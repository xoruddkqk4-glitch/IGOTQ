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
      <div className="apple-card p-3 sm:p-4 rounded-[16px] border border-black/[0.08] bg-white mb-5 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 pl-1">
          <span className="w-2 h-2 rounded-full bg-[#0066cc]"></span>
          <span className="text-[13px] font-semibold text-[#1d1d1f]">방장(호스트) 제어판</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Button */}
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[11px] bg-[#fafafc] hover:bg-[#f5f5f7] border border-black/[0.08] text-[13px] font-normal text-[#1d1d1f] transition-all active:scale-[0.97]"
          >
            <Download className="w-3.5 h-3.5 text-[#0066cc]" />
            <span>대화 다운로드</span>
          </button>

          {/* Import Button */}
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[11px] bg-[#fafafc] hover:bg-[#f5f5f7] border border-black/[0.08] text-[13px] font-normal text-[#1d1d1f] transition-all active:scale-[0.97]"
          >
            <Upload className="w-3.5 h-3.5 text-[#0066cc]" />
            <span>세션 복원</span>
          </button>

          {/* Co-host Share Link */}
          <button
            onClick={handleCopyHostLink}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[11px] bg-[#fafafc] hover:bg-[#f5f5f7] border border-black/[0.08] text-[13px] font-normal text-[#1d1d1f] transition-all active:scale-[0.97]"
            title="공동 발표자에게 호스트 권한 링크 복사"
          >
            {copiedHostLink ? <Check className="w-3.5 h-3.5 text-[#34c759]" /> : <Link2 className="w-3.5 h-3.5 text-[#0066cc]" />}
            <span>{copiedHostLink ? '복사 완료' : '공동 발표자 링크'}</span>
          </button>

          {/* Close Room Button */}
          <button
            onClick={() => {
              if (confirm('방을 즉시 종료하시겠습니까? 모든 참가자가 퇴장되고 데이터가 안전하게 삭제됩니다.')) {
                onCloseRoom();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[11px] bg-[#ff3b30]/10 hover:bg-[#ff3b30]/15 border border-[#ff3b30]/20 text-[13px] font-normal text-[#d70015] transition-all active:scale-[0.97]"
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
