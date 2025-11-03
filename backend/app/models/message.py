"""
Message model for internal communication system
"""
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, Index

from sqlalchemy.orm import relationship

from .base import BaseModel


class Message(BaseModel):
    """Internal messaging system model"""
    
    __tablename__ = "messages"
    
    # Multi-tenancy
    institution_id = Column(String(36), ForeignKey("institutions.id"), nullable=False)
    
    # Message participants
    sender_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    recipient_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Message content
    content = Column(Text, nullable=False)
    file_url = Column(Text)  # Optional file attachment
    
    # Read status tracking
    read = Column(Boolean, default=False)
    read_at = Column(DateTime)
    
    # Relationships
    institution = relationship("Institution", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="received_messages")
    
    def __repr__(self):
        return f"<Message(id={self.id}, sender_id={self.sender_id}, read={self.read})>"


# Indexes for chat performance
Index("idx_messages_institution_id", Message.institution_id)
Index("idx_messages_sender_id", Message.sender_id)
Index("idx_messages_recipient_id", Message.recipient_id)
Index("idx_messages_created_at", Message.created_at)
Index("idx_messages_read", Message.read)
# Composite index for conversation queries
Index("idx_messages_conversation", Message.sender_id, Message.recipient_id, Message.created_at)