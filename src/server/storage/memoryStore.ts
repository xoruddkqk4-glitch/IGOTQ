import { VolatileStore } from './types';
import { RoomInfo } from '@/types/room';
import { StoredMessage } from '@/types/message';

export class MemoryStore implements VolatileStore {
  private rooms = new Map<string, RoomInfo>();
  private messages = new Map<string, Map<string, StoredMessage>>(); // slug -> (msgId -> StoredMessage)
  private messageOrder = new Map<string, string[]>(); // slug -> msgId[]
  private participants = new Map<string, Set<string>>(); // slug -> Set<socketId>

  async createRoom(room: RoomInfo): Promise<void> {
    this.rooms.set(room.slug, { ...room });
    if (!this.messages.has(room.slug)) {
      this.messages.set(room.slug, new Map());
      this.messageOrder.set(room.slug, []);
      this.participants.set(room.slug, new Set());
    }
  }

  async getRoom(slug: string): Promise<RoomInfo | null> {
    const room = this.rooms.get(slug);
    if (!room) return null;
    const count = this.participants.get(slug)?.size || 0;
    return { ...room, participantCount: count };
  }

  async deleteRoom(slug: string): Promise<void> {
    this.rooms.delete(slug);
    this.messages.delete(slug);
    this.messageOrder.delete(slug);
    this.participants.delete(slug);
  }

  async getAllActiveRooms(): Promise<RoomInfo[]> {
    const list: RoomInfo[] = [];
    for (const [slug, room] of this.rooms.entries()) {
      const count = this.participants.get(slug)?.size || 0;
      list.push({ ...room, participantCount: count });
    }
    return list;
  }

  async getExpiredRooms(nowIso: string): Promise<string[]> {
    const expired: string[] = [];
    const nowTime = new Date(nowIso).getTime();
    for (const [slug, room] of this.rooms.entries()) {
      if (new Date(room.expiresAt).getTime() <= nowTime) {
        expired.push(slug);
      }
    }
    return expired;
  }

  async addMessage(slug: string, message: StoredMessage): Promise<void> {
    let msgMap = this.messages.get(slug);
    let order = this.messageOrder.get(slug);
    if (!msgMap || !order) {
      msgMap = new Map();
      order = [];
      this.messages.set(slug, msgMap);
      this.messageOrder.set(slug, order);
    }
    msgMap.set(message.id, { ...message });
    order.push(message.id);
  }

  async getMessages(slug: string): Promise<StoredMessage[]> {
    const msgMap = this.messages.get(slug);
    const order = this.messageOrder.get(slug);
    if (!msgMap || !order) return [];

    return order.map((id) => msgMap.get(id)!).filter(Boolean);
  }

  async getMessageById(slug: string, messageId: string): Promise<StoredMessage | null> {
    const msg = this.messages.get(slug)?.get(messageId);
    return msg ? { ...msg } : null;
  }

  async updateMessage(
    slug: string,
    messageId: string,
    updates: Partial<StoredMessage>
  ): Promise<StoredMessage | null> {
    const msgMap = this.messages.get(slug);
    if (!msgMap) return null;
    const existing = msgMap.get(messageId);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    msgMap.set(messageId, updated);
    return { ...updated };
  }

  async deleteMessage(slug: string, messageId: string): Promise<boolean> {
    const msgMap = this.messages.get(slug);
    const order = this.messageOrder.get(slug);
    if (!msgMap || !order) return false;

    const exists = msgMap.delete(messageId);
    if (exists) {
      const idx = order.indexOf(messageId);
      if (idx !== -1) order.splice(idx, 1);
    }
    return exists;
  }

  async addParticipant(slug: string, socketId: string): Promise<number> {
    let set = this.participants.get(slug);
    if (!set) {
      set = new Set();
      this.participants.set(slug, set);
    }
    set.add(socketId);
    return set.size;
  }

  async removeParticipant(slug: string, socketId: string): Promise<number> {
    const set = this.participants.get(slug);
    if (!set) return 0;
    set.delete(socketId);
    return set.size;
  }

  async getParticipantCount(slug: string): Promise<number> {
    return this.participants.get(slug)?.size || 0;
  }

  async getTotalParticipantCount(): Promise<number> {
    let total = 0;
    for (const set of this.participants.values()) {
      total += set.size;
    }
    return total;
  }
}
