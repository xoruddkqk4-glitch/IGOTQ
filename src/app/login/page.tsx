'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, UserPlus, KeyRound, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // If already logged in, redirect
  if (user) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4 glass-panel p-8 rounded-3xl border border-white/10">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">이미 로그인되어 있습니다</h2>
        <p className="text-xs text-slate-400">{user.email}</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
        >
          홈으로 이동
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        router.push('/');
      } else if (mode === 'signup') {
        if (password !== passwordConfirm) {
          throw new Error('비밀번호가 일치하지 않습니다.');
        }
        if (password.length < 6) {
          throw new Error('비밀번호는 최소 6자 이상이어야 합니다.');
        }

        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await sendEmailVerification(cred.user);
        setInfo('인증 메일을 발송했습니다! 이메일함을 확인하여 인증을 완료해 주세요.');
        setMode('login');
      } else if (mode === 'reset') {
        await sendPasswordResetEmail(auth, email.trim());
        setInfo('비밀번호 재설정 링크를 이메일로 전송했습니다.');
        setMode('login');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류';
      let friendly = errorMsg;
      if (errorMsg.includes('user-not-found') || errorMsg.includes('wrong-password') || errorMsg.includes('invalid-credential')) {
        friendly = '이메일 또는 비밀번호가 올바르지 않습니다.';
      } else if (errorMsg.includes('email-already-in-use')) {
        friendly = '이미 가입된 이메일 주소입니다.';
      } else if (errorMsg.includes('invalid-email')) {
        friendly = '올바른 이메일 주소 형식이 아닙니다.';
      }
      setError(friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        {/* Header Tabs */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-white tracking-tight">
            {mode === 'login' ? '호스트 및 관리자 로그인' : mode === 'signup' ? '새 계정 생성' : '비밀번호 재설정'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'login'
              ? '온라인 클라우드 저장 및 어드민 관리 권한 계정'
              : mode === 'signup'
              ? '이메일 인증을 통해 안전하게 계정을 생성합니다'
              : '가입하신 이메일로 재설정 링크를 보내드립니다'}
          </p>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {info && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{info}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">이메일 주소</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
              required
            />
          </div>

          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">비밀번호</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    비밀번호를 잊으셨나요?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
                required
              />
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">비밀번호 확인</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>처리 중...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>로그인하기</span>
              </>
            ) : mode === 'signup' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>가입하고 인증메일 받기</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>재설정 메일 발송</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="pt-2 border-t border-white/10 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              아직 계정이 없으신가요?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setInfo(null);
                }}
                className="text-indigo-400 font-bold hover:underline"
              >
                회원가입하기
              </button>
            </p>
          ) : (
            <p>
              이미 계정이 있으신가요?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setInfo(null);
                }}
                className="text-indigo-400 font-bold hover:underline"
              >
                로그인 화면으로
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
