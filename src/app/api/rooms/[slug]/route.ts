import { NextRequest, NextResponse } from 'next/server';
import { getServerStore } from '@/server/context';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const store = getServerStore();
  const room = await store.getRoom(slug);

  if (!room) {
    return NextResponse.json({ error: '방을 찾을 수 없거나 만료되었습니다.' }, { status: 404 });
  }

  return NextResponse.json({
    room: {
      id: room.id,
      slug: room.slug,
      title: room.title,
      isCloudPersisted: room.isCloudPersisted,
      expiresAt: room.expiresAt,
      createdAt: room.createdAt,
      participantCount: room.participantCount,
    },
  });
}
