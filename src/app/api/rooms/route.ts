import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerStore } from '@/server/context';
import { hashHostToken, verifyFirebaseIdToken } from '@/server/authz';
import { firestoreRepo } from '@/server/storage/firestoreRepo';
import { adminFirestore } from '@/server/firebaseAdmin';
import { getSystemSettings } from '@/server/settings';
import { sanitizeSlug, isValidSlug, generateRandomSlug } from '@/lib/slug';
import { RoomInfo, CreateRoomResponse } from '@/types/room';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = (body.title || '').trim();
    if (!title) {
      return NextResponse.json({ error: '방 제목을 입력해 주세요.' }, { status: 400 });
    }

    const settings = getSystemSettings();
    const ttlMinutes = Math.min(
      settings.maxTtlMinutes,
      Math.max(10, parseInt(body.ttlMinutes, 10) || settings.defaultTtlMinutes)
    );

    let rawSlug = body.slug ? sanitizeSlug(body.slug) : generateRandomSlug();
    const slugCheck = isValidSlug(rawSlug);
    if (!slugCheck.valid) {
      return NextResponse.json({ error: slugCheck.reason }, { status: 400 });
    }

    const store = getServerStore();
    const existing = await store.getRoom(rawSlug);
    if (existing) {
      return NextResponse.json({ error: '이미 사용 중인 방 코드(슬러그)입니다.' }, { status: 409 });
    }

    // Check Cloud Persistence permission
    let isCloudPersisted = false;
    let hostUid: string | null = null;

    if (body.isCloudPersisted) {
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
      const decoded = await verifyFirebaseIdToken(token);

      if (!decoded) {
        return NextResponse.json({ error: '클라우드 저장을 위해서는 먼저 로그인이 필요합니다.' }, { status: 401 });
      }

      const userDoc = await adminFirestore().collection('users').doc(decoded.uid).get();
      const userData = userDoc.data();
      if (!userData?.canPersist && !decoded.admin) {
        return NextResponse.json({ error: '클라우드 저장 권한이 승인되지 않은 계정입니다.' }, { status: 403 });
      }

      if (!body.consentGiven) {
        return NextResponse.json({ error: '클라우드 저장 시 데이터 보관에 대한 동의가 필요합니다.' }, { status: 400 });
      }

      isCloudPersisted = true;
      hostUid = decoded.uid;
    }

    const hostToken = crypto.randomBytes(24).toString('hex');
    const hostTokenHash = hashHostToken(hostToken);
    const roomId = `room-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000).toISOString();

    const room: RoomInfo = {
      id: roomId,
      slug: rawSlug,
      title,
      hostTokenHash,
      hostUid,
      isCloudPersisted,
      expiresAt,
      createdAt: now.toISOString(),
      participantCount: 0,
    };

    await store.createRoom(room);

    if (isCloudPersisted) {
      await firestoreRepo.saveRoom(room);
    }

    const response: CreateRoomResponse = {
      room: {
        id: room.id,
        slug: room.slug,
        title: room.title,
        isCloudPersisted: room.isCloudPersisted,
        expiresAt: room.expiresAt,
        createdAt: room.createdAt,
      },
      hostToken,
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류';
    console.error('Room creation error:', err);
    return NextResponse.json({ error: `방 생성 실패: ${errorMsg}` }, { status: 500 });
  }
}
