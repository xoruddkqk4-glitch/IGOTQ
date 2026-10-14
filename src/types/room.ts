export interface NoticeAttachment {
  name: string;
  size: number;
  dataUrl: string;
  type?: string;
}

export interface RoomInfo {
  id: string;
  slug: string;
  title: string;
  notice?: string | null; // Pinned room announcement set by host
  noticeAttachment?: NoticeAttachment | null; // Shared file attachment set by host
  hostTokenHash?: string;
  hostUid?: string | null;
  isCloudPersisted: boolean;
  ttlMinutes: number; // Session retention time in minutes after host closes the room
  isClosed: boolean; // false while actively running, true after host closes the room
  closedAt?: string | null; // ISO 8601 when host closed the room
  expiresAt: string | null; // ISO 8601 when retention period ends (null while room is active)
  createdAt: string; // ISO 8601
  participantCount?: number;
}

export interface CreateRoomInput {
  title: string;
  slug?: string;
  ttlMinutes?: number;
  isCloudPersisted?: boolean;
  consentGiven?: boolean;
}

export interface CreateRoomResponse {
  room: RoomInfo;
  hostToken: string;
}
