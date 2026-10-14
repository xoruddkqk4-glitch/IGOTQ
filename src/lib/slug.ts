import { RESERVED_SLUGS } from './constants';

export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function isValidSlug(slug: string): { valid: boolean; reason?: string } {
  if (!slug || slug.length < 3) {
    return { valid: false, reason: '슬러그는 최소 3자 이상이어야 합니다.' };
  }
  if (slug.length > 50) {
    return { valid: false, reason: '슬러그는 최대 50자 이하이어야 합니다.' };
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { valid: false, reason: '영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.' };
  }
  if (RESERVED_SLUGS.has(slug)) {
    return { valid: false, reason: '해당 슬러그는 시스템 예약어로 사용할 수 없습니다.' };
  }
  return { valid: true };
}

export function generateRandomSlug(): string {
  const adjectives = ['swift', 'bright', 'live', 'open', 'spark', 'fast', 'quick', 'clear'];
  const nouns = ['forum', 'room', 'talk', 'chat', 'desk', 'panel', 'voice', 'stage'];
  const randAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randNum = Math.floor(100 + Math.random() * 900);
  return `${randAdj}-${randNoun}-${randNum}`;
}
