'use client';

import React from 'react';
import { Modal } from '@/components/common/Modal';
import { Download, FileJson, FileText, CheckCircle2 } from 'lucide-react';
import { exportSessionAsJson, exportSessionAsTxt } from '@/lib/sessionExport';
import { RoomInfo } from '@/types/room';
import { ThreadedMessage } from '@/types/message';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomInfo;
  messages: ThreadedMessage[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, room, messages }) => {
  const handleDownloadJson = () => {
    exportSessionAsJson(room, messages);
    onClose();
  };

  const handleDownloadTxt = () => {
    exportSessionAsTxt(room, messages);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="세션 대화 및 Q&A 다운로드">
      <div className="space-y-4">
        <p className="text-xs text-slate-300 leading-relaxed">
          현재 방의 모든 질문, 답변 스레드, 대화 내용을 로컬 컴퓨터에 안전하게 저장합니다.
          서버를 거치지 않고 브라우저에서 즉시 파일이 생성됩니다.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* JSON Export */}
          <button
            onClick={handleDownloadJson}
            className="p-4 rounded-2xl glass-card border border-indigo-500/20 hover:border-indigo-500/40 text-left space-y-2 group transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                표준 JSON 다운로드
              </h4>
              <p className="text-[11px] text-slate-400">
                향후 다른 방에서 업로드하여 세션을 그대로 복원할 수 있는 표준 백업 형식입니다.
              </p>
            </div>
          </button>

          {/* TXT Export */}
          <button
            onClick={handleDownloadTxt}
            className="p-4 rounded-2xl glass-card border border-cyan-500/20 hover:border-cyan-500/40 text-left space-y-2 group transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                텍스트 (.txt) 다운로드
              </h4>
              <p className="text-[11px] text-slate-400">
                세미나 종료 후 보고서나 회의록으로 바로 열람 및 공유하기 좋은 형태입니다.
              </p>
            </div>
          </button>
        </div>

        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>총 {messages.length}개의 질문 및 메시지가 저장 대상입니다.</span>
        </div>
      </div>
    </Modal>
  );
};
