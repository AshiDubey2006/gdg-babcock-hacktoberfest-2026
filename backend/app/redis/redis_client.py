from app.config import get_settings
from redis.asyncio import Redis

settings=get_settings()
redis_client: Redis = Redis.from_url(settings.redis_url)