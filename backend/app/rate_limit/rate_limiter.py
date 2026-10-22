import time
import asyncio
import math

from collections import deque,defaultdict
from fastapi import HTTPException,status, Request

class SlidingWindowRateLimiter:
    def __init__(self, limit: int=5,window_seconds: int=60):
        self.limit=limit
        self.window_seconds=window_seconds
        
        self.request_store= defaultdict(deque)
        # creates a dictionary that automatically initializes a new, empty deque whenever you access a key that does not exist.
        self.lock= asyncio.Lock()
        
    async def is_allowed(self,key:str) -> bool:
        async with self.lock:
            current_time= time.monotonic()
            timestamps= self.request_store[key]
            
            while timestamps and current_time-timestamps[0]>= self.window_seconds:
                timestamps.popleft()
                
            if(len(timestamps)> self.limit):
                return False
            
            timestamps.append(current_time)            
            return True
        
rate_limiter= SlidingWindowRateLimiter()


# FastAPI dependency
async def rate_limit_dependency(request: Request):
    client_ip= request.client.host if request.client else "unknown"
    key= f"{request.url.path}:{client_ip}"
    is_allowed= await rate_limiter.is_allowed(key)
    
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later."
        )
            
        
        