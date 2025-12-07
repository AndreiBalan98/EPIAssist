"""Application configuration and settings."""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """App settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"  # Ignore extra fields in .env
    )
    
    # Environment
    env: str = "development"
    
    # Logging
    log_level: str = "INFO"
    
    # Paths - now points to docs/clean for markdown files
    docs_dir: Path = Path(__file__).parent.parent.parent.parent / "docs" / "clean"
    
    # CORS
    cors_origins: list[str] = ["*"]
    
    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    openai_timeout: int = 30
    openai_max_tokens: int = 16000
    
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