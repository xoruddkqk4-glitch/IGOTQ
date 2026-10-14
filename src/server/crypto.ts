import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY;
  if (envKey) {
    const buf = Buffer.from(envKey, 'base64');
    if (buf.length === 32) return buf;
    if (Buffer.from(envKey).length === 32) return Buffer.from(envKey);
  }
  // Default fallback deterministic 32-byte key for local development
  return crypto.scryptSync('igotq-fallback-secret-password-key', 'igotq-salt', 32);
}

export function encryptText(plaintext: string): { ciphertext: string; iv: string; authTag: string } {
  const iv = crypto.randomBytes(12);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return {
    ciphertext: encrypted,
    iv: iv.toString('hex'),
    authTag,
  };
}

export function decryptText(encryptedHex: string, ivHex: string, authTagHex: string): string {
  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return '[복호화 실패]';
  }
}
