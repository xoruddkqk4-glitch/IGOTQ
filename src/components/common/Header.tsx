'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare, Shield, Clock, LogIn, LogOut, User } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full apple-nav-global h-16 flex items-center px-4 sm:px-8 border-b border-white/[0.08]">
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group transition-opacity hover:opacity-85">
          <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold shadow-sm">
            <MessageSquare className="w-4 h-4 fill-black text-black" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[17px] text-white tracking-tight">
              IGOTQ
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#34c759]/20 text-[#34c759] text-[10px] font-semibold tracking-wider border border-[#34c759]/30">
              LIVE
            </span>
          </div>
        </Link>

        {/* Navigation links & Actions */}
        <nav className="flex items-center gap-3 sm:gap-5 text-[14px] text-[#d2d2d7]">
          {profile?.canPersist && (
            <Link
              href="/history"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[#d2d2d7] hover:text-white hover:bg-white/10 transition-all font-medium text-[13px] sm:text-[14px]"
            >
              <Clock className="w-4 h-4 text-[#86868b]" />
              <span>저장된 세션</span>
            </Link>
          )}

          {profile?.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[#d2d2d7] hover:text-white hover:bg-white/10 transition-all font-medium text-[13px] sm:text-[14px]"
            >
              <Shield className="w-4 h-4 text-[#34c759]" />
              <span className="text-white font-medium">관리자</span>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2.5 pl-3 sm:pl-4 border-l border-white/15">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[13px] text-[#f5f5f7]">
                <User className="w-3.5 h-3.5 text-[#86868b]" />
                <span className="max-w-[140px] sm:max-w-[200px] truncate">{user.email}</span>
                {profile?.role === 'admin' && (
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-[#0066cc]/30 text-[#2997ff] text-[10px] font-bold tracking-wider">
                    ADMIN
                  </span>
                )}
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1 p-2 rounded-full text-[#86868b] hover:text-white hover:bg-white/10 transition-colors"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="apple-btn-primary px-4 py-1.5 text-[13px] sm:text-[14px] flex items-center gap-1.5 rounded-full"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>로그인</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
