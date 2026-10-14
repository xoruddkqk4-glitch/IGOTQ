'use client';

import React, { useState } from 'react';
import { CornerDownRight, Send, ShieldCheck, User } from 'lucide-react';
import { ReplyItem } from '@/types/message';

interface ReplyThreadProps {
  questionId: string;
  replies: ReplyItem[];
  isHost: boolean;
  onSendReply: (parentId: string, content: string) => void;
}

export const ReplyThread: React.FC<ReplyThreadProps> = ({ questionId, replies, isHost, onSendReply }) => {
  const [replyText, setReplyText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      onSendReply(questionId, replyText.trim());
      setReplyText('');
    }
  };

  return (
    <div className="mt-3 pl-3 sm:pl-5 border-l-2 border-black/[0.1] space-y-2.5">
      {/* Existing replies */}
      {replies.map((reply) => {
        const timeStr = new Date(reply.createdAt).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        return (
          <div key={reply.id} className="p-3.5 rounded-[14px] bg-[#f5f5f7] border border-black/[0.06] text-[14px] animate-fade-in">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0066cc]" />
                <span className="font-semibold text-[#1d1d1f] text-[13px]">{reply.nickname}</span>
                <span className="text-[11px] px-2 py-0.2 rounded-full bg-black/[0.05] text-[#1d1d1f] font-normal">발표자 답변</span>
              </div>
              <span className="text-[11px] text-[#86868b]">{timeStr}</span>
            </div>
            <p className="text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">{reply.content}</p>
          </div>
        );
      })}

      {/* Host reply form */}
      {isHost && (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
          <CornerDownRight className="w-4 h-4 text-[#86868b] flex-shrink-0" />
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="발표자 공식 답변 작성 (등록 시 자동으로 답변 완료 전환)..."
            className="flex-1 px-4 py-2 rounded-full bg-[#f5f5f7] border border-black/[0.1] text-[14px] text-[#1d1d1f] placeholder-[#86868b] focus:bg-white focus:ring-2 focus:ring-[#0071e3] focus:border-transparent outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!replyText.trim()}
            className="px-4 py-2 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white font-normal text-[13px] transition-all active:scale-[0.97] disabled:opacity-40 flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">답변</span>
          </button>
        </form>
      )}
    </div>
  );
};
