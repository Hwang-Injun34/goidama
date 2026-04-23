from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    KAKAO_REST_API_KEY: str
    KAKAO_REDIRECT_URI: str
    KAKAO_CLIENT_SECRET: str

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings():
    return Settings()

