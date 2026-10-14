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
    <div className="sticky bottom-0 z-30 pt-3 pb-5 bg-white/90 backdrop-blur-xl border-t border-black/[0.08] px-4 -mx-4 sm:mx-0 sm:rounded-[20px] sm:mb-5 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
      <form onSubmit={handleSubmit} className="space-y-2.5 max-w-4xl mx-auto">
        <div className="flex items-center justify-between px-1">
          {/* Question / Message toggle */}
          <div className="flex items-center gap-1.5 p-0.5 bg-[#e8e8ed] rounded-full">
            <button
              type="button"
              onClick={() => setIsQuestion(true)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] transition-all ${
                isQuestion
                  ? 'bg-white text-[#1d1d1f] font-normal shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
                  : 'text-[#86868b] hover:text-[#1d1d1f] font-normal'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#0066cc]" />
              <span>질문 (Q&A)</span>
            </button>
            <button
              type="button"
              onClick={() => setIsQuestion(false)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] transition-all ${
                !isQuestion
                  ? 'bg-white text-[#1d1d1f] font-normal shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
                  : 'text-[#86868b] hover:text-[#1d1d1f] font-normal'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#86868b]" />
              <span>일반 의견</span>
            </button>
          </div>

          {/* Char counter */}
          <span
            className={`text-[12px] font-mono ${
              content.length > MAX_MESSAGE_LENGTH ? 'text-[#ff3b30] font-semibold' : 'text-[#86868b]'
            }`}
          >
            {content.length} / {MAX_MESSAGE_LENGTH}
          </span>
        </div>

        <div className="flex items-end gap-2.5">
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
            className="flex-1 p-3.5 rounded-[14px] bg-[#f5f5f7] border border-black/[0.1] text-[15px] sm:text-[17px] text-[#1d1d1f] placeholder-[#86868b] focus:bg-white focus:ring-2 focus:ring-[#0071e3] focus:border-transparent outline-none resize-none transition-all"
          />

          <button
            type="submit"
            disabled={!content.trim() || disabled || content.length > MAX_MESSAGE_LENGTH}
            className="h-[56px] px-6 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white font-normal text-[15px] sm:text-[17px] flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none flex-shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">전송</span>
          </button>
        </div>
      </form>
    </div>
  );
};
