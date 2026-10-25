-- KEYS[1] = Redis key for this rate-limit bucket
-- ARGV[1] = maximum allowed requests
-- ARGV[2] = window duration in milliseconds
-- ARGV[3] = unique request ID

local key=KEYS[1]
local limit=tonumber(ARGV[1])
local window_ms=tonumber(ARGV[2])
local request_id=ARGV[3]

-- Step 1: Get current time from Redis (in milliseconds)
local redis_time =redis.call('TIME')
local seconds =tonumber(redis_time[1])
local microseconds =tonumber(redis_time[2])

local now =(seconds * 1000)+math.floor(microseconds / 1000)

-- Step 2: Calculate beginning of the sliding window
local window_start= now-window_ms

-- Step 3: Remove Requests outside the current window 
redis.call('ZREMRANGEBYSCORE',key,'-inf', window_start)

-- Step 4: Count requests currently inside the window
local request_count= redis.call('ZCARD',key)

-- Step 5: Reject request if the count is greater than limit
if request_count>=limit then
    return {0,0}
end

-- Step 6: Add this request with its timestamp as the score
redis.call('ZADD',key,now,request_id)

-- Step 7: Expire the key when it becomes inactive
redis.call('PEXPIRE',key,window_ms)

-- Step 8: Calculate remaining requests
local remaining = limit-request_count-1

-- Step 9: Return: allowed, remaining requests
return {1, remaining}
