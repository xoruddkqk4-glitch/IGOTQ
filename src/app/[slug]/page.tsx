'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { getClientSocket } from '@/lib/socket';
import { useAuth } from '@/hooks/useAuth';
import { NicknameGate } from '@/components/room/NicknameGate';
import { RoomHeader } from '@/components/room/RoomHeader';
import { HostToolbar } from '@/components/room/HostToolbar';
import { QAFilterBar, FilterTab, SortOption } from '@/components/room/QAFilterBar';
import { QuestionCard } from '@/components/room/QuestionCard';
import { MessageInput } from '@/components/room/MessageInput';
import { RoomExpiredOverlay } from '@/components/room/RoomExpiredOverlay';
import { RoomInfo } from '@/types/room';
import { ThreadedMessage } from '@/types/message';
import { MessageSquareDashed, AlertCircle } from 'lucide-react';

export default function RoomPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { getIdToken } = useAuth();

  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [nickname, setNickname] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [messages, setMessages] = useState<ThreadedMessage[]>([]);

  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [sortOption, setSortOption] = useState<SortOption>('latest');
  const [isExpired, setIsExpired] = useState(false);
  const [expiredMsg, setExpiredMsg] = useState<string | undefined>();
  const [socketError, setSocketError] = useState<string | null>(null);

  // 1. Initial Room Metadata fetch
  useEffect(() => {
    async function fetchRoom() {
      try {
        const res = await fetch(`/api/rooms/${slug}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || '방 정보를 불러오지 못했습니다.');
        }
        setRoom(data.room);

        // Check if nickname is remembered
        const savedNick = sessionStorage.getItem(`igotq:nick:${slug}`);
        if (savedNick) setNickname(savedNick);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '알 수 없는 오류';
        setLoadError(msg);
      } finally {
        setLoading(false);
      }
    }
    fetchRoom();
  }, [slug]);

  // 2. Connect socket when nickname is available
  useEffect(() => {
    if (!room || !nickname) return;

    const socket = getClientSocket();
    if (!socket.connected) socket.connect();

    // Check for hostToken in localStorage or hash fragment
    let hostToken = localStorage.getItem(`igotq:host:${slug}`);
    if (typeof window !== 'undefined' && window.location.hash.includes('host=')) {
      const match = window.location.hash.match(/host=([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        hostToken = match[1];
        localStorage.setItem(`igotq:host:${slug}`, hostToken);
      }
    }

    // Join room
    getIdToken().then((idToken) => {
      socket.emit('join_room', {
        slug,
        nickname,
        hostToken: hostToken || undefined,
        idToken,
      });
    });

    socket.on('room_state', (payload) => {
      setIsHost(payload.isHost);
      setMessages(payload.messages || []);
      if (payload.room) {
        setRoom(payload.room);
        setParticipantCount(payload.room.participantCount || 1);
      }
    });

    socket.on('participants_updated', (payload) => {
      setParticipantCount(payload.count);
    });

    socket.on('message_created', (payload) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.message.id)) return prev;
        return [payload.message, ...prev];
      });
    });

    socket.on('message_updated', (payload) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === payload.message.id ? payload.message : m))
      );
    });

    socket.on('message_deleted', (payload) => {
      setMessages((prev) => prev.filter((m) => m.id !== payload.messageId));
    });

    socket.on('session_imported', (payload) => {
      setMessages(payload.messages);
    });

    socket.on('room_expired', (payload) => {
      setIsExpired(true);
      setExpiredMsg(payload.message);
    });

    socket.on('error', (payload) => {
      setSocketError(payload.message || '오류가 발생했습니다.');
      setTimeout(() => setSocketError(null), 4000);
    });

    return () => {
      socket.off('room_state');
      socket.off('participants_updated');
      socket.off('message_created');
      socket.off('message_updated');
      socket.off('message_deleted');
      socket.off('session_imported');
      socket.off('room_expired');
      socket.off('error');
    };
  }, [room, nickname, slug, getIdToken]);

  // Handle actions
  const handleEnterNickname = (nick: string) => {
    setNickname(nick);
    sessionStorage.setItem(`igotq:nick:${slug}`, nick);
  };

  const handleSendMessage = (content: string, isQuestion: boolean) => {
    const socket = getClientSocket();
    socket.emit('send_message', { content, isQuestion });
  };

  const handleSendReply = (parentId: string, content: string) => {
    const socket = getClientSocket();
    socket.emit('send_reply', { parentId, content });
  };

  const handleToggleStatus = (messageId: string, status: 'pending' | 'answered') => {
    const socket = getClientSocket();
    socket.emit('toggle_status', { messageId, status });
  };

  const handleDeleteMessage = (messageId: string) => {
    const socket = getClientSocket();
    socket.emit('delete_message', { messageId });
  };

  const handleImportMessages = (importedMsgs: ThreadedMessage[]) => {
    const socket = getClientSocket();
    socket.emit('import_session', { messages: importedMsgs });
  };

  const handleCloseRoom = () => {
    const socket = getClientSocket();
    socket.emit('close_room');
  };

  // Filter and sort calculations
  const filteredMessages = useMemo(() => {
    let list = [...messages];

    // Filter Tab
    if (filterTab === 'pending') {
      list = list.filter((m) => m.status === 'pending');
    } else if (filterTab === 'answered') {
      list = list.filter((m) => m.status === 'answered');
    }

    // Sort
    if (sortOption === 'latest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOption === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortOption === 'pendingFirst') {
      list.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    return list;
  }, [messages, filterTab, sortOption]);

  const counts = useMemo(() => {
    const all = messages.length;
    const pending = messages.filter((m) => m.status === 'pending').length;
    const answered = messages.filter((m) => m.status === 'answered').length;
    return { all, pending, answered };
  }, [messages]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
        <p className="text-xs text-slate-400">세션 로딩 중...</p>
      </div>
    );
  }

  if (loadError || !room) {
    return (
      <div className="max-w-md mx-auto my-12 glass-panel p-8 rounded-3xl text-center space-y-4 border border-red-500/20">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">방을 찾을 수 없습니다</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          {loadError || '존재하지 않거나 유효 시간이 만료되어 파기된 방입니다.'}
        </p>
        <a
          href="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
        >
          홈으로 돌아가기
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Expired Overlay */}
      {isExpired && <RoomExpiredOverlay message={expiredMsg} />}

      {/* Nickname Dialog if not entered yet */}
      {!nickname && <NicknameGate roomTitle={room.title} onEnter={handleEnterNickname} />}

      {/* Socket Error Toast */}
      {socketError && (
        <div className="fixed top-16 right-4 z-50 p-3 rounded-xl bg-red-600 text-white text-xs font-semibold shadow-xl flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{socketError}</span>
        </div>
      )}

      {/* Room Header */}
      <RoomHeader room={room} participantCount={participantCount} isHost={isHost} />

      {/* Host Toolbar */}
      {isHost && (
        <HostToolbar
          room={room}
          messages={messages}
          onImportMessages={handleImportMessages}
          onCloseRoom={handleCloseRoom}
        />
      )}

      {/* Q&A Filter & Sort Bar */}
      <QAFilterBar
        currentTab={filterTab}
        onTabChange={setFilterTab}
        currentSort={sortOption}
        onSortChange={setSortOption}
        counts={counts}
      />

      {/* Messages List */}
      <div className="space-y-3 min-h-[300px]">
        {filteredMessages.length === 0 ? (
          <div className="py-16 text-center space-y-2 glass-panel rounded-2xl border border-white/5">
            <MessageSquareDashed className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-400">
              {filterTab === 'pending'
                ? '미답변 질문이 없습니다.'
                : filterTab === 'answered'
                ? '답변 완료된 질문이 없습니다.'
                : '아직 등록된 질문이나 의견이 없습니다.'}
            </p>
            <p className="text-xs text-slate-500">
              첫 번째 질문을 남겨 세미나의 소통을 시작해 보세요!
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <QuestionCard
              key={msg.id}
              message={msg}
              isHost={isHost}
              onSendReply={handleSendReply}
              onToggleStatus={handleToggleStatus}
              onDeleteMessage={handleDeleteMessage}
            />
          ))
        )}
      </div>

      {/* Bottom Sticky Message Input Bar */}
      <MessageInput onSendMessage={handleSendMessage} disabled={isExpired || !nickname} />
    </div>
  );
}
