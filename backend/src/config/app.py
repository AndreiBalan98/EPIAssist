"""FastAPI application configuration."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config.settings import settings
from .routes.api import router
from .utils.logger import setup_logger

logger = setup_logger(__name__, settings.log_level)


def create_app() -> FastAPI:
    """
    Create and configure FastAPI application.
    
    Returns:
        Configured FastAPI app instance
    """
    app = FastAPI(
        title="EPI Assist API",
        description="Medical documentation assistant backend",
        version="0.1.0"
    )
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routes
    app.include_router(router)
    
    logger.info(f"FastAPI app created - Environment: {settings.env}")
    
    return app