'use client';

import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Send,
  MessageCircle,
  HelpCircle,
  MessageSquare,
  Clock,
  Crown,
} from 'lucide-react';
import { ThreadedMessage, ReplyItem } from '@/types/message';

interface KakaoMessageBubbleProps {
  message: ThreadedMessage;
  isMe: boolean;
  isHost: boolean;
  currentNickname?: string | null;
  onSendReply: (parentId: string, content: string) => void;
  onToggleStatus: (messageId: string, status: 'pending' | 'answered') => void;
  onDeleteMessage: (messageId: string) => void;
}

export const KakaoMessageBubble = React.memo<KakaoMessageBubbleProps>(({
  message,
  isMe,
  isHost,
  currentNickname,
  onSendReply,
  onToggleStatus,
  onDeleteMessage,
}) => {
  const [showReplies, setShowReplies] = useState(true);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const timeStr = new Date(message.createdAt).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isHostQuestion = Boolean(message.isQuestion && message.isHostReply);
  const canReply = isHost || isHostQuestion;
  const isAnswered = message.status === 'answered';
  const rawReplies = message.replies || [];

  // 호스트 질문이고 현재 사용자가 청중인 경우: 블라인드 모드로 본인 답변만 노출
  const replies = (isHostQuestion && !isHost)
    ? rawReplies.filter((rep) => rep.nickname === currentNickname)
    : rawReplies;

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      onSendReply(message.id, replyText.trim());
      setReplyText('');
      setIsReplying(false);
      setShowReplies(true);
    }
  };

  // Avatar pastel background colors based on nickname
  const getAvatarBg = (name: string) => {
    const colors = [
      'bg-[#FFD1D1] text-[#C53030]',
      'bg-[#D1E8FF] text-[#2B6CB0]',
      'bg-[#D6BCFA] text-[#6B46C1]',
      'bg-[#FED7D7] text-[#9B2C2C]',
      'bg-[#C6F6D5] text-[#22543D]',
      'bg-[#FEEBC8] text-[#7B341E]',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % colors.length;
    return colors[idx];
  };

  /* -------------------------------------------------------------
   * 1. MY MESSAGE (내가 보낸 메시지 - 우측 노란색 말풍선 #FEE500)
   * ------------------------------------------------------------- */
  if (isMe) {
    return (
      <div className="flex justify-end items-end gap-1.5 mb-3 group animate-fade-in pl-10">
        {/* Left of Bubble: Timestamp & Status */}
        <div className="flex flex-col items-end text-[10px] text-[#556677] pb-1 flex-shrink-0 select-none space-y-0.5">
          {message.isHostReply && (
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-800 border border-amber-500/30 flex items-center gap-0.5">
              <Crown className="w-2.5 h-2.5 text-amber-600" />
              호스트
            </span>
          )}
          {message.isQuestion && (
            <span
              className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full ${
                isAnswered ? 'text-[#1e7e34]' : 'text-[#ff3b30]'
              }`}
            >
              {isAnswered ? '답변완료' : '미답변'}
            </span>
          )}
          <span>{timeStr}</span>
        </div>

        {/* Speech Bubble: Kakao Yellow for Questions / Soft Amber for Host / Soft Sky Blue for Opinions */}
        <div
          className={`max-w-[85%] sm:max-w-[78%] rounded-[15px] rounded-tr-[2px] text-black p-3 sm:p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-colors ${
            message.isQuestion
              ? 'bg-[#FEE500] border border-[#efd700]'
              : message.isHostReply
              ? 'bg-[#FFF9E6] border border-[#f5b800]/40 shadow-xs'
              : 'bg-[#EBF3FE] border border-[#0066cc]/20'
          }`}
        >
          {/* Question Tag Header if question */}
          {message.isQuestion ? (
            <div className="flex items-center justify-between gap-1.5 mb-1.5 pb-1 border-b border-black/[0.08]">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1d1d1f] bg-black/[0.07] px-2 py-0.5 rounded-full">
                  <HelpCircle className="w-3 h-3 text-[#0066cc]" />
                  <span>Q&A 질문</span>
                </span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    isAnswered
                      ? 'bg-[#34c759]/20 text-[#1e7e34]'
                      : 'bg-[#ff3b30]/15 text-[#d70015]'
                  }`}
                >
                  {isAnswered ? '답변 완료' : '미답변'}
                </span>
              </div>

              {/* Host Controls on own message if host */}
              {isHost && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      onToggleStatus(message.id, isAnswered ? 'pending' : 'answered')
                    }
                    className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 hover:bg-black/15 font-medium transition-colors"
                    title={isAnswered ? '미답변 상태로 되돌리기' : '답변 완료로 변경'}
                  >
                    {isAnswered ? '되돌리기' : '완료'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('이 메시지를 삭제하시겠습니까?')) {
                        onDeleteMessage(message.id);
                      }
                    }}
                    className="text-black/60 hover:text-[#ff3b30] p-0.5 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-1 mb-1 text-[11px] font-medium">
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-[#0066cc]" />
                <span className="font-bold text-[#0066cc]">일반 의견</span>
              </div>
              {isHost && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('이 메시지를 삭제하시겠습니까?')) {
                      onDeleteMessage(message.id);
                    }
                  }}
                  className="text-black/60 hover:text-[#ff3b30] p-0.5 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Message Content */}
          <p className="text-[14px] sm:text-[15px] text-[#000000] leading-relaxed whitespace-pre-wrap break-words font-normal">
            {message.content}
          </p>

          {/* Q&A Section inside bubble */}
          {message.isQuestion && (
            <div className="mt-2.5 pt-2 border-t border-black/[0.08] space-y-2">
              <div className="flex items-center justify-between gap-2 text-[12px] flex-wrap">
                {replies.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setShowReplies(!showReplies)}
                    className="flex items-center gap-1 text-[12px] font-semibold text-black/80 hover:text-black transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#0066cc]" />
                    <span>
                      {isHostQuestion && !isHost ? `내 답변 ${replies.length}개` : `답변 ${replies.length}개`}{' '}
                      {showReplies ? '접기' : '보기'}
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] text-black/60">
                    <Clock className="w-3 h-3 text-[#d70015]" />
                    <span>{isHostQuestion ? '청중 답변 수집 중' : '발표자 답변 대기 중'}</span>
                  </div>
                )}

                {/* Reply Button (Host or Audience on Host Question) */}
                {canReply && !isReplying && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsReplying(true);
                      setShowReplies(true);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-[#0066cc] hover:bg-[#0055b3] text-white text-[11px] font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>{isHost ? '발표자 답변 달기' : '답변 제출하기'}</span>
                  </button>
                )}
              </div>

              {/* Replies List */}
              {showReplies && replies.length > 0 && (
                <div className="space-y-1.5 pl-1">
                  {replies.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-2.5 rounded-[10px] bg-white/80 border-l-[3px] border-[#0066cc] text-[13px] text-black shadow-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1 font-semibold text-[12px] text-[#0066cc]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{rep.nickname}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#0066cc]/10 text-[#0066cc] font-normal">
                            {rep.isHostReply ? '발표자 공식 답변' : '내 제출 답변'}
                          </span>
                        </div>
                        <span className="text-[10px] text-black/50">
                          {new Date(rep.createdAt).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[13px] text-black/90 leading-snug whitespace-pre-wrap break-words">
                        {rep.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Host Reply Composer */}
              {isHost && isReplying && (
                <form onSubmit={handleReplySubmit} className="pt-1.5 space-y-1.5 bg-black/[0.04] p-2.5 rounded-[10px]">
                  <div className="flex items-center justify-between text-[11px] text-[#0066cc] font-semibold">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      공식 답변 작성
                    </span>
                    <span className="text-[10px] text-black/50 font-normal">전송 시 답변완료 자동 전환</span>
                  </div>
                  <textarea
                    autoFocus
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="질문에 대한 발표자 공식 답변을 입력하세요..."
                    className="w-full px-2.5 py-1.5 rounded-[8px] bg-white border border-black/15 text-[13px] text-black outline-none focus:border-[#0066cc] resize-none"
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsReplying(false)}
                      className="px-2 py-0.5 text-[11px] text-black/60 hover:text-black"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="flex items-center gap-1 px-3 py-1 rounded-[6px] bg-[#0066cc] hover:bg-[#0055b3] text-white text-[11px] font-semibold disabled:opacity-40 shadow-xs"
                    >
                      <Send className="w-2.5 h-2.5" />
                      <span>답변 등록</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
   * 2. OTHER PARTICIPANTS' MESSAGES (상대방 메시지 - 좌측 흰색 말풍선 #FFFFFF)
   * ------------------------------------------------------------- */
  return (
    <div className="flex items-start gap-2 mb-3.5 group animate-fade-in pr-10">
      {/* Profile Avatar */}
      <div
        className={`w-9 h-9 rounded-[13px] flex items-center justify-center font-bold text-[13px] shadow-xs flex-shrink-0 mt-0.5 ${getAvatarBg(
          message.nickname
        )}`}
        title={message.nickname}
      >
        {message.nickname.slice(0, 1).toUpperCase()}
      </div>

      {/* Message Column */}
      <div className="flex-1 min-w-0">
        {/* Sender Nickname */}
        <div className="text-[12px] text-[#556677] font-semibold mb-1 flex items-center gap-1.5">
          <span>{message.nickname}</span>
          {message.isHostReply && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/15 to-amber-600/15 text-amber-800 border border-amber-500/30 font-bold flex items-center gap-1 shadow-xs">
              <Crown className="w-3 h-3 text-amber-600" />
              <span>진행자(호스트)</span>
            </span>
          )}
        </div>

        {/* Bubble + Timestamp Row */}
        <div className="flex items-end gap-1.5">
          {/* Speech Bubble: Warm Cream Yellow for Questions / Soft Amber for Host / Pure White for Opinions */}
          <div
            className={`max-w-[85%] sm:max-w-[78%] rounded-[15px] rounded-tl-[2px] text-black p-3 sm:p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-colors ${
              message.isQuestion
                ? 'bg-[#FFFDF0] border border-[#f3e498]'
                : message.isHostReply
                ? 'bg-[#FFF9E6] border border-[#f5b800]/40 shadow-xs'
                : 'bg-white border border-black/[0.06]'
            }`}
          >
            {/* Header info for Questions */}
            {message.isQuestion ? (
              <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-black/[0.06]">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1d1d1f] bg-[#f0f2f5] px-2 py-0.5 rounded-full">
                    <HelpCircle className="w-3 h-3 text-[#0066cc]" />
                    <span>Q&A 질문</span>
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isAnswered
                        ? 'bg-[#34c759]/15 text-[#1e7e34]'
                        : 'bg-[#ff3b30]/10 text-[#d70015]'
                    }`}
                  >
                    {isAnswered ? '답변 완료' : '미답변'}
                  </span>
                </div>

                {/* Host Quick Actions */}
                {isHost && (
                  <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() =>
                        onToggleStatus(message.id, isAnswered ? 'pending' : 'answered')
                      }
                      className={`text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors ${
                        isAnswered
                          ? 'text-[#86868b] hover:bg-black/5'
                          : 'bg-[#34c759]/10 text-[#1e7e34] hover:bg-[#34c759]/20 font-medium'
                      }`}
                      title={isAnswered ? '미답변 상태로 되돌리기' : '답변 완료로 변경'}
                    >
                      {isAnswered ? <RotateCcw className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      <span>{isAnswered ? '되돌리기' : '답변완료'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('이 메시지를 삭제하시겠습니까?')) {
                          onDeleteMessage(message.id);
                        }
                      }}
                      className="text-[#86868b] hover:text-[#ff3b30] p-1 rounded transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between gap-1 mb-1 text-[11px] text-[#556677]">
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-[#86868b]" />
                  <span className="font-semibold">일반 의견</span>
                </div>
                {isHost && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('이 메시지를 삭제하시겠습니까?')) {
                        onDeleteMessage(message.id);
                      }
                    }}
                    className="text-[#86868b] hover:text-[#ff3b30] p-0.5 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Message Body */}
            <p className="text-[14px] sm:text-[15px] text-[#111111] leading-relaxed whitespace-pre-wrap break-words font-normal">
              {message.content}
            </p>

            {/* Replies / Threads for Q&A */}
            {message.isQuestion && (
              <div className="mt-2.5 pt-2 border-t border-black/[0.06] space-y-2">
                <div className="flex items-center justify-between gap-2 text-[12px] flex-wrap">
                  {replies.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setShowReplies(!showReplies)}
                      className="flex items-center gap-1 font-semibold text-[#0066cc] hover:text-[#0077ed]"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>
                        {isHostQuestion && !isHost ? `내 답변 ${replies.length}개` : `답변 ${replies.length}개`}{' '}
                        {showReplies ? '접기' : '보기'}
                      </span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#86868b]">
                      <Clock className="w-3 h-3 text-[#ff9500]" />
                      <span>{isHostQuestion ? '청중 답변 수집 중' : '발표자 답변 대기 중'}</span>
                    </div>
                  )}

                  {/* Reply Button (Host or Audience on Host Question) */}
                  {canReply && !isReplying && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsReplying(true);
                        setShowReplies(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#0066cc] hover:bg-[#0055b3] text-white text-[12px] font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{isHost ? '발표자 답변 달기' : '답변 제출하기'}</span>
                    </button>
                  )}
                </div>

                {/* Replies List (KakaoTalk Quoted Box Style) */}
                {showReplies && replies.length > 0 && (
                  <div className="space-y-1.5">
                    {replies.map((rep) => (
                      <div
                        key={rep.id}
                        className="p-2.5 rounded-[10px] bg-[#fffde6] border-l-[3px] border-[#FEE500] text-[13px] text-black"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1 font-semibold text-[12px] text-[#1d1d1f]">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#0066cc]" />
                            <span>{rep.nickname}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/5 text-black font-normal">
                              {rep.isHostReply ? '발표자 공식 답변' : (isHostQuestion && !isHost ? '내 제출 답변' : '청중 응답')}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#86868b]">
                            {new Date(rep.createdAt).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-[13px] text-[#111111] leading-snug whitespace-pre-wrap break-words">
                          {rep.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {canReply && isReplying && (
                  <form onSubmit={handleReplySubmit} className="pt-1.5 space-y-1.5 bg-[#f5f7fa] p-2.5 rounded-[10px] border border-black/[0.08]">
                    <div className="flex items-center justify-between text-[11px] text-[#0066cc] font-semibold">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {isHost ? '발표자 공식 답변 작성' : '호스트 질문에 답변 제출'}
                      </span>
                      <span className="text-[10px] text-[#86868b] font-normal">
                        {isHost ? '전송 시 답변완료 자동 전환' : '발표 화면에 실시간 집계됩니다'}
                      </span>
                    </div>
                    <textarea
                      autoFocus
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={
                        isHost
                          ? '질문에 대한 발표자 공식 답변을 입력하세요...'
                          : '호스트 질문에 대한 나의 답변/생각을 입력하세요...'
                      }
                      className="w-full px-2.5 py-1.5 rounded-[8px] bg-white border border-black/15 text-[13px] text-black outline-none focus:border-[#0066cc] resize-none"
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsReplying(false);
                          setReplyText('');
                        }}
                        className="px-2.5 py-1 text-[11px] text-[#667788] hover:text-black"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        disabled={!replyText.trim()}
                        className="flex items-center gap-1 px-3 py-1 rounded-[6px] bg-[#0066cc] hover:bg-[#0055b3] text-white text-[12px] font-semibold disabled:opacity-40 shadow-xs"
                      >
                        <Send className="w-3 h-3" />
                        <span>답변 등록</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Right of Bubble: Timestamp */}
          <div className="text-[10px] text-[#556677] self-end pb-0.5 whitespace-nowrap select-none">
            {timeStr}
          </div>
        </div>
      </div>
    </div>
  );
});

KakaoMessageBubble.displayName = 'KakaoMessageBubble';
