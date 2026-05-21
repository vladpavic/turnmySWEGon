from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./campfire.db"
    upload_dir: str = "uploads"
    cors_origins: list[str] = ["http://localhost:5173"]
    rabbitmq_url: str | None = None  # if unset, publishing is silently skipped

    model_config = {"env_file": ".env"}


settings = Settings()
