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
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Q&A
        </span>
      )}
      {status === 'answered' ? (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          답변 완료
        </span>
      ) : (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          미답변
        </span>
      )}
      {isRestored && (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
          [이전 세션 기록]
        </span>
      )}
    </div>
  );
};
