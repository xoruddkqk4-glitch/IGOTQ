'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, ExternalLink, FileText, Image as ImageIcon, File } from 'lucide-react';
import { NoticeAttachment } from '@/types/room';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: NoticeAttachment | null;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  attachment,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Convert base64 dataUrl to Blob URL for clean browser sandboxing & mobile performance
  useEffect(() => {
    if (!attachment?.dataUrl) {
      setBlobUrl(null);
      return;
    }

    try {
      const arr = attachment.dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || attachment.type || 'application/octet-stream';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (e) {
      console.error('Blob URL creation error:', e);
      setBlobUrl(attachment.dataUrl);
    }
  }, [attachment]);

  // Close on Escape key & disable body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !attachment) return null;

  const isImage =
    attachment.type?.startsWith('image/') ||
    /\.(jpe?g|png|gif|webp|svg|bmp)$/i.test(attachment.name);
  const isPdf =
    attachment.type === 'application/pdf' ||
    /\.pdf$/i.test(attachment.name);

  const handleOpenExternal = () => {
    const targetUrl = blobUrl || attachment.dataUrl;
    if (typeof window !== 'undefined') {
      window.open(targetUrl, '_blank');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in text-[#1d1d1f]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl sm:max-w-5xl bg-white rounded-[24px] border border-black/[0.08] shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-black/[0.06] bg-[#fbfbfd]">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-xl bg-[#0066cc]/10 text-[#0066cc] flex items-center justify-center flex-shrink-0">
              {isImage ? (
                <ImageIcon className="w-4 h-4" />
              ) : isPdf ? (
                <FileText className="w-4 h-4" />
              ) : (
                <File className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-[14px] sm:text-[15px] font-bold text-[#1d1d1f] truncate">
                {attachment.name}
              </h3>
              <p className="text-[11px] text-[#86868b]">
                {(attachment.size / 1024).toFixed(1)} KB • {isImage ? '이미지 파일' : isPdf ? 'PDF 문서' : '첨부 파일'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Open in New Tab Button */}
            <button
              type="button"
              onClick={handleOpenExternal}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-[10px] bg-[#f0f4f8] hover:bg-[#e4ebf2] text-[#445566] hover:text-[#1d1d1f] text-[12px] font-medium transition-colors"
              title="새 탭에서 전체 화면으로 열기"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">새 탭에서 열기</span>
            </button>

            {/* Direct Download Button */}
            <a
              href={blobUrl || attachment.dataUrl}
              download={attachment.name}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-[10px] bg-[#0066cc] hover:bg-[#0055b3] text-white text-[12px] font-semibold transition-all active:scale-95 shadow-xs"
              title="파일 다운로드"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">다운로드</span>
            </a>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/[0.05] hover:bg-black/[0.1] text-[#86868b] hover:text-[#1d1d1f] flex items-center justify-center transition-colors ml-1"
              title="닫기 (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Viewer Area */}
        <div className="flex-1 p-3 sm:p-5 overflow-y-auto bg-[#f8fafc] flex flex-col justify-center">
          {isImage ? (
            /* Image Preview */
            <div className="flex items-center justify-center min-h-[300px] max-h-[75vh] overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={blobUrl || attachment.dataUrl}
                alt={attachment.name}
                className="max-w-full max-h-[72vh] object-contain rounded-xl shadow-sm bg-white"
              />
            </div>
          ) : isPdf ? (
            /* PDF Preview */
            <div className="flex flex-col h-[70vh] sm:h-[75vh] w-full">
              <div className="flex-1 w-full rounded-2xl overflow-hidden border border-black/[0.08] shadow-sm bg-white">
                <iframe
                  src={`${blobUrl || attachment.dataUrl}#toolbar=1`}
                  className="w-full h-full border-0 rounded-2xl"
                  title={attachment.name}
                />
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#667788] px-1 flex-wrap gap-2">
                <span>
                  💡 모바일 브라우저 환경에 따라 인라인 미리보기가 제한될 경우 <strong>[새 탭에서 열기]</strong>를 눌러 바로 확인하실 수 있습니다.
                </span>
                <button
                  type="button"
                  onClick={handleOpenExternal}
                  className="text-[#0066cc] font-semibold hover:underline flex-shrink-0"
                >
                  새 탭에서 전체 화면으로 보기 ↗
                </button>
              </div>
            </div>
          ) : (
            /* Unsupported File Type Fallback */
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#f0f4f8] flex items-center justify-center text-[#86868b] mx-auto">
                <File className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-[#1d1d1f]">미리보기가 지원되지 않는 파일 형식입니다</h4>
                <p className="text-sm text-[#86868b]">
                  {attachment.name} 파일은 다운로드 후 전용 뷰어 프로그램으로 확인하실 수 있습니다.
                </p>
              </div>
              <div className="pt-2">
                <a
                  href={blobUrl || attachment.dataUrl}
                  download={attachment.name}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0066cc] text-white text-[13px] font-semibold hover:bg-[#0055b3] transition-all shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>파일 다운로드</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
