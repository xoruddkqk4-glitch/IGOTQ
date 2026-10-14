'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Cloud, RotateCcw, Clock, Calendar, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { RoomInfo } from '@/types/room';

export default function HistoryPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, getIdToken } = useAuth();

  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      if (authLoading) return;
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const token = await getIdToken();
        const res = await fetch('/api/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setRooms(data.rooms || []);
        } else {
          setError(data.error || '히스토리를 불러오지 못했습니다.');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '알 수 없는 오류';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [user, authLoading, getIdToken, router]);

  const handleRestore = async (roomId: string) => {
    setRestoringId(roomId);
    setError(null);

    try {
      const token = await getIdToken();
      const res = await fetch(`/api/history/${roomId}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '복원 실패');

      localStorage.setItem(`igotq:host:${data.room.slug}`, data.hostToken);
      router.push(`/${data.room.slug}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '알 수 없는 오류';
      setError(`세션 복원 실패: ${msg}`);
      setRestoringId(null);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
        <p className="text-xs text-slate-400">클라우드 세션 목록 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cloud className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white">클라우드 저장 세션 히스토리</h1>
          </div>
          <p className="text-xs text-slate-400">
            승인된 계정으로 클라우드에 암호화 보관된 과거 세션 목록입니다. 원클릭으로 새 세션에 복원할 수 있습니다.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {rooms.length === 0 ? (
        <div className="glass-panel p-16 rounded-3xl border border-white/5 text-center space-y-3">
          <Cloud className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">저장된 클라우드 세션이 없습니다</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            새 방 개설 시 &apos;온라인 상에 세션 기록 저장&apos; 옵션을 활성화하면 세션이 안전하게 클라우드에 보관됩니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rooms.map((room) => {
            const createdStr = new Date(room.createdAt).toLocaleString('ko-KR');
            return (
              <div
                key={room.id}
                className="glass-card p-5 rounded-2xl border border-white/10 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="font-mono text-cyan-400">igotq.com/{room.slug}</span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {createdStr}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug">{room.title}</h3>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    클라우드 암호화 보관 완료
                  </span>

                  <button
                    onClick={() => handleRestore(room.id)}
                    disabled={restoringId === room.id}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-40"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{restoringId === room.id ? '복원 중...' : '원클릭 복원'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
