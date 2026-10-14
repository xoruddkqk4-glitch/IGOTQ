'use client';

import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Copy,
  Check,
  Maximize,
  Minimize,
  MessageSquare,
  Users,
  Megaphone,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ShieldCheck,
  RotateCcw,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Paperclip,
  Download,
  Eye,
} from 'lucide-react';
import { RoomInfo, NoticeAttachment } from '@/types/room';
import { ThreadedMessage } from '@/types/message';
import { FilePreviewModal } from './FilePreviewModal';

interface ProjectorViewProps {
  room: RoomInfo;
  messages: ThreadedMessage[];
  notice?: string | null;
  attachment?: NoticeAttachment | null;
  isHost: boolean;
  participantCount: number;
  onExitProjector: () => void;
  onToggleStatus: (messageId: string, status: 'pending' | 'answered') => void;
  onDeleteMessage: (messageId: string) => void;
}

export const ProjectorView: React.FC<ProjectorViewProps> = ({
  room,
  messages,
  notice,
  attachment,
  isHost,
  participantCount,
  onExitProjector,
  onToggleStatus,
  onDeleteMessage,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'answered'>('all');
  const [roomUrl, setRoomUrl] = useState('');
  const [displayHost, setDisplayHost] = useState('igotq.com');
  const [isQrCollapsed, setIsQrCollapsed] = useState(false);
  const [spotlightId, setSpotlightId] = useState<string | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [isBigPendingMode, setIsBigPendingMode] = useState(false);

  const isViewable =
    Boolean(attachment) &&
    (Boolean(attachment?.type?.startsWith('image/')) ||
      Boolean(attachment?.type === 'application/pdf') ||
      /\.(jpe?g|png|gif|webp|svg|bmp|pdf)$/i.test(attachment?.name || ''));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/${room.slug}`;
      setRoomUrl(url);
      setDisplayHost(window.location.host);

      QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((dataUrl) => setQrDataUrl(dataUrl))
        .catch((err) => console.warn('Projector QR error:', err));
    }
  }, [room.slug]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleCopyUrl = () => {
    if (roomUrl) {
      navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExit = () => {
    if (typeof window !== 'undefined' && window.opener) {
      window.close();
    } else {
      onExitProjector();
    }
  };

  // Only display questions on projector screen
  const questionMessages = messages.filter((m) => m.isQuestion);
  const pendingQuestions = questionMessages.filter((m) => m.status === 'pending');
  const answeredQuestions = questionMessages.filter((m) => m.status === 'answered');

  const displayedList =
    filter === 'pending'
      ? pendingQuestions
      : filter === 'answered'
      ? answeredQuestions
      : questionMessages;

  // Spotlight active question
  const spotlightQuestion = questionMessages.find((q) => q.id === spotlightId) || null;
  const spotlightIndex = displayedList.findIndex((q) => q.id === spotlightId);

  const handleNextSpotlight = useCallback(() => {
    if (displayedList.length === 0) return;
    const nextIdx = (spotlightIndex + 1) % displayedList.length;
    setSpotlightId(displayedList[nextIdx].id);
  }, [displayedList, spotlightIndex]);

  const handlePrevSpotlight = useCallback(() => {
    if (displayedList.length === 0) return;
    const prevIdx = (spotlightIndex - 1 + displayedList.length) % displayedList.length;
    setSpotlightId(displayedList[prevIdx].id);
  }, [displayedList, spotlightIndex]);

  // Keyboard navigation for Spotlight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (spotlightId) {
        if (e.key === 'Escape') {
          setSpotlightId(null);
        } else if (e.key === 'ArrowRight') {
          handleNextSpotlight();
        } else if (e.key === 'ArrowLeft') {
          handlePrevSpotlight();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spotlightId, handleNextSpotlight, handlePrevSpotlight]);

  return (
    <div className="fixed inset-0 z-[60] bg-[#BACEE0] text-[#1d1d1f] flex flex-col font-sans selection:bg-[#FEE500] selection:text-black overflow-y-auto">
      {/* 1. Top Presentation Bar (Kakao Theme Header) */}
      <header className="px-6 py-3.5 bg-white/90 backdrop-blur-md border-b border-[#a2b8cc]/60 shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={handleExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f0f4f8] hover:bg-[#e4ebf2] text-[#445566] hover:text-[#1d1d1f] text-[13px] font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>대화창으로 돌아가기</span>
          </button>

          <div className="h-4 w-px bg-black/[0.1] hidden sm:block"></div>

          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34c759] animate-pulse flex-shrink-0"></span>
            <h1 className="text-base sm:text-lg font-bold text-[#1d1d1f] truncate">
              {room.title}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#0066cc]/10 text-[#0066cc] text-xs font-bold whitespace-nowrap">
              질문 카드 뷰
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f0f4f8] text-[#556677] text-xs font-medium">
            <Users className="w-3.5 h-3.5 text-[#0066cc]" />
            <span>참여자 {participantCount}명</span>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0066cc] hover:bg-[#0055b3] text-white text-xs font-semibold transition-all active:scale-95 shadow-sm"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? '창 모드' : '전체 화면'}</span>
          </button>
        </div>
      </header>

      {/* 2. Top Auditorium Join Banner (Collapsible QR + Large Link - Matching Host Style) */}
      <div className="px-4 sm:px-6 pt-4 max-w-7xl mx-auto w-full">
        <div className="bg-white/95 backdrop-blur-md rounded-[24px] border border-black/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-5 sm:p-7 relative overflow-hidden transition-all duration-300">
          {!isQrCollapsed ? (
            /* Expanded Full QR Banner */
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
                <div className="p-3 bg-[#f8fafc] border border-black/[0.06] rounded-2xl shadow-sm flex-shrink-0">
                  {qrDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrDataUrl}
                      alt="Audience QR Code"
                      className="w-32 h-32 sm:w-40 sm:h-40 rounded-lg block"
                    />
                  ) : (
                    <div className="w-32 h-32 sm:w-40 sm:h-40 bg-slate-200 animate-pulse rounded-lg" />
                  )}
                </div>

                <div className="space-y-2.5 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEE500] border border-[#e5ce00] text-[#191919] text-xs font-bold shadow-xs">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>스마트폰 카메라로 스캔하여 참여</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#1d1d1f] tracking-tight">
                    지금 바로 Q&amp;A에 질문하세요!
                  </h2>
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <span className="text-[#667788] text-sm font-medium">접속 주소:</span>
                    <span className="text-xl sm:text-2xl font-mono font-extrabold text-[#0066cc] bg-[#f0f4f8] px-3.5 py-1.5 rounded-xl border border-[#d0dbe5]">
                      {displayHost}/{room.slug}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="p-2 rounded-xl bg-[#f0f4f8] hover:bg-[#e4ebf2] border border-[#d0dbe5] text-[#556677] hover:text-[#1d1d1f] transition-colors"
                      title="접속 링크 복사"
                    >
                      {copied ? <Check className="w-4 h-4 text-[#34c759]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Notice & Summary Statistics */}
              <div className="w-full md:w-auto flex flex-col gap-3 min-w-[280px]">
                {notice && (
                  <div className="p-3.5 rounded-xl bg-[#FFFBE6] border border-[#f5da00] text-[#5c4300] text-sm flex items-start gap-2.5">
                    <Megaphone className="w-4 h-4 text-[#e5a000] flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#8a6500] uppercase tracking-wider mb-0.5">
                        공지사항
                      </div>
                      <div className="leading-snug break-words whitespace-pre-wrap font-medium">{notice}</div>
                      {attachment && (
                        <div className="mt-2.5 pt-2 border-t border-[#f5da00]/60 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (isViewable) setShowFilePreview(true);
                              else {
                                const a = document.createElement('a');
                                a.href = attachment.dataUrl;
                                a.download = attachment.name;
                                a.click();
                              }
                            }}
                            className="flex items-center gap-1 text-[11px] font-medium text-[#7a5900] hover:text-[#1d1d1f] hover:underline truncate cursor-pointer text-left"
                            title={isViewable ? '클릭 시 바로보기' : '다운로드'}
                          >
                            <Paperclip className="w-3 h-3 flex-shrink-0 text-[#a37900]" />
                            <span className="truncate">{attachment.name}</span>
                          </button>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            {isViewable && (
                              <button
                                type="button"
                                onClick={() => setShowFilePreview(true)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f5da00] text-[#191919] text-[10px] font-bold hover:bg-[#fae100] transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                <span>바로보기</span>
                              </button>
                            )}
                            <a
                              href={attachment.dataUrl}
                              download={attachment.name}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/80 text-[#556677] text-[10px] font-medium hover:bg-white transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              <span>다운로드</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-black/[0.06]">
                    <div className="text-xs text-[#667788] font-medium">전체 질문</div>
                    <div className="text-xl font-extrabold text-[#1d1d1f] mt-0.5">
                      {questionMessages.length}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#fff8f8] border border-[#ff3b30]/20">
                    <div className="text-xs text-[#d70015] font-semibold">미답변</div>
                    <div className="text-xl font-extrabold text-[#d70015] mt-0.5">
                      {pendingQuestions.length}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#f0fdf4] border border-[#34c759]/20">
                    <div className="text-xs text-[#1e7e34] font-semibold">답변 완료</div>
                    <div className="text-xl font-extrabold text-[#1e7e34] mt-0.5">
                      {answeredQuestions.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapse Button */}
              <button
                type="button"
                onClick={() => setIsQrCollapsed(true)}
                className="absolute top-3.5 right-4 flex items-center gap-1 text-[11px] text-[#667788] hover:text-[#1d1d1f] px-2.5 py-1 rounded-full bg-[#f0f4f8] hover:bg-[#e4ebf2] transition-colors"
                title="질문 목록을 더 넓게 보기 위해 QR 배너를 접습니다"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                <span>QR 배너 접기</span>
              </button>
            </div>
          ) : (
            /* Collapsed Mini QR Strip */
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-[#f8fafc] border border-black/[0.06] rounded-lg shadow-xs flex-shrink-0">
                  {qrDataUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrDataUrl} alt="QR Thumbnail" className="w-8 h-8 rounded" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#667788] font-medium">접속 주소:</span>
                  <span className="text-sm font-mono font-bold text-[#0066cc] bg-[#f0f4f8] px-2.5 py-0.5 rounded-md border border-[#d0dbe5]">
                    {displayHost}/{room.slug}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="p-1 rounded bg-[#f0f4f8] hover:bg-[#e4ebf2] text-[#556677]"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#34c759]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {notice && (
                  <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#5c4300] bg-[#FFFBE6] px-3 py-1 rounded-full border border-[#f5da00] max-w-md truncate font-medium">
                    <Megaphone className="w-3 h-3 text-[#e5a000] flex-shrink-0" />
                    <span className="truncate">{notice}</span>
                  </div>
                )}

                {attachment && (
                  <button
                    type="button"
                    onClick={() => {
                      if (isViewable) setShowFilePreview(true);
                      else {
                        const a = document.createElement('a');
                        a.href = attachment.dataUrl;
                        a.download = attachment.name;
                        a.click();
                      }
                    }}
                    className="hidden md:inline-flex items-center gap-1 text-xs text-[#0066cc] bg-[#0066cc]/10 hover:bg-[#0066cc]/20 px-2.5 py-1 rounded-full font-medium transition-colors"
                  >
                    <Paperclip className="w-3 h-3" />
                    <span>{isViewable ? '자료 바로보기' : '첨부파일'}</span>
                  </button>
                )}

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#667788]">질문 {questionMessages.length}개</span>
                  <span className="text-[#a2b8cc]">•</span>
                  <span className="text-[#1e7e34] font-semibold">답변 {answeredQuestions.length}개</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsQrCollapsed(false)}
                  className="flex items-center gap-1 text-[11px] text-[#0066cc] hover:text-[#0055b3] px-3 py-1 rounded-full bg-[#0066cc]/10 hover:bg-[#0066cc]/20 transition-colors font-medium"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>대형 QR 펼치기</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Filter Bar (Kakao Pill Style & Big Pending View Toggle) */}
      <div className="px-4 sm:px-6 py-4 max-w-7xl mx-auto w-full flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 bg-white/90 backdrop-blur-md rounded-full border border-black/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <button
              type="button"
              onClick={() => {
                setFilter('all');
                setIsBigPendingMode(false);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === 'all' && !isBigPendingMode
                  ? 'bg-[#1d1d1f] text-white shadow-xs'
                  : 'text-[#667788] hover:text-[#1d1d1f]'
              }`}
            >
              전체 질문 ({questionMessages.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setFilter('pending');
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filter === 'pending' && !isBigPendingMode
                  ? 'bg-[#ff9500] text-white shadow-xs'
                  : 'text-[#667788] hover:text-[#1d1d1f]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff9500]"></span>
              <span>답변 대기 중 ({pendingQuestions.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setFilter('answered');
                setIsBigPendingMode(false);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filter === 'answered' && !isBigPendingMode
                  ? 'bg-[#34c759] text-white shadow-xs'
                  : 'text-[#667788] hover:text-[#1d1d1f]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#34c759]"></span>
              <span>답변 완료 ({answeredQuestions.length})</span>
            </button>
          </div>

          {/* New Prominent "미완료 질문 크게 보기" Button */}
          <button
            type="button"
            onClick={() => {
              const nextMode = !isBigPendingMode;
              setIsBigPendingMode(nextMode);
              if (nextMode) {
                setFilter('pending');
              }
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
              isBigPendingMode
                ? 'bg-[#FEE500] text-[#191919] border-2 border-[#e5ce00] scale-105 shadow-md ring-2 ring-[#fae100]/40'
                : 'bg-white hover:bg-[#fffdf0] text-[#7a5900] border border-[#f5da00]'
            }`}
            title="미완료(미답변) 질문을 대형 화면에 맞추어 크고 눈에 띄게 표시합니다"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#e5a000]" />
            <span>미완료 질문 크게 보기</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isBigPendingMode ? 'bg-black/15 text-black' : 'bg-[#FFFBE6] text-[#7a5900]'
              }`}
            >
              {pendingQuestions.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-[#445566] flex items-center gap-2 font-medium bg-white/60 px-3 py-1 rounded-full border border-black/[0.05]">
          <span>질문 카드를 클릭하면 <strong>[집중 조명 모드]</strong>로 확대됩니다</span>
          <span className="w-2 h-2 rounded-full bg-[#0066cc] animate-ping"></span>
        </div>
      </div>

      {/* 4. Question Cards Grid (Bright Yellow Cream & White Cards) */}
      <main className="flex-1 px-4 sm:px-6 pb-12 max-w-7xl mx-auto w-full">
        {isBigPendingMode ? (
          /* Large Unanswered Hero Cards Mode */
          pendingQuestions.length === 0 ? (
            <div className="py-20 text-center space-y-3 rounded-3xl border border-dashed border-[#a2b8cc] bg-white/80 p-8 max-w-3xl mx-auto shadow-xs my-4">
              <div className="w-14 h-14 rounded-full bg-[#e8f8ed] text-[#34c759] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#1d1d1f]">모든 현장 질문에 답변이 완료되었습니다!</h3>
              <p className="text-sm text-[#667788]">
                현재 대기 중인 미완료 질문이 없습니다. 상단에서 [미완료 질문 크게 보기]를 끄거나 [전체 질문]을 선택해 완료된 질문을 열람하세요.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto mt-2">
              <div className="flex items-center justify-between text-xs text-[#7a5900] bg-[#FFFBE6] px-4 py-2.5 rounded-xl border border-[#f5da00]">
                <span className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#ff9500]" />
                  현재 발표자가 답변해야 할 미완료 질문 {pendingQuestions.length}개를 대형 화면으로 집중 표시 중입니다.
                </span>
                <span className="hidden sm:inline text-[11px] text-[#8a6500]">카드를 클릭하면 전면 집중 조명 모드로 확대됩니다</span>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {pendingQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    onClick={() => setSpotlightId(q.id)}
                    className="rounded-[26px] p-6 sm:p-8 bg-[#FFFDF0] border-2 border-[#fae100] shadow-[0_8px_30px_rgba(250,225,0,0.22)] transition-all cursor-pointer group hover:scale-[1.01] hover:shadow-2xl flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Large Header */}
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-[#FFF5C2] border border-[#f5b800] text-[#8a6500] font-bold text-base flex items-center justify-center shadow-xs">
                            {q.nickname.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base sm:text-lg font-bold text-[#1d1d1f]">
                                {q.nickname}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-[#ff9500]/15 text-[#c25e00] text-xs font-extrabold border border-[#ff9500]/30 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>미완료 질문 #{idx + 1}</span>
                              </span>
                            </div>
                            <div className="text-xs text-[#86868b] mt-0.5">
                              {new Date(q.createdAt).toLocaleTimeString('ko-KR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })} 등록
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {isHost && (
                            <button
                              type="button"
                              onClick={() => onToggleStatus(q.id, 'answered')}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#34c759] hover:bg-[#2db24f] text-white text-xs font-bold transition-all shadow-xs active:scale-95"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>답변 완료 처리</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSpotlightId(q.id)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-black/10 text-[#0066cc] text-xs font-bold transition-all shadow-xs active:scale-95"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>전체 화면 조명</span>
                          </button>
                        </div>
                      </div>

                      {/* Extra Large Question Typography */}
                      <div className="text-xl sm:text-3xl font-extrabold text-[#1d1d1f] leading-relaxed break-words whitespace-pre-wrap py-2">
                        {q.content}
                      </div>
                    </div>

                    <div className="pt-4 mt-2 border-t border-[#fae100]/60 flex items-center justify-between text-xs text-[#8a6500]">
                      <span className="flex items-center gap-1 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-[#ff9500]" />
                        클릭 시 화면 전체 집중 조명 모드로 확대됩니다
                      </span>
                      <span className="font-bold underline">조명 확대 ↗</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : displayedList.length === 0 ? (
          <div className="py-24 text-center space-y-4 rounded-3xl border border-dashed border-[#a2b8cc] bg-white/70 backdrop-blur-sm p-8 mt-2 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#eef4fb] flex items-center justify-center text-[#0066cc] mx-auto">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#1d1d1f]">등록된 질문이 없습니다</h3>
              <p className="text-[#667788] text-sm max-w-md mx-auto">
                스마트폰 카메라로 화면 상단의 QR 코드를 스캔하여 실시간 질문을 남겨보세요!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
            {displayedList.map((q) => {
              const isAnswered = q.status === 'answered';
              const replies = q.replies || [];

              return (
                <div
                  key={q.id}
                  onClick={() => setSpotlightId(q.id)}
                  className={`rounded-[22px] p-5 border transition-all flex flex-col justify-between cursor-pointer group hover:scale-[1.01] hover:shadow-xl ${
                    isAnswered
                      ? 'bg-white border-black/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.04)]'
                      : 'bg-[#FFFDF0] border-[#fae100] shadow-[0_4px_16px_rgba(250,225,0,0.18)]'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header: Author + Time + Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#eef4fb] text-[#0066cc] font-bold text-xs flex items-center justify-center border border-[#d0e2f5]">
                          {q.nickname.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#1d1d1f]">{q.nickname}</div>
                          <div className="text-[11px] text-[#86868b]">
                            {new Date(q.createdAt).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                            isAnswered
                              ? 'bg-[#34c759]/15 text-[#1e7e34] border border-[#34c759]/25'
                              : 'bg-[#ff9500]/15 text-[#c25e00] border border-[#ff9500]/25'
                          }`}
                        >
                          {isAnswered ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>답변 완료</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5" />
                              <span>답변 대기 중</span>
                            </>
                          )}
                        </span>

                        {isHost && (
                          <div className="flex items-center gap-1 ml-1">
                            <button
                              type="button"
                              onClick={() => onToggleStatus(q.id, isAnswered ? 'pending' : 'answered')}
                              className="p-1 rounded text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/5 transition-colors"
                              title={isAnswered ? '미답변 상태로 변경' : '답변 완료로 변경'}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('이 질문을 삭제하시겠습니까?')) {
                                  onDeleteMessage(q.id);
                                }
                              }}
                              className="p-1 rounded text-[#86868b] hover:text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-colors"
                              title="삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Question Content (Large Crisp Typography) */}
                    <div className="text-base sm:text-lg font-bold text-[#1d1d1f] leading-relaxed break-words whitespace-pre-wrap pt-1">
                      {q.content}
                    </div>
                  </div>

                  {/* Speaker Official Replies in Kakao Yellow Bubble */}
                  {replies.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-black/[0.06] space-y-2">
                      {replies.map((rep) => (
                        <div
                          key={rep.id}
                          className="p-3 rounded-[16px] bg-[#FEE500] border border-[#e5ce00] text-[#191919] text-sm shadow-xs"
                        >
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#191919] mb-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#191919]" />
                            <span>{rep.nickname}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/10 text-black font-semibold">
                              발표자 공식 답변
                            </span>
                          </div>
                          <p className="text-[#191919] font-medium leading-snug whitespace-pre-wrap break-words">
                            {rep.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Spotlight Hint */}
                  <div className="pt-3 mt-2 border-t border-black/[0.04] flex items-center justify-between text-[11px] text-[#86868b] opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="flex items-center gap-1 text-[#0066cc] font-medium">
                      <Sparkles className="w-3 h-3" />
                      클릭하여 화면 중앙에 집중 조명
                    </span>
                    <span>클릭하여 확대 ↗</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 5. Spotlight Modal (특정 질문 전면 집중 조명 모드) */}
      {spotlightQuestion && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col justify-between p-6 sm:p-12 animate-fade-in"
          onClick={() => setSpotlightId(null)}
        >
          {/* Spotlight Top Bar */}
          <div
            className="flex items-center justify-between gap-4 max-w-4xl mx-auto w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 text-[#0066cc] text-xs font-bold shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>현장 질문 집중 조명</span>
              </span>
              <span className="text-xs text-white/90 font-mono font-bold bg-black/30 px-2.5 py-1 rounded-full">
                {spotlightIndex + 1} / {displayedList.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevSpotlight}
                className="p-2 rounded-full bg-white/80 hover:bg-white text-[#1d1d1f] shadow-md transition-colors"
                title="이전 질문 (단축키: ←)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextSpotlight}
                className="p-2 rounded-full bg-white/80 hover:bg-white text-[#1d1d1f] shadow-md transition-colors"
                title="다음 질문 (단축키: →)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setSpotlightId(null)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/80 hover:bg-[#ff3b30] hover:text-white text-[#1d1d1f] shadow-md transition-colors text-xs font-semibold ml-2"
                title="닫기 (단축키: ESC)"
              >
                <X className="w-4 h-4" />
                <span>닫기 (ESC)</span>
              </button>
            </div>
          </div>

          {/* Spotlight Center Huge Card */}
          <div
            className="max-w-4xl mx-auto w-full my-auto py-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-[28px] p-8 sm:p-12 shadow-2xl border border-black/10 text-[#1d1d1f] space-y-6">
              {/* Author + Status Header */}
              <div className="flex items-center justify-between gap-4 border-b border-black/[0.06] pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#eef4fb] text-[#0066cc] font-bold text-xl flex items-center justify-center border border-[#d0e2f5]">
                    {spotlightQuestion.nickname.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1d1d1f]">{spotlightQuestion.nickname}</h3>
                    <p className="text-xs text-[#86868b]">
                      {new Date(spotlightQuestion.createdAt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      등록 질문
                    </p>
                  </div>
                </div>

                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 ${
                    spotlightQuestion.status === 'answered'
                      ? 'bg-[#34c759]/15 text-[#1e7e34] border border-[#34c759]/25'
                      : 'bg-[#ff9500]/15 text-[#c25e00] border border-[#ff9500]/25'
                  }`}
                >
                  {spotlightQuestion.status === 'answered' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>답변 완료</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>답변 대기 중</span>
                    </>
                  )}
                </span>
              </div>

              {/* Massive Question Text */}
              <div className="py-2">
                <p className="text-2xl sm:text-4xl font-extrabold text-[#1d1d1f] leading-relaxed tracking-tight break-words whitespace-pre-wrap">
                  {spotlightQuestion.content}
                </p>
              </div>

              {/* Official Answers in Spotlight */}
              {spotlightQuestion.replies && spotlightQuestion.replies.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-black/[0.06]">
                  {spotlightQuestion.replies.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-5 rounded-2xl bg-[#FEE500] border border-[#e5ce00] text-[#191919] shadow-sm"
                    >
                      <div className="flex items-center gap-2 text-sm font-bold text-[#191919] mb-2">
                        <ShieldCheck className="w-4 h-4" />
                        <span>{rep.nickname}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-black/10 text-black font-semibold">
                          발표자 공식 답변
                        </span>
                      </div>
                      <p className="text-lg sm:text-xl text-[#191919] font-medium leading-relaxed whitespace-pre-wrap break-words">
                        {rep.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Spotlight Bottom Footer */}
          <div
            className="flex items-center justify-between gap-4 max-w-4xl mx-auto w-full text-xs text-white/90"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="font-medium">키보드 단축키:</span>
              <kbd className="px-2.5 py-1 rounded bg-white/20 text-white font-mono font-bold backdrop-blur-sm">
                ← 이전
              </kbd>
              <kbd className="px-2.5 py-1 rounded bg-white/20 text-white font-mono font-bold backdrop-blur-sm">
                다음 →
              </kbd>
              <kbd className="px-2.5 py-1 rounded bg-white/20 text-white font-mono font-bold backdrop-blur-sm">
                ESC 닫기
              </kbd>
            </div>

            {isHost && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onToggleStatus(
                      spotlightQuestion.id,
                      spotlightQuestion.status === 'answered' ? 'pending' : 'answered'
                    )
                  }
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#1d1d1f] hover:bg-slate-100 font-semibold shadow-md transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>
                    {spotlightQuestion.status === 'answered'
                      ? '미답변 상태로 되돌리기'
                      : '답변 완료로 처리'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Direct Inline File Preview Modal */}
      <FilePreviewModal
        isOpen={showFilePreview}
        onClose={() => setShowFilePreview(false)}
        attachment={attachment || null}
      />
    </div>
  );
};
