'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileJson, AlertCircle } from 'lucide-react';
import { parseSessionJson } from '@/lib/sessionImport';
import { getClientSocket } from '@/lib/socket';

export const ImportDropzone: React.FC = () => {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      setError('JSON 파일만 업로드할 수 있습니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const parsed = parseSessionJson(text, 'temp');

      if (!parsed.success || !parsed.messages) {
        throw new Error(parsed.error || '유효하지 않은 IGOTQ 세션 파일입니다.');
      }

      // Create new room with imported title
      const title = parsed.roomTitle ? `${parsed.roomTitle} (복원됨)` : '복원된 세션';
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, ttlMinutes: 180 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '복원용 방 생성 실패');

      const { room, hostToken } = data;
      localStorage.setItem(`igotq:host:${room.slug}`, hostToken);

      // Connect socket and import messages
      const socket = getClientSocket();
      socket.connect();

      socket.emit('join_room', {
        slug: room.slug,
        nickname: '발표자(Host)',
        hostToken,
      });

      socket.emit('import_session', { messages: parsed.messages });

      // Navigate to room
      router.push(`/${room.slug}`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류';
      setError(errorMsg);
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 rounded-xl bg-[#ff3b30]/10 border border-[#ff3b30]/20 text-[#d70015] text-[14px] font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-[20px] cursor-pointer transition-all ${
          dragOver
            ? 'border-[#0066cc] bg-[#0066cc]/5'
            : 'border-black/[0.12] hover:border-[#0066cc] bg-[#f5f5f7] hover:bg-black/[0.02]'
        }`}
      >
        <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
        <div className="w-14 h-14 rounded-full bg-black/[0.04] text-[#0066cc] flex items-center justify-center mb-3.5">
          <UploadCloud className="w-7 h-7" />
        </div>
        <p className="text-[18px] sm:text-[20px] font-semibold text-[#1d1d1f]">
          {loading ? '기존 대화 업로드 중...' : 'JSON 백업 파일 선택 또는 드래그'}
        </p>
        <p className="text-[14px] text-[#86868b] mt-1.5">이전에 저장한 대화 기록을 그대로 불러옵니다</p>
      </label>
    </div>
  );
};
