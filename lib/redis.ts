import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  lazyConnect: true,
  enableOfflineQueue: false, // Disable offline queue to prevent connection spam
  maxRetriesPerRequest: 1, // Reduced retries to avoid spam
  retryDelayOnClusterDown: 100,
  retryDelayOnFailover: 100,
  retryDelayOnTryAgain: 100,
});

// Handle Redis connection errors gracefully
redis.on('error', (error) => {
  // Only log connection errors in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('Redis connection error (app will continue without Redis caching):', error.message);
  }
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

// Cache configuration
export const CACHE_TTL = {
  USER_STATS: 300, // 5 minutes
  INTERVIEW_LIST: 60, // 1 minute
  FEEDBACK: 600, // 10 minutes
  GESTURE_METRICS: 30, // 30 seconds
};

export const generateCacheKey = (prefix: string, ...params: string[]) => {
  return `${prefix}:${params.join(':')}`;
};

export default redis;
