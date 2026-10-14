'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, Download, ExternalLink, QrCode } from 'lucide-react';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomTitle: string;
  slug: string;
}

export const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, roomTitle, slug }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [roomUrl, setRoomUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/${slug}`;
      setRoomUrl(url);

      QRCode.toDataURL(url, {
        width: 360,
        margin: 2,
        color: {
          dark: '#1d1d1f',
          light: '#ffffff',
        },
      })
        .then((dataUrl) => setQrDataUrl(dataUrl))
        .catch((err) => console.error('Failed to generate QR:', err));
    }
  }, [slug]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (roomUrl) {
      navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `igotq-${slug}-qrcode.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-[28px] border border-black/10 shadow-[0_20px_50px_rgba(0,0,0,0.25)] p-6 sm:p-8 text-center space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/5 transition-colors"
          title="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0066cc]/10 text-[#0066cc] text-[12px] font-medium mb-1">
            <QrCode className="w-3.5 h-3.5" />
            <span>실시간 Q&A 접속 QR 코드</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#1d1d1f] tracking-tight truncate px-6">
            {roomTitle}
          </h2>
          <p className="text-[13px] text-[#86868b]">
            스마트폰 카메라로 스캔하여 즉시 질문에 참여하세요
          </p>
        </div>

        {/* QR Code Container */}
        <div className="p-4 sm:p-5 bg-[#f5f5f7] rounded-[22px] border border-black/5 flex items-center justify-center">
          {qrDataUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={qrDataUrl}
              alt="Room QR Code"
              className="w-56 h-56 sm:w-64 sm:h-64 rounded-xl shadow-sm bg-white p-2"
            />
          ) : (
            <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center text-[#86868b] text-[13px]">
              QR 코드 생성 중...
            </div>
          )}
        </div>

        {/* Room URL Pill */}
        <div className="flex items-center justify-between gap-2 p-2.5 px-4 rounded-full bg-[#f5f5f7] border border-black/5 text-[14px]">
          <span className="font-mono text-[#1d1d1f] truncate font-medium">{roomUrl}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-black/5 text-[#0066cc] text-[12px] font-medium shadow-sm transition-all flex-shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#34c759]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '복사됨' : '복사'}</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-black/15 hover:bg-[#f5f5f7] text-[#1d1d1f] text-[13px] font-medium transition-all"
          >
            <Download className="w-4 h-4 text-[#86868b]" />
            <span>QR 이미지 저장</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#0066cc] hover:bg-[#0077ed] text-white text-[13px] font-medium transition-all"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
