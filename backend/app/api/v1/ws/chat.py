"""
Real-time chat WebSocket endpoint with authentication and connection management
"""
from typing import Dict, Set
from datetime import datetime
from fastapi import WebSocket, WebSocketDisconnect, Query, status
from sqlalchemy.orm import Session
import json

from app.database import get_db
from app.models.user import User
from app.models.message import Message
from app.core.security import SecurityUtils


class ConnectionManager:
    """
    Manages WebSocket connections for real-time messaging
    
    Features:
    - Connection pooling per institution
    - User presence tracking
    - Room-based messaging
    - Broadcast capabilities
    """
    
    def __init__(self):
        # Active connections: {user_id: WebSocket}
        self.active_connections: Dict[str, WebSocket] = {}
        
        # User presence: {user_id: {institution_id, last_seen, status}}
        self.user_presence: Dict[str, dict] = {}
        
        # Institution rooms: {institution_id: Set[user_id]}
        self.institution_rooms: Dict[str, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str, institution_id: str):
        """Accept WebSocket connection and register user"""
        await websocket.accept()
        
        # Store connection
        self.active_connections[user_id] = websocket
        
        # Update presence
        self.user_presence[user_id] = {
            "institution_id": institution_id,
            "last_seen": datetime.utcnow().isoformat(),
            "status": "online"
        }
        
        # Add to institution room
        if institution_id not in self.institution_rooms:
            self.institution_rooms[institution_id] = set()
        self.institution_rooms[institution_id].add(user_id)
        
        # Notify others about user joining
        await self.broadcast_to_institution(
            institution_id,
            {
                "type": "user_joined",
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat()
            },
            exclude_user=user_id
        )
    
    async def disconnect(self, user_id: str):
        """Remove connection and update presence"""
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            institution_id = self.user_presence.get(user_id, {}).get("institution_id")
            
            # Remove from active connections
            del self.active_connections[user_id]
            
            # Update presence to offline
            if user_id in self.user_presence:
                self.user_presence[user_id]["status"] = "offline"
                self.user_presence[user_id]["last_seen"] = datetime.utcnow().isoformat()
            
            # Remove from institution room
            if institution_id and institution_id in self.institution_rooms:
                self.institution_rooms[institution_id].discard(user_id)
            
            # Notify others about user leaving
            if institution_id:
                await self.broadcast_to_institution(
                    institution_id,
                    {
                        "type": "user_left",
                        "user_id": user_id,
                        "timestamp": datetime.utcnow().isoformat()
                    },
                    exclude_user=user_id
                )
    
    async def send_personal_message(self, user_id: str, message: dict):
        """Send message to specific user"""
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            try:
                await websocket.send_json(message)
            except Exception as e:
                print(f"Error sending message to {user_id}: {e}")
                await self.disconnect(user_id)
    
    async def broadcast_to_institution(self, institution_id: str, message: dict, exclude_user: str = None):
        """Broadcast message to all users in institution"""
        if institution_id not in self.institution_rooms:
            return
        
        disconnected_users = []
        
        for user_id in self.institution_rooms[institution_id]:
            if exclude_user and user_id == exclude_user:
                continue
            
            if user_id in self.active_connections:
                try:
                    await self.active_connections[user_id].send_json(message)
                except Exception as e:
                    print(f"Error broadcasting to {user_id}: {e}")
                    disconnected_users.append(user_id)
        
        # Clean up disconnected users
        for user_id in disconnected_users:
            await self.disconnect(user_id)
    
    def get_online_users(self, institution_id: str) -> list:
        """Get list of online users in institution"""
        if institution_id not in self.institution_rooms:
            return []
        
        return [
            {
                "user_id": user_id,
                "status": self.user_presence[user_id]["status"],
                "last_seen": self.user_presence[user_id]["last_seen"]
            }
            for user_id in self.institution_rooms[institution_id]
            if user_id in self.user_presence
        ]
    
    def is_user_online(self, user_id: str) -> bool:
        """Check if user is currently online"""
        return user_id in self.active_connections


# Global connection manager instance
manager = ConnectionManager()


async def get_current_user_from_token(token: str, db: Session) -> User:
    """
    Validate JWT token and return current user
    
    Used for WebSocket authentication via query parameter
    """
    try:
        payload = SecurityUtils.decode_token(token)
        user_id = payload.get("sub")
        
        if not user_id:
            return None
        
        user = db.query(User).filter(User.id == user_id).first()
        return user
    except Exception as e:
        print(f"Token validation error: {e}")
        return None


