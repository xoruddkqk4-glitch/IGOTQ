import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseIdToken } from '@/server/authz';
import { adminFirestore } from '@/server/firebaseAdmin';
import { firestoreRepo } from '@/server/storage/firestoreRepo';
import { RoomInfo } from '@/types/room';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
  const decoded = await verifyFirebaseIdToken(token);

  if (!decoded || !decoded.admin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  const snap = await adminFirestore().collection('rooms').orderBy('createdAt', 'desc').get();
  const rooms: RoomInfo[] = [];
  snap.forEach((doc) => {
    rooms.push(doc.data() as RoomInfo);
  });

  return NextResponse.json({ rooms });
}

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
  const decoded = await verifyFirebaseIdToken(token);

  if (!decoded || !decoded.admin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId');
  if (!roomId) {
    return NextResponse.json({ error: 'roomId가 필요합니다.' }, { status: 400 });
  }

  await firestoreRepo.deleteRoom(roomId);
  return NextResponse.json({ success: true });
}
