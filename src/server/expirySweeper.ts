import { getServerStore, getServerIO } from './context';
import { firestoreRepo } from './storage/firestoreRepo';

let sweeperInterval: NodeJS.Timeout | null = null;

export function startExpirySweeper(): void {
  if (sweeperInterval) return;

  sweeperInterval = setInterval(async () => {
    try {
      const store = getServerStore();
      const io = getServerIO();
      const nowIso = new Date().toISOString();
      const expiredSlugs = await store.getExpiredRooms(nowIso);

      for (const slug of expiredSlugs) {
        const room = await store.getRoom(slug);
        if (io) {
          io.to(`room:${slug}`).emit('room_expired', {
            slug,
            reason: 'SESSION_TTL_EXPIRED',
            message: '세션 유효 시간이 만료되어 방이 안전하게 종료 및 삭제되었습니다.',
          });
        }

        // Delete from volatile store
        await store.deleteRoom(slug);

        // Delete from cloud DB if persisted
        if (room && room.isCloudPersisted) {
          await firestoreRepo.deleteRoom(room.id).catch((e) => console.error('Cloud cleanup err:', e));
        }
      }
    } catch (err) {
      console.error('Expiry sweeper error:', err);
    }
  }, 5000);
}

export function stopExpirySweeper(): void {
  if (sweeperInterval) {
    clearInterval(sweeperInterval);
    sweeperInterval = null;
  }
}
