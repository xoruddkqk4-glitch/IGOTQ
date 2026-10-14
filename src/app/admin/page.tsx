'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Shield,
  Activity,
  Cpu,
  HardDrive,
  Users,
  Settings,
  AlertOctagon,
  UserCheck,
  Trash2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { AdminMetrics, SystemSettings } from '@/types/settings';
import { RoomInfo } from '@/types/room';
import { UserProfile } from '@/types/user';

export default function AdminPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, getIdToken } = useAuth();

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [activeRooms, setActiveRooms] = useState<RoomInfo[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [profanityWords, setProfanityWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState('');
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Auth gate
  useEffect(() => {
    if (authLoading) return;
    if (!user || profile?.role !== 'admin') {
      router.push('/login');
    }
  }, [user, profile, authLoading, router]);

  // Fetch all admin data
  const fetchData = async () => {
    try {
      const token = await getIdToken();
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, setRes, profRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/settings', { headers }),
        fetch('/api/admin/profanity', { headers }),
        fetch('/api/admin/users', { headers }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setMetrics(statsData.metrics);
        setActiveRooms(statsData.activeRooms || []);
      }
      if (setRes.ok) {
        const setData = await setRes.json();
        setSettings(setData.settings);
      }
      if (profRes.ok) {
        const profData = await profRes.json();
        setProfanityWords(profData.words || []);
      }
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsersList(uData.users || []);
      }
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchData();
      const interval = setInterval(fetchData, 8000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSavingSettings(true);

    try {
      const token = await getIdToken();
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setStatusMsg('시스템 설정이 성공적으로 저장되었습니다.');
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddProfanity = async () => {
    if (!newWord.trim()) return;
    const updated = [...profanityWords, newWord.trim()];
    setProfanityWords(updated);
    setNewWord('');

    const token = await getIdToken();
    await fetch('/api/admin/profanity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ words: updated }),
    });
  };

  const handleRemoveProfanity = async (target: string) => {
    const updated = profanityWords.filter((w) => w !== target);
    setProfanityWords(updated);

    const token = await getIdToken();
    await fetch('/api/admin/profanity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ words: updated }),
    });
  };

  const handleToggleUserPermission = async (targetUid: string, current: boolean) => {
    const token = await getIdToken();
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetUid, canPersist: !current }),
    });

    if (res.ok) {
      setUsersList((prev) =>
        prev.map((u) => (u.uid === targetUid ? { ...u, canPersist: !current } : u))
      );
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
        <p className="text-xs text-slate-400">관리자 대시보드 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-black text-white">Super Admin Dashboard</h1>
          </div>
          <p className="text-xs text-slate-400">시스템 자원 실시간 모니터링, 글로벌 설정 및 사용자 저장 권한 관리</p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>새로고침</span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
          {statusMsg}
        </div>
      )}

      {/* 1. Real-time Telemetry Metrics */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs">활성 세션</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics?.activeRoomsCount || 0}개</div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs">동시 접속자</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics?.totalParticipants || 0}명</div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs">메모리 사용량</span>
            <HardDrive className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics?.memoryUsageMb || 0} MB</div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs">CPU 부하율</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics?.cpuUsagePercent || 0}%</div>
        </div>
      </section>

      {/* 2. Active Rooms Table */}
      <section className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span>현재 활성 방 모니터링 ({activeRooms.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="py-2.5 px-3">방 제목</th>
                <th className="py-2.5 px-3">슬러그</th>
                <th className="py-2.5 px-3">접속자</th>
                <th className="py-2.5 px-3">저장 모드</th>
                <th className="py-2.5 px-3">만료 예정</th>
              </tr>
            </thead>
            <tbody>
              {activeRooms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    현재 활성화된 방이 없습니다.
                  </td>
                </tr>
              ) : (
                activeRooms.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-semibold text-white">{r.title}</td>
                    <td className="py-2.5 px-3 font-mono text-cyan-400">{r.slug}</td>
                    <td className="py-2.5 px-3 text-slate-300">{r.participantCount || 0}명</td>
                    <td className="py-2.5 px-3">
                      {r.isCloudPersisted ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                          클라우드
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                          휘발성(In-Memory)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {new Date(r.expiresAt).toLocaleTimeString('ko-KR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. User Approval System */}
      <section className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>사용자 클라우드 저장 권한 승인 관리 ({usersList.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="py-2.5 px-3">사용자 이메일</th>
                <th className="py-2.5 px-3">이메일 인증 여부</th>
                <th className="py-2.5 px-3">역할</th>
                <th className="py-2.5 px-3">클라우드 저장 권한</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => (
                <tr key={u.uid} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-2.5 px-3 font-medium text-white">{u.email}</td>
                  <td className="py-2.5 px-3">
                    {u.emailVerified ? (
                      <span className="text-emerald-400 font-bold">인증 완료</span>
                    ) : (
                      <span className="text-slate-500">미인증</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <button
                      onClick={() => handleToggleUserPermission(u.uid, u.canPersist)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        u.canPersist
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {u.canPersist ? '승인됨 (저장 가능)' : '승인 거부됨'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Global Settings & Profanity Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Settings Form */}
        {settings && (
          <form onSubmit={handleSaveSettings} className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>시스템 정책 설정</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">기본 방 유지 시간 (분)</label>
                <input
                  type="number"
                  value={settings.defaultTtlMinutes}
                  onChange={(e) => setSettings({ ...settings, defaultTtlMinutes: parseInt(e.target.value, 10) || 120 })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">최대 허용 방 유지 시간 (분)</label>
                <input
                  type="number"
                  value={settings.maxTtlMinutes}
                  onChange={(e) => setSettings({ ...settings, maxTtlMinutes: parseInt(e.target.value, 10) || 1440 })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">질문/메시지 최대 글자 수</label>
                <input
                  type="number"
                  value={settings.maxMessageLength}
                  onChange={(e) => setSettings({ ...settings, maxMessageLength: parseInt(e.target.value, 10) || 500 })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">소켓 레이트 리밋 (10초당 허용 건수)</label>
                <input
                  type="number"
                  value={settings.rateLimitPer10Sec}
                  onChange={(e) => setSettings({ ...settings, rateLimitPer10Sec: parseInt(e.target.value, 10) || 5 })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
            >
              {savingSettings ? '설정 저장 중...' : '시스템 설정 저장'}
            </button>
          </form>
        )}

        {/* Profanity Filter */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-amber-400" />
            <span>글로벌 금칙어(비속어) 관리</span>
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="추가할 금칙어 입력"
              className="flex-1 px-3 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500"
            />
            <button
              type="button"
              onClick={handleAddProfanity}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>추가</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto p-1">
            {profanityWords.map((word) => (
              <span
                key={word}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs"
              >
                <span>{word}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveProfanity(word)}
                  className="text-red-400 hover:text-white"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
