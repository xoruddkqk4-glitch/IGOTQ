import { ThreadedMessage } from '@/types/message';
import { RoomInfo } from '@/types/room';
import { SessionExportData } from '@/types/session';

export function exportSessionAsJson(room: RoomInfo, messages: ThreadedMessage[]): void {
  const exportData: SessionExportData = {
    service: 'IGOTQ',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    roomInfo: {
      title: room.title,
      slug: room.slug,
      expiresAt: room.expiresAt,
    },
    messages: messages.map((m) => ({
      id: m.id,
      parent_id: null,
      nickname: m.nickname,
      content: m.content,
      status: m.status,
      createdAt: m.createdAt,
      isRestored: m.isRestored,
      replies: m.replies.map((r) => ({
        id: r.id,
        nickname: r.nickname,
        content: r.content,
        createdAt: r.createdAt,
      })),
    })),
  };

  const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  triggerDownload(jsonBlob, `IGOTQ_${room.slug}_${getTimestampStr()}.json`);
}

export function exportSessionAsTxt(room: RoomInfo, messages: ThreadedMessage[]): void {
  const lines: string[] = [
    `================================================================`,
    `[IGOTQ 세션 대화 및 Q&A 기록]`,
    `방 제목: ${room.title} (slug: ${room.slug})`,
    `내보낸 시각: ${new Date().toLocaleString('ko-KR')}`,
    `================================================================\n`,
  ];

  messages.forEach((msg, idx) => {
    const statusText = msg.status === 'answered' ? '[답변완료]' : '[미답변]';
    const tag = msg.isRestored ? '[이전기록] ' : '';
    const qBadge = msg.isQuestion ? 'Q. ' : 'MSG. ';
    const timeStr = new Date(msg.createdAt).toLocaleTimeString('ko-KR');

    lines.push(`${idx + 1}. ${tag}${qBadge}${statusText} ${msg.nickname} (${timeStr})`);
    lines.push(`   ${msg.content}`);

    if (msg.replies && msg.replies.length > 0) {
      msg.replies.forEach((rep) => {
        const repTime = new Date(rep.createdAt).toLocaleTimeString('ko-KR');
        lines.push(`   └ [답변] ${rep.nickname} (${repTime}): ${rep.content}`);
      });
    }
    lines.push('');
  });

  const txtBlob = new Blob([lines.join('\n')], {
    type: 'text/plain;charset=utf-8',
  });
  triggerDownload(txtBlob, `IGOTQ_${room.slug}_${getTimestampStr()}.txt`);
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getTimestampStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${y}${m}${d}_${h}${min}`;
}
