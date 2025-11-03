import React from 'react';
import { Contact, Message } from '../../../chatData';

interface ChatSidebarProps {
  contacts: Contact[];
  conversations: Record<number, Message[]>;
  activeContactId: number | null;
  onSelectContact: (contactId: number) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ contacts, conversations, activeContactId, onSelectContact }) => {

  const getLastMessage = (contactId: number): Message | undefined => {
      const conversation = conversations[contactId];
      return conversation?.[conversation.length - 1];
  }

  return (
    <div className="w-80 border-r border-gray-200 bg-slate-800 flex flex-col">
      <div className="h-20 flex items-center px-4 border-b border-slate-700 flex-shrink-0">
        <h2 className="text-xl font-bold text-white">Conversas</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ul>
          {contacts.map(contact => {
            const lastMessage = getLastMessage(contact.id);
            return (
              <li key={contact.id}>
                <button
                  onClick={() => onSelectContact(contact.id)}
                  className={`w-full text-left p-4 flex items-center space-x-3 transition-colors duration-150 focus:outline-none ${
                    activeContactId === contact.id
                      ? 'bg-slate-700'
                      : 'hover:bg-slate-700/50'
                  }`}
                >
                  <div className="relative">
                    <img className="h-12 w-12 rounded-full" src={contact.avatar} alt={contact.name} />
                    {contact.online && (
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-slate-800" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-white truncate">{contact.name}</p>
                        {lastMessage && <p className="text-xs text-gray-400">{lastMessage.timestamp}</p>}
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {lastMessage ? lastMessage.text : 'Nenhuma mensagem ainda'}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
