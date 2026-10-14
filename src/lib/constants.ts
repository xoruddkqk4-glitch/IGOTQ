export const DEFAULT_TTL_MINUTES = 120; // 2 hours
export const MAX_TTL_MINUTES = 1440; // 24 hours
export const MAX_MESSAGE_LENGTH = 500;
export const MAX_NICKNAME_LENGTH = 20;
export const RATE_LIMIT_PER_10_SEC = 5;

export const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'login',
  'history',
  '_next',
  'static',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
]);
