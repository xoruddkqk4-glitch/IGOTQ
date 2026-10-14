'use client';

import React, { useState } from 'react';
import { Send, HelpCircle, MessageSquare } from 'lucide-react';
import { MAX_MESSAGE_LENGTH } from '@/lib/constants';

interface MessageInputProps {
  onSendMessage: (content: string, isQuestion: boolean) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
  const [content, setContent] = useState('');
  const [isQuestion, setIsQuestion] = useState(true);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (content.trim() && !disabled) {
      onSendMessage(content.trim(), isQuestion);
      setContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="sticky bottom-0 z-30 pt-2 pb-4 glass-panel border-t border-white/10 px-4 -mx-4 sm:mx-0 sm:rounded-2xl sm:mb-4 shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-2 max-w-4xl mx-auto">
        <div className="flex items-center justify-between px-1">
          {/* Question / Message toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsQuestion(!isQuestion)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                isQuestion
                  ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300 shadow-sm'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isQuestion ? (
                <>
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>질문(Q&A)으로 등록</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>일반 의견으로 등록</span>
                </>
              )}
            </button>
          </div>

          {/* Char counter */}
          <span
            className={`text-[11px] font-mono ${
              content.length > MAX_MESSAGE_LENGTH ? 'text-red-400 font-bold' : 'text-slate-500'
            }`}
          >
            {content.length} / {MAX_MESSAGE_LENGTH}
          </span>
        </div>

        <div className="flex items-end gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              isQuestion
                ? '발표자에게 궁금한 질문을 남겨주세요... (Enter 전송, Shift+Enter 줄바꿈)'
                : '세미나에 대한 자유로운 의견이나 반응을 남겨주세요...'
            }
            maxLength={MAX_MESSAGE_LENGTH}
            rows={2}
            className="flex-1 p-3 rounded-xl glass-input text-sm text-white placeholder-slate-500 resize-none"
          />

          <button
            type="submit"
            disabled={!content.trim() || disabled || content.length > MAX_MESSAGE_LENGTH}
            className="h-[58px] px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">전송</span>
          </button>
        </div>
      </form>
    </div>
  );
};
