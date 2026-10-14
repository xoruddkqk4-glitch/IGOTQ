import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseIdToken } from '@/server/authz';
import { adminFirestore } from '@/server/firebaseAdmin';
import { UserProfile } from '@/types/user';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
  const decoded = await verifyFirebaseIdToken(token);

  if (!decoded || !decoded.admin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  const snap = await adminFirestore().collection('users').orderBy('createdAt', 'desc').get();
  const users: UserProfile[] = [];
  snap.forEach((doc) => {
    users.push(doc.data() as UserProfile);
  });

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
  const decoded = await verifyFirebaseIdToken(token);

  if (!decoded || !decoded.admin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  const { targetUid, canPersist } = await req.json();
  if (!targetUid) {
    return NextResponse.json({ error: '대상 UID가 필요합니다.' }, { status: 400 });
  }

  const userRef = adminFirestore().collection('users').doc(targetUid);
  await userRef.set(
    {
      canPersist: Boolean(canPersist),
      approvedBy: decoded.email || decoded.uid,
      approvedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  const updatedDoc = await userRef.get();
  return NextResponse.json({ user: updatedDoc.data() });
}
