import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyFirebaseIdToken, hashHostToken } from '@/server/authz';
import { firestoreRepo } from '@/server/storage/firestoreRepo';
import { getServerStore } from '@/server/context';
import { adminFirestore } from '@/server/firebaseAdmin';
import { generateRandomSlug } from '@/lib/slug';
import { RoomInfo } from '@/types/room';

export async function POST(req: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const { roomId } = params;
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    const decoded = await verifyFirebaseIdToken(token);

    if (!decoded) {
      return NextResponse.json({ error: '인증되지 않았습니다.' }, { status: 401 });
    }

    const roomDoc = await adminFirestore().collection('rooms').doc(roomId).get();
    if (!roomDoc.exists) {
      return NextResponse.json({ error: '보관된 방을 찾을 수 없습니다.' }, { status: 404 });
    }

    const roomData = roomDoc.data();
    if (roomData?.hostUid !== decoded.uid && !decoded.admin) {
      return NextResponse.json({ error: '이 방을 복원할 권한이 없습니다.' }, { status: 403 });
    }

    const pastMessages = await firestoreRepo.getRoomMessages(roomId);
    const store = getServerStore();

    // Generate new live session
    const newSlug = generateRandomSlug();
    const hostToken = crypto.randomBytes(24).toString('hex');
    const hostTokenHash = hashHostToken(hostToken);
    const newRoomId = `restored-${Date.now()}`;
    const now = new Date();

    const roomTitle = roomData?.title || '저장된 방';
    const newRoom: RoomInfo = {
      id: newRoomId,
      slug: newSlug,
      title: `${roomTitle} (복원됨)`,
      hostTokenHash,
      hostUid: decoded.uid,
      isCloudPersisted: false,
      ttlMinutes: roomData?.ttlMinutes || 120,
      isClosed: false,
      closedAt: null,
      expiresAt: null,
      createdAt: now.toISOString(),
      participantCount: 0,
    };

    await store.createRoom(newRoom);

    // Inject past messages marked with isRestored: true
    for (const msg of pastMessages) {
      await store.addMessage(newSlug, {
        ...msg,
        id: `restored-${msg.id}`,
        roomId: newRoomId,
        isRestored: true,
      });
    }

    return NextResponse.json({
      room: newRoom,
      hostToken,
      restoredCount: pastMessages.length,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류';
    return NextResponse.json({ error: `복원 실패: ${errorMsg}` }, { status: 500 });
  }
}
