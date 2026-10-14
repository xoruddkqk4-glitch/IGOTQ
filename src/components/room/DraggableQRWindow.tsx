'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { QrCode, Copy, Check, X, GripHorizontal, Download, Smartphone } from 'lucide-react';

interface DraggableQRWindowProps {
  isOpen: boolean;
  onClose: () => void;
  roomTitle: string;
  slug: string;
}

export const DraggableQRWindow: React.FC<DraggableQRWindowProps> = ({
  isOpen,
  onClose,
  roomTitle,
  slug,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [roomUrl, setRoomUrl] = useState('');
  const [displayHost, setDisplayHost] = useState('igotq.com');

  // Position state (null indicates initial calculation needed)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  // Generate large QR code
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/${slug}`;
      setRoomUrl(url);
      setDisplayHost(window.location.host);

      QRCode.toDataURL(url, {
        width: 360,
        margin: 2,
        color: {
          dark: '#111111',
          light: '#ffffff',
        },
      })
        .then((dataUrl) => setQrDataUrl(dataUrl))
        .catch((err) => console.error('Failed to generate large QR:', err));
    }
  }, [slug]);

  // Set default initial position (top-right area with safe margin)
  useEffect(() => {
    if (isOpen && position === null && typeof window !== 'undefined') {
      const winWidth = window.innerWidth;
      const cardWidth = Math.min(380, winWidth - 32);
      const initialX = Math.max(16, winWidth - cardWidth - 32);
      const initialY = 76; // Just below the top presentation bar
      setPosition({ x: initialX, y: initialY });
    }
  }, [isOpen, position]);

  // Dragging logic
  const handleDragStart = (clientX: number, clientY: number) => {
    if (!position) return;
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      startX: position.x,
      startY: position.y,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag when clicking the header area (excluding buttons)
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const touch = e.touches[0];
    if (touch) {
      handleDragStart(touch.clientX, touch.clientY);
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !dragStartRef.current) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;

      const cardWidth = windowRef.current?.offsetWidth || 380;
      const cardHeight = windowRef.current?.offsetHeight || 500;
      const maxX = Math.max(0, window.innerWidth - cardWidth - 8);
      const maxY = Math.max(0, window.innerHeight - cardHeight - 8);

      const nextX = Math.min(maxX, Math.max(8, dragStartRef.current.startX + dx));
      const nextY = Math.min(maxY, Math.max(8, dragStartRef.current.startY + dy));

      setPosition({ x: nextX, y: nextY });
    },
    [isDragging]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !dragStartRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;

      const dx = touch.clientX - dragStartRef.current.mouseX;
      const dy = touch.clientY - dragStartRef.current.mouseY;

      const cardWidth = windowRef.current?.offsetWidth || 380;
      const cardHeight = windowRef.current?.offsetHeight || 500;
      const maxX = Math.max(0, window.innerWidth - cardWidth - 8);
      const maxY = Math.max(0, window.innerHeight - cardHeight - 8);

      const nextX = Math.min(maxX, Math.max(8, dragStartRef.current.startX + dx));
      const nextY = Math.min(maxY, Math.max(8, dragStartRef.current.startY + dy));

      setPosition({ x: nextX, y: nextY });
    },
    [isDragging]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleDragEnd]);

  if (!isOpen) return null;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (roomUrl) {
      navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `igotq-${slug}-qrcode.png`;
    a.click();
  };

  return (
    <div
      ref={windowRef}
      style={{
        position: 'fixed',
        left: position ? `${position.x}px` : 'auto',
        top: position ? `${position.y}px` : '76px',
        right: position ? 'auto' : '24px',
        zIndex: 80,
      }}
      className={`w-[90vw] max-w-[380px] sm:max-w-[400px] bg-white/98 backdrop-blur-xl rounded-[28px] border-2 border-[#0066cc]/25 shadow-[0_24px_64px_rgba(0,0,0,0.28)] overflow-hidden transition-shadow select-none animate-fade-in ${
        isDragging ? 'shadow-[0_32px_80px_rgba(0,0,0,0.36)] scale-[1.01]' : ''
      }`}
    >
      {/* 1. Draggable Header Bar */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="px-4 py-3 bg-gradient-to-r from-[#0066cc] to-[#0055b3] text-white flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-white/10"
        title="마우스로 드래그하여 원하는 위치로 이동하세요"
      >
        <div className="flex items-center gap-2 min-w-0">
          <GripHorizontal className="w-4 h-4 text-white/70 flex-shrink-0 animate-pulse" />
          <div className="flex items-center gap-1.5 min-w-0">
            <QrCode className="w-4 h-4 flex-shrink-0" />
            <span className="text-[13px] font-bold tracking-tight truncate">
              실시간 참여 QR 코드
            </span>
          </div>
          <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-medium text-white/90 whitespace-nowrap">
            드래그 이동 가능
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors ml-2 flex-shrink-0"
          title="닫기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Main Content Body */}
      <div className="p-5 text-center space-y-4">
        {/* Room Title */}
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-bold text-[#1d1d1f] tracking-tight truncate px-2" title={roomTitle}>
            {roomTitle}
          </h2>
          <div className="inline-flex items-center gap-1.5 text-xs text-[#0066cc] font-semibold bg-[#0066cc]/10 px-3 py-1 rounded-full">
            <Smartphone className="w-3.5 h-3.5" />
            <span>스마트폰 카메라로 스캔하여 즉시 입장</span>
          </div>
        </div>

        {/* Extra Large Scannable QR Container (교실/강당 뒤편 가시성 극대화) */}
        <div className="p-4 bg-[#f8fafc] rounded-[24px] border border-black/10 flex flex-col items-center justify-center shadow-inner relative group">
          {qrDataUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={qrDataUrl}
              alt="Join QR Code"
              className="w-60 h-60 sm:w-68 sm:h-68 rounded-2xl bg-white p-2.5 shadow-md border border-black/5"
            />
          ) : (
            <div className="w-60 h-60 sm:w-68 sm:h-68 flex items-center justify-center text-xs text-[#86868b]">
              대형 QR 생성 중...
            </div>
          )}
          <span className="text-[11px] text-[#64748b] mt-2 font-medium">
            먼 거리에서도 고화질 스캔이 지원됩니다
          </span>
        </div>

        {/* Large Prominent URL Display Box */}
        <div className="bg-[#f0f4f8] rounded-[18px] p-3 border border-[#d0dbe5] text-left space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#64748b] font-medium">
            <span>직접 주소창 입력</span>
            <span className="text-[10px] text-[#0066cc] font-semibold">참여 코드: {slug}</span>
          </div>
          <div
            className="font-mono text-lg sm:text-xl font-extrabold text-[#1d1d1f] tracking-tight truncate select-all"
            title={roomUrl}
          >
            <span className="text-[#86868b] font-normal">{displayHost}/</span>
            <span className="text-[#0066cc] font-black">{slug}</span>
          </div>
        </div>

        {/* Actions Button Group */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-2.5 px-3 rounded-full bg-[#0066cc] hover:bg-[#0055b3] text-white text-xs sm:text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '주소 복사됨!' : '주소 복사하기'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="py-2.5 px-3.5 rounded-full bg-white hover:bg-[#f1f5f9] border border-black/15 text-[#475569] hover:text-[#1e293b] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="QR 이미지 고화질 PNG 다운로드"
          >
            <Download className="w-4 h-4 text-[#64748b]" />
            <span className="hidden sm:inline">저장</span>
          </button>
        </div>
      </div>
    </div>
  );
};
