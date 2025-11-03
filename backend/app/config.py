"""
Configuration settings for colaboraEDU backend
Based on technical specifications document
"""
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # App info
    app_name: str = "colaboraEDU API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Server
    host: str = "192.168.10.178"
    port: int = 8004
    reload: bool = True
    
    # Database  
    database_url: str = "sqlite:///./colaboraedu.db"
    database_echo: bool = False
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # JWT
    secret_key: str = "your-super-secret-jwt-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS
    allowed_origins: list[str] = [
        "http://localhost:3000",  # React dev server
        "http://127.0.0.1:3000",
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173",
        "http://192.168.10.178:3000",  # Network access
        "http://192.168.10.178:5173",  # Network Vite
        "http://192.168.10.178:8004",  # API itself
        "http://192.168.10.121:*",  # Client machines
        "http://192.168.10.*:*",  # Local network
    ]
    
    # Celery
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"
    
    # File upload
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    upload_path: str = "./uploads"
    
    # Email (for notifications)
    smtp_server: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    
    # AI/ML APIs
    gemini_api_key: Optional[str] = None  # Google Gemini AI for PDF extraction
    openai_api_key: Optional[str] = None  # OpenAI (alternative)
    
    # Multi-tenancy
    default_institution_id: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()