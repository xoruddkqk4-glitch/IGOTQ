import { z } from 'zod';
import { ThreadedMessage, ReplyItem, MessageStatus } from '@/types/message';

const ReplySchema = z.object({
  id: z.string().optional(),
  nickname: z.string().min(1).max(50),
  content: z.string().min(1).max(1000),
  createdAt: z.string().optional(),
});

const MessageSchema = z.object({
  id: z.string().optional(),
  parent_id: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  nickname: z.string().min(1).max(50),
  content: z.string().min(1).max(1000),
  status: z.enum(['pending', 'answered']).optional(),
  createdAt: z.string().optional(),
  replies: z.array(ReplySchema).optional(),
});

const SessionFileSchema = z.object({
  service: z.string().optional(),
  version: z.string().optional(),
  roomInfo: z
    .object({
      title: z.string().optional(),
      slug: z.string().optional(),
    })
    .optional(),
  messages: z.array(MessageSchema),
});

export interface ParseResult {
  success: boolean;
  messages?: ThreadedMessage[];
  roomTitle?: string;
  error?: string;
}

export function parseSessionJson(jsonStr: string, roomId: string): ParseResult {
  try {
    if (jsonStr.length > 2 * 1024 * 1024) {
      return { success: false, error: '파일 크기가 2MB를 초과했습니다.' };
    }

    const rawData = JSON.parse(jsonStr);
    const parsed = SessionFileSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: `JSON 형식이 올바르지 않습니다: ${parsed.error.errors[0]?.message || '스키마 불일치'}`,
      };
    }

    const { messages: rawMessages, roomInfo } = parsed.data;

    if (rawMessages.length > 2000) {
      return { success: false, error: '세션 내 메시지 수가 최대 제한(2,000건)을 초과했습니다.' };
    }

    const normalized: ThreadedMessage[] = [];

    // Check if flat or nested
    const hasParentIds = rawMessages.some((m) => m.parent_id || m.parentId);

    if (hasParentIds) {
      // Flat list with parent_id
      const rootMsgs = rawMessages.filter((m) => !m.parent_id && !m.parentId);
      const childMap = new Map<string, ReplyItem[]>();

      rawMessages.forEach((m) => {
        const pId = m.parent_id || m.parentId;
        if (pId) {
          const list = childMap.get(pId) || [];
          list.push({
            id: m.id || `reply-${Math.random().toString(36).slice(2, 9)}`,
            nickname: m.nickname,
            content: m.content,
            isHostReply: true,
            createdAt: m.createdAt || new Date().toISOString(),
          });
          childMap.set(pId, list);
        }
      });

      rootMsgs.forEach((rm, idx) => {
        const msgId = rm.id || `restored-${idx}-${Date.now()}`;
        normalized.push({
          id: msgId,
          roomId,
          nickname: rm.nickname,
          content: rm.content,
          isQuestion: true,
          isHostReply: false,
          status: (rm.status as MessageStatus) || (childMap.has(msgId) ? 'answered' : 'pending'),
          isRestored: true,
          createdAt: rm.createdAt || new Date().toISOString(),
          replies: childMap.get(msgId) || [],
        });
      });
    } else {
      // Nested replies structure
      rawMessages.forEach((rm, idx) => {
        const msgId = rm.id || `restored-${idx}-${Date.now()}`;
        const replies: ReplyItem[] = (rm.replies || []).map((r, rIdx) => ({
          id: r.id || `reply-${msgId}-${rIdx}`,
          nickname: r.nickname,
          content: r.content,
          isHostReply: true,
          createdAt: r.createdAt || new Date().toISOString(),
        }));

        normalized.push({
          id: msgId,
          roomId,
          nickname: rm.nickname,
          content: rm.content,
          isQuestion: true,
          isHostReply: false,
          status: (rm.status as MessageStatus) || (replies.length > 0 ? 'answered' : 'pending'),
          isRestored: true,
          createdAt: rm.createdAt || new Date().toISOString(),
          replies,
        });
      });
    }

    return {
      success: true,
      messages: normalized,
      roomTitle: roomInfo?.title,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류';
    return { success: false, error: `파일 읽기 오류: ${errorMsg}` };
  }
}
