'use client';

import React, { useState } from 'react';
import { CreateRoomForm } from '@/components/home/CreateRoomForm';
import { JoinRoomForm } from '@/components/home/JoinRoomForm';
import { ImportDropzone } from '@/components/home/ImportDropzone';
import { Sparkles, LogIn, UploadCloud, ShieldCheck, Zap, Lock, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'import'>('join');

  return (
    <div className="space-y-12 py-4">
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Frictionless 휘발성 백채널 Q&A 플랫폼</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          질문이 생겼을 땐? <br />
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-200 bg-clip-text text-transparent">
            IGOTQ!
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          세미나, 컨퍼런스, 수업에서 청중과 발표자 사이의 벽을 허뭅니다.
          회원가입 없는 3초 접속, 실시간 질문/답변 스레드, 세션 종료 시 흔적 없이 파기되는 In-Memory 보안 백채널입니다.
        </p>
      </section>

      {/* Main Interactive Action Box */}
      <section className="max-w-xl mx-auto">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          {/* Tab selector */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10">
            <button
              onClick={() => setActiveTab('join')}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'join'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>방 코드 참여</span>
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'create'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>새 방 개설</span>
            </button>

            <button
              onClick={() => setActiveTab('import')}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'import'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>세션 복원</span>
            </button>
          </div>

          {/* Active Tab View */}
          <div className="pt-2 animate-fade-in">
            {activeTab === 'join' && <JoinRoomForm />}
            {activeTab === 'create' && <CreateRoomForm />}
            {activeTab === 'import' && <ImportDropzone />}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
        <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">3초 만에 무가입 참여</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            청중은 복잡한 회원가입 절차 없이 URL이나 방 코드와 닉네임만으로 즉시 질문할 수 있습니다.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">미답변/답변완료 스레드</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            발표자가 질문에 답변을 작성하면 자동으로 &apos;답변 완료&apos;로 전환되며 스레드로 깔끔히 정리됩니다.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Zero Data Retention</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            일반 사용자 방은 100% 메모리에서만 동작하며, 시간 만료 시 서버에 어떠한 데이터도 남지 않습니다.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">로컬 파일 백업/복원</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            방장은 세션 기록을 JSON/TXT로 즉시 다운로드하고, 필요 시 언제든 재업로드하여 세션을 이어갈 수 있습니다.
          </p>
        </div>
      </section>
    </div>
  );
}
