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
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <p className="text-xs text-slate-300 leading-relaxed">
          이전에 다운로드했던 IGOTQ 백업 JSON 파일을 업로드하면 질문과 답변 기록이{' '}
          <span className="text-purple-400 font-bold">[이전 세션 기록]</span> 태그와 함께 현재 방에 즉시 복원됩니다.
        </p>

        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/60 rounded-2xl bg-indigo-500/5 hover:bg-indigo-500/10 cursor-pointer transition-all">
          <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
          <UploadCloud className="w-8 h-8 text-indigo-400 mb-2" />
          <span className="text-xs font-bold text-white">
            {loading ? '복원 파일 파싱 중...' : 'JSON 백업 파일 선택 또는 드래그'}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">최대 2MB / 2,000개 메시지 지원</span>
        </label>
      </div>
    </Modal>
  );
};
