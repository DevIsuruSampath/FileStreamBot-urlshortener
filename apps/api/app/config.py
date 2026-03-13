from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    DATABASE_URL: str = 'postgresql+asyncpg://postgres:postgres@localhost:5432/shortener'
    REDIS_URL: str = 'redis://localhost:6379/0'
    JWT_SECRET: str = 'change_me_super_secret'
    JWT_EXPIRE_MINUTES: int = 10080

    DEFAULT_ADMIN_EMAIL: str = 'admin@changeme.com'
    DEFAULT_ADMIN_PASSWORD: str = 'changeme'

    PUBLIC_WEB_HOST: str = 'exa.com'
    PUBLIC_CONTENT_HOST: str = 'adsexample.com'


settings = Settings()
