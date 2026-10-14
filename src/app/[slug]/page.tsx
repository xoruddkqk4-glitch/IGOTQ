'use client';

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { getClientSocket } from '@/lib/socket';
import { useAuth } from '@/hooks/useAuth';
import { NicknameGate } from '@/components/room/NicknameGate';
import { HostToolbar } from '@/components/room/HostToolbar';
import { FilterTab, SortOption } from '@/components/room/QAFilterBar';
import { KakaoNoticeBar } from '@/components/room/KakaoNoticeBar';
import { KakaoMessageBubble } from '@/components/room/KakaoMessageBubble';
import { MessageInput } from '@/components/room/MessageInput';
import { RoomExpiredOverlay } from '@/components/room/RoomExpiredOverlay';
import { useRoomHeader } from '@/context/RoomHeaderContext';
import { FloatingQRWidget } from '@/components/room/FloatingQRWidget';
import { ProjectorView } from '@/components/room/ProjectorView';
import { StreamFeedView } from '@/components/room/StreamFeedView';
import { EditNoticeModal } from '@/components/room/EditNoticeModal';
import { RoomInfo, NoticeAttachment } from '@/types/room';
import { ThreadedMessage, ReplyItem } from '@/types/message';
import { MessageSquareDashed, AlertCircle, Clock } from 'lucide-react';

