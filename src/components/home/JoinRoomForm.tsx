'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
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
    <form onSubmit={handleJoin} className="space-y-4">
      {error && (
        <p className="text-[14px] text-[#ff3b30] bg-[#ff3b30]/10 px-4 py-2.5 rounded-xl font-medium">
          {error}
        </p>
      )}
      
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="방 코드 또는 URL 입력 (예: ai-edu)"
          className="w-full flex-1 px-6 py-4 rounded-full bg-[#f5f5f7] border border-black/[0.12] text-[18px] sm:text-[20px] font-medium text-[#1d1d1f] placeholder-[#86868b] focus:bg-white focus:ring-2 focus:ring-[#0071e3] focus:border-transparent outline-none transition-all font-mono"
          required
          autoFocus
        />
        <button
          type="submit"
          className="w-full sm:w-auto px-9 py-4 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white text-[17px] sm:text-[18px] font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97] shadow-none flex-shrink-0"
        >
          <span>참여하기</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};
