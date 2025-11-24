"""Application configuration and settings."""
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """App settings loaded from environment variables."""
    
    # Environment
    env: str = "development"
    
    # Logging
    log_level: str = "INFO"
    
    # Paths
    docs_dir: Path = Path(__file__).parent.parent.parent.parent / "docs"
    
    # CORS
    cors_origins: list[str] = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"


settings = Settings()