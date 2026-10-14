import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Header } from '@/components/common/Header';

export const metadata: Metadata = {
  title: 'IGOTQ - 초간결성 휘발성 백채널 Q&A',
  description: '질문이 생겼을 땐? IGOTQ! 세미나, 컨퍼런스, 교실 수업을 위한 초간결 실시간 Q&A 백채널 웹앱',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col bg-[#0b0f19] text-[#f9fafb]">
        <AuthProvider>
          <Header />
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
