'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, Copy, Check, Maximize2, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { QRModal } from './QRModal';

interface FloatingQRWidgetProps {
  roomTitle: string;
  slug: string;
}

export const FloatingQRWidget: React.FC<FloatingQRWidgetProps> = ({ roomTitle, slug }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [showFullModal, setShowFullModal] = useState(false);
  const [roomUrl, setRoomUrl] = useState('');
  const [displayHost, setDisplayHost] = useState('igotq.com');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/${slug}`;
      setRoomUrl(url);
      setDisplayHost(window.location.host);

      QRCode.toDataURL(url, {
        width: 200,
        margin: 1,
        color: {
          dark: '#1d1d1f',
          light: '#ffffff',
        },
      })
        .then((dataUrl) => setQrDataUrl(dataUrl))
        .catch((err) => console.error('Failed to generate floating QR:', err));
    }
  }, [slug]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (roomUrl) {
      navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="fixed right-4 sm:right-6 bottom-24 sm:bottom-28 z-40 select-none animate-fade-in">
        {minimized ? (
          // Minimized Floating Pill
          <div
            onClick={() => setMinimized(false)}
            className="flex items-center gap-2 p-2 sm:px-4 sm:py-2.5 bg-white/95 backdrop-blur-md rounded-full border border-black/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.18)] cursor-pointer transition-all hover:scale-105 active:scale-95 text-[#1d1d1f]"
            title="QR 코드 및 접속 주소 펼치기"
          >
            <div className="w-6 h-6 rounded-full bg-[#0066cc]/10 flex items-center justify-center text-[#0066cc]">
              <QrCode className="w-3.5 h-3.5" />
            </div>
            <span className="font-mono text-[13px] font-bold text-[#1d1d1f]">
              <span className="text-[#86868b] font-normal">{displayHost}/</span>
              <span className="text-[#0066cc] font-extrabold">{slug}</span>
            </span>
            <ChevronUp className="w-4 h-4 text-[#86868b]" />
          </div>
        ) : (
          // Expanded Floating Card (Always Floating with Large Link & QR)
          <div className="relative bg-white/95 backdrop-blur-md rounded-[24px] border border-black/10 shadow-[0_16px_48px_rgba(0,0,0,0.16)] p-4 text-center space-y-3 w-[240px] sm:w-[260px] transition-all hover:shadow-[0_20px_56px_rgba(0,0,0,0.2)]">
            {/* Top Bar: Title & Controls */}
            <div className="flex items-center justify-between gap-1 text-[11px] text-[#86868b] border-b border-black/5 pb-2">
              <span className="font-medium text-[#1d1d1f] flex items-center gap-1.5 truncate max-w-[140px]" title={roomTitle}>
                <QrCode className="w-3.5 h-3.5 text-[#0066cc] flex-shrink-0" />
                <span className="truncate font-semibold">{roomTitle}</span>
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setShowFullModal(true)}
                  className="p-1 rounded hover:bg-black/5 text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                  title="크게 보기(대형 발표자 모드)"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setMinimized(true)}
                  className="p-1 rounded hover:bg-black/5 text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                  title="접기"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scannable QR Code */}
            <div
              onClick={() => setShowFullModal(true)}
              className="bg-[#f5f5f7] p-2.5 rounded-[18px] border border-black/[0.04] cursor-pointer group relative flex flex-col items-center justify-center transition-transform hover:scale-[1.02]"
              title="클릭하여 대형 화면으로 확대"
            >
              {qrDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={qrDataUrl}
                  alt="Room QR Code"
                  className="w-32 h-32 sm:w-36 sm:h-36 rounded-xl bg-white p-1.5 shadow-sm"
                />
              ) : (
                <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center text-[11px] text-[#86868b]">
                  QR 생성 중...
                </div>
              )}
              <span className="text-[11px] text-[#86868b] mt-1.5 font-medium group-hover:text-[#0066cc] transition-colors">
                카메라로 QR 스캔
              </span>
              <div className="absolute inset-0 bg-black/40 rounded-[18px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[12px] font-medium backdrop-blur-[1px]">
                대형 화면 확대
              </div>
            </div>

            {/* Prominent Large Link Address Box (주소 직접 접속용) */}
            <div className="bg-[#f5f5f7] rounded-[16px] p-2.5 sm:p-3 border border-black/[0.08] text-left space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#86868b] font-medium">
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-[#0066cc]" />
                  <span>접속 주소</span>
                </span>
                <span className="text-[10px] text-[#86868b]">주소창에 입력</span>
              </div>
              <div
                className="font-mono text-[16px] sm:text-[18px] font-bold text-[#1d1d1f] tracking-tight truncate select-all leading-tight"
                title={roomUrl}
              >
                <span className="text-[#86868b] font-normal">{displayHost}/</span>
                <span className="text-[#0066cc] font-extrabold">{slug}</span>
              </div>
            </div>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-2 px-3 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white text-[12px] sm:text-[13px] font-medium flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] shadow-sm cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '주소 복사 완료!' : '주소 복사하기'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Full Presentation Modal */}
      <QRModal
        isOpen={showFullModal}
        onClose={() => setShowFullModal(false)}
        roomTitle={roomTitle}
        slug={slug}
      />
    </>
  );
};
