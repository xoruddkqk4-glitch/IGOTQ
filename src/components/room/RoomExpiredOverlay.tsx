'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Home } from 'lucide-react';

interface RoomExpiredOverlayProps {
  message?: string;
}

export const RoomExpiredOverlay: React.FC<RoomExpiredOverlayProps> = ({
  message = '세션 유효 시간이 만료되어 방이 안전하게 종료 및 삭제되었습니다.',
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-red-500/20 text-center shadow-2xl space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-white">세션이 종료되었습니다</h3>
        <p className="text-xs text-slate-300 leading-relaxed">{message}</p>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>홈으로 이동하기</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
