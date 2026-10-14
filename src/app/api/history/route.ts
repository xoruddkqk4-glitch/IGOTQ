import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseIdToken } from '@/server/authz';
import { firestoreRepo } from '@/server/storage/firestoreRepo';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
  const decoded = await verifyFirebaseIdToken(token);

  if (!decoded) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const rooms = await firestoreRepo.getUserRooms(decoded.uid);
  return NextResponse.json({ rooms });
}
