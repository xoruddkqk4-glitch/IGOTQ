import { VolatileStore } from './types';
import { MemoryStore } from './memoryStore';
import { RedisStore } from './redisStore';

let storeInstance: VolatileStore | null = null;

export function getVolatileStore(): VolatileStore {
  if (!storeInstance) {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl && redisUrl.trim().length > 0) {
      try {
        storeInstance = new RedisStore(redisUrl);
      } catch (err) {
        console.warn('⚠️ Redis connection failed, falling back to MemoryStore:', err);
        storeInstance = new MemoryStore();
      }
    } else {
      storeInstance = new MemoryStore();
    }
  }
  return storeInstance;
}
