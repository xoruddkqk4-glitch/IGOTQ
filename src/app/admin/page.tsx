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
        <div className="w-8 h-8 rounded-full border-2 border-[#0066cc] border-t-transparent animate-spin"></div>
        <p className="text-[13px] text-[#86868b]">관리자 대시보드 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-black/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#0066cc]" />
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] tracking-tight">Super Admin Dashboard</h1>
          </div>
          <p className="text-[14px] text-[#86868b]">시스템 자원 실시간 모니터링, 글로벌 설정 및 사용자 저장 권한 관리</p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.1] text-[13px] font-normal text-[#1d1d1f] hover:bg-[#f5f5f7] transition-all active:scale-[0.97]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>새로고침</span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-[#34c759]/10 border border-[#34c759]/20 text-[#1e7e34] text-[13px] font-medium">
          {statusMsg}
        </div>
      )}

      {/* 1. Real-time Telemetry Metrics */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="apple-card p-5 sm:p-6 rounded-[18px] border border-black/[0.08] bg-white space-y-1">
          <div className="flex items-center justify-between text-[#86868b]">
            <span className="text-[13px]">활성 세션</span>
            <Activity className="w-4 h-4 text-[#0066cc]" />
          </div>
          <div className="text-3xl font-semibold text-[#1d1d1f]">{metrics?.activeRoomsCount || 0}개</div>
        </div>

        <div className="apple-card p-5 sm:p-6 rounded-[18px] border border-black/[0.08] bg-white space-y-1">
          <div className="flex items-center justify-between text-[#86868b]">
            <span className="text-[13px]">동시 접속자</span>
            <Users className="w-4 h-4 text-[#34c759]" />
          </div>
          <div className="text-3xl font-semibold text-[#1d1d1f]">{metrics?.totalParticipants || 0}명</div>
        </div>

        <div className="apple-card p-5 sm:p-6 rounded-[18px] border border-black/[0.08] bg-white space-y-1">
          <div className="flex items-center justify-between text-[#86868b]">
            <span className="text-[13px]">메모리 사용량</span>
            <HardDrive className="w-4 h-4 text-[#0066cc]" />
          </div>
          <div className="text-3xl font-semibold text-[#1d1d1f]">{metrics?.memoryUsageMb || 0} MB</div>
        </div>

        <div className="apple-card p-5 sm:p-6 rounded-[18px] border border-black/[0.08] bg-white space-y-1">
          <div className="flex items-center justify-between text-[#86868b]">
            <span className="text-[13px]">CPU 부하율</span>
            <Cpu className="w-4 h-4 text-[#ff9500]" />
          </div>
          <div className="text-3xl font-semibold text-[#1d1d1f]">{metrics?.cpuUsagePercent || 0}%</div>
        </div>
      </section>

      {/* 2. Active Rooms Table */}
      <section className="apple-card p-6 sm:p-7 rounded-[20px] border border-black/[0.08] bg-white space-y-4">
        <h3 className="text-[17px] font-semibold text-[#1d1d1f] flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#0066cc]" />
          <span>현재 활성 방 모니터링 ({activeRooms.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-black/[0.08] text-[#86868b] font-normal">
                <th className="py-3 px-3">방 제목</th>
                <th className="py-3 px-3">슬러그</th>
                <th className="py-3 px-3">접속자</th>
                <th className="py-3 px-3">저장 모드</th>
                <th className="py-3 px-3">만료 예정</th>
              </tr>
            </thead>
            <tbody>
              {activeRooms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#86868b]">
                    현재 활성화된 방이 없습니다.
                  </td>
                </tr>
              ) : (
                activeRooms.map((r) => (
                  <tr key={r.id} className="border-b border-black/[0.04] hover:bg-black/[0.015]">
                    <td className="py-3 px-3 font-semibold text-[#1d1d1f]">{r.title}</td>
                    <td className="py-3 px-3 font-mono text-[#0066cc]">{r.slug}</td>
                    <td className="py-3 px-3 text-[#1d1d1f]">{r.participantCount || 0}명</td>
                    <td className="py-3 px-3">
                      {r.isCloudPersisted ? (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#0066cc]/10 text-[#0066cc] font-medium">
                          클라우드
                        </span>
                      ) : (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-black/[0.05] text-[#86868b]">
                          휘발성(In-Memory)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[#86868b]">
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
      <section className="apple-card p-6 sm:p-7 rounded-[20px] border border-black/[0.08] bg-white space-y-4">
        <h3 className="text-[17px] font-semibold text-[#1d1d1f] flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-[#34c759]" />
          <span>사용자 클라우드 저장 권한 승인 관리 ({usersList.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-black/[0.08] text-[#86868b] font-normal">
                <th className="py-3 px-3">사용자 이메일</th>
                <th className="py-3 px-3">이메일 인증 여부</th>
                <th className="py-3 px-3">역할</th>
                <th className="py-3 px-3">클라우드 저장 권한</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => (
                <tr key={u.uid} className="border-b border-black/[0.04] hover:bg-black/[0.015]">
                  <td className="py-3 px-3 font-semibold text-[#1d1d1f]">{u.email}</td>
                  <td className="py-3 px-3">
                    {u.emailVerified ? (
                      <span className="text-[#1e7e34] font-medium">인증 완료</span>
                    ) : (
                      <span className="text-[#86868b]">미인증</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="uppercase text-[11px] font-medium px-2 py-0.5 rounded-full bg-black/[0.05] text-[#1d1d1f]">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleToggleUserPermission(u.uid, u.canPersist)}
                      className={`px-3.5 py-1 rounded-full text-[12px] font-normal transition-all active:scale-[0.97] ${
                        u.canPersist
                          ? 'bg-[#0066cc] text-white'
                          : 'bg-black/[0.05] text-[#86868b] hover:text-[#1d1d1f]'
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Settings Form */}
        {settings && (
          <form onSubmit={handleSaveSettings} className="apple-card p-6 rounded-[20px] border border-black/[0.08] bg-white space-y-4">
            <h3 className="text-[17px] font-semibold text-[#1d1d1f] flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#0066cc]" />
              <span>시스템 정책 설정</span>
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1">기본 방 유지 시간 (분)</label>
                <input
                  type="number"
                  value={settings.defaultTtlMinutes}
                  onChange={(e) => setSettings({ ...settings, defaultTtlMinutes: parseInt(e.target.value, 10) || 120 })}
                  className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#f5f5f7] border border-black/[0.1] text-[14px] text-[#1d1d1f] focus:bg-white focus:ring-2 focus:ring-[#0071e3] outline-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1">최대 허용 방 유지 시간 (분)</label>
                <input
                  type="number"
                  value={settings.maxTtlMinutes}
                  onChange={(e) => setSettings({ ...settings, maxTtlMinutes: parseInt(e.target.value, 10) || 1440 })}
                  className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#f5f5f7] border border-black/[0.1] text-[14px] text-[#1d1d1f] focus:bg-white focus:ring-2 focus:ring-[#0071e3] outline-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1">질문/메시지 최대 글자 수</label>
                <input
                  type="number"
                  value={settings.maxMessageLength}
                  onChange={(e) => setSettings({ ...settings, maxMessageLength: parseInt(e.target.value, 10) || 500 })}
                  className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#f5f5f7] border border-black/[0.1] text-[14px] text-[#1d1d1f] focus:bg-white focus:ring-2 focus:ring-[#0071e3] outline-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1">소켓 레이트 리밋 (10초당 허용 건수)</label>
                <input
                  type="number"
                  value={settings.rateLimitPer10Sec}
                  onChange={(e) => setSettings({ ...settings, rateLimitPer10Sec: parseInt(e.target.value, 10) || 5 })}
                  className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#f5f5f7] border border-black/[0.1] text-[14px] text-[#1d1d1f] focus:bg-white focus:ring-2 focus:ring-[#0071e3] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="w-full py-3 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white font-normal text-[15px] transition-all active:scale-[0.97]"
            >
              {savingSettings ? '설정 저장 중...' : '시스템 설정 저장'}
            </button>
          </form>
        )}

        {/* Profanity Filter */}
        <div className="apple-card p-6 rounded-[20px] border border-black/[0.08] bg-white space-y-4">
          <h3 className="text-[17px] font-semibold text-[#1d1d1f] flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-[#ff9500]" />
            <span>글로벌 금칙어(비속어) 관리</span>
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="추가할 금칙어 입력"
              className="flex-1 px-3.5 py-2.5 rounded-[12px] bg-[#f5f5f7] border border-black/[0.1] text-[14px] text-[#1d1d1f] placeholder-[#86868b] focus:bg-white focus:ring-2 focus:ring-[#0071e3] outline-none"
            />
            <button
              type="button"
              onClick={handleAddProfanity}
              className="px-5 py-2.5 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white text-[14px] font-normal flex items-center gap-1 transition-all active:scale-[0.97]"
            >
              <Plus className="w-4 h-4" />
              <span>추가</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto p-1">
            {profanityWords.map((word) => (
              <span
                key={word}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.05] border border-black/[0.08] text-[#1d1d1f] text-[12px]"
              >
                <span>{word}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveProfanity(word)}
                  className="text-[#86868b] hover:text-[#ff3b30] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