export default function RoomPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { getIdToken } = useAuth();
  const { setRoomHeaderData } = useRoomHeader();

  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [nickname, setNickname] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [messages, setMessages] = useState<ThreadedMessage[]>([]);

  const [viewMode, setViewMode] = useState<'chat' | 'projector' | 'stream'>('chat');
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeAttachment, setNoticeAttachment] = useState<NoticeAttachment | null>(null);
  const [showEditNotice, setShowEditNotice] = useState(false);

  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [sortOption, setSortOption] = useState<SortOption>('latest');
  const [isExpired, setIsExpired] = useState(false);
  const [expiredMsg, setExpiredMsg] = useState<string | undefined>();
  const [socketError, setSocketError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const v = sp.get('view');
      if (v === 'projector') {
        setViewMode('projector');
        setNickname((prev) => prev || '전광판화면');
      } else if (v === 'stream' || v === 'feed') {
        setViewMode('stream');
        setNickname((prev) => prev || '전광판화면');
      }
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  const dateStr = useMemo(() => {
    const d = room?.createdAt ? new Date(room.createdAt) : new Date();
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  }, [room?.createdAt]);

  // Sync room header data to the sticky Top Navigation Panel (전광판/백채널 모드에서는 헤더 중복 방지)
  useEffect(() => {
    if (viewMode === 'projector' || viewMode === 'stream') {
      setRoomHeaderData(null);
      return;
    }
    if (room) {
      setRoomHeaderData({ room, participantCount, isHost });
    }
    return () => {
      setRoomHeaderData(null);
    };
  }, [room, participantCount, isHost, viewMode, setRoomHeaderData]);

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
        if (data.room?.notice) setNotice(data.room.notice);

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

    const joinRoom = () => {
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
    };

    socket.on('connect', joinRoom);
    if (socket.connected) {
      joinRoom();
    } else {
      socket.connect();
    }

    socket.on('room_state', (payload) => {
      setIsHost(payload.isHost);
      setMessages(payload.messages || []);
      if (payload.room) {
        setRoom(payload.room);
        setParticipantCount(payload.room.participantCount || 1);
        if (payload.room.notice !== undefined) {
          setNotice(payload.room.notice || null);
        }
        if (payload.room.noticeAttachment !== undefined) {
          setNoticeAttachment(payload.room.noticeAttachment || null);
        }
      }
    });

    socket.on('notice_updated', (payload: { notice: string | null; attachment?: NoticeAttachment | null }) => {
      setNotice(payload.notice);
      setNoticeAttachment(payload.attachment || null);
      setRoom((prev) =>
        prev
          ? {
              ...prev,
              notice: payload.notice,
              noticeAttachment: payload.attachment || null,
            }
          : null
      );
    });

    socket.on('participants_updated', (payload) => {
      setParticipantCount(payload.count);
    });

    socket.on('message_created', (payload) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.message.id)) return prev;
        // Reconcile optimistic placeholder
        const filtered = prev.filter(
          (m) =>
            !(
              m.id.startsWith('optimistic-') &&
              m.content === payload.message.content &&
              m.nickname === payload.message.nickname
            )
        );
        return [payload.message, ...filtered];
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

    socket.on('room_closed', (payload) => {
      setRoom((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          isClosed: true,
          closedAt: payload.closedAt,
          expiresAt: payload.expiresAt,
        };
        setRoomHeaderData((hdr) => (hdr ? { ...hdr, room: updated } : null));
        return updated;
      });
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
      socket.off('connect', joinRoom);
      socket.off('room_state');
      socket.off('notice_updated');
      socket.off('participants_updated');
      socket.off('message_created');
      socket.off('message_updated');
      socket.off('message_deleted');
      socket.off('session_imported');
      socket.off('room_closed');
      socket.off('room_expired');
      socket.off('error');
    };
  }, [room, nickname, slug, getIdToken, setRoomHeaderData]);

  const handleSaveNotice = useCallback((newNotice: string, newAttachment?: NoticeAttachment | null) => {
    setNotice(newNotice || null);
    setNoticeAttachment(newAttachment || null);
    setRoom((prev) =>
      prev
        ? {
            ...prev,
            notice: newNotice || null,
            noticeAttachment: newAttachment || null,
          }
        : null
    );
    const socket = getClientSocket();
    socket.emit('update_notice', { notice: newNotice, attachment: newAttachment || null });
  }, []);

  // Handle actions with 0ms Optimistic Updates & Memoized Handlers
  const handleEnterNickname = useCallback((nick: string) => {
    setNickname(nick);
    sessionStorage.setItem(`igotq:nick:${slug}`, nick);
  }, [slug]);

  const handleSendMessage = useCallback((content: string, isQuestion: boolean) => {
    // 0ms Optimistic local rendering
    const tempId = `optimistic-${Date.now()}`;
    const optimisticMsg: ThreadedMessage = {
      id: tempId,
      roomId: room?.id || slug,
      content,
      nickname: nickname || '익명',
      isQuestion,
      isHostReply: Boolean(isHost),
      status: 'pending',
      isRestored: false,
      createdAt: new Date().toISOString(),
      replies: [],
    };
    setMessages((prev) => [optimisticMsg, ...prev]);

    const socket = getClientSocket();
    socket.emit('send_message', { content, isQuestion, slug, nickname });
  }, [room?.id, slug, nickname, isHost]);

  const handleSendReply = useCallback((parentId: string, content: string) => {
    // 0ms Optimistic reply insertion
    const tempReplyId = `optimistic-reply-${Date.now()}`;
    const optimisticReply: ReplyItem = {
      id: tempReplyId,
      content,
      nickname: nickname || (isHost ? '진행자' : '참여자'),
      isHostReply: isHost,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) =>
      prev.map((m) =>
        m.id === parentId
          ? { ...m, replies: [...(m.replies || []), optimisticReply] }
          : m
      )
    );

    const socket = getClientSocket();
    socket.emit('send_reply', { parentId, content });
  }, [nickname, isHost]);

  const handleToggleStatus = useCallback((messageId: string, status: 'pending' | 'answered') => {
    // 0ms Optimistic status change
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, status } : m))
    );
    const socket = getClientSocket();
    socket.emit('toggle_status', { messageId, status });
  }, []);

  const handleDeleteMessage = useCallback((messageId: string) => {
    // 0ms Optimistic deletion
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    const socket = getClientSocket();
    socket.emit('delete_message', { messageId });
  }, []);

  const handleImportMessages = useCallback((importedMsgs: ThreadedMessage[]) => {
    setMessages(importedMsgs);
    const socket = getClientSocket();
    socket.emit('import_session', { messages: importedMsgs });
  }, []);

  const handleCloseRoom = useCallback(() => {
    const socket = getClientSocket();
    socket.emit('close_room');
  }, []);

  const handleDeleteRoomImmediately = useCallback(() => {
    const socket = getClientSocket();
    socket.emit('delete_room_immediately');
  }, []);

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
        <div className="w-8 h-8 rounded-full border-2 border-[#0066cc] border-t-transparent animate-spin"></div>
        <p className="text-[13px] text-[#86868b]">세션 로딩 중...</p>
      </div>
    );
  }

  if (loadError || !room) {
    return (
      <div className="max-w-md mx-auto my-12 apple-card p-8 sm:p-10 rounded-[22px] text-center space-y-4 border border-black/[0.08] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <div className="w-12 h-12 rounded-full bg-[#ff3b30]/10 text-[#d70015] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-[#1d1d1f]">방을 찾을 수 없습니다</h2>
        <p className="text-[14px] text-[#86868b] leading-relaxed">
          {loadError || '존재하지 않거나 유효 시간이 만료되어 파기된 방입니다.'}
        </p>
        <a
          href="/"
          className="inline-block px-6 py-2.5 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white font-normal text-[15px] transition-all active:scale-[0.97]"
        >
          홈으로 돌아가기
        </a>
      </div>
    );
  }

  if (viewMode === 'projector') {
    return (
      <ProjectorView
        room={room}
        messages={messages}
        notice={notice}
        attachment={noticeAttachment}
        isHost={isHost}
        participantCount={participantCount}
        onExitProjector={() => setViewMode('chat')}
        onToggleStatus={handleToggleStatus}
        onDeleteMessage={handleDeleteMessage}
      />
    );
  }

  if (viewMode === 'stream') {
    return (
      <StreamFeedView
        room={room}
        messages={messages}
        notice={notice}
        attachment={noticeAttachment}
        participantCount={participantCount}
        onExit={() => setViewMode('chat')}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full px-2 sm:px-0">
      {/* 1. Host Toolbar placed outside & ABOVE the chat window container */}
      {isHost && (
        <div className="mb-3">
          <HostToolbar
            room={room}
            messages={messages}
            onImportMessages={handleImportMessages}
            onCloseRoom={handleCloseRoom}
            onDeleteRoomImmediately={handleDeleteRoomImmediately}
            onOpenProjector={() => {
              if (typeof window !== 'undefined') {
                window.open(`/${room.slug}?view=projector`, '_blank');
              }
            }}
            onOpenStreamFeed={() => {
              if (typeof window !== 'undefined') {
                window.open(`/${room.slug}?view=stream`, '_blank');
              }
            }}
          />
        </div>
      )}

      {/* 2. KakaoTalk Chat Room Window */}
      <div className="rounded-[24px] sm:border border-[#a2b8cc] shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col bg-[#BACEE0] min-h-[calc(100vh-6.5rem)] relative">
        {/* Expired Overlay */}
        {isExpired && <RoomExpiredOverlay message={expiredMsg} />}

        {/* Nickname Dialog if not entered yet */}
        {!nickname && <NicknameGate roomTitle={room.title} onEnter={handleEnterNickname} />}

        {/* Socket Error Toast */}
        {socketError && (
          <div className="fixed top-14 right-4 z-50 px-4 py-2.5 rounded-full bg-[#1d1d1f] text-white text-[13px] font-normal shadow-xl flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-[#ff3b30] flex-shrink-0" />
            <span>{socketError}</span>
          </div>
        )}

        {/* Persistent Floating QR Code & Link Widget (대화창에 항상 떠 있음) */}
        <FloatingQRWidget roomTitle={room.title} slug={slug} />

        {/* Kakao Top Pinned Notice & Filter Bar */}
        <KakaoNoticeBar
          roomTitle={room.title}
          slug={slug}
          notice={notice}
          attachment={noticeAttachment}
          isHost={isHost}
          onOpenEditNotice={() => setShowEditNotice(true)}
          currentTab={filterTab}
          onTabChange={setFilterTab}
          currentSort={sortOption}
          onSortChange={setSortOption}
          counts={counts}
        />

        {/* Session Closed Retention Banner (if closed) */}
        {room.isClosed && (
          <div className="mx-3 sm:mx-4 mt-3 p-3.5 rounded-[14px] bg-[#ff9f0a]/15 border border-[#ff9f0a]/30 flex items-center justify-between gap-2.5 text-black shadow-xs animate-fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#ff9f0a]/25 flex items-center justify-center flex-shrink-0 text-[#d97706]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[13px] sm:text-[14px] font-bold text-[#1d1d1f]">
                  방장이 세션을 종료하였습니다
                </h4>
                <p className="text-[11px] sm:text-[12px] text-[#556677]">
                  새로운 질문 접수는 마감되었으며, 설정된 보관 시간 동안 질문과 답변을 열람하고 다운로드할 수 있습니다.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ff9f0a]/25 text-[#d97706] whitespace-nowrap">
              보관 중
            </span>
          </div>
        )}

        {/* Kakao Chat Stream Area (Scrollable Messages) */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3 min-h-[380px]">
          {/* Kakao Date Separator Pill */}
          <div className="text-center my-2">
            <span className="kakao-date-pill text-[11px] sm:text-[12px] font-medium px-4 py-1 rounded-full shadow-xs inline-block">
              {dateStr}
            </span>
          </div>

          {/* Message Feed */}
          {filteredMessages.length === 0 ? (
            <div className="py-20 text-center space-y-2 bg-white/60 backdrop-blur-xs rounded-[20px] p-6 max-w-sm mx-auto shadow-xs text-black animate-fade-in mt-6">
              <MessageSquareDashed className="w-8 h-8 text-[#556677] mx-auto" />
              <p className="text-[14px] font-bold text-[#222222]">
                {filterTab === 'pending'
                  ? '미답변 질문이 없습니다.'
                  : filterTab === 'answered'
                  ? '답변 완료된 질문이 없습니다.'
                  : '아직 등록된 질문이나 의견이 없습니다.'}
              </p>
              <p className="text-[12px] text-[#556677]">
                첫 번째 질문이나 의견을 남겨 소통을 시작해 보세요!
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <KakaoMessageBubble
                key={msg.id}
                message={msg}
                isMe={Boolean(nickname && msg.nickname === nickname)}
                isHost={isHost}
                onSendReply={handleSendReply}
                onToggleStatus={handleToggleStatus}
                onDeleteMessage={handleDeleteMessage}
              />
            ))
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Kakao Bottom Message Input Bar */}
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={isExpired || !nickname || Boolean(room.isClosed)}
          disabledReason={
            room.isClosed
              ? '방장이 세션을 종료하여 더 이상 질문을 남길 수 없습니다.'
              : isExpired
              ? '세션이 만료되었습니다.'
              : undefined
          }
          nickname={nickname}
        />
      </div>

      {/* Edit Notice Modal */}
      <EditNoticeModal
        isOpen={showEditNotice}
        onClose={() => setShowEditNotice(false)}
        currentNotice={notice}
        currentAttachment={noticeAttachment}
        onSaveNotice={handleSaveNotice}
      />
    </div>
  );
}
