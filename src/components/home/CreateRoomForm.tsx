'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, Clock, Cloud, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

interface CreateRoomFormProps {
  initialTitle?: string;
  onSuccess?: (slug: string, hostToken: string) => void;
}

export const CreateRoomForm: React.FC<CreateRoomFormProps> = ({ initialTitle = '', onSuccess }) => {
  const router = useRouter();
  const { user, profile, getIdToken } = useAuth();

  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState('');
  const [ttlMinutes, setTtlMinutes] = useState(120);
  const [isCloudPersisted, setIsCloudPersisted] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('방 제목을 입력해 주세요.');
      return;
    }

    if (isCloudPersisted && !consentGiven) {
      setError('온라인 클라우드 저장 옵션을 사용하려면 데이터 보관 동의가 필요합니다.');
      return;
    }

    setLoading(true);

    try {
      const token = await getIdToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title,
          slug: slug.trim() || undefined,
          ttlMinutes,
          isCloudPersisted,
          consentGiven,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '방 생성에 실패했습니다.');
      }

      // Store host token in localStorage
      localStorage.setItem(`igotq:host:${data.room.slug}`, data.hostToken);

      if (onSuccess) {
        onSuccess(data.room.slug, data.hostToken);
      } else {
        router.push(`/${data.room.slug}`);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          세미나 / 수업 / 발표 제목 <span className="text-indigo-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 2026 AI 융합교육 세미나 Q&A"
          className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
          <span>접속 슬러그 (URL 코드)</span>
          <span className="text-[11px] text-slate-500 font-normal">미입력 시 무작위 자동 생성</span>
        </label>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 font-mono pl-1">igotq.com/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="ai-edu-2026"
            className="flex-1 px-3.5 py-2 rounded-xl glass-input text-sm font-mono text-white placeholder-slate-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>세션 유지 시간 (만료 후 자동 파기)</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: '1시간', val: 60 },
            { label: '2시간', val: 120 },
            { label: '4시간', val: 240 },
            { label: '12시간', val: 720 },
          ].map((item) => (
            <button
              key={item.val}
              type="button"
              onClick={() => setTtlMinutes(item.val)}
              className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                ttlMinutes === item.val
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cloud Persistence Toggle (Available for approved hosts) */}
      {profile?.canPersist && (
        <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-xs font-bold text-cyan-200">온라인 상에 세션 기록 저장</span>
                <p className="text-[10px] text-cyan-400/80">승인된 계정 전용 암호화 클라우드 보관</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isCloudPersisted}
                onChange={(e) => setIsCloudPersisted(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          {isCloudPersisted && (
            <label className="flex items-start gap-2 pt-2 border-t border-cyan-500/20 cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 rounded border-cyan-400 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-[11px] text-cyan-300 leading-snug">
                (필수) 질문자 개인 식별 정보는 암호화 처리되며, 세션 유효 기간 종료 시까지 안전하게 보관됨에 동의합니다.
              </span>
            </label>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        {loading ? (
          <span>방 개설 중...</span>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>새 Q&A 방 개설하기</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </>
        )}
      </button>
    </form>
  );
};
