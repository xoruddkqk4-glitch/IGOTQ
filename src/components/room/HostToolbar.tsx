'use client';

import React, { useState } from 'react';
import { Download, Upload, Link2, Power, Check } from 'lucide-react';
import { ExportModal } from './ExportModal';
import { ImportModal } from './ImportModal';
import { RoomInfo } from '@/types/room';
import { ThreadedMessage } from '@/types/message';

interface HostToolbarProps {
  room: RoomInfo;
  messages: ThreadedMessage[];
  onImportMessages: (messages: ThreadedMessage[]) => void;
  onCloseRoom: () => void;
}

export const HostToolbar: React.FC<HostToolbarProps> = ({
  room,
  messages,
  onImportMessages,
  onCloseRoom,
}) => {
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [copiedHostLink, setCopiedHostLink] = useState(false);

  const handleCopyHostLink = () => {
    if (typeof window !== 'undefined') {
      const hostToken = localStorage.getItem(`igotq:host:${room.slug}`);
      if (hostToken) {
        const url = `${window.location.origin}/${room.slug}#host=${hostToken}`;
        navigator.clipboard.writeText(url);
        setCopiedHostLink(true);
        setTimeout(() => setCopiedHostLink(false), 2000);
      } else {
        alert('현재 브라우저에 저장된 호스트 토큰을 찾을 수 없습니다.');
      }
    }
  };

  return (
    <>
      <div className="glass-panel p-2.5 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 mb-4 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 pl-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          <span className="text-xs font-bold text-indigo-300">방장(호스트) 전용 제어판</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Export Button */}
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>대화 다운로드</span>
          </button>

          {/* Import Button */}
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span>세션 복원</span>
          </button>

          {/* Co-host Share Link */}
          <button
            onClick={handleCopyHostLink}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-colors"
            title="공동 발표자에게 호스트 권한 링크 복사"
          >
            {copiedHostLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{copiedHostLink ? '복사됨!' : '공동 발표자 링크'}</span>
          </button>

          {/* Close Room Button */}
          <button
            onClick={() => {
              if (confirm('방을 즉시 종료하시겠습니까? 모든 참가자가 퇴장되고 데이터가 안전하게 삭제됩니다.')) {
                onCloseRoom();
              }
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-semibold text-red-300 transition-colors"
          >
            <Power className="w-3.5 h-3.5" />
            <span>방 종료</span>
          </button>
        </div>
      </div>

      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        room={room}
        messages={messages}
      />

      <ImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        roomId={room.id}
        onImportMessages={onImportMessages}
      />
    </>
  );
};
