import json
from typing import Any

import redis

from app.core.config import get_settings
from app.core.logging import logger

settings = get_settings()


class CacheService:
    def __init__(self) -> None:
        self.client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)

    def get(self, key: str) -> Any | None:
        try:
            raw = self.client.get(key)
            return json.loads(raw) if raw else None
        except Exception as exc:
            logger.error(f"Cache get failed for key={key}: {exc}")
            return None

    def set(self, key: str, value: Any, ttl: int | None = None) -> None:
        try:
            self.client.set(
                key,
                json.dumps(value, default=str),
                ex=ttl or settings.REDIS_CACHE_TTL,
            )
        except Exception as exc:
            logger.error(f"Cache set failed for key={key}: {exc}")

    def delete(self, key: str) -> None:
        try:
            self.client.delete(key)
        except Exception as exc:
            logger.error(f"Cache delete failed for key={key}: {exc}")
