import React from 'react';
import { Message } from '../../../chatData';
import type { UserProfile } from '../../../types';

interface ChatMessageProps {
  message: Message;
  isSent: boolean;
  colorClasses: UserProfile['colorClasses'];
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isSent, colorClasses }) => {
  const alignment = isSent ? 'justify-end' : 'justify-start';
  const bubbleClasses = isSent
    ? `${colorClasses.button} text-white`
    : 'bg-gray-200 text-gray-800';

  return (
    <div className={`flex items-end ${alignment}`}>
      <div className="flex flex-col space-y-1 max-w-sm">
        <div className={`px-4 py-2 rounded-2xl inline-block ${bubbleClasses} ${isSent ? 'rounded-br-none' : 'rounded-bl-none'}`}>
          <span className="text-sm">{message.text}</span>
        </div>
        <div className={`text-xs text-gray-400 ${isSent ? 'text-right' : 'text-left'}`}>
            {message.timestamp}
        </div>
      </div>
    </div>
  );
};
