import React from 'react';
import { MessageStatus } from '@/types/message';

interface BadgeProps {
  status?: MessageStatus;
  isRestored?: boolean;
  isQuestion?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ status, isRestored, isQuestion }) => {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {isQuestion && (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-black/[0.05] text-[#1d1d1f] border border-black/[0.08]">
          Q&A
        </span>
      )}
      {status === 'answered' ? (
        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#34c759]/10 text-[#1e7e34] border border-[#34c759]/25 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34c759]"></span>
          답변 완료
        </span>
      ) : (
        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#ff9500]/10 text-[#b25000] border border-[#ff9500]/25 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff9500]"></span>
          미답변
        </span>
      )}
      {isRestored && (
        <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-black/[0.04] text-[#86868b] border border-black/[0.06]">
          이전 기록
        </span>
      )}
    </div>
  );
};
