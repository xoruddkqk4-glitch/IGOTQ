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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-[#ff3b30]/10 border border-[#ff3b30]/20 text-[#d70015] text-[14px] font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-[16px] sm:text-[17px] font-semibold text-[#1d1d1f] mb-2">
          방 제목 <span className="text-[#0066cc]">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 2026 AI 세미나 Q&A"
          className="w-full px-5 py-3.5 rounded-[14px] bg-[#f5f5f7] border border-black/[0.12] text-[17px] sm:text-[18px] font-medium text-[#1d1d1f] placeholder-[#86868b] focus:bg-white focus:ring-2 focus:ring-[#0071e3] focus:border-transparent outline-none transition-all"
          required
        />
      </div>

      <div>
        <label className="block text-[16px] sm:text-[17px] font-semibold text-[#1d1d1f] mb-2">
          방 코드 (선택)
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[16px] text-[#86868b] font-mono pl-1">igotq.com/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="ai-edu (미입력 시 자동 생성)"
            className="flex-1 px-4 py-3 rounded-[14px] bg-[#f5f5f7] border border-black/[0.12] text-[16px] font-mono text-[#1d1d1f] placeholder-[#86868b] focus:bg-white focus:ring-2 focus:ring-[#0071e3] focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-[16px] sm:text-[17px] font-semibold text-[#1d1d1f] mb-2 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#86868b]" />
          <span>세션 유지 시간</span>
        </label>
        <div className="grid grid-cols-4 gap-2.5">
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
              className={`py-2.5 px-3 rounded-full text-[15px] sm:text-[16px] font-semibold border transition-all active:scale-[0.97] ${
                ttlMinutes === item.val
                  ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]'
                  : 'bg-[#f5f5f7] text-[#1d1d1f] border-black/[0.08] hover:bg-[#e8e8ed]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cloud Persistence Toggle (Available for approved hosts) */}
      {profile?.canPersist && (
        <div className="p-4 rounded-[16px] bg-[#f5f5f7] border border-black/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Cloud className="w-5 h-5 text-[#0066cc]" />
              <div>
                <span className="text-[15px] font-semibold text-[#1d1d1f]">클라우드 암호화 보관</span>
                <p className="text-[13px] text-[#86868b]">승인 계정 전용 히스토리 저장</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isCloudPersisted}
                onChange={(e) => setIsCloudPersisted(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#e5e5ea] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#34c759]"></div>
            </label>
          </div>

          {isCloudPersisted && (
            <label className="flex items-start gap-2 pt-2.5 border-t border-black/[0.06] cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 rounded border-black/20 text-[#0066cc] focus:ring-[#0071e3]"
              />
              <span className="text-[13px] text-[#86868b] leading-snug">
                (필수) 개인 식별 정보는 암호화 처리되며, 세션 기간 종료 시까지 안전하게 보관됨에 동의합니다.
              </span>
            </label>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white font-semibold text-[18px] sm:text-[19px] flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50"
      >
        {loading ? (
          <span>방 개설 중...</span>
        ) : (
          <>
            <span>새 Q&A 방 개설하기</span>
            <ArrowRight className="w-5 h-5 ml-0.5" />
          </>
        )}
      </button>
    </form>
  );
};
