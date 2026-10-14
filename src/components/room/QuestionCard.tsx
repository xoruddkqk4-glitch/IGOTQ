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

export const QuestionCard = React.memo<QuestionCardProps>(({
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
      className={`apple-card p-5 sm:p-6 rounded-[18px] border border-black/[0.08] transition-all animate-fade-in ${
        isAnswered ? 'bg-[#fafafc]' : 'bg-white'
      }`}
    >
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-7 h-7 rounded-full bg-black/[0.05] border border-black/[0.08] flex items-center justify-center text-[#1d1d1f]">
            <User className="w-4 h-4 text-[#86868b]" />
          </div>
          <span className="text-[15px] font-semibold text-[#1d1d1f]">{message.nickname}</span>
          <span className="text-[12px] text-[#86868b]">{timeStr}</span>
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
              className={`p-1.5 px-2.5 rounded-[8px] text-[12px] font-normal flex items-center gap-1 transition-colors ${
                isAnswered
                  ? 'text-[#86868b] hover:bg-black/[0.05]'
                  : 'text-[#1e7e34] bg-[#34c759]/10 hover:bg-[#34c759]/20'
              }`}
              title={isAnswered ? '미답변 상태로 되돌리기' : '답변 완료로 변경'}
            >
              {isAnswered ? <RotateCcw className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isAnswered ? '미답변 전환' : '답변 완료'}</span>
            </button>
            <button
              onClick={() => {
                if (confirm('이 메시지를 삭제하시겠습니까?')) {
                  onDeleteMessage(message.id);
                }
              }}
              className="p-1.5 rounded-[8px] text-[#86868b] hover:text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-colors"
              title="메시지 삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Content (Apple 17px body) */}
      <p className="text-[15px] sm:text-[17px] text-[#1d1d1f] leading-[1.47] font-normal whitespace-pre-wrap pl-0.5">
        {message.content}
      </p>

      {/* Reply toggle & count */}
      <div className="mt-3.5 flex items-center justify-between text-[13px] pt-3 border-t border-black/[0.06]">
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="flex items-center gap-1.5 text-[13px] text-[#0066cc] hover:text-[#0077ed] font-normal transition-colors"
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
});

QuestionCard.displayName = 'QuestionCard';
