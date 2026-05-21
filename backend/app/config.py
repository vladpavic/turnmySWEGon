from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./campfire.db"
    upload_dir: str = "uploads"

    model_config = {"env_file": ".env"}


settings = Settings()
