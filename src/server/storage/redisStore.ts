import Redis from 'ioredis';
import { VolatileStore } from './types';
import { RoomInfo } from '@/types/room';
import { StoredMessage } from '@/types/message';

export class RedisStore implements VolatileStore {
  private client: Redis;

  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 100, 3000),
    });
  }

  async createRoom(room: RoomInfo): Promise<void> {
    const ttlSeconds =
      room.isClosed && room.expiresAt
        ? Math.max(1, Math.floor((new Date(room.expiresAt).getTime() - Date.now()) / 1000))
        : 7 * 24 * 3600; // Keep active rooms for up to 7 days
    const score = room.isClosed && room.expiresAt ? new Date(room.expiresAt).getTime() : 8640000000000000;
    const roomKey = `room:${room.slug}`;
    await this.client
      .multi()
      .hset(roomKey, {
        id: room.id,
        slug: room.slug,
        title: room.title,
        notice: room.notice || '',
        noticeAttachment: room.noticeAttachment ? JSON.stringify(room.noticeAttachment) : '',
        hostTokenHash: room.hostTokenHash || '',
        hostUid: room.hostUid || '',
        isCloudPersisted: room.isCloudPersisted ? '1' : '0',
        ttlMinutes: String(room.ttlMinutes || 120),
        isClosed: room.isClosed ? '1' : '0',
        closedAt: room.closedAt || '',
        expiresAt: room.expiresAt || '',
        createdAt: room.createdAt,
      })
      .expire(roomKey, ttlSeconds)
      .zadd('rooms:active', score, room.slug)
      .exec();
  }

  async getRoom(slug: string): Promise<RoomInfo | null> {
    const raw = await this.client.hgetall(`room:${slug}`);
    if (!raw || !raw.id) return null;

    // Lazy expiration check
    const nowTime = Date.now();
    const isExpired = raw.expiresAt && new Date(raw.expiresAt).getTime() <= nowTime;
    if (isExpired) {
      await this.deleteRoom(slug);
      return null;
    }

    const count = await this.getParticipantCount(slug);
    return {
      id: raw.id,
      slug: raw.slug,
      title: raw.title,
      notice: raw.notice || null,
      noticeAttachment: raw.noticeAttachment ? (() => {
        try { return JSON.parse(raw.noticeAttachment); } catch { return null; }
      })() : null,
      hostTokenHash: raw.hostTokenHash || undefined,
      hostUid: raw.hostUid || null,
      isCloudPersisted: raw.isCloudPersisted === '1',
      ttlMinutes: parseInt(raw.ttlMinutes, 10) || 120,
      isClosed: raw.isClosed === '1',
      closedAt: raw.closedAt || null,
      expiresAt: raw.expiresAt || null,
      createdAt: raw.createdAt,
      participantCount: count,
    };
  }

  async updateRoom(slug: string, updates: Partial<RoomInfo>): Promise<RoomInfo | null> {
    const room = await this.getRoom(slug);
    if (!room) return null;
    const updated: RoomInfo = { ...room, ...updates };
    await this.createRoom(updated);
    return updated;
  }

  async deleteRoom(slug: string): Promise<void> {
    await this.client
      .multi()
      .del(`room:${slug}`)
      .del(`room:${slug}:msgs`)
      .del(`room:${slug}:order`)
      .del(`room:${slug}:presence`)
      .zrem('rooms:active', slug)
      .exec();
  }

  async getAllActiveRooms(): Promise<RoomInfo[]> {
    const slugs = await this.client.zrange('rooms:active', 0, -1);
    const rooms: RoomInfo[] = [];
    for (const slug of slugs) {
      const room = await this.getRoom(slug);
      if (room) rooms.push(room);
    }
    return rooms;
  }

  async getExpiredRooms(nowIso: string): Promise<string[]> {
    const nowTime = new Date(nowIso).getTime();
    return await this.client.zrangebyscore('rooms:active', '-inf', nowTime);
  }

  async addMessage(slug: string, message: StoredMessage): Promise<void> {
    const room = await this.getRoom(slug);
    const ttlSeconds =
      room && room.isClosed && room.expiresAt
        ? Math.max(1, Math.floor((new Date(room.expiresAt).getTime() - Date.now()) / 1000))
        : 7 * 24 * 3600;
    const msgsKey = `room:${slug}:msgs`;
    const orderKey = `room:${slug}:order`;

    await this.client
      .multi()
      .hset(msgsKey, message.id, JSON.stringify(message))
      .rpush(orderKey, message.id)
      .expire(msgsKey, ttlSeconds)
      .expire(orderKey, ttlSeconds)
      .exec();
  }

  async addMessages(slug: string, messages: StoredMessage[]): Promise<void> {
    if (!messages.length) return;
    const room = await this.getRoom(slug);
    const ttlSeconds =
      room && room.isClosed && room.expiresAt
        ? Math.max(1, Math.floor((new Date(room.expiresAt).getTime() - Date.now()) / 1000))
        : 7 * 24 * 3600;
    const msgsKey = `room:${slug}:msgs`;
    const orderKey = `room:${slug}:order`;

    const pipeline = this.client.multi();
    for (const message of messages) {
      pipeline.hset(msgsKey, message.id, JSON.stringify(message));
      pipeline.rpush(orderKey, message.id);
    }
    pipeline.expire(msgsKey, ttlSeconds);
    pipeline.expire(orderKey, ttlSeconds);
    await pipeline.exec();
  }

  async getMessages(slug: string): Promise<StoredMessage[]> {
    const order = await this.client.lrange(`room:${slug}:order`, 0, -1);
    if (!order.length) return [];
    const rawMsgs = await this.client.hmget(`room:${slug}:msgs`, ...order);
    return rawMsgs.filter(Boolean).map((str) => JSON.parse(str!) as StoredMessage);
  }

  async getMessageById(slug: string, messageId: string): Promise<StoredMessage | null> {
    const str = await this.client.hget(`room:${slug}:msgs`, messageId);
    return str ? (JSON.parse(str) as StoredMessage) : null;
  }

  async updateMessage(
    slug: string,
    messageId: string,
    updates: Partial<StoredMessage>
  ): Promise<StoredMessage | null> {
    const existing = await this.getMessageById(slug, messageId);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    await this.client.hset(`room:${slug}:msgs`, messageId, JSON.stringify(updated));
    return updated;
  }

  async deleteMessage(slug: string, messageId: string): Promise<boolean> {
    const res = await this.client.hdel(`room:${slug}:msgs`, messageId);
    if (res > 0) {
      await this.client.lrem(`room:${slug}:order`, 1, messageId);
      return true;
    }
    return false;
  }

  async addParticipant(slug: string, socketId: string): Promise<number> {
    const presenceKey = `room:${slug}:presence`;
    await this.client.sadd(presenceKey, socketId);
    return await this.client.scard(presenceKey);
  }

  async removeParticipant(slug: string, socketId: string): Promise<number> {
    const presenceKey = `room:${slug}:presence`;
    await this.client.srem(presenceKey, socketId);
    return await this.client.scard(presenceKey);
  }

  async getParticipantCount(slug: string): Promise<number> {
    return await this.client.scard(`room:${slug}:presence`);
  }

  async getTotalParticipantCount(): Promise<number> {
    const slugs = await this.client.zrange('rooms:active', 0, -1);
    let total = 0;
    for (const slug of slugs) {
      total += await this.client.scard(`room:${slug}:presence`);
    }
    return total;
  }
}
