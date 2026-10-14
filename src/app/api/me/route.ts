import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseIdToken } from '@/server/authz';
import { adminFirestore } from '@/server/firebaseAdmin';
import { UserProfile } from '@/types/user';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
  const decoded = await verifyFirebaseIdToken(token);

  if (!decoded) {
    return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
  }

  const userDocRef = adminFirestore().collection('users').doc(decoded.uid);
  const doc = await userDocRef.get();

  if (!doc.exists) {
    const newProfile: UserProfile = {
      uid: decoded.uid,
      email: decoded.email || '',
      role: decoded.admin ? 'admin' : 'user',
      canPersist: Boolean(decoded.admin),
      emailVerified: Boolean(decoded.email_verified),
      createdAt: new Date().toISOString(),
    };
    await userDocRef.set(newProfile);
    return NextResponse.json({ user: newProfile });
  }

  const user = doc.data() as UserProfile;
  return NextResponse.json({ user });
}
