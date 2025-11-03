"""
Messages endpoints - REST API for messaging system with real-time support
"""
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks

from app.models.message import Message
from app.models.user import User
from app.schemas.message import (
    MessageCreate,
    MessageUpdate,
    MessageResponse,
    MessageFilters,
    ConversationResponse,
    MessageStats,
    MessageBulkAction,
    MessageBulkResponse,
)
from app.schemas.common import PaginationParams, PaginatedResponse, ApiResponse
from app.api.deps import get_current_user, get_db, require_permissions


router = APIRouter()


# Background task for sending message notifications
async def send_message_notification(
    message_id: str,
    recipient_email: str,
    sender_name: str,
    subject: str,
    priority: str
):
    """
    Send notification for new messages
    
    In production, this would:
    - Send email notification
    - Send push notification
    - Send SMS for high priority messages
    """
    print(f"📧 Sending message notification")
    print(f"   To: {recipient_email}")
    print(f"   From: {sender_name}")
    print(f"   Subject: {subject}")
    print(f"   Priority: {priority}")
    
    # TODO: Implement actual notification sending
    # await send_email(recipient_email, subject, body)
    # await send_push_notification(recipient_id, message)


@router.post(
    "/",
    response_model=ApiResponse[MessageResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Send message",
    description="Send a new message with optional file attachments and scheduling"
)
async def send_message(
    message_data: MessageCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(["admin", "professor", "coordenador", "orientador", "secretario", "responsavel"]))
):
    """
    Send a new message.
    
    **Features:**
    - Optional file attachments
    - Message scheduling
    - Priority levels (low, normal, high, urgent)
    - Threading support (reply to messages)
    - Automatic notifications
    
    **Required Permissions:** All authenticated users
    """
    # Verify recipient exists and belongs to same institution
    recipient = db.query(User).filter(
        and_(
            User.id == message_data.recipient_id,
            User.institution_id == current_user.institution_id
        )
    ).first()
    
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipient with ID {message_data.recipient_id} not found"
        )
    
    # If replying, verify parent message exists
    if message_data.parent_message_id:
        parent = db.query(Message).filter(
            and_(
                Message.id == message_data.parent_message_id,
                Message.institution_id == current_user.institution_id
            )
        ).first()
        
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parent message with ID {message_data.parent_message_id} not found"
            )
    
    # Create message
    message = Message(
        **message_data.model_dump(),
        sender_id=current_user.id,
        institution_id=current_user.institution_id,
        created_at=datetime.utcnow()
    )
    
    db.add(message)
    db.commit()
    db.refresh(message)
    
    # Schedule notification for immediate messages
    if not message_data.scheduled_for or message_data.scheduled_for <= datetime.utcnow():
        background_tasks.add_task(
            send_message_notification,
            message_id=message.id,
            recipient_email=recipient.email,
            sender_name=current_user.full_name,
            subject=message.subject,
            priority=message.priority.value
        )
    
    return ApiResponse(
        success=True,
        message="Message sent successfully",
        data=MessageResponse.model_validate(message)
    )


@router.get(
    "/",
    response_model=ApiResponse[PaginatedResponse[MessageResponse]],
    summary="List messages",
    description="List messages with advanced filtering (inbox/sent/archived)"
)
async def list_messages(
    filters: MessageFilters = Depends(),
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(["admin", "professor", "coordenador", "orientador", "secretario", "responsavel"]))
):
    """
    List messages with comprehensive filtering.
    
    **Filters:**
    - Folder: inbox, sent, archived, starred
    - Priority: low, normal, high, urgent
    - Read status
    - Has attachments
    - Date range
    - Search in subject/content
    
    **Required Permissions:** All authenticated users
    """
    # Base query
    query = db.query(Message).options(
        joinedload(Message.sender),
        joinedload(Message.recipient)
    ).filter(Message.institution_id == current_user.institution_id)
    
    # Folder filter
    if filters.folder == "inbox":
        query = query.filter(
            and_(
                Message.recipient_id == current_user.id,
                Message.archived == False
            )
        )
    elif filters.folder == "sent":
        query = query.filter(Message.sender_id == current_user.id)
    elif filters.folder == "archived":
        query = query.filter(
            and_(
                Message.recipient_id == current_user.id,
                Message.archived == True
            )
        )
    elif filters.folder == "starred":
        query = query.filter(
            and_(
                Message.recipient_id == current_user.id,
                Message.starred == True
            )
        )
    else:
        # Default: show all messages for user
        query = query.filter(
            or_(
                Message.sender_id == current_user.id,
                Message.recipient_id == current_user.id
            )
        )
    
    # Priority filter
    if filters.priority:
        query = query.filter(Message.priority == filters.priority)
    
    # Read status filter
    if filters.read is not None:
        query = query.filter(Message.read == filters.read)
    
    # Starred filter
    if filters.starred is not None:
        query = query.filter(Message.starred == filters.starred)
    
    # Has attachments filter
    if filters.has_attachments:
        query = query.filter(Message.file_attachments != None)
        query = query.filter(func.json_array_length(Message.file_attachments) > 0)
    
    # Search filter
    if filters.search:
        search_pattern = f"%{filters.search}%"
        query = query.filter(
            or_(
                Message.subject.ilike(search_pattern),
                Message.content.ilike(search_pattern)
            )
        )
    
    # Apply sorting
    if filters.sort_by:
        sort_column = getattr(Message, filters.sort_by, None)
        if sort_column:
            if filters.sort_order == "desc":
                query = query.order_by(sort_column.desc())
            else:
                query = query.order_by(sort_column.asc())
    else:
        # Default: most recent first
        query = query.order_by(Message.created_at.desc())
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    messages = query.offset(pagination.offset).limit(pagination.limit).all()
    
    # Build paginated response
    paginated = PaginatedResponse.create(
        items=[MessageResponse.model_validate(msg) for msg in messages],
        page=pagination.page,
        size=pagination.limit,
        total=total
    )
    
    return ApiResponse(
        success=True,
        message=f"Found {total} message(s)",
        data=paginated
    )


