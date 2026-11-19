import { Redis } from 'ioredis';

import { env } from '../config/env.js';

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  connectTimeout: 5_000,
  maxRetriesPerRequest: 1,
  retryStrategy(times: number) {
    return Math.min(times * 500, 5_000);
  },
});

export async function connectRedis(): Promise<void> {
  if (redis.status === 'wait') {
    await redis.connect();
  }

  if (redis.status !== 'ready') {
    throw new Error(`Redis is not ready. Current status: ${redis.status}`);
  }
}

export async function checkRedisConnection(): Promise<void> {
  const response = await redis.ping();

  if (response !== 'PONG') {
    throw new Error('Redis health check failed');
  }
}

export async function closeRedisConnection(): Promise<void> {
  if (redis.status === 'ready') {
    await redis.quit();
    return;
  }

  redis.disconnect();
}
