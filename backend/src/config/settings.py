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
    
    # OpenAI - REQUIRED
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    
    class Config:
        env_file = ".env"
    
    def validate_required(self) -> None:
        """Validate that required settings are present."""
        if not self.openai_api_key:
            raise ValueError(
                "OPENAI_API_KEY is required. "
                "Please set it in your .env file or environment variables."
            )


settings = Settings()
# Validate on initialization
settings.validate_required()