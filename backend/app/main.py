"""
Main FastAPI application
colaboraEDU backend API
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base
from app.api.v1.endpoints import auth, users, institutions, settings as settings_router


# Create database tables
def create_tables():
    """Create database tables if they don't exist"""
    Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan events
    Runs on startup and shutdown
    """
    # Startup
    print("🚀 Starting colaboraEDU API...")
    create_tables()
    print("📊 Database tables created/verified")
    yield
    # Shutdown
    print("🛑 Shutting down colaboraEDU API...")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend API para colaboraEDU - Sistema de gestão educacional",
    docs_url="/docs",  # Always enable docs for development
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware - Allow all origins for local network development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Global exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Global HTTP exception handler"""
    from fastapi.responses import JSONResponse
    from datetime import datetime
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat()
        }
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API info"""
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
        "docs_url": "/docs" if settings.debug else None,
        "status": "running"
    }


# API v1 routes
app.include_router(
    auth.router,
    prefix="/api/v1/auth",
    tags=["authentication"],
    responses={
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden"},
    }
)

app.include_router(
    users.router,
    prefix="/api/v1/users",
    tags=["users"],
    responses={
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden"},
        404: {"description": "Not found"},
    }
)

# Institutions router
app.include_router(
    institutions.router,
    prefix="/api/v1/institutions",
    tags=["institutions"]
)

# Import students router
from app.api.v1.endpoints import students

app.include_router(
    students.router,
    prefix="/api/v1/students",
    tags=["students"],
    responses={
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden"},
        404: {"description": "Not found"},
    }
)

# Import occurrences router
from app.api.v1.endpoints import occurrences

app.include_router(
    occurrences.router,
    prefix="/api/v1/occurrences",
    tags=["occurrences"],
    responses={
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden"},
        404: {"description": "Not found"},
    }
)

# Import messages router
from app.api.v1.endpoints import messages

app.include_router(
    messages.router,
    prefix="/api/v1/messages",
    tags=["messages"],
    responses={
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden"},
        404: {"description": "Not found"},
    }
)

# Settings router
app.include_router(
    settings_router.router,
    prefix="/api/v1/settings",
    tags=["settings"],
    responses={
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden - Admin only"},
    }
)

# Rules and Policies router
from app.api.v1.endpoints import rules_policies

app.include_router(
    rules_policies.router,
    prefix="/api/v1/rules-policies",
    tags=["rules_policies"],
    responses={
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden - Admin only"},
    }
)

# Academic Parameters router
from app.api.v1.endpoints import academic_parameters

app.include_router(
    academic_parameters.router,
    prefix="/api/v1/academic",
    tags=["academic_parameters"],
    responses={
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden - Admin only"},
    }
)

# Integrations router
from app.api.v1.endpoints import integrations

app.include_router(
    integrations.router,
    prefix="/api/v1/integrations",
    tags=["integrations"],
    responses={
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden - Admin only"},
    }
)

# Classes router
from app.api.v1.endpoints import classes

app.include_router(
    classes.router,
    prefix="/api/v1/classes",
    tags=["classes"],
    responses={
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden"},
        404: {"description": "Not found"},
    }
)

# Assignments router
from app.api.v1.endpoints import assignments

app.include_router(
    assignments.router,
    prefix="/api/v1/assignments",
    tags=["assignments"],
    responses={
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden"},
        404: {"description": "Not found"},
    }
)

# Attendance router
from app.api.v1.endpoints import attendance

app.include_router(
    attendance.router,
    prefix="/api/v1/attendance",
    tags=["attendance"],
    responses={
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden"},
        404: {"description": "Not found"},
    }
)

# Import WebSocket chat endpoint
from app.api.v1.ws.chat import chat_endpoint

app.websocket("/ws/chat")(chat_endpoint)

# PDF Processing router
from app.api.v1.endpoints import pdf_processing

app.include_router(
    pdf_processing.router,
    prefix="/api/v1/pdf",
    tags=["pdf_processing"],
    responses={
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden"},
        404: {"description": "Not found"},
    }
)




# Additional metadata for OpenAPI
if settings.debug:
    app.openapi_tags = [
        {
            "name": "authentication",
            "description": "Login, logout, token management",
        },
        {
            "name": "users",
            "description": "User management with RBAC and multi-tenancy",
        },
        {
            "name": "students",
            "description": "Student academic management",
        },
        {
            "name": "grades",
            "description": "Academic grade management",
        },
        {
            "name": "occurrences",
            "description": "Student occurrence tracking",
        },
        {
            "name": "messages",
            "description": "Internal messaging system",
        },
    ]


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload,
        log_level="info" if settings.debug else "warning"
    )