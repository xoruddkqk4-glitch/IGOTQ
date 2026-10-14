'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, ArrowRight } from 'lucide-react';
import { sanitizeSlug } from '@/lib/slug';

export const JoinRoomForm: React.FC = () => {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let clean = code.trim();
    if (clean.includes('/')) {
      const parts = clean.split('/');
      clean = parts[parts.length - 1] || '';
    }
    clean = sanitizeSlug(clean);

    if (!clean) {
      setError('올바른 방 코드 또는 URL을 입력해 주세요.');
      return;
    }

    router.push(`/${clean}`);
  };

  return (
    <form onSubmit={handleJoin} className="space-y-3">
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="relative">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="방 코드 또는 URL 입력 (예: ai-edu-2026)"
          className="w-full pl-4 pr-12 py-3 rounded-xl glass-input text-sm text-white placeholder-slate-500 font-mono"
          required
        />
        <button
          type="submit"
          className="absolute right-2 top-2 bottom-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors shadow-md shadow-indigo-600/20"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <p className="text-[11px] text-slate-400 text-center">
        별도 회원가입 없이 발표자가 공유한 코드만 넣으면 3초 만에 참여 완료!
      </p>
    </form>
  );
};
