import crypto from 'crypto';
import { adminAuth } from './firebaseAdmin';

export function hashHostToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function verifyHostToken(candidate: string, storedHash: string): boolean {
  if (!candidate || !storedHash) return false;
  const candidateHash = hashHostToken(candidate);
  try {
    return crypto.timingSafeEqual(Buffer.from(candidateHash, 'hex'), Buffer.from(storedHash, 'hex'));
  } catch {
    return false;
  }
}

export async function verifyFirebaseIdToken(token?: string) {
  if (!token) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(token);
    return decoded;
  } catch {
    return null;
  }
}
