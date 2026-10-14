export interface RoomInfo {
  id: string;
  slug: string;
  title: string;
  hostTokenHash?: string;
  hostUid?: string | null;
  isCloudPersisted: boolean;
  expiresAt: string; // ISO 8601
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
