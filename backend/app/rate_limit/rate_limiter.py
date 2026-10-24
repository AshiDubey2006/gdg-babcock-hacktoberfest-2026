from fastapi import HTTPException,status, Request
from pathlib import Path
from uuid import uuid4
from redis.asyncio import Redis
from app.dependencies import AdminDep
from app.redis import redis_client


# Class to initialize a sliding window rate limiter implemented by Lua script 
class SlidingWindowRateLimiter:
    def __init__(self, redis_client:Redis,limit: int = 100,window_ms: int = 1000 ):
        if(limit<=0 or window_ms<=0):
            raise ValueError("Both Limit and Window interval should be greater than 0 ms")
        self.redis_client=redis_client
        self.limit=limit
        self.window_ms=window_ms
        # Load the lua script 
        script_path= Path(__file__).with_name("sliding_window.lua")
        lua_script = script_path.read_text(encoding="utf-8")
        # Register the script with Redis
        self.script = self.redis_client.register_script(lua_script)
        
    async def is_allowed(self,key:str) -> bool:
        request_id=str(uuid4())
        
        result= await self.script(
            keys=[key],
            args=[
                str(self.limit),
                str(self.window_ms),
                str(request_id)
            ]
        )
        allowed = bool(result[0])
        return allowed

# Defining the rate limiter    
rate_limiter= SlidingWindowRateLimiter(
    redis_client=redis_client,
    limit=100,
    window_ms=1000
)


async def rate_limit_dependency(key):
    is_allowed= await rate_limiter.is_allowed(key)
    
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later."
        )

# Auth dependencies
async def login_rate_limit_dependency(request: Request):
    client_ip= request.client.host if request.client else "unknown"
    key= f"rate_limit:auth:login:{client_ip}"
    await rate_limit_dependency(key)
    
async def register_rate_limit_dependency(request: Request):
    client_ip= request.client.host if request.client else "unknown"
    key= f"rate_limit:auth:register:{client_ip}"
    await rate_limit_dependency(key)
    
        
# Grading Dependencies
async def grade_submission_rate_limit_dependency(admin: AdminDep):
    user_id= admin.id if admin else "unknown"
    key= f"rate_limit:grading:submission:{user_id}"
    await rate_limit_dependency(key)
    
async def override_submission_rate_limit_dependency(admin: AdminDep):
    user_id= admin.id if admin else "unknown"
    key= f"rate_limit:grading:override_submission:{user_id}"
    await rate_limit_dependency(key)
            
        
        