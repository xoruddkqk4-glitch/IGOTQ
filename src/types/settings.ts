export interface SystemSettings {
  defaultTtlMinutes: number;
  maxTtlMinutes: number;
  maxMessageLength: number;
  rateLimitPer10Sec: number;
}

export interface AdminMetrics {
  activeRoomsCount: number;
  totalParticipants: number;
  memoryUsageMb: number;
  cpuUsagePercent: number;
  uptimeSeconds: number;
  timestamp: string;
}
