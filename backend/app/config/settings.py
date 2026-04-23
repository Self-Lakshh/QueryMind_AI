import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./querymind.db"
    AI_SERVER_URL: str = "http://localhost:8001/generate"
    MAX_QUERY_ROWS: int = 100
    ALLOWED_ORIGINS: str = "http://localhost:5173"
    DEBUG: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
