'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { UploadCloud, AlertCircle, CheckCircle2 } from 'lucide-react';
import { parseSessionJson } from '@/lib/sessionImport';
import { ThreadedMessage } from '@/types/message';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  onImportMessages: (messages: ThreadedMessage[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, roomId, onImportMessages }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setError('JSON 백업 파일만 업로드할 수 있습니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const parsed = parseSessionJson(text, roomId);

      if (!parsed.success || !parsed.messages) {
        throw new Error(parsed.error || '유효하지 않은 세션 파일입니다.');
      }

      onImportMessages(parsed.messages);
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="이전 세션 기록 복원 (JSON 업로드)">
      <div className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-[#ff3b30]/10 border border-[#ff3b30]/20 text-[#d70015] text-[13px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <p className="text-[14px] text-[#86868b] leading-relaxed">
          이전에 다운로드했던 IGOTQ 백업 JSON 파일을 업로드하면 질문과 답변 기록이{' '}
          <span className="text-[#1d1d1f] font-semibold">[이전 기록]</span> 태그와 함께 현재 방에 즉시 복원됩니다.
        </p>

        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-black/[0.12] hover:border-[#0066cc] rounded-[18px] bg-[#f5f5f7] hover:bg-black/[0.02] cursor-pointer transition-all">
          <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
          <div className="w-12 h-12 rounded-full bg-black/[0.04] text-[#0066cc] flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <span className="text-[15px] font-semibold text-[#1d1d1f]">
            {loading ? '복원 파일 파싱 중...' : 'JSON 백업 파일 선택 또는 드래그'}
          </span>
          <span className="text-[12px] text-[#86868b] mt-1">최대 2MB / 2,000개 메시지 지원</span>
        </label>
      </div>
    </Modal>
  );
};
