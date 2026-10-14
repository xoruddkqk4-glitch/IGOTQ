'use client';

import React, { useState } from 'react';
import { User, ArrowRight } from 'lucide-react';

interface NicknameGateProps {
  roomTitle: string;
  initialNickname?: string;
  isEditMode?: boolean;
  onClose?: () => void;
  onEnter: (nickname: string) => void;
}

export const NicknameGate: React.FC<NicknameGateProps> = ({
  roomTitle,
  initialNickname = '',
  isEditMode = false,
  onClose,
  onEnter,
}) => {
  const [nickname, setNickname] = useState(initialNickname);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onEnter(nickname.trim().slice(0, 20));
      if (onClose) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white p-8 sm:p-10 rounded-[24px] border border-black/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.14)] text-center text-[#1d1d1f]">
        {/* Close button in edit mode */}
        {isEditMode && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.05] transition-colors"
            title="닫기"
          >
            ✕
          </button>
        )}

        <div className="w-12 h-12 rounded-full bg-black/[0.04] text-[#1d1d1f] flex items-center justify-center mx-auto mb-4">
          <User className="w-6 h-6 text-[#0066cc]" />
        </div>

        <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-1.5 tracking-tight">
          {isEditMode ? '닉네임 변경하기' : 'Q&A 백채널 참여하기'}
        </h2>
        <p className="text-[14px] text-[#86868b] mb-6 line-clamp-1">{roomTitle}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
              사용할 닉네임을 입력해 주세요
            </label>
            <input
              type="text"
              autoFocus
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 청중1, 김질문, 참석자"
              maxLength={20}
              className="w-full px-4 py-3.5 rounded-[12px] bg-[#f5f5f7] border border-black/[0.1] text-[17px] text-[#1d1d1f] placeholder-[#86868b] focus:bg-white focus:ring-2 focus:ring-[#0071e3] outline-none transition-all"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            {isEditMode && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] font-normal text-[16px] transition-all"
              >
                취소
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white font-normal text-[17px] flex items-center justify-center gap-1.5 transition-all active:scale-[0.97]"
            >
              <span>{isEditMode ? '변경 완료' : '입장하기'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <p className="text-[13px] text-[#86868b] mt-5">
          {isEditMode
            ? '닉네임을 변경하면 이후 작성하는 질문과 답변에 새 닉네임이 적용됩니다.'
            : '회원가입 없이 닉네임만으로 바로 자유롭게 질문할 수 있습니다.'}
        </p>
      </div>
    </div>
  );
};
