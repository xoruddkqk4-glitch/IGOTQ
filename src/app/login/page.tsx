'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle2, AlertCircle, Shield, Cloud, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect
  if (user) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4 apple-card p-8 sm:p-10 rounded-[24px] border border-black/[0.08] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <CheckCircle2 className="w-12 h-12 text-[#34c759] mx-auto" />
        <h2 className="text-xl font-semibold text-[#1d1d1f]">이미 로그인되어 있습니다</h2>
        <p className="text-[14px] text-[#86868b]">{user.email}</p>
        <button
          onClick={() => router.push('/')}
          className="px-7 py-2.5 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white font-normal text-[15px] transition-all active:scale-[0.97]"
        >
          홈으로 이동
        </button>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류';
      let friendly = 'Google 로그인 중 오류가 발생했습니다. 다시 시도해 주세요.';

      if (errorMsg.includes('popup-closed-by-user')) {
        friendly = '로그인 창이 닫혔습니다. 다시 시도해 주세요.';
      } else if (errorMsg.includes('popup-blocked')) {
        friendly = '브라우저 팝업이 차단되었습니다. 팝업 허용 후 다시 시도해 주세요.';
      } else if (errorMsg.includes('unauthorized-domain')) {
        friendly = 'Firebase 콘솔의 승인된 도메인(Authorized domains)에 localhost가 등록되어 있는지 확인해 주세요.';
      } else if (errorMsg.includes('network-request-failed')) {
        friendly = '네트워크 연결이 원활하지 않습니다. 인터넷 상태를 확인해 주세요.';
      }
      setError(friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 sm:px-0">
      <div className="apple-card p-8 sm:p-10 rounded-[28px] border border-black/[0.08] bg-white shadow-[0_4px_28px_rgba(0,0,0,0.05)] space-y-8 text-center">
        {/* Brand / Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.04] text-[12px] font-medium text-[#86868b] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#0066cc]" />
            <span>간편하고 안전한 원클릭 인증</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] tracking-tight">
            호스트 및 관리자 로그인
          </h2>
          <p className="text-[14px] text-[#86868b] leading-relaxed max-w-sm mx-auto">
            별도의 회원가입이나 비밀번호 없이<br className="hidden sm:inline" /> Google 계정으로 1초 만에 바로 시작하세요.
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-[#ff3b30]/10 border border-[#ff3b30]/20 text-[#d70015] text-[13px] flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google One-Click Button */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-4 px-6 rounded-full bg-white hover:bg-[#f5f5f7] border border-black/15 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] text-[#1d1d1f] font-medium text-[16px] flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-2 text-[#86868b]">
                <div className="w-4 h-4 border-2 border-[#86868b] border-t-transparent rounded-full animate-spin"></div>
                <span>Google 계정 확인 중...</span>
              </div>
            ) : (
              <>
                {/* Official Google G Logo */}
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google 계정으로 계속하기</span>
              </>
            )}
          </button>
        </div>

        {/* Feature benefits highlight */}
        <div className="pt-6 border-t border-black/[0.06] text-left space-y-3">
          <p className="text-[12px] font-semibold text-[#86868b] tracking-wide uppercase">
            로그인 시 제공되는 기능
          </p>
          <div className="space-y-2 text-[13px] text-[#515154]">
            <div className="flex items-center gap-2.5">
              <Cloud className="w-4 h-4 text-[#0066cc] flex-shrink-0" />
              <span>클라우드 세션 영구 보관 및 히스토리 조회</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-[#34c759] flex-shrink-0" />
              <span>관리자 권한 승격 시 실시간 모니터링 & 설정 제어</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
