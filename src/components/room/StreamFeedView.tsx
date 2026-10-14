'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  Users,
  Maximize,
  Minimize,
  ArrowLeft,
  Megaphone,
  CheckCircle2,
  Clock,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Paperclip,
  Download,
  Eye,
  ArrowDownCircle,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import { RoomInfo, NoticeAttachment } from '@/types/room';
import { ThreadedMessage } from '@/types/message';
import { FilePreviewModal } from './FilePreviewModal';

interface StreamFeedViewProps {
  room: RoomInfo;
  messages: ThreadedMessage[];
  notice?: string | null;
  attachment?: NoticeAttachment | null;
  participantCount: number;
  onExit: () => void;
}

export const StreamFeedView: React.FC<StreamFeedViewProps> = ({
  room,
  messages,
  notice,
  attachment,
  participantCount,
  onExit,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [showQrBanner, setShowQrBanner] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [displayHost, setDisplayHost] = useState('igotq.com');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const feedContainerRef = useRef<HTMLDivElement>(null);

  const isViewable =
    Boolean(attachment) &&
    (Boolean(attachment?.type?.startsWith('image/')) ||
      Boolean(attachment?.type === 'application/pdf') ||
      /\.(jpe?g|png|gif|webp|svg|bmp|pdf)$/i.test(attachment?.name || ''));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/${room.slug}`;
      setDisplayHost(window.location.host);
      QRCode.toDataURL(url, {
        width: 240,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      })
        .then((dataUrl) => setQrDataUrl(dataUrl))
        .catch((err) => console.warn('QR Error:', err));
    }
  }, [room.slug]);

  // Auto-scroll when new messages arrive if autoScroll is enabled
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, autoScroll]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleCopyUrl = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/${room.slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExit = () => {
    if (typeof window !== 'undefined' && window.opener) {
      window.close();
    } else {
      onExit();
    }
  };

  // Chronological order for live feed (earliest to latest from top to bottom)
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="fixed inset-0 z-[60] bg-[#BACEE0] flex flex-col font-sans text-[#1d1d1f] selection:bg-[#FEE500] selection:text-black overflow-y-auto">
      {/* 1. Top Presentation Bar */}
      <header className="px-4 sm:px-8 py-3.5 bg-white/95 backdrop-blur-md border-b border-[#a2b8cc]/60 shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-between gap-3 sticky top-0 z-30 w-full flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={handleExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f0f4f8] hover:bg-[#e4ebf2] text-[#445566] hover:text-[#1d1d1f] text-[12px] sm:text-[13px] font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>대화창 이동</span>
          </button>

          <div className="h-4 w-px bg-black/[0.1] hidden sm:block"></div>

          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34c759] animate-pulse flex-shrink-0"></span>
            <h1 className="text-base sm:text-lg font-bold text-[#1d1d1f] truncate">
              {room.title}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#0066cc]/10 text-[#0066cc] text-xs font-bold whitespace-nowrap hidden sm:inline-block">
              백채널 뷰 (전광판)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* QR Code Toggle Button */}
          <button
            type="button"
            onClick={() => setShowQrBanner(!showQrBanner)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              showQrBanner
                ? 'bg-[#FEE500] text-[#191919] border border-[#e5ce00] shadow-xs'
                : 'bg-[#f0f4f8] hover:bg-[#e4ebf2] text-[#445566]'
            }`}
            title="청중 접속용 QR 코드 토글"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">접속 QR</span>
            {showQrBanner ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Auto-scroll Lock Toggle */}
          <button
            type="button"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              autoScroll
                ? 'bg-[#34c759]/15 text-[#1e7e34] border border-[#34c759]/30'
                : 'bg-[#ff9500]/15 text-[#c25e00] border border-[#ff9500]/30'
            }`}
            title={autoScroll ? '실시간 자동 스크롤 작동 중' : '자동 스크롤 일시 정지됨'}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{autoScroll ? '자동 스크롤 켜짐' : '스크롤 고정'}</span>
          </button>

          {/* Participant Count */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f0f4f8] text-[#556677] text-xs font-medium">
            <Users className="w-3.5 h-3.5 text-[#0066cc]" />
            <span>참여자 {participantCount}명</span>
          </div>

          {/* Fullscreen Button */}
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

      {/* 2. Collapsible Auditorium QR Banner (Optional Dropdown) */}
      {showQrBanner && (
        <div className="bg-white/95 backdrop-blur-md border-b border-[#a2b8cc]/60 shadow-[0_4px_16px_rgba(0,0,0,0.06)] px-6 py-4 animate-fade-in">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl border border-black/10 shadow-xs flex-shrink-0">
                {qrDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrDataUrl} alt="Join QR" className="w-20 h-20 rounded" />
                )}
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#0066cc] flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>스마트폰으로 스캔하여 실시간 참여</span>
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-sm sm:text-base font-mono font-bold text-[#0066cc] bg-[#f0f4f8] px-3 py-1 rounded-lg border border-[#d0dbe5]">
                    {displayHost}/{room.slug}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="p-1.5 rounded-lg bg-[#f0f4f8] hover:bg-[#e4ebf2] text-[#556677] transition-colors"
                    title="링크 복사"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#34c759]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="text-right text-xs text-[#667788] hidden sm:block">
              <p>본 화면은 대형 스크린 전용 <strong>백채널 뷰</strong>입니다.</p>
              <p className="text-[11px] text-[#86868b] mt-0.5">모든 청중의 멘트와 공식 답변이 좌측 정렬 타임라인으로 실시간 갱신됩니다.</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Top Pinned Announcement Strip */}
      {notice && (
        <div className="bg-[#FFFBE6]/95 backdrop-blur-sm border-b border-[#f5da00] px-4 sm:px-6 py-2.5 text-xs text-[#5c4300] shadow-xs">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Megaphone className="w-4 h-4 text-[#e5a000] flex-shrink-0" />
              <span className="font-bold text-[#8a6500] flex-shrink-0">[공지사항]</span>
              <span className="font-medium truncate">{notice}</span>
            </div>

            {attachment && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (isViewable) setShowFilePreview(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#f5da00] text-[#191919] font-bold text-[11px] hover:bg-[#fae100] transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  <span>자료 바로보기</span>
                </button>
                <a
                  href={attachment.dataUrl}
                  download={attachment.name}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-white/80 text-[#556677] text-[11px] hover:bg-white transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span className="hidden sm:inline">다운로드</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Public Live Feed Stream (100% Left Aligned, No Input Bar) */}
      <main
        ref={feedContainerRef}
        className="flex-1 max-w-6xl xl:max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-12 py-6 sm:py-10 flex flex-col space-y-6"
      >
        {sortedMessages.length === 0 ? (
          <div className="py-16 sm:py-24 text-center space-y-6 rounded-[32px] border-2 border-dashed border-[#8ea9c2] bg-white/95 backdrop-blur-md p-8 sm:p-14 my-auto shadow-[0_12px_40px_rgba(0,0,0,0.06)] max-w-3xl mx-auto w-full">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#eef4fb] flex items-center justify-center text-[#0066cc] mx-auto shadow-inner">
              <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1d1d1f] tracking-tight">
                아직 등록된 멘트가 없습니다
              </h3>
              <p className="text-base sm:text-lg text-[#556677] max-w-xl mx-auto font-medium">
                스마트폰 카메라로 접속하여 자유로운 의견과 실시간 질문을 남겨보세요!
              </p>
            </div>

            {/* Embedded QR invitation in empty state for immediate audience engagement */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-6 bg-[#f8fafc] p-6 rounded-2xl border border-black/[0.06]">
              {qrDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="Scan QR" className="w-32 h-32 rounded-xl border border-black/10 shadow-xs" />
              )}
              <div className="space-y-2 text-center sm:text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEE500] text-[#191919] text-xs font-bold">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>실시간 Q&A 접속 주소</span>
                </span>
                <div className="text-xl sm:text-2xl font-mono font-black text-[#0066cc] tracking-tight">
                  {displayHost}/{room.slug}
                </div>
                <p className="text-xs text-[#86868b]">별도의 회원가입이나 앱 설치 없이 즉시 참여할 수 있습니다.</p>
              </div>
            </div>
          </div>
        ) : (
          sortedMessages.map((msg) => {
            const isQuestion = msg.isQuestion;
            const isAnswered = msg.status === 'answered';
            const replies = msg.replies || [];

            return (
              <div key={msg.id} className="flex items-start gap-3.5 sm:gap-4 animate-fade-in group">
                {/* Author Avatar (High-contrast, Large for distance viewing) */}
                <div
                  className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-base sm:text-xl font-black shadow-xs border ${
                    isQuestion
                      ? 'bg-[#FFFBE6] text-[#b38600] border-[#fae100]'
                      : 'bg-white text-[#0066cc] border-black/10'
                  }`}
                >
                  {msg.nickname.slice(0, 1).toUpperCase()}
                </div>

                {/* Message Body Column */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Top Metadata Header */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-base sm:text-lg lg:text-xl font-black text-[#1d1d1f]">
                      {msg.nickname}
                    </span>

                    {/* Mode & Status Badges */}
                    {isQuestion ? (
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#FEE500] text-[#191919] text-xs sm:text-sm font-bold border border-[#e5ce00]">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>질문</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-white text-[#556677] text-xs sm:text-sm font-medium border border-black/10">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>일반 의견</span>
                      </span>
                    )}

                    {isQuestion && (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          isAnswered
                            ? 'bg-[#34c759]/15 text-[#1e7e34] border-[#34c759]/30'
                            : 'bg-[#ff9500]/15 text-[#c25e00] border-[#ff9500]/30'
                        }`}
                      >
                        {isAnswered ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>답변 완료</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>답변 대기 중</span>
                          </>
                        )}
                      </span>
                    )}

                    <span className="text-xs sm:text-sm text-[#778899]">
                      {new Date(msg.createdAt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Message Bubble (Large High-contrast typography for classrooms / auditoriums) */}
                  <div
                    className={`p-4 sm:p-6 lg:p-7 rounded-[26px] rounded-tl-sm text-[18px] sm:text-[22px] md:text-[25px] leading-relaxed break-words whitespace-pre-wrap shadow-sm transition-all ${
                      isQuestion
                        ? 'bg-[#FFFDF0] border-2 sm:border-3 border-[#fae100] text-[#111111] font-bold shadow-[0_4px_20px_rgba(250,225,0,0.18)]'
                        : 'bg-white border border-black/[0.1] text-[#111111] font-medium'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Speaker Official Replies: Indented directly under the question */}
                  {replies.length > 0 && (
                    <div className="ml-4 sm:ml-8 pl-3 sm:pl-5 border-l-4 border-[#f5b800] space-y-2.5 mt-3 pt-1">
                      {replies.map((rep) => (
                        <div
                          key={rep.id}
                          className="p-4 sm:p-5 rounded-[22px] bg-[#FEE500] border-2 border-[#e5ce00] text-[#191919] shadow-sm"
                        >
                          <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-[#191919] mb-1.5">
                            <ShieldCheck className="w-4 h-4 text-[#191919]" />
                            <span>{rep.nickname}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-black/10 text-black font-extrabold">
                              발표자 공식 답변
                            </span>
                            <span className="text-xs text-black/60 font-normal ml-auto">
                              {new Date(rep.createdAt).toLocaleTimeString('ko-KR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-[#191919] text-[16px] sm:text-[20px] font-bold leading-relaxed whitespace-pre-wrap break-words">
                            {rep.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} className="h-6" />
      </main>

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={showFilePreview}
        onClose={() => setShowFilePreview(false)}
        attachment={attachment || null}
      />
    </div>
  );
};
