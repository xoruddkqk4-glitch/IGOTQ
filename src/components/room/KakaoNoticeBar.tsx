'use client';

import React, { useState } from 'react';
import {
  Megaphone,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Edit3,
  Paperclip,
  Download,
  FileText,
  Eye,
} from 'lucide-react';
import { FilterTab, SortOption, QAFilterCounts } from './QAFilterBar';
import { NoticeAttachment } from '@/types/room';
import { FilePreviewModal } from './FilePreviewModal';

interface KakaoNoticeBarProps {
  roomTitle: string;
  slug: string;
  notice?: string | null;
  attachment?: NoticeAttachment | null;
  isHost?: boolean;
  onOpenEditNotice?: () => void;
  currentTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  counts: QAFilterCounts;
}

export const KakaoNoticeBar: React.FC<KakaoNoticeBarProps> = ({
  roomTitle,
  slug,
  notice,
  attachment,
  isHost,
  onOpenEditNotice,
  currentTab,
  onTabChange,
  currentSort,
  onSortChange,
  counts,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const isViewable =
    Boolean(attachment) &&
    (Boolean(attachment?.type?.startsWith('image/')) ||
      Boolean(attachment?.type === 'application/pdf') ||
      /\.(jpe?g|png|gif|webp|svg|bmp|pdf)$/i.test(attachment?.name || ''));

  return (
    <>
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-black/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {/* 1. Kakao Notice Pinned Bar */}
        <div className="px-4 py-2 flex items-center justify-between gap-2.5 border-b border-black/[0.04] bg-[#fbfbfd]">
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-5 h-5 rounded-full bg-[#0066cc]/10 flex items-center justify-center flex-shrink-0 text-[#0066cc]">
              <Megaphone className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0 text-[13px]">
              <span className="font-bold text-[#0066cc] flex-shrink-0">[공지]</span>
              <span className="text-[#1d1d1f] font-medium truncate">
                {notice ? notice : `${roomTitle} 실시간 Q&A 세션`}
              </span>
              {attachment && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isViewable) {
                      setShowPreview(true);
                    } else {
                      const a = document.createElement('a');
                      a.href = attachment.dataUrl;
                      a.download = attachment.name;
                      a.click();
                    }
                  }}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[5px] bg-[#0066cc]/10 text-[#0066cc] text-[10px] font-semibold flex-shrink-0 hover:bg-[#0066cc]/20 transition-colors"
                  title={isViewable ? '클릭하여 파일 바로보기' : '클릭하여 다운로드'}
                >
                  <Paperclip className="w-2.5 h-2.5" />
                  <span className="hidden sm:inline">{isViewable ? '파일 바로보기' : '첨부파일'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {attachment && (
              <div className="flex items-center gap-1">
                {isViewable && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPreview(true);
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[11px] font-semibold text-[#0066cc] bg-[#0066cc]/10 hover:bg-[#0066cc]/20 transition-colors"
                    title={`${attachment.name} 바로보기`}
                  >
                    <Eye className="w-3 h-3" />
                    <span className="hidden sm:inline">바로보기</span>
                  </button>
                )}

                <a
                  href={attachment.dataUrl}
                  download={attachment.name}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[11px] font-medium text-[#556677] hover:text-[#1d1d1f] bg-black/[0.05] hover:bg-black/[0.1] transition-colors"
                  title={`${attachment.name} 다운로드`}
                >
                  <Download className="w-3 h-3" />
                  <span className="hidden sm:inline">다운로드</span>
                </a>
              </div>
            )}

            {isHost && onOpenEditNotice && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditNotice();
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[11px] font-semibold text-[#0066cc] bg-[#0066cc]/10 hover:bg-[#0066cc]/20 transition-colors"
                title="공지사항 수정"
              >
                <Edit3 className="w-3 h-3" />
                <span>공지 수정</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-full text-[#86868b] hover:text-[#1d1d1f] transition-transform"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Notice Drawer */}
        {isExpanded && (
          <div className="px-4 py-3 bg-white border-b border-black/[0.06] text-[12px] text-[#556677] leading-relaxed animate-fade-in space-y-2.5">
            {notice && (
              <div className="p-2.5 rounded-[8px] bg-[#f0f7ff] border border-[#0066cc]/15 text-[#004499] font-medium text-[13px] whitespace-pre-wrap">
                {notice}
              </div>
            )}

            {/* Shared Attachment Card with Direct View & Download */}
            {attachment && (
              <div
                onClick={() => {
                  if (isViewable) setShowPreview(true);
                }}
                className={`flex items-center justify-between p-2.5 rounded-[12px] bg-[#f5f9ff] border border-[#0066cc]/20 ${
                  isViewable ? 'cursor-pointer hover:bg-[#ebf4ff] hover:border-[#0066cc]/40' : ''
                } transition-all`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="w-9 h-9 rounded-xl bg-[#0066cc]/10 flex items-center justify-center flex-shrink-0 text-[#0066cc]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-[#1d1d1f] truncate flex items-center gap-1.5">
                      <span>{attachment.name}</span>
                      {isViewable && (
                        <span className="text-[10px] text-[#0066cc] font-semibold bg-[#0066cc]/10 px-1.5 py-0.2 rounded-full hidden sm:inline">
                          클릭 시 바로보기
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-[#86868b]">
                      {(attachment.size / 1024).toFixed(1)} KB • 공유 첨부자료
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-1.5 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isViewable && (
                    <button
                      type="button"
                      onClick={() => setShowPreview(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#0066cc] hover:bg-[#0055b3] text-white text-[11px] font-semibold shadow-xs transition-all active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>바로보기</span>
                    </button>
                  )}
                  <a
                    href={attachment.dataUrl}
                    download={attachment.name}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] bg-white hover:bg-slate-100 border border-black/10 text-[#445566] text-[11px] font-medium transition-all active:scale-95"
                  >
                    <Download className="w-3 h-3" />
                    <span>다운로드</span>
                  </a>
                </div>
              </div>
            )}

            <div className="space-y-1 text-[#667788]">
              <p>
                • 질문은 <strong>[Q&A 질문]</strong> 모드로 작성하시면 발표자가 실시간으로 확인하고 공식 답변을 등록합니다.
              </p>
              <p>
                • 일반 세미나 의견이나 리액션은 <strong>[일반 의견]</strong> 모드로 소통하실 수 있습니다.
              </p>
              <p className="font-mono text-[#0066cc]">
                • 접속 링크: igotq.com/{slug}
              </p>
            </div>

            {isHost && onOpenEditNotice && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onOpenEditNotice}
                  className="w-full py-1.5 rounded-[8px] border border-[#0066cc]/30 bg-[#0066cc]/5 hover:bg-[#0066cc]/10 text-[#0066cc] text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>공지사항 내용 / 첨부파일 수정하기</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. Filter & Sort Strip */}
        <div className="px-3.5 py-2 flex items-center justify-between gap-2 flex-wrap bg-white/70">
          {/* Kakao-style Filter Pills */}
          <div className="flex items-center gap-1 p-0.5 bg-[#eef1f4] rounded-full overflow-x-auto">
            <button
              onClick={() => onTabChange('all')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[12px] font-medium transition-all shrink-0 ${
                currentTab === 'all'
                  ? 'bg-white text-black shadow-xs font-semibold'
                  : 'text-[#667788] hover:text-black'
              }`}
            >
              <span>전체</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/5 font-mono">
                {counts.all}
              </span>
            </button>

            <button
              onClick={() => onTabChange('opinion')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[12px] font-medium transition-all shrink-0 ${
                currentTab === 'opinion'
                  ? 'bg-white text-black shadow-xs font-semibold'
                  : 'text-[#667788] hover:text-black'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#0066cc]"></span>
              <span>의견</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#0066cc]/10 text-[#0066cc] font-mono">
                {counts.opinion}
              </span>
            </button>

            <button
              onClick={() => onTabChange('pending')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-medium transition-all ${
                currentTab === 'pending'
                  ? 'bg-white text-black shadow-xs font-semibold'
                  : 'text-[#667788] hover:text-black'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30]"></span>
              <span>미답변</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#ff3b30]/10 text-[#d70015] font-mono">
                {counts.pending}
              </span>
            </button>

            <button
              onClick={() => onTabChange('answered')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-medium transition-all ${
                currentTab === 'answered'
                  ? 'bg-white text-black shadow-xs font-semibold'
                  : 'text-[#667788] hover:text-black'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#34c759]"></span>
              <span>답변완료</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#34c759]/10 text-[#1e7e34] font-mono">
                {counts.answered}
              </span>
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#86868b]" />
            <select
              value={currentSort}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent text-[12px] text-[#333333] font-medium focus:outline-none cursor-pointer py-1 pr-1"
            >
              <option value="chronological">시간순 (최신글 아래)</option>
              <option value="reverse">최신순 (최신글 위)</option>
              <option value="pendingFirst">미답변 우선</option>
            </select>
          </div>
        </div>
      </div>

      {/* Direct Inline File Preview Modal */}
      <FilePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        attachment={attachment || null}
      />
    </>
  );
};
