import { MessageStatus } from './message';

export interface SessionExportReply {
  id: string;
  nickname: string;
  content: string;
  createdAt: string;
}

export interface SessionExportMessage {
  id: string;
  parent_id?: string | null;
  parentId?: string | null;
  nickname: string;
  content: string;
  status: MessageStatus;
  createdAt: string;
  isRestored?: boolean;
  replies?: SessionExportReply[];
}

export interface SessionExportData {
  service: "IGOTQ";
  version: "1.0";
  exportedAt: string;
  roomInfo: {
    title: string;
    slug: string;
    expiresAt?: string;
  };
  messages: SessionExportMessage[];
}
