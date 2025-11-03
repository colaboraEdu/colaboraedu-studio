"""
Core utilities for authentication: password hashing, JWT tokens, etc.
"""
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Union, Any, Dict
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings


# Password hashing context - using bcrypt as recommended
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthUtils:
    """Authentication utility class"""
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a plain password against a hashed password"""
        try:
            # Try bcrypt first
            return pwd_context.verify(plain_password, hashed_password)
        except:
            # Fall back to simple SHA256 for demo users
            return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a plain password"""
        # Truncate password to 72 bytes if necessary (bcrypt limitation)
        if len(password.encode('utf-8')) > 72:
            password = password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
        return pwd_context.hash(password)
    
    @staticmethod
    def create_access_token(
        data: Dict[str, Any],
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Create a JWT access token
        
        Args:
            data: Dictionary containing user data (usually user_id, institution_id, role)
            expires_delta: Token expiration time (defaults to setting)
            
        Returns:
            Encoded JWT token string
        """
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.secret_key, 
            algorithm=settings.algorithm
        )
        return encoded_jwt
    
    @staticmethod
    def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
        """
        Decode and validate a JWT token
        
        Args:
            token: JWT token string
            
        Returns:
            Decoded token data or None if invalid
        """
        try:
            payload = jwt.decode(
                token,
                settings.secret_key,
                algorithms=[settings.algorithm]
            )
            return payload
        except JWTError:
            return None
    
    @staticmethod 
    def create_token_data(
        user_id: str,
        institution_id: str,
        role: str,
        email: str
    ) -> Dict[str, Any]:
        """
        Create standardized token data dictionary
        
        This follows JWT best practices and our multi-tenancy requirements
        """
        return {
            "sub": user_id,  # JWT standard: subject (user ID)
            "institution_id": institution_id,  # Multi-tenancy
            "role": role,  # RBAC
            "email": email,  # Additional user info
            "iat": datetime.utcnow(),  # Issued at
        }