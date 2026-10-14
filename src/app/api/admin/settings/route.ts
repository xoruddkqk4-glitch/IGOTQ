import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseIdToken } from '@/server/authz';
import { getSystemSettings, updateSystemSettings } from '@/server/settings';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
  const decoded = await verifyFirebaseIdToken(token);

  if (!decoded || !decoded.admin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  return NextResponse.json({ settings: getSystemSettings() });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
  const decoded = await verifyFirebaseIdToken(token);

  if (!decoded || !decoded.admin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  const body = await req.json();
  const updated = updateSystemSettings(body);
  return NextResponse.json({ settings: updated });
}
