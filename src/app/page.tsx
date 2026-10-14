'use client';

import React, { useState } from 'react';
import { CreateRoomForm } from '@/components/home/CreateRoomForm';
import { JoinRoomForm } from '@/components/home/JoinRoomForm';
import { LogIn, PlusCircle, Zap, RefreshCw, Lock, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('join');

  return (
    <div className="space-y-12 sm:space-y-16 py-4 sm:py-8">
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-3 pt-2">
        <h1 className="text-5xl sm:text-7xl font-bold tracking-[-0.03em] text-[#1d1d1f] leading-[1.06]">
          질문이 생겼을 땐? <br className="sm:hidden" />
          <span className="text-[#0066cc]">IGOTQ</span>
        </h1>

        <p className="text-[20px] sm:text-[24px] text-[#424245] font-normal max-w-xl mx-auto pt-1 leading-snug">
          회원가입 없는 3초 접속 · 무흔적 실시간 세션 Q&A
        </p>
      </section>

      {/* Main Interactive Action Box */}
      <section className="max-w-xl mx-auto">
        <div className="apple-card p-6 sm:p-10 rounded-[28px] border border-black/[0.08] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.05)] space-y-7">
          {/* Segmented Tab Selector */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-[#e8e8ed] rounded-full w-full">
            <button
              type="button"
              onClick={() => setActiveTab('join')}
              className={`py-3 px-4 rounded-full font-semibold flex items-center justify-center gap-2 whitespace-nowrap min-w-0 transition-all cursor-pointer select-none text-[15px] sm:text-[16px] ${
                activeTab === 'join'
                  ? 'bg-white text-[#1d1d1f] shadow-[0_2px_8px_rgba(0,0,0,0.12)] font-bold'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              <LogIn className="w-4 h-4 text-[#0066cc] shrink-0" />
              <span>방 참여하기</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`py-3 px-4 rounded-full font-semibold flex items-center justify-center gap-2 whitespace-nowrap min-w-0 transition-all cursor-pointer select-none text-[15px] sm:text-[16px] ${
                activeTab === 'create'
                  ? 'bg-white text-[#1d1d1f] shadow-[0_2px_8px_rgba(0,0,0,0.12)] font-bold'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-[#0066cc] shrink-0" />
              <span>새 방 만들기</span>
            </button>
          </div>

          {/* Active Tab View */}
          <div className="pt-1 animate-fade-in">
            {activeTab === 'join' && <JoinRoomForm />}
            {activeTab === 'create' && <CreateRoomForm />}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto pt-2">
        <div className="apple-card p-6 rounded-[20px] border border-black/[0.08] bg-white space-y-2">
          <div className="w-11 h-11 rounded-full bg-black/[0.04] text-[#0066cc] flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-[18px] font-semibold text-[#1d1d1f]">3초 무가입 참여</h3>
          <p className="text-[14px] text-[#6e6e73] leading-snug">
            URL 또는 방 코드만으로 즉시 질문
          </p>
        </div>

        <div className="apple-card p-6 rounded-[20px] border border-black/[0.08] bg-white space-y-2">
          <div className="w-11 h-11 rounded-full bg-black/[0.04] text-[#0066cc] flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h3 className="text-[18px] font-semibold text-[#1d1d1f]">실시간 Q&A 스레드</h3>
          <p className="text-[14px] text-[#6e6e73] leading-snug">
            미답변 및 답변 완료 자동 분류
          </p>
        </div>

        <div className="apple-card p-6 rounded-[20px] border border-black/[0.08] bg-white space-y-2">
          <div className="w-11 h-11 rounded-full bg-black/[0.04] text-[#0066cc] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-[18px] font-semibold text-[#1d1d1f]">무흔적 세션 보안</h3>
          <p className="text-[14px] text-[#6e6e73] leading-snug">
            세션 만료 시 서버 데이터 영구 파기
          </p>
        </div>

        <div className="apple-card p-6 rounded-[20px] border border-black/[0.08] bg-white space-y-2">
          <div className="w-11 h-11 rounded-full bg-black/[0.04] text-[#0066cc] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-[18px] font-semibold text-[#1d1d1f]">로컬 백업 & 복원</h3>
          <p className="text-[14px] text-[#6e6e73] leading-snug">
            JSON 파일로 안전 보관 및 원클릭 재개
          </p>
        </div>
      </section>
    </div>
  );
}
