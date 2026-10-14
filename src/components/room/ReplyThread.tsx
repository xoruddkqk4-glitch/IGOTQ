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
    <div className="mt-3 pl-3 sm:pl-5 border-l-2 border-indigo-500/30 space-y-2.5">
      {/* Existing replies */}
      {replies.map((reply) => {
        const timeStr = new Date(reply.createdAt).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        return (
          <div key={reply.id} className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs animate-fade-in">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-bold text-indigo-300">{reply.nickname}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400">발표자 답변</span>
              </div>
              <span className="text-[10px] text-slate-500">{timeStr}</span>
            </div>
            <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
          </div>
        );
      })}

      {/* Host reply form */}
      {isHost && (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
          <CornerDownRight className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="발표자 공식 답변 작성 (등록 시 자동으로 답변 완료 전환)..."
            className="flex-1 px-3 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={!replyText.trim()}
            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors disabled:opacity-40 flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">답변</span>
          </button>
        </form>
      )}
    </div>
  );
};
