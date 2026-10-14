'use client';

import React, { useState } from 'react';
import { User, ArrowRight } from 'lucide-react';

interface NicknameGateProps {
  roomTitle: string;
  onEnter: (nickname: string) => void;
}

export const NicknameGate: React.FC<NicknameGateProps> = ({ roomTitle, onEnter }) => {
  const [nickname, setNickname] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onEnter(nickname.trim().slice(0, 20));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[24px] border border-black/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.14)] text-center text-[#1d1d1f]">
        <div className="w-12 h-12 rounded-full bg-black/[0.04] text-[#1d1d1f] flex items-center justify-center mx-auto mb-4">
          <User className="w-6 h-6 text-[#0066cc]" />
        </div>

        <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-1.5 tracking-tight">Q&A 백채널 참여하기</h2>
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

          <button
            type="submit"
            className="w-full py-3.5 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white font-normal text-[17px] flex items-center justify-center gap-1.5 transition-all active:scale-[0.97]"
          >
            <span>입장하기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[13px] text-[#86868b] mt-5">
          회원가입 없이 닉네임만으로 바로 자유롭게 질문할 수 있습니다.
        </p>
      </div>
    </div>
  );
};
