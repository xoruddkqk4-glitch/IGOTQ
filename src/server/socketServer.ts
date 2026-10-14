import { Server as SocketIOServer, Socket } from 'socket.io';
import { getServerStore } from './context';
import { verifyHostToken, verifyFirebaseIdToken } from './authz';
import { checkRateLimit, cleanupSocketRateLimit } from './rateLimit';
import { filterProfanity } from './profanityFilter';
import { getSystemSettings } from './settings';
import { collectMetrics } from './metrics';
import { firestoreRepo } from './storage/firestoreRepo';
import { StoredMessage, ThreadedMessage, ReplyItem } from '@/types/message';

interface SocketData {
  slug?: string;
  nickname?: string;
  isHost?: boolean;
  userUid?: string;
}

export function setupSocketServer(io: SocketIOServer) {
  // Main namespace
  io.on('connection', (socket: Socket) => {
    const data: SocketData = {};

    // 1. Join room
    socket.on('join_room', async (payload: { slug: string; nickname: string; hostToken?: string; idToken?: string }) => {
      try {
        const { slug, nickname, hostToken, idToken } = payload;
        if (!slug || !nickname) {
          socket.emit('error', { code: 'INVALID_PAYLOAD', message: '방 슬러그와 닉네임이 필요합니다.' });
          return;
        }

        const store = getServerStore();
        const room = await store.getRoom(slug);
        if (!room) {
          socket.emit('error', { code: 'ROOM_NOT_FOUND', message: '존재하지 않거나 이미 종료된 방입니다.' });
          return;
        }

        data.slug = slug;
        data.nickname = nickname.trim().slice(0, 20);

        // Verify Host
        let isHost = false;
        if (hostToken && room.hostTokenHash && verifyHostToken(hostToken, room.hostTokenHash)) {
          isHost = true;
        }

        // If cloud room and authenticated user matches hostUid
        if (idToken) {
          const decoded = await verifyFirebaseIdToken(idToken);
          if (decoded) {
            data.userUid = decoded.uid;
            if (room.hostUid && room.hostUid === decoded.uid) {
              isHost = true;
            }
          }
        }

        data.isHost = isHost;
        socket.join(`room:${slug}`);

        const participantCount = await store.addParticipant(slug, socket.id);
        io.to(`room:${slug}`).emit('participants_updated', { count: participantCount });

        // Build threaded messages
        const storedMsgs = await store.getMessages(slug);
        const threaded = buildThreadedMessages(storedMsgs);

        socket.emit('room_state', {
          room: {
            id: room.id,
            slug: room.slug,
            title: room.title,
            isCloudPersisted: room.isCloudPersisted,
            expiresAt: room.expiresAt,
            createdAt: room.createdAt,
            participantCount,
          },
          isHost,
          messages: threaded,
        });
      } catch (err) {
        console.error('join_room error:', err);
        socket.emit('error', { code: 'SERVER_ERROR', message: '방 입장 처리 중 오류가 발생했습니다.' });
      }
    });

    // 2. Send message / question
    socket.on('send_message', async (payload: { content: string; isQuestion?: boolean; slug?: string; nickname?: string }) => {
      try {
        const slug = data.slug || payload.slug;
        const nickname = data.nickname || payload.nickname;
        if (!slug || !nickname) {
          socket.emit('error', { code: 'NOT_IN_ROOM', message: '방에 먼저 입장해야 합니다.' });
          return;
        }

        // Recover socket session data and join room if missing
        if (!data.slug || !data.nickname) {
          data.slug = slug;
          data.nickname = nickname.trim().slice(0, 20);
          socket.join(`room:${slug}`);
        }

        const content = (payload.content || '').trim();
        const settings = getSystemSettings();

        if (!content || content.length > settings.maxMessageLength) {
          socket.emit('error', {
            code: 'INVALID_LENGTH',
            message: `메시지는 1자 이상 ${settings.maxMessageLength}자 이하여야 합니다.`,
          });
          return;
        }

        // Rate limit check
        const rateCheck = checkRateLimit(socket.id, content);
        if (!rateCheck.allowed) {
          const msg = rateCheck.reason === 'DUPLICATE_MESSAGE' ? '중복된 메시지는 연속해서 보낼 수 없습니다.' : '요청이 너무 빠릅니다. 잠시 후 다시 시도해 주세요.';
          socket.emit('error', { code: rateCheck.reason || 'RATE_LIMITED', message: msg });
          return;
        }

        // Profanity filter
        const { cleanText } = filterProfanity(content);

        const store = getServerStore();
        const room = await store.getRoom(slug);
        if (!room) {
          socket.emit('error', { code: 'ROOM_NOT_FOUND', message: '방이 만료되었거나 존재하지 않습니다.' });
          return;
        }

        const newMsg: StoredMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          roomId: room.id,
          parentId: null,
          nickname,
          content: cleanText,
          isQuestion: Boolean(payload.isQuestion),
          isHostReply: false,
          status: 'pending',
          isRestored: false,
          createdAt: new Date().toISOString(),
        };

        await store.addMessage(slug, newMsg);

        if (room.isCloudPersisted) {
          firestoreRepo.saveMessage(room.id, newMsg).catch((e) => console.error('Cloud msg save err:', e));
        }

        const threadedItem: ThreadedMessage = {
          ...newMsg,
          replies: [],
        };

        io.to(`room:${slug}`).emit('message_created', { message: threadedItem });
      } catch (err) {
        console.error('send_message error:', err);
        socket.emit('error', { code: 'SERVER_ERROR', message: '메시지 전송 중 오류가 발생했습니다.' });
      }
    });

    // 3. Send reply (Host only)
    socket.on('send_reply', async (payload: { parentId: string; content: string }) => {
      try {
        const { slug, nickname, isHost } = data;
        if (!slug || !isHost) {
          socket.emit('error', { code: 'FORBIDDEN', message: '대댓글 답변은 호스트만 작성할 수 있습니다.' });
          return;
        }

        const { parentId, content } = payload;
        const cleanContent = (content || '').trim();
        if (!parentId || !cleanContent) {
          socket.emit('error', { code: 'INVALID_PAYLOAD', message: '답변 내용과 대상 질문이 필요합니다.' });
          return;
        }

        const store = getServerStore();
        const room = await store.getRoom(slug);
        if (!room) return;

        const parentMsg = await store.getMessageById(slug, parentId);
        if (!parentMsg) {
          socket.emit('error', { code: 'MESSAGE_NOT_FOUND', message: '답변할 원본 질문을 찾을 수 없습니다.' });
          return;
        }

        const { cleanText } = filterProfanity(cleanContent);

        const replyMsg: StoredMessage = {
          id: `reply-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          roomId: room.id,
          parentId,
          nickname: `${nickname}(Host)`,
          content: cleanText,
          isQuestion: false,
          isHostReply: true,
          status: 'answered',
          isRestored: false,
          createdAt: new Date().toISOString(),
        };

        await store.addMessage(slug, replyMsg);

        // Auto mark parent as answered
        const updatedParent = await store.updateMessage(slug, parentId, { status: 'answered' });

        if (room.isCloudPersisted) {
          firestoreRepo.saveMessage(room.id, replyMsg).catch((e) => console.error('Cloud reply err:', e));
          if (updatedParent) {
            firestoreRepo.saveMessage(room.id, updatedParent).catch((e) => console.error('Cloud parent update err:', e));
          }
        }

        // Broadcast updated thread
        const allMsgs = await store.getMessages(slug);
        const threaded = buildThreadedMessages(allMsgs);
        const targetThread = threaded.find((t) => t.id === parentId);

        if (targetThread) {
          io.to(`room:${slug}`).emit('message_updated', { message: targetThread });
        }
      } catch (err) {
        console.error('send_reply error:', err);
        socket.emit('error', { code: 'SERVER_ERROR', message: '대댓글 등록 중 오류가 발생했습니다.' });
      }
    });

    // 4. Toggle status (Host only)
    socket.on('toggle_status', async (payload: { messageId: string; status: 'pending' | 'answered' }) => {
      try {
        const { slug, isHost } = data;
        if (!slug || !isHost) {
          socket.emit('error', { code: 'FORBIDDEN', message: '질문 상태 변경은 호스트만 가능합니다.' });
          return;
        }

        const store = getServerStore();
        const updated = await store.updateMessage(slug, payload.messageId, { status: payload.status });
        if (!updated) return;

        const room = await store.getRoom(slug);
        if (room?.isCloudPersisted) {
          firestoreRepo.saveMessage(room.id, updated).catch((e) => console.error('Cloud update status err:', e));
        }

        const allMsgs = await store.getMessages(slug);
        const threaded = buildThreadedMessages(allMsgs);
        const target = threaded.find((t) => t.id === payload.messageId);

        if (target) {
          io.to(`room:${slug}`).emit('message_updated', { message: target });
        }
      } catch (err) {
        console.error('toggle_status error:', err);
      }
    });

    // 5. Delete message (Host only)
    socket.on('delete_message', async (payload: { messageId: string }) => {
      try {
        const { slug, isHost } = data;
        if (!slug || !isHost) {
          socket.emit('error', { code: 'FORBIDDEN', message: '메시지 삭제 권한이 없습니다.' });
          return;
        }

        const store = getServerStore();
        await store.deleteMessage(slug, payload.messageId);

        io.to(`room:${slug}`).emit('message_deleted', { messageId: payload.messageId });
      } catch (err) {
        console.error('delete_message error:', err);
      }
    });

    // 6. Import session (Host only)
    socket.on('import_session', async (payload: { messages: ThreadedMessage[] }) => {
      try {
        const { slug, isHost } = data;
        if (!slug || !isHost) {
          socket.emit('error', { code: 'FORBIDDEN', message: '세션 복원은 호스트만 수행할 수 있습니다.' });
          return;
        }

        const store = getServerStore();
        const room = await store.getRoom(slug);
        if (!room) return;

        for (const tm of payload.messages) {
          const rootMsg: StoredMessage = {
            id: tm.id,
            roomId: room.id,
            parentId: null,
            nickname: tm.nickname,
            content: tm.content,
            isQuestion: tm.isQuestion,
            isHostReply: tm.isHostReply,
            status: tm.status,
            isRestored: true,
            createdAt: tm.createdAt,
          };
          await store.addMessage(slug, rootMsg);

          for (const rep of tm.replies) {
            const repMsg: StoredMessage = {
              id: rep.id,
              roomId: room.id,
              parentId: tm.id,
              nickname: rep.nickname,
              content: rep.content,
              isQuestion: false,
              isHostReply: rep.isHostReply,
              status: 'answered',
              isRestored: true,
              createdAt: rep.createdAt,
            };
            await store.addMessage(slug, repMsg);
          }
        }

        const allMsgs = await store.getMessages(slug);
        const threaded = buildThreadedMessages(allMsgs);
        io.to(`room:${slug}`).emit('session_imported', { messages: threaded });
      } catch (err) {
        console.error('import_session error:', err);
      }
    });

    // 7. Close room (Host only)
    socket.on('close_room', async () => {
      try {
        const { slug, isHost } = data;
        if (!slug || !isHost) return;

        const store = getServerStore();
        const room = await store.getRoom(slug);

        io.to(`room:${slug}`).emit('room_expired', {
          slug,
          reason: 'HOST_CLOSED',
          message: '방장이 세션을 종료하였습니다.',
        });

        await store.deleteRoom(slug);

        if (room?.isCloudPersisted) {
          await firestoreRepo.deleteRoom(room.id).catch((e) => console.error('Cloud close err:', e));
        }
      } catch (err) {
        console.error('close_room error:', err);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      cleanupSocketRateLimit(socket.id);
      if (data.slug) {
        const store = getServerStore();
        const count = await store.removeParticipant(data.slug, socket.id);
        io.to(`room:${data.slug}`).emit('participants_updated', { count });
      }
    });
  });

  // Admin namespace for live telemetry
  const adminNs = io.of('/admin');
  adminNs.on('connection', (socket: Socket) => {
    const sendMetrics = async () => {
      const store = getServerStore();
      const rooms = await store.getAllActiveRooms();
      const totalParts = await store.getTotalParticipantCount();
      const metrics = collectMetrics(rooms.length, totalParts);
      socket.emit('metrics', { metrics, activeRooms: rooms });
    };

    sendMetrics();
    const interval = setInterval(sendMetrics, 5000);

    socket.on('disconnect', () => {
      clearInterval(interval);
    });
  });
}

function buildThreadedMessages(storedMsgs: StoredMessage[]): ThreadedMessage[] {
  const rootMsgs = storedMsgs.filter((m) => !m.parentId);
  const repliesByParent = new Map<string, ReplyItem[]>();

  storedMsgs
    .filter((m) => m.parentId)
    .forEach((m) => {
      const pId = m.parentId!;
      const list = repliesByParent.get(pId) || [];
      list.push({
        id: m.id,
        nickname: m.nickname,
        content: m.content,
        isHostReply: m.isHostReply,
        createdAt: m.createdAt,
      });
      repliesByParent.set(pId, list);
    });

  return rootMsgs.map((rm) => ({
    id: rm.id,
    roomId: rm.roomId,
    nickname: rm.nickname,
    content: rm.content,
    isQuestion: rm.isQuestion,
    isHostReply: rm.isHostReply,
    status: rm.status,
    isRestored: rm.isRestored,
    createdAt: rm.createdAt,
    replies: repliesByParent.get(rm.id) || [],
  }));
}
