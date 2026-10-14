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
    <div className="space-y-3">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
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
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
          dragOver
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04]'
        }`}
      >
        <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2.5">
          <UploadCloud className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-slate-200">
          {loading ? '세션 복원 중...' : '이전 세션 백업 JSON 파일 드래그 앤 드롭'}
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">또는 클릭하여 파일 선택 (.json 파일만 지원)</p>
      </label>
    </div>
  );
};
