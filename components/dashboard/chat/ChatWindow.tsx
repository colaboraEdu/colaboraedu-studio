import React, { useState, useEffect, useRef } from 'react';
import { Contact, Message, currentUserId } from '../../../chatData';
import { ChatMessage } from './ChatMessage';
import type { UserProfile } from '../../../types';

interface ChatWindowProps {
  contact: Contact;
  conversation: Message[];
  onSendMessage: (text: string) => void;
  colorClasses: UserProfile['colorClasses'];
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ contact, conversation, onSendMessage, colorClasses }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [conversation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img className="h-12 w-12 rounded-full" src={contact.avatar} alt={contact.name} />
             {contact.online && (
                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
            )}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-800">{contact.name}</p>
            <p className="text-sm text-gray-500">{contact.online ? 'Online' : 'Offline'}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          {conversation.map(message => (
            <ChatMessage
              key={message.id}
              message={message}
              isSent={message.senderId === currentUserId}
              colorClasses={colorClasses}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex items-center space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite uma mensagem..."
            className={`flex-1 block w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${colorClasses.ring} ${colorClasses.focusBorder} sm:text-sm`}
          />
          <button
            type="submit"
            className={`flex-shrink-0 inline-flex items-center justify-center h-12 w-12 rounded-full text-white ${colorClasses.button} ${colorClasses.buttonHover} focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorClasses.ring}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};
