import { RoomInfo } from '@/types/room';
import { StoredMessage } from '@/types/message';

export interface VolatileStore {
  createRoom(room: RoomInfo): Promise<void>;
  getRoom(slug: string): Promise<RoomInfo | null>;
  deleteRoom(slug: string): Promise<void>;
  getAllActiveRooms(): Promise<RoomInfo[]>;
  getExpiredRooms(nowIso: string): Promise<string[]>; // returns slugs

  addMessage(slug: string, message: StoredMessage): Promise<void>;
  getMessages(slug: string): Promise<StoredMessage[]>;
  getMessageById(slug: string, messageId: string): Promise<StoredMessage | null>;
  updateMessage(slug: string, messageId: string, updates: Partial<StoredMessage>): Promise<StoredMessage | null>;
  deleteMessage(slug: string, messageId: string): Promise<boolean>;

  addParticipant(slug: string, socketId: string): Promise<number>;
  removeParticipant(slug: string, socketId: string): Promise<number>;
  getParticipantCount(slug: string): Promise<number>;
  getTotalParticipantCount(): Promise<number>;
}
