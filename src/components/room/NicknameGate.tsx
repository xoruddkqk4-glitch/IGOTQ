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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
          <User className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold text-white mb-1">Q&A 백채널 입장하기</h2>
        <p className="text-xs text-slate-400 mb-6 line-clamp-1">{roomTitle}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              사용할 닉네임을 입력해 주세요
            </label>
            <input
              type="text"
              autoFocus
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 청중1, 김질문, 참석자"
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-slate-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <span>입장하기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-slate-500 mt-4">
          회원가입 없이 닉네임만으로 바로 자유롭게 질문할 수 있습니다.
        </p>
      </div>
    </div>
  );
};
