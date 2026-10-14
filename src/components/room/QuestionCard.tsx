'use client';

import React from 'react';
import { KakaoMessageBubble } from './KakaoMessageBubble';
import { ThreadedMessage } from '@/types/message';

interface QuestionCardProps {
  message: ThreadedMessage;
  isHost: boolean;
  onSendReply: (parentId: string, content: string) => void;
  onToggleStatus: (messageId: string, status: 'pending' | 'answered') => void;
  onDeleteMessage: (messageId: string) => void;
  currentNickname?: string | null;
}

export const QuestionCard = React.memo<QuestionCardProps>(({
  message,
  isHost,
  onSendReply,
  onToggleStatus,
  onDeleteMessage,
  currentNickname,
}) => {
  const isMe = Boolean(currentNickname && message.nickname === currentNickname);

  return (
    <KakaoMessageBubble
      message={message}
      isMe={isMe}
      isHost={isHost}
      onSendReply={onSendReply}
      onToggleStatus={onToggleStatus}
      onDeleteMessage={onDeleteMessage}
    />
  );
});

QuestionCard.displayName = 'QuestionCard';