async def chat_endpoint(
    websocket: WebSocket,
    token: str = Query(..., description="JWT authentication token"),
):
    """
    WebSocket endpoint for real-time chat
    
    **Authentication:** JWT token via query parameter
    
    **Message Types:**
    - chat_message: Send/receive chat messages
    - typing: Typing indicators
    - read_receipt: Message read confirmations
    - presence: User online/offline status
    - get_online_users: Request list of online users
    
    **Example Connection:**
    ```javascript
    const ws = new WebSocket(`ws://localhost:8004/ws/chat?token=${jwtToken}`);
    ```
    
    **Message Format:**
    ```json
    {
        "type": "chat_message",
        "recipient_id": "user-uuid",
        "content": "Hello!",
        "priority": "normal"
    }
    ```
    """
    db = next(get_db())
    
    try:
        # Authenticate user
        current_user = await get_current_user_from_token(token, db)
        
        if not current_user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid authentication token")
            return
        
        # Connect user
        await manager.connect(websocket, current_user.id, current_user.institution_id)
        
        # Send welcome message
        await websocket.send_json({
            "type": "connected",
            "message": f"Welcome {current_user.full_name}!",
            "user_id": current_user.id,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Send online users list
        online_users = manager.get_online_users(current_user.institution_id)
        await websocket.send_json({
            "type": "online_users",
            "users": online_users,
            "count": len(online_users)
        })
        
        # Message loop
        while True:
            # Receive message
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            message_type = message_data.get("type")
            
            # Handle different message types
            if message_type == "chat_message":
                # Validate recipient
                recipient_id = message_data.get("recipient_id")
                
                if not recipient_id:
                    await websocket.send_json({
                        "type": "error",
                        "message": "recipient_id is required"
                    })
                    continue
                
                # Verify recipient exists and is in same institution
                recipient = db.query(User).filter(
                    User.id == recipient_id,
                    User.institution_id == current_user.institution_id
                ).first()
                
                if not recipient:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Recipient not found or not in same institution"
                    })
                    continue
                
                # Save message to database
                message = Message(
                    sender_id=current_user.id,
                    recipient_id=recipient_id,
                    institution_id=current_user.institution_id,
                    subject=message_data.get("subject", "Chat Message"),
                    content=message_data.get("content", ""),
                    priority=message_data.get("priority", "normal"),
                    created_at=datetime.utcnow()
                )
                
                db.add(message)
                db.commit()
                db.refresh(message)
                
                # Prepare message for delivery
                chat_message = {
                    "type": "chat_message",
                    "message_id": message.id,
                    "sender_id": current_user.id,
                    "sender_name": current_user.full_name,
                    "recipient_id": recipient_id,
                    "content": message.content,
                    "priority": message.priority,
                    "timestamp": message.created_at.isoformat()
                }
                
                # Send to recipient if online
                if manager.is_user_online(recipient_id):
                    await manager.send_personal_message(recipient_id, chat_message)
                
                # Send confirmation to sender
                await websocket.send_json({
                    "type": "message_sent",
                    "message_id": message.id,
                    "recipient_online": manager.is_user_online(recipient_id),
                    "timestamp": datetime.utcnow().isoformat()
                })
            
            elif message_type == "typing":
                # Typing indicator
                recipient_id = message_data.get("recipient_id")
                is_typing = message_data.get("is_typing", True)
                
                if recipient_id and manager.is_user_online(recipient_id):
                    await manager.send_personal_message(recipient_id, {
                        "type": "typing",
                        "user_id": current_user.id,
                        "user_name": current_user.full_name,
                        "is_typing": is_typing
                    })
            
            elif message_type == "read_receipt":
                # Message read confirmation
                message_id = message_data.get("message_id")
                
                if message_id:
                    # Update message as read
                    msg = db.query(Message).filter(
                        Message.id == message_id,
                        Message.recipient_id == current_user.id
                    ).first()
                    
                    if msg:
                        msg.read = True
                        msg.read_at = datetime.utcnow()
                        db.commit()
                        
                        # Notify sender
                        if manager.is_user_online(msg.sender_id):
                            await manager.send_personal_message(msg.sender_id, {
                                "type": "read_receipt",
                                "message_id": message_id,
                                "read_by": current_user.id,
                                "read_at": msg.read_at.isoformat()
                            })
            
            elif message_type == "get_online_users":
                # Request online users
                online_users = manager.get_online_users(current_user.institution_id)
                await websocket.send_json({
                    "type": "online_users",
                    "users": online_users,
                    "count": len(online_users)
                })
            
            elif message_type == "ping":
                # Keepalive ping
                await websocket.send_json({
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat()
                })
            
            else:
                # Unknown message type
                await websocket.send_json({
                    "type": "error",
                    "message": f"Unknown message type: {message_type}"
                })
    
    except WebSocketDisconnect:
        await manager.disconnect(current_user.id)
        print(f"User {current_user.full_name} disconnected")
    
    except Exception as e:
        print(f"WebSocket error: {e}")
        if current_user:
            await manager.disconnect(current_user.id)
    
    finally:
        db.close()
