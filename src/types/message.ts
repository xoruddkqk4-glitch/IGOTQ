export type MessageStatus = 'pending' | 'answered';

export interface StoredMessage {
  id: string;
  roomId: string;
  parentId: string | null;
  nickname: string;
  content: string;
  isQuestion: boolean;
  isHostReply: boolean;
  status: MessageStatus;
  isRestored: boolean;
  createdAt: string; // ISO 8601
}

export interface ReplyItem {
  id: string;
  nickname: string;
  content: string;
  isHostReply: boolean;
  createdAt: string;
}

export interface ThreadedMessage {
  id: string;
  roomId: string;
  nickname: string;
  content: string;
  isQuestion: boolean;
  isHostReply: boolean;
  status: MessageStatus;
  isRestored: boolean;
  createdAt: string;
  replies: ReplyItem[];
}
