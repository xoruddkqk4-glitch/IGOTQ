'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/common/Modal';
import { Megaphone, Sparkles, Trash2, Check, Paperclip, FileText, X, Eye } from 'lucide-react';
import { NoticeAttachment } from '@/types/room';
import { FilePreviewModal } from './FilePreviewModal';

interface EditNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNotice: string | null;
  currentAttachment?: NoticeAttachment | null;
  onSaveNotice: (notice: string, attachment?: NoticeAttachment | null) => void;
}

const TEMPLATES = [
  '📢 실시간 Q&A 세션이 시작되었습니다. 궁금한 점을 질문으로 남겨주세요!',
  '⏰ 10분 후 Q&A 질문 접수가 마감됩니다. 추가 질문을 등록해 주세요.',
  '☕ 15분간 중간 휴식 시간입니다. 자유롭게 질문을 남겨주시면 곧 답변드립니다.',
  '📄 첨부된 발표 자료 및 안내 문서를 확인하시고 질문을 남겨주세요.',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export const EditNoticeModal: React.FC<EditNoticeModalProps> = ({
  isOpen,
  onClose,
  currentNotice,
  currentAttachment,
  onSaveNotice,
}) => {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<NoticeAttachment | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isViewable =
    Boolean(attachment) &&
    (Boolean(attachment?.type?.startsWith('image/')) ||
      Boolean(attachment?.type === 'application/pdf') ||
      /\.(jpe?g|png|gif|webp|svg|bmp|pdf)$/i.test(attachment?.name || ''));

  useEffect(() => {
    if (isOpen) {
      setText(currentNotice || '');
      setAttachment(currentAttachment || null);
      setFileError(null);
    }
  }, [isOpen, currentNotice, currentAttachment]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setFileError('파일 크기는 최대 10MB까지 첨부할 수 있습니다.');
      return;
    }

    setFileError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAttachment({
        name: file.name,
        size: file.size,
        dataUrl,
        type: file.type || 'application/octet-stream',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    onSaveNotice(text.trim(), attachment);
    onClose();
  };

  const handleClear = () => {
    setText('');
    setAttachment(null);
    onSaveNotice('', null);
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="채팅방 상단 공지사항 관리">
      <div className="space-y-4">
        <p className="text-[13px] text-[#667788] leading-relaxed">
          방장이 등록한 공지는 모든 청중의 대화창 최상단에 <strong>실시간으로 고정</strong>되어 노출됩니다.
        </p>

        {/* Textarea */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-[#1d1d1f] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-[#0066cc]" />
              공지 내용 (최대 200자)
            </span>
            <span className="text-[11px] font-mono text-[#86868b]">{text.length}/200</span>
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 200))}
            placeholder="청중에게 전달할 공지사항이나 안내 문구를 입력하세요. (예: 발표 자료 안내, 질의응답 진행 방식 등)"
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-[12px] border border-black/10 text-[14px] text-[#1d1d1f] focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 transition-all resize-none bg-[#fbfbfd]"
          />
        </div>

        {/* File Attachment Section */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-[#1d1d1f] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-[#0066cc]" />
              공유 자료 / 파일 첨부 (최대 10MB)
            </span>
            <span className="text-[11px] text-[#86868b]">PDF, PPTX, 이미지, 문서 등</span>
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {attachment ? (
            <div className="flex items-center justify-between p-2.5 rounded-[10px] bg-[#f0f7ff] border border-[#0066cc]/20">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-[#0066cc] flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-[#1d1d1f] truncate">
                    {attachment.name}
                  </div>
                  <div className="text-[11px] text-[#667788]">
                    {formatFileSize(attachment.size)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {isViewable && (
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-[7px] text-[11px] font-semibold text-[#0066cc] bg-[#0066cc]/10 hover:bg-[#0066cc]/20 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>미리보기</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  className="p-1 rounded-full text-[#86868b] hover:text-[#ff3b30] hover:bg-black/5 transition-colors"
                  title="첨부 파일 삭제"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-3 rounded-[10px] border border-dashed border-black/20 hover:border-[#0066cc] bg-[#fbfbfd] hover:bg-[#f0f7ff]/50 text-[13px] text-[#556677] hover:text-[#0066cc] flex items-center justify-center gap-1.5 transition-all"
            >
              <Paperclip className="w-4 h-4" />
              <span>발표 자료나 공유 파일 첨부하기</span>
            </button>
          )}

          {fileError && (
            <p className="text-[11px] text-[#ff3b30] font-medium">{fileError}</p>
          )}
        </div>

        {/* Quick Templates */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-[#86868b] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#ff9500]" />
            빠른 템플릿 선택
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setText(tmpl)}
                className="text-left px-2.5 py-1.5 rounded-[8px] bg-black/[0.03] hover:bg-black/[0.06] text-[12px] text-[#445566] transition-colors line-clamp-1"
              >
                {tmpl}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-black/[0.06]">
          {currentNotice || currentAttachment ? (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 px-3 py-2 rounded-[10px] text-[12px] font-medium text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>공지 내리기</span>
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[10px] text-[13px] font-medium text-[#556677] hover:bg-black/[0.05] transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold text-white bg-[#0066cc] hover:bg-[#0055b3] shadow-xs active:scale-[0.98] transition-all"
            >
              <Check className="w-4 h-4" />
              <span>공지 저장 및 즉시 반영</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>

    <FilePreviewModal
      isOpen={showPreview}
      onClose={() => setShowPreview(false)}
      attachment={attachment}
    />
  </>
);
};
