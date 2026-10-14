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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[24px] border border-black/[0.08] text-center shadow-[0_20px_60px_rgba(0,0,0,0.14)] space-y-4 text-[#1d1d1f]">
        <div className="w-14 h-14 rounded-full bg-[#ff3b30]/10 text-[#d70015] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h3 className="text-2xl font-semibold text-[#1d1d1f]">세션이 종료되었습니다</h3>
        <p className="text-[14px] text-[#86868b] leading-relaxed">{message}</p>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white font-normal text-[17px] transition-all active:scale-[0.97]"
          >
            <Home className="w-4 h-4" />
            <span>홈으로 이동하기</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
