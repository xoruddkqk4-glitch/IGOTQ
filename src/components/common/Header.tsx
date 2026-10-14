'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare, Shield, Clock, LogIn, LogOut, User } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                IGOTQ
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">I Got A Question! 휘발성 Q&A 백채널</p>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          {profile?.canPersist && (
            <Link
              href="/history"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">저장된 세션</span>
            </Link>
          )}

          {profile?.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all"
            >
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>관리자</span>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="max-w-[120px] truncate">{user.email}</span>
              </span>
              <button
                onClick={() => signOut()}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-200 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>로그인</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
