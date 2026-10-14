import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseIdToken } from '@/server/authz';
import { getServerStore } from '@/server/context';
import { collectMetrics } from '@/server/metrics';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
  const decoded = await verifyFirebaseIdToken(token);

  if (!decoded || !decoded.admin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  const store = getServerStore();
  const rooms = await store.getAllActiveRooms();
  const totalParticipants = await store.getTotalParticipantCount();
  const metrics = collectMetrics(rooms.length, totalParticipants);

  return NextResponse.json({ metrics, activeRooms: rooms });
}
