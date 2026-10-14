'use client';

import React, { useState } from 'react';
import { User, MessageCircle, CheckCircle2, RotateCcw, Trash2, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { ReplyThread } from './ReplyThread';
import { ThreadedMessage } from '@/types/message';

interface QuestionCardProps {
  message: ThreadedMessage;
  isHost: boolean;
  onSendReply: (parentId: string, content: string) => void;
  onToggleStatus: (messageId: string, status: 'pending' | 'answered') => void;
  onDeleteMessage: (messageId: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  message,
  isHost,
  onSendReply,
  onToggleStatus,
  onDeleteMessage,
}) => {
  const [showReplies, setShowReplies] = useState(true);

  const timeStr = new Date(message.createdAt).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isAnswered = message.status === 'answered';

  return (
    <div
      className={`glass-card p-4 rounded-2xl border transition-all animate-fade-in ${
        isAnswered
          ? 'border-emerald-500/20 bg-slate-900/60'
          : 'border-white/10 bg-slate-900/80 shadow-md shadow-black/20'
      }`}
    >
      {/* Header Info */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-white">{message.nickname}</span>
          <span className="text-[10px] text-slate-500">{timeStr}</span>
          <Badge
            status={message.status}
            isRestored={message.isRestored}
            isQuestion={message.isQuestion}
          />
        </div>

        {/* Host action buttons */}
        {isHost && (
          <div className="flex items-center gap-1 opacity-90 hover:opacity-100 transition-opacity">
            <button
              onClick={() => onToggleStatus(message.id, isAnswered ? 'pending' : 'answered')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                isAnswered
                  ? 'text-amber-400 hover:bg-amber-500/10'
                  : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
              title={isAnswered ? '미답변 상태로 되돌리기' : '답변 완료로 변경'}
            >
              {isAnswered ? <RotateCcw className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span className="text-[11px] hidden sm:inline">{isAnswered ? '미답변 전환' : '답변 완료'}</span>
            </button>
            <button
              onClick={() => {
                if (confirm('이 메시지를 삭제하시겠습니까?')) {
                  onDeleteMessage(message.id);
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="메시지 삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <p className="text-sm text-slate-100 leading-relaxed whitespace-pre-wrap pl-1">{message.content}</p>

      {/* Reply toggle & count */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>답변 및 스레드 ({message.replies?.length || 0})</span>
        </button>
      </div>

      {/* Thread Content */}
      {showReplies && (
        <ReplyThread
          questionId={message.id}
          replies={message.replies || []}
          isHost={isHost}
          onSendReply={onSendReply}
        />
      )}
    </div>
  );
};
