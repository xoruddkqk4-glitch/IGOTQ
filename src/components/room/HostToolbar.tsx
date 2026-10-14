'use client';

import React, { useState } from 'react';
import { Download, Power, Trash2, Clock, Tv, HelpCircle } from 'lucide-react';
import { ExportModal } from './ExportModal';
import { RoomInfo } from '@/types/room';
import { ThreadedMessage } from '@/types/message';

interface HostToolbarProps {
  room: RoomInfo;
  messages: ThreadedMessage[];
  onImportMessages?: (messages: ThreadedMessage[]) => void;
  onCloseRoom: () => void;
  onDeleteRoomImmediately?: () => void;
  onOpenProjector?: () => void;
  onOpenStreamFeed?: () => void;
}

export const HostToolbar: React.FC<HostToolbarProps> = ({
  room,
  messages,
  onImportMessages,
  onCloseRoom,
  onDeleteRoomImmediately,
  onOpenProjector,
  onOpenStreamFeed,
}) => {
  const [showExport, setShowExport] = useState(false);

  const handleOpenProjector = () => {
    if (onOpenProjector) {
      onOpenProjector();
    } else if (typeof window !== 'undefined') {
      window.open(`/${room.slug}?view=projector`, '_blank');
    }
  };

  const handleOpenStreamFeed = () => {
    if (onOpenStreamFeed) {
      onOpenStreamFeed();
    } else if (typeof window !== 'undefined') {
      window.open(`/${room.slug}?view=stream`, '_blank');
    }
  };

  return (
    <>
      <div className="rounded-[18px] border border-[#f5da00] bg-[#FFFDE6] px-3 py-2 sm:px-4 sm:py-2.5 mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-between gap-2 overflow-x-auto whitespace-nowrap text-black">
        {/* Left: Title */}
        <div className="flex items-center gap-2 pl-0.5 flex-shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f5b800] animate-pulse"></span>
          <span className="text-[12px] sm:text-[13px] font-bold text-[#1d1d1f]">방장(호스트) 제어판</span>
        </div>

        {/* Right: 1-Row Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap flex-shrink-0 overflow-x-auto scrollbar-none py-0.5">
          {/* 1. Realtime Backchannel Feed View Button (Emphasized with Blue Accent, Placed on Left) */}
          <button
            onClick={handleOpenStreamFeed}
            style={{ fontSize: 'clamp(11px, 1.3vw, 13px)' }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-[11px] bg-[#0066cc] hover:bg-[#0055b3] text-white font-semibold shadow-xs transition-all active:scale-[0.97] whitespace-nowrap flex-shrink-0 select-none"
            title="입력창 없이 모든 대화가 좌측 정렬로 흐르는 대형 스크린 백채널 뷰 열기"
          >
            <Tv className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="whitespace-nowrap">백채널 뷰</span>
          </button>

          {/* 2. Question Cards View Button (미완료 질문 집중 & 카드 뷰) */}
          <button
            onClick={handleOpenProjector}
            style={{ fontSize: 'clamp(11px, 1.3vw, 13px)' }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-[11px] bg-[#fafafc] hover:bg-[#f0f4f8] border border-black/[0.1] text-[#1d1d1f] font-semibold transition-all active:scale-[0.97] whitespace-nowrap flex-shrink-0 select-none"
            title="미완료 질문을 크고 집중적으로 보여주는 프로젝터 카드 뷰 열기"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#0066cc] shrink-0" />
            <span className="whitespace-nowrap">질문 카드 뷰</span>
          </button>

          {/* 3. Export Button */}
          <button
            onClick={() => setShowExport(true)}
            style={{ fontSize: 'clamp(11px, 1.3vw, 13px)' }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-[11px] bg-[#fafafc] hover:bg-[#f5f5f7] border border-black/[0.08] font-normal text-[#1d1d1f] transition-all active:scale-[0.97] whitespace-nowrap flex-shrink-0 select-none"
          >
            <Download className="w-3.5 h-3.5 text-[#0066cc] shrink-0" />
            <span className="whitespace-nowrap">대화 다운로드</span>
          </button>

          {/* 5. Close Room or Immediate Delete based on room state */}
          {room.isClosed ? (
            <>
              <div 
                style={{ fontSize: 'clamp(10.5px, 1.2vw, 12px)' }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[11px] bg-[#ff9f0a]/10 border border-[#ff9f0a]/20 font-medium text-[#d97706] whitespace-nowrap flex-shrink-0 select-none"
              >
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">세션 종료됨</span>
              </div>
              <button
                onClick={() => {
                  if (
                    confirm(
                      '세션 데이터를 즉시 영구 삭제하시겠습니까? 남은 보관 시간과 관계없이 모든 Q&A 기록이 즉시 삭제됩니다.'
                    )
                  ) {
                    onDeleteRoomImmediately?.();
                  }
                }}
                style={{ fontSize: 'clamp(11px, 1.3vw, 13px)' }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-[11px] bg-[#ff3b30]/10 hover:bg-[#ff3b30]/15 border border-[#ff3b30]/20 font-normal text-[#d70015] transition-all active:scale-[0.97] whitespace-nowrap flex-shrink-0 select-none"
                title="남은 보관 시간 없이 즉시 삭제"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">즉시 삭제</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                const hours = Math.round((room.ttlMinutes || 120) / 60);
                if (
                  confirm(
                    `세션을 종료하시겠습니까?\n종료 후 설정된 보관 시간(${hours}시간) 동안 참가자들이 Q&A를 열람하고 다운로드할 수 있습니다.`
                  )
                ) {
                  onCloseRoom();
                }
              }}
              style={{ fontSize: 'clamp(11px, 1.3vw, 13px)' }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-[11px] bg-[#ff3b30]/10 hover:bg-[#ff3b30]/15 border border-[#ff3b30]/20 font-normal text-[#d70015] transition-all active:scale-[0.97] whitespace-nowrap flex-shrink-0 select-none"
            >
              <Power className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">방 종료</span>
            </button>
          )}
        </div>
      </div>

      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        room={room}
        messages={messages}
      />
    </>
  );
};
