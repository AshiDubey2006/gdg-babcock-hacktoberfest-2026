import time
import pytest
import pytest_asyncio
import redis.asyncio as Redis
from app.config import get_settings

from app.rate_limit.rate_limiter import SlidingWindowRateLimiter

@pytest_asyncio.fixture
async def redis_client():
    settings=get_settings()
    client=Redis.from_url(settings.redis_url, decode_responses=True)
    await client.flushdb()
    yield client
    await client.flushdb()
    await client.aclose()
    
@pytest.mark.asyncio
async def test_login_limit_by_ip(redis_client):
    limiter = SlidingWindowRateLimiter(redis_client, limit=2, window_ms=1000)

    key = "rate_limit:auth:login:127.0.0.1"

    assert await limiter.is_allowed(key) is True
    assert await limiter.is_allowed(key) is True
    assert await limiter.is_allowed(key) is False


async def test_grading_limit_by_user_and_submission(redis_client):
    limiter = SlidingWindowRateLimiter(redis_client, limit=1, window_ms=1000)

    key = "rate_limit:grading:submission:42"

    assert await limiter.is_allowed(key) is True
    assert await limiter.is_allowed(key) is False
    
async def test_allows_requests_until_the_limit(redis_client):
    limiter = SlidingWindowRateLimiter(redis_client, limit=3, window_ms=1000)
    key = "rate_limit:auth:login:127.0.0.1"

    assert await limiter.is_allowed(key) is True
    assert await limiter.is_allowed(key) is True
    assert await limiter.is_allowed(key) is True

    assert await limiter.is_allowed(key) is False


async def test_rejects_when_limit_is_reached(redis_client):
    limiter = SlidingWindowRateLimiter(redis_client, limit=2, window_ms=1000)
    key = "rate_limit:grading:submission:99"

    assert await limiter.is_allowed(key) is True
    assert await limiter.is_allowed(key) is True
    assert await limiter.is_allowed(key) is False


async def test_resets_after_the_window(redis_client):
    limiter = SlidingWindowRateLimiter(redis_client, limit=1, window_ms=200)
    key = "rate_limit:auth:register:10.0.0.5"

    assert await limiter.is_allowed(key) is True
    assert await limiter.is_allowed(key) is False

    time.sleep(0.25)
    assert await limiter.is_allowed(key) is True


async def test_works_with_different_keys_independently(redis_client):
    limiter = SlidingWindowRateLimiter(redis_client, limit=1, window_ms=1000)

    login_key = "rate_limit:auth:login:127.0.0.1"
    other_login_key = "rate_limit:auth:login:127.0.0.2"

    assert await limiter.is_allowed(login_key) is True
    assert await limiter.is_allowed(other_login_key) is True

    assert await limiter.is_allowed(login_key) is False
    assert await limiter.is_allowed(other_login_key) is False
    
@pytest.mark.asyncio
async def test_grading_allows_100_requests_per_user(redis_client):
    limiter = SlidingWindowRateLimiter(
        redis_client,
        limit=100,
        window_ms=1000
    )

    key = "rate_limit:grading:user:123"

    # First 100 requests should succeed.
    for _ in range(100):
        assert await limiter.is_allowed(key) is True

    # The 101st-150th requests should be rejected.
    for _ in range(50):
        assert await limiter.is_allowed(key) is False
    # Post waiting one second the other requests should be allowed 
    time.sleep(1)
    for _ in range(10):
        assert await limiter.is_allowed(key) is True


def test_rejects_invalid_config_values(redis_client):
    with pytest.raises(ValueError):
        SlidingWindowRateLimiter(redis_client, limit=0, window_ms=1000)

    with pytest.raises(ValueError):
        SlidingWindowRateLimiter(redis_client, limit=100, window_ms=0)

    with pytest.raises(ValueError):
        SlidingWindowRateLimiter(redis_client, limit=-1, window_ms=1000)

    with pytest.raises(ValueError):
        SlidingWindowRateLimiter(redis_client, limit=100, window_ms=-1)