@router.get(
    "/{message_id}",
    response_model=ApiResponse[MessageResponse],
    summary="Get message details",
    description="Retrieve detailed information about a specific message"
)
async def get_message(
    message_id: str,
    mark_as_read: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(["admin", "professor", "coordenador", "orientador", "secretario", "responsavel"]))
):
    """
    Get detailed message information.
    
    **Auto-marks as read** if user is recipient (can be disabled with mark_as_read=false)
    
    **Required Permissions:** All authenticated users
    """
    message = db.query(Message).options(
        joinedload(Message.sender),
        joinedload(Message.recipient)
    ).filter(
        and_(
            Message.id == message_id,
            Message.institution_id == current_user.institution_id,
            or_(
                Message.sender_id == current_user.id,
                Message.recipient_id == current_user.id
            )
        )
    ).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Message with ID {message_id} not found"
        )
    
    # Mark as read if recipient and not already read
    if mark_as_read and message.recipient_id == current_user.id and not message.read:
        message.read = True
        message.read_at = datetime.utcnow()
        db.commit()
        db.refresh(message)
    
    return ApiResponse(
        success=True,
        message="Message retrieved successfully",
        data=MessageResponse.model_validate(message)
    )


@router.put(
    "/{message_id}",
    response_model=ApiResponse[MessageResponse],
    summary="Update message",
    description="Update message status (read, starred, archived)"
)
async def update_message(
    message_id: str,
    message_data: MessageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(["admin", "professor", "coordenador", "orientador", "secretario", "responsavel"]))
):
    """
    Update message status.
    
    **Allowed updates:**
    - Mark as read/unread
    - Star/unstar
    - Archive/unarchive
    
    **Required Permissions:** All authenticated users (own messages only)
    """
    message = db.query(Message).filter(
        and_(
            Message.id == message_id,
            Message.institution_id == current_user.institution_id,
            Message.recipient_id == current_user.id  # Only recipient can update
        )
    ).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Message with ID {message_id} not found or you don't have permission to update it"
        )
    
    # Update fields
    update_data = message_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "read" and value:
            setattr(message, "read_at", datetime.utcnow())
        setattr(message, field, value)
    
    message.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(message)
    
    return ApiResponse(
        success=True,
        message="Message updated successfully",
        data=MessageResponse.model_validate(message)
    )


@router.delete(
    "/{message_id}",
    response_model=ApiResponse[dict],
    summary="Delete message",
    description="Soft delete a message"
)
async def delete_message(
    message_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(["admin", "professor", "coordenador", "orientador", "secretario", "responsavel"]))
):
    """
    Soft delete a message (marks as deleted, doesn't remove from database).
    
    **Required Permissions:** All authenticated users (own messages only)
    """
    message = db.query(Message).filter(
        and_(
            Message.id == message_id,
            Message.institution_id == current_user.institution_id,
            or_(
                Message.sender_id == current_user.id,
                Message.recipient_id == current_user.id
            )
        )
    ).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Message with ID {message_id} not found"
        )
    
    # Soft delete
    message.deleted_at = datetime.utcnow()
    db.commit()
    
    return ApiResponse(
        success=True,
        message="Message deleted successfully",
        data={"id": message_id, "deleted_at": message.deleted_at}
    )


