'use client';

import React, { useEffect, useState } from 'react';
import { Users, Clock, Share2, Check, Cloud, Shield } from 'lucide-react';
import { RoomInfo } from '@/types/room';

interface RoomHeaderProps {
  room: RoomInfo;
  participantCount: number;
  isHost: boolean;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({ room, participantCount, isHost }) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const end = new Date(room.expiresAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('만료됨');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}시간 ${mins}분`);
      } else {
        setTimeLeft(`${mins}분 ${secs}초`);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [room.expiresAt]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="apple-card p-5 sm:p-6 rounded-[20px] border border-black/[0.08] bg-white mb-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#1d1d1f] tracking-tight">{room.title}</h1>
            {isHost && (
              <span className="text-[11px] font-normal px-2.5 py-0.5 rounded-full bg-black/[0.05] text-[#1d1d1f] border border-black/[0.08] flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#1d1d1f]" />
                방장(호스트)
              </span>
            )}
            {room.isCloudPersisted && (
              <span className="text-[11px] font-normal px-2.5 py-0.5 rounded-full bg-[#0066cc]/10 text-[#0066cc] border border-[#0066cc]/20 flex items-center gap-1">
                <Cloud className="w-3 h-3" />
                클라우드 저장 모드
              </span>
            )}
          </div>
          <p className="text-[13px] text-[#86868b] font-mono">igotq.com/{room.slug}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Participants */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f5f5f7] border border-black/[0.06] text-[12px] font-normal text-[#1d1d1f]">
            <span className="w-2 h-2 rounded-full bg-[#34c759] animate-pulse"></span>
            <Users className="w-3.5 h-3.5 text-[#86868b]" />
            <span>{participantCount}명 접속 중</span>
          </div>

          {/* Time Remaining */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f5f5f7] border border-black/[0.06] text-[12px] font-normal text-[#1d1d1f]">
            <Clock className="w-3.5 h-3.5 text-[#86868b]" />
            <span>{timeLeft}</span>
          </div>

          {/* Share Link Button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white text-[13px] font-normal transition-all active:scale-[0.97]"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? '복사 완료' : '링크 복사'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
