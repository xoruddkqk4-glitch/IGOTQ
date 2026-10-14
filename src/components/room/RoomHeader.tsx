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
    <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 mb-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">{room.title}</h1>
            {isHost && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Shield className="w-3 h-3 text-indigo-400" />
                방장(호스트)
              </span>
            )}
            {room.isCloudPersisted && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                <Cloud className="w-3 h-3 text-cyan-400" />
                클라우드 저장 모드
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-mono">igotq.com/{room.slug}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Participants */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{participantCount}명 접속 중</span>
          </div>

          {/* Time Remaining */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-200">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{timeLeft}</span>
          </div>

          {/* Share Link Button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-semibold text-indigo-300 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? '복사됨!' : '링크 복사'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
