interface ClientBucket {
  tokens: number;
  lastRefill: number;
  lastMessageContent: string;
}

const clientBuckets = new Map<string, ClientBucket>();

const CAPACITY = 5; // tokens
const REFILL_INTERVAL_MS = 10000; // 10 seconds

export function checkRateLimit(
  socketId: string,
  content: string
): { allowed: boolean; reason?: 'RATE_LIMITED' | 'DUPLICATE_MESSAGE' } {
  const now = Date.now();
  let bucket = clientBuckets.get(socketId);

  if (!bucket) {
    bucket = {
      tokens: CAPACITY - 1,
      lastRefill: now,
      lastMessageContent: content.trim(),
    };
    clientBuckets.set(socketId, bucket);
    return { allowed: true };
  }

  // Refill tokens
  const elapsed = now - bucket.lastRefill;
  if (elapsed >= REFILL_INTERVAL_MS) {
    bucket.tokens = CAPACITY;
    bucket.lastRefill = now;
  }

  // Check duplicate content
  if (bucket.lastMessageContent === content.trim() && content.trim().length > 0) {
    return { allowed: false, reason: 'DUPLICATE_MESSAGE' };
  }

  if (bucket.tokens <= 0) {
    return { allowed: false, reason: 'RATE_LIMITED' };
  }

  bucket.tokens -= 1;
  bucket.lastMessageContent = content.trim();
  return { allowed: true };
}

export function cleanupSocketRateLimit(socketId: string): void {
  clientBuckets.delete(socketId);
}
