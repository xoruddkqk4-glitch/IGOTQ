'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRoomHeader } from '@/context/RoomHeaderContext';
import { QRModal } from '@/components/room/QRModal';
import {
  MessageSquare,
  Shield,
  Clock,
  LogIn,
  LogOut,
  User,
  Users,
  Share2,
  Check,
  QrCode,
  Cloud,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { roomHeaderData, openQRModal, setOpenQRModal } = useRoomHeader();

  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  // Status and countdown timer for room header
  const roomData = roomHeaderData?.room;
  useEffect(() => {
    if (!roomData) return;

    // 1. Room is actively running
    if (!roomData.isClosed) {
      const hours = Math.round((roomData.ttlMinutes || 120) / 60);
      setTimeLeft(`진행 중 (종료 후 ${hours}시간 보관)`);
      return;
    }

    // 2. Room is closed by host -> counting down post-close retention
    if (!roomData.expiresAt) {
      setTimeLeft('세션 종료됨');
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const end = new Date(roomData.expiresAt!).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('보관 만료됨');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`보관 ${hours}시간 ${mins}분 남음`);
      } else {
        setTimeLeft(`보관 ${mins}분 ${secs}초 남음`);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [roomData]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // If in a room: Render Room Header in the Top Panel!
  if (roomHeaderData) {
    const { room, participantCount, isHost } = roomHeaderData;

    return (
      <>
        <header className="sticky top-0 z-50 w-full apple-nav-global h-16 flex items-center px-4 sm:px-8 border-b border-white/[0.08] shadow-sm">
          <div className="max-w-5xl mx-auto w-full flex items-center justify-between gap-3">
            {/* Left: Brand icon + Room Title & URL */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <Link
                href="/"
                className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold shadow-sm flex-shrink-0 transition-opacity hover:opacity-85"
                title="홈으로 이동"
              >
                <MessageSquare className="w-4 h-4 fill-black text-black" />
              </Link>

              <div className="h-6 w-px bg-white/15 hidden sm:block flex-shrink-0"></div>

              <div className="flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                  <h1 className="font-semibold text-[15px] sm:text-[18px] text-white tracking-tight truncate max-w-[130px] sm:max-w-[260px]">
                    {room.title}
                  </h1>
                  {isHost && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-[#f5f5f7] border border-white/15 flex-shrink-0">
                      호스트
                    </span>
                  )}
                  {room.isCloudPersisted && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#0066cc]/30 text-[#2997ff] border border-[#0066cc]/40 hidden md:inline-flex items-center gap-1 flex-shrink-0">
                      <Cloud className="w-2.5 h-2.5" />
                      클라우드
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-[12px] text-[#86868b] font-mono tracking-tight truncate">
                  igotq.com/{room.slug}
                </p>
              </div>
            </div>

            {/* Right: Participants, Timer, Copy Link, QR Code */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
              {/* Participants */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-[12px] sm:text-[13px] text-[#f5f5f7]">
                <span className="w-2 h-2 rounded-full bg-[#34c759] animate-pulse"></span>
                <Users className="w-3.5 h-3.5 text-[#86868b]" />
                <span className="font-medium whitespace-nowrap">{participantCount}명 접속 중</span>
              </div>

              {/* Time Remaining / Room Status */}
              {timeLeft && (
                <div
                  className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] sm:text-[13px] ${
                    room.isClosed
                      ? 'bg-[#ff9f0a]/15 border-[#ff9f0a]/30 text-[#ffb340]'
                      : 'bg-white/10 border-white/10 text-[#f5f5f7]'
                  }`}
                >
                  <Clock className={`w-3.5 h-3.5 ${room.isClosed ? 'text-[#ffb340]' : 'text-[#86868b]'}`} />
                  <span className="whitespace-nowrap font-medium">{timeLeft}</span>
                </div>
              )}

              {/* Copy Link Button */}
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white text-[12px] sm:text-[13px] font-normal transition-all active:scale-[0.97] cursor-pointer shadow-sm whitespace-nowrap"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Share2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? '복사 완료' : '링크 복사'}</span>
              </button>

              {/* QR Code Presentation Button */}
              <button
                onClick={() => setOpenQRModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[12px] sm:text-[13px] font-normal transition-all active:scale-[0.97] cursor-pointer whitespace-nowrap"
                title="대형 QR 코드 보기"
              >
                <QrCode className="w-3.5 h-3.5 text-[#2997ff]" />
                <span className="hidden sm:inline">QR 코드</span>
              </button>
            </div>
          </div>
        </header>

        {/* Global QR Modal */}
        <QRModal
          isOpen={openQRModal}
          onClose={() => setOpenQRModal(false)}
          roomTitle={room.title}
          slug={room.slug}
        />
      </>
    );
  }

  // Default: Standard Global Header for Home / Login / Admin / History
  return (
    <header className="sticky top-0 z-50 w-full apple-nav-global h-16 flex items-center px-4 sm:px-8 border-b border-white/[0.08]">
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group transition-opacity hover:opacity-85">
          <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold shadow-sm">
            <MessageSquare className="w-4 h-4 fill-black text-black" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[17px] text-white tracking-tight">
              IGOTQ
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#34c759]/20 text-[#34c759] text-[10px] font-semibold tracking-wider border border-[#34c759]/30">
              LIVE
            </span>
          </div>
        </Link>

        {/* Navigation links & Actions */}
        <nav className="flex items-center gap-3 sm:gap-5 text-[14px] text-[#d2d2d7]">
          {profile?.canPersist && (
            <Link
              href="/history"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[#d2d2d7] hover:text-white hover:bg-white/10 transition-all font-medium text-[13px] sm:text-[14px]"
            >
              <Clock className="w-4 h-4 text-[#86868b]" />
              <span>저장된 세션</span>
            </Link>
          )}

          {profile?.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[#d2d2d7] hover:text-white hover:bg-white/10 transition-all font-medium text-[13px] sm:text-[14px]"
            >
              <Shield className="w-4 h-4 text-[#34c759]" />
              <span className="text-white font-medium">관리자</span>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2.5 pl-3 sm:pl-4 border-l border-white/15">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[13px] text-[#f5f5f7]">
                <User className="w-3.5 h-3.5 text-[#86868b]" />
                <span className="max-w-[140px] sm:max-w-[200px] truncate">{user.email}</span>
                {profile?.role === 'admin' && (
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-[#0066cc]/30 text-[#2997ff] text-[10px] font-bold tracking-wider">
                    ADMIN
                  </span>
                )}
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1 p-2 rounded-full text-[#86868b] hover:text-white hover:bg-white/10 transition-colors"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="apple-btn-primary px-4 py-1.5 text-[13px] sm:text-[14px] flex items-center gap-1.5 rounded-full"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>로그인</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

