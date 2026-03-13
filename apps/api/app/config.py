from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/shortener"
    REDIS_URL: str = "redis://localhost:6379/0"
    JWT_SECRET: str = "change_me_super_secret"
    JWT_EXPIRE_MINUTES: int = 10080

    DEFAULT_ADMIN_EMAIL: str = "admin@changeme.com"
    DEFAULT_ADMIN_PASSWORD: str = "changeme"

    PUBLIC_WEB_HOST: str = "exa.com"
    PUBLIC_CONTENT_HOST: str = "adsexample.com"
    PUBLIC_ADMIN_HOST: str = "admin.example.com"
    PUBLIC_API_HOST: str = "api.example.com"

    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001,http://localhost:3002"

    @property
    def cors_origins_list(self) -> list[str]:
        return [x.strip() for x in self.CORS_ORIGINS.split(",") if x.strip()]


settings = Settings()
