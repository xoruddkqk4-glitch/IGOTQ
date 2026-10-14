'use client';

import React, { useState } from 'react';
import { Send, HelpCircle, MessageSquare, User } from 'lucide-react';
import { MAX_MESSAGE_LENGTH } from '@/lib/constants';

interface MessageInputProps {
  onSendMessage: (content: string, isQuestion: boolean) => void;
  disabled?: boolean;
  disabledReason?: string;
  nickname?: string | null;
  onChangeNickname?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled,
  disabledReason,
  nickname,
  onChangeNickname,
}) => {
  const [content, setContent] = useState('');
  const [isQuestion, setIsQuestion] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (content.trim() && !disabled && content.length <= MAX_MESSAGE_LENGTH) {
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
    <div className="sticky bottom-0 z-30 bg-white border-t border-[#d8d8d8] px-3.5 sm:px-5 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
      <form onSubmit={handleSubmit} className="space-y-2 max-w-4xl mx-auto">
        {/* Top Control Bar: Mode Toggle + Nickname + Char Counter */}
        <div className="flex items-center justify-between gap-2 text-[12px]">
          {/* Mode Selector Toggle Pills: 일반 의견이 기본값 & 첫 번째 위치 */}
          <div className="flex items-center gap-1 p-0.5 bg-[#f0f2f5] rounded-full">
            <button
              type="button"
              onClick={() => setIsQuestion(false)}
              style={{ fontSize: 'clamp(11px, 2.2vw, 13px)' }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full whitespace-nowrap shrink-0 transition-all ${
                !isQuestion
                  ? 'bg-[#0066cc] text-white font-semibold shadow-xs'
                  : 'text-[#667788] hover:text-black font-normal'
              }`}
            >
              <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${!isQuestion ? 'text-white' : 'text-[#556677]'}`} />
              <span className="whitespace-nowrap">일반 의견</span>
            </button>

            <button
              type="button"
              onClick={() => setIsQuestion(true)}
              style={{ fontSize: 'clamp(11px, 2.2vw, 13px)' }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full whitespace-nowrap shrink-0 transition-all ${
                isQuestion
                  ? 'bg-white text-black font-semibold shadow-xs'
                  : 'text-[#667788] hover:text-black font-normal'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#0066cc] shrink-0" />
              <span className="whitespace-nowrap">질문 (Q&A)</span>
            </button>
          </div>

          {/* Right: Nickname Pill & Char Count */}
          <div className="flex items-center gap-2 text-[#778899]">
            {nickname && (
              <button
                type="button"
                onClick={onChangeNickname}
                disabled={!onChangeNickname}
                title={onChangeNickname ? '클릭하여 닉네임 변경' : undefined}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f0f2f5] text-[11px] font-medium text-[#445566] transition-colors ${
                  onChangeNickname ? 'hover:bg-[#e4e7eb] hover:text-[#111111] cursor-pointer' : ''
                }`}
              >
                <User className="w-3 h-3 text-[#0066cc]" />
                <span className="max-w-[80px] sm:max-w-[120px] truncate">{nickname}</span>
                <span className="text-[#0066cc]">(나)</span>
              </button>
            )}

            <span
              className={`font-mono text-[11px] ${
                content.length > MAX_MESSAGE_LENGTH ? 'text-[#ff3b30] font-bold' : ''
              }`}
            >
              {content.length}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>
        </div>

        {/* Input Textarea & Kakao Yellow Send Button */}
        <div className="flex items-end gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              disabled && disabledReason
                ? disabledReason
                : isQuestion
                ? '발표자에게 궁금한 질문을 남겨보세요... (Enter 전송, Shift+Enter 줄바꿈)'
                : '자유로운 의견이나 반응을 남겨보세요...'
            }
            maxLength={MAX_MESSAGE_LENGTH}
            rows={2}
            className="flex-1 p-2.5 px-4 rounded-[18px] bg-[#f2f3f5] border border-transparent text-[14px] sm:text-[15px] text-[#111111] placeholder-[#8899aa] focus:bg-white focus:border-[#c5ccd3] focus:ring-0 outline-none resize-none transition-all leading-snug"
          />

          {/* KakaoTalk Signature Yellow Send Button */}
          <button
            type="submit"
            disabled={!content.trim() || disabled || content.length > MAX_MESSAGE_LENGTH}
            className="w-11 h-11 rounded-full bg-[#FEE500] hover:bg-[#fad800] active:scale-95 text-black flex items-center justify-center font-bold shadow-sm transition-transform disabled:opacity-40 disabled:scale-100 flex-shrink-0 cursor-pointer disabled:cursor-not-allowed"
            title="전송 (Enter)"
          >
            <Send className="w-4 h-4 fill-black text-black ml-0.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
