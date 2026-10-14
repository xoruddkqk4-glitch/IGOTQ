import { SystemSettings } from '@/types/settings';
import { DEFAULT_TTL_MINUTES, MAX_TTL_MINUTES, MAX_MESSAGE_LENGTH, RATE_LIMIT_PER_10_SEC } from '@/lib/constants';

let currentSettings: SystemSettings = {
  defaultTtlMinutes: DEFAULT_TTL_MINUTES,
  maxTtlMinutes: MAX_TTL_MINUTES,
  maxMessageLength: MAX_MESSAGE_LENGTH,
  rateLimitPer10Sec: RATE_LIMIT_PER_10_SEC,
};

export function getSystemSettings(): SystemSettings {
  return { ...currentSettings };
}

export function updateSystemSettings(newSettings: Partial<SystemSettings>): SystemSettings {
  currentSettings = {
    ...currentSettings,
    ...newSettings,
  };
  return { ...currentSettings };
}
