"""
Message-related Pydantic schemas following FastAPI best practices
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, validator
from uuid import UUID

from .common import BaseSchema, FilterParams


class MessageBase(BaseModel):
    """Base message information"""
    
    content: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="Message content",
        example="Gostaria de agendar uma reunião para discutir o desempenho do aluno."
    )
    subject: Optional[str] = Field(
        None,
        max_length=200,
        description="Message subject/title",
        example="Reunião sobre desempenho acadêmico"
    )
    message_type: str = Field(
        default="text",
        max_length=50,
        description="Type of message (text, announcement, urgent, etc.)",
        example="text"
    )


class MessageCreate(MessageBase):
    """Schema for creating a new message"""
    
    recipient_id: UUID = Field(..., description="Message recipient user ID")
    file_attachments: Optional[List[str]] = Field(
        None,
        max_items=5,
        description="List of file URLs attached to the message",
        example=["https://example.com/file1.pdf", "https://example.com/file2.jpg"]
    )
    parent_message_id: Optional[UUID] = Field(
        None,
        description="ID of the message being replied to (for threading)"
    )
    scheduled_for: Optional[datetime] = Field(
        None,
        description="Schedule message to be sent later"
    )
    priority: str = Field(
        default="normal",
        pattern="^(low|normal|high|urgent)$",
        description="Message priority level",
        example="normal"
    )
    
    @validator('scheduled_for')
    def validate_scheduled_for(cls, v):
        """Validate that scheduled time is in the future"""
        if v and v <= datetime.utcnow():
            raise ValueError('Scheduled time must be in the future')
        return v


class MessageUpdate(BaseModel):
    """Schema for updating message information"""
    
    read: Optional[bool] = Field(None, description="Mark message as read/unread")
    archived: Optional[bool] = Field(None, description="Archive/unarchive message")
    starred: Optional[bool] = Field(None, description="Star/unstar message")


class MessageResponse(MessageBase, BaseSchema):
    """Complete message response schema"""
    
    id: UUID = Field(..., description="Message unique identifier")
    institution_id: UUID = Field(..., description="Institution ID")
    sender_id: UUID = Field(..., description="Sender user ID")
    recipient_id: UUID = Field(..., description="Recipient user ID")
    parent_message_id: Optional[UUID] = Field(None, description="Parent message for threading")
    thread_id: Optional[UUID] = Field(None, description="Thread identifier")
    file_attachments: Optional[List[str]] = Field(None, description="Attached files")
    priority: str = Field(..., description="Message priority")
    read: bool = Field(default=False, description="Read status")
    read_at: Optional[datetime] = Field(None, description="When message was read")
    archived: bool = Field(default=False, description="Archive status")
    starred: bool = Field(default=False, description="Starred status")
    scheduled_for: Optional[datetime] = Field(None, description="Scheduled send time")
    sent_at: Optional[datetime] = Field(None, description="When message was sent")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    # Related data (optional)
    sender: Optional[Dict[str, Any]] = Field(None, description="Sender information")
    recipient: Optional[Dict[str, Any]] = Field(None, description="Recipient information")
    replies_count: Optional[int] = Field(None, description="Number of replies")


class MessageListItem(BaseSchema):
    """Simplified message data for list responses"""
    
    id: UUID
    subject: Optional[str]
    content_preview: str = Field(..., description="First 100 characters of content")
    sender_name: str = Field(..., description="Sender full name")
    recipient_name: str = Field(..., description="Recipient full name")
    priority: str
    read: bool
    starred: bool
    replies_count: int = Field(default=0, description="Number of replies")
    sent_at: Optional[datetime]
    created_at: datetime


class MessagesList(BaseModel):
    """Message list with metadata"""
    
    messages: List[MessageListItem] = Field(..., description="List of messages")


class MessageFilters(FilterParams):
    """Filters for message queries"""
    
    sender_id: Optional[UUID] = Field(
        None,
        description="Filter by sender ID"
    )
    recipient_id: Optional[UUID] = Field(
        None,
        description="Filter by recipient ID"
    )
    message_type: Optional[str] = Field(
        None,
        description="Filter by message type"
    )
    priority: Optional[str] = Field(
        None,
        pattern="^(low|normal|high|urgent)$",
        description="Filter by priority"
    )
    read: Optional[bool] = Field(
        None,
        description="Filter by read status"
    )
    starred: Optional[bool] = Field(
        None,
        description="Filter by starred status"
    )
    archived: Optional[bool] = Field(
        None,
        description="Filter by archived status"
    )
    date_from: Optional[datetime] = Field(
        None,
        description="Filter messages from this date"
    )
    date_to: Optional[datetime] = Field(
        None,
        description="Filter messages until this date"
    )
    has_attachments: Optional[bool] = Field(
        None,
        description="Filter messages with/without attachments"
    )


class ConversationParticipant(BaseModel):
    """Conversation participant information"""
    
    user_id: UUID = Field(..., description="User ID")
    user_name: str = Field(..., description="User full name")
    user_role: str = Field(..., description="User role")
    last_read_at: Optional[datetime] = Field(None, description="Last read timestamp")


class ConversationResponse(BaseSchema):
    """Conversation thread response"""
    
    thread_id: UUID = Field(..., description="Conversation thread ID")
    subject: Optional[str] = Field(None, description="Conversation subject")
    participants: List[ConversationParticipant] = Field(..., description="Participants")
    messages: List[MessageResponse] = Field(..., description="Messages in thread")
    total_messages: int = Field(..., description="Total messages in conversation")
    unread_count: int = Field(..., description="Unread messages count")
    last_activity: datetime = Field(..., description="Last activity timestamp")
    created_at: datetime = Field(..., description="Conversation start timestamp")


class MessageStats(BaseModel):
    """Message statistics for user/institution"""
    
    total_messages: int = Field(..., description="Total messages")
    sent_messages: int = Field(..., description="Messages sent")
    received_messages: int = Field(..., description="Messages received")
    unread_messages: int = Field(..., description="Unread messages")
    starred_messages: int = Field(..., description="Starred messages")
    archived_messages: int = Field(..., description="Archived messages")
    messages_by_priority: Dict[str, int] = Field(..., description="Messages by priority level")
    active_conversations: int = Field(..., description="Active conversation threads")


class MessageNotificationSettings(BaseModel):
    """User notification preferences for messages"""
    
    email_notifications: bool = Field(default=True, description="Email notifications")
    push_notifications: bool = Field(default=True, description="Push notifications")
    sms_notifications: bool = Field(default=False, description="SMS notifications")
    digest_frequency: str = Field(
        default="daily",
        pattern="^(immediate|hourly|daily|weekly|never)$",
        description="Digest email frequency"
    )
    quiet_hours_start: Optional[str] = Field(
        None,
        pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
        description="Quiet hours start time (HH:MM)"
    )
    quiet_hours_end: Optional[str] = Field(
        None,
        pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
        description="Quiet hours end time (HH:MM)"
    )


class MessageBulkAction(BaseModel):
    """Schema for bulk message operations"""
    
    message_ids: List[UUID] = Field(
        ...,
        min_items=1,
        max_items=100,
        description="List of message IDs"
    )
    action: str = Field(
        ...,
        pattern="^(mark_read|mark_unread|archive|unarchive|star|unstar|delete)$",
        description="Action to perform"
    )


class MessageBulkResponse(BaseModel):
    """Response for bulk message operations"""
    
    total_requested: int = Field(..., description="Total messages requested")
    total_processed: int = Field(..., description="Total messages processed")
    total_errors: int = Field(..., description="Total errors")
    processed_ids: List[UUID] = Field(..., description="Successfully processed message IDs")
    errors: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="List of errors"
    )