@router.get(
    "/conversations/{user_id}",
    response_model=ApiResponse[ConversationResponse],
    summary="Get conversation with user",
    description="Get complete conversation thread with a specific user"
)
async def get_conversation(
    user_id: str,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(["admin", "professor", "coordenador", "orientador", "secretario", "responsavel"]))
):
    """
    Retrieve complete conversation thread with a specific user.
    
    Shows all messages exchanged between current user and specified user,
    ordered chronologically.
    
    **Required Permissions:** All authenticated users
    """
    # Verify other user exists
    other_user = db.query(User).filter(
        and_(
            User.id == user_id,
            User.institution_id == current_user.institution_id
        )
    ).first()
    
    if not other_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    
    # Get all messages between users
    messages = db.query(Message).options(
        joinedload(Message.sender),
        joinedload(Message.recipient)
    ).filter(
        and_(
            Message.institution_id == current_user.institution_id,
            Message.deleted_at.is_(None),
            or_(
                and_(
                    Message.sender_id == current_user.id,
                    Message.recipient_id == user_id
                ),
                and_(
                    Message.sender_id == user_id,
                    Message.recipient_id == current_user.id
                )
            )
        )
    ).order_by(Message.created_at.asc()).limit(limit).all()
    
    # Count unread messages
    unread_count = sum(1 for msg in messages if msg.recipient_id == current_user.id and not msg.read)
    
    conversation = ConversationResponse(
        user_id=user_id,
        user_name=other_user.full_name,
        user_email=other_user.email,
        messages=[MessageResponse.model_validate(msg) for msg in messages],
        total_messages=len(messages),
        unread_count=unread_count
    )
    
    return ApiResponse(
        success=True,
        message=f"Found {len(messages)} message(s) in conversation",
        data=conversation
    )


@router.get(
    "/stats/overview",
    response_model=ApiResponse[MessageStats],
    summary="Get messaging statistics",
    description="Get comprehensive messaging statistics for current user"
)
async def get_message_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(["admin", "professor", "coordenador", "orientador", "secretario", "responsavel"]))
):
    """
    Get messaging statistics including:
    - Total sent/received
    - Unread count
    - Response rate
    - Most contacted users
    
    **Required Permissions:** All authenticated users
    """
    # Count sent messages
    total_sent = db.query(Message).filter(
        and_(
            Message.sender_id == current_user.id,
            Message.institution_id == current_user.institution_id,
            Message.deleted_at.is_(None)
        )
    ).count()
    
    # Count received messages
    total_received = db.query(Message).filter(
        and_(
            Message.recipient_id == current_user.id,
            Message.institution_id == current_user.institution_id,
            Message.deleted_at.is_(None)
        )
    ).count()
    
    # Count unread messages
    unread_count = db.query(Message).filter(
        and_(
            Message.recipient_id == current_user.id,
            Message.institution_id == current_user.institution_id,
            Message.read == False,
            Message.deleted_at.is_(None)
        )
    ).count()
    
    # Calculate response rate (simplified)
    response_rate = (total_sent / total_received * 100) if total_received > 0 else 0
    
    # Average response time (placeholder - would need actual calculation)
    avg_response_time = "2.5 hours"
    
    # Most contacted users (placeholder)
    most_contacted = []
    
    stats = MessageStats(
        total_sent=total_sent,
        total_received=total_received,
        unread_count=unread_count,
        response_rate=response_rate,
        avg_response_time=avg_response_time,
        most_contacted=most_contacted
    )
    
    return ApiResponse(
        success=True,
        message="Statistics retrieved successfully",
        data=stats
    )


@router.post(
    "/bulk",
    response_model=ApiResponse[MessageBulkResponse],
    summary="Bulk message operations",
    description="Perform bulk operations on multiple messages"
)
async def bulk_message_operation(
    bulk_data: MessageBulkAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions(["admin", "professor", "coordenador", "orientador", "secretario", "responsavel"]))
):
    """
    Perform bulk operations on messages.
    
    **Supported actions:**
    - mark_read: Mark multiple messages as read
    - mark_unread: Mark multiple messages as unread
    - archive: Archive multiple messages
    - unarchive: Unarchive multiple messages
    - delete: Delete multiple messages
    - star: Star multiple messages
    - unstar: Unstar multiple messages
    
    **Required Permissions:** All authenticated users (own messages only)
    """
    # Get messages
    messages = db.query(Message).filter(
        and_(
            Message.id.in_(bulk_data.message_ids),
            Message.institution_id == current_user.institution_id,
            Message.recipient_id == current_user.id  # Only own messages
        )
    ).all()
    
    if not messages:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No messages found with the provided IDs"
        )
    
    success_count = 0
    failed_ids = []
    
    # Perform action
    for message in messages:
        try:
            if bulk_data.action == "mark_read":
                message.read = True
                message.read_at = datetime.utcnow()
            elif bulk_data.action == "mark_unread":
                message.read = False
                message.read_at = None
            elif bulk_data.action == "archive":
                message.archived = True
            elif bulk_data.action == "unarchive":
                message.archived = False
            elif bulk_data.action == "delete":
                message.deleted_at = datetime.utcnow()
            elif bulk_data.action == "star":
                message.starred = True
            elif bulk_data.action == "unstar":
                message.starred = False
            
            message.updated_at = datetime.utcnow()
            success_count += 1
        except Exception as e:
            failed_ids.append(message.id)
    
    db.commit()
    
    response = MessageBulkResponse(
        action=bulk_data.action,
        total_requested=len(bulk_data.message_ids),
        success_count=success_count,
        failed_count=len(failed_ids),
        failed_ids=failed_ids
    )
    
    return ApiResponse(
        success=True,
        message=f"Bulk operation completed: {success_count} success, {len(failed_ids)} failed",
        data=response
    )
