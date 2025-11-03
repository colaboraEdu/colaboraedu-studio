import React, { useState, useEffect } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';
import { mockContacts, mockConversations, currentUserId, Contact, Message } from '../../../chatData';
import type { UserProfile } from '../../../types';

interface ChatDashboardProps {
  currentUserProfile: UserProfile;
}

const randomReplies = [
  "Ok, entendi.",
  "Vou verificar e já te retorno.",
  "Certo, obrigado!",
  "Pode deixar.",
  "Recebido!",
  "Legal! 😄",
  "Sem problemas.",
];

export const ChatDashboard: React.FC<ChatDashboardProps> = ({ currentUserProfile }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [conversations, setConversations] = useState<Record<number, Message[]>>({});
  const [activeContactId, setActiveContactId] = useState<number | null>(null);

  useEffect(() => {
    // Simulate fetching data
    setContacts(mockContacts);
    setConversations(mockConversations);

    // Set the first contact with messages as active by default
    const firstContactWithMessages = mockContacts.find(c => mockConversations[c.id] && mockConversations[c.id].length > 0);
    if (firstContactWithMessages) {
        setActiveContactId(firstContactWithMessages.id);
    }
  }, []);

  const handleSelectContact = (contactId: number) => {
    setActiveContactId(contactId);
  };

  const handleSendMessage = (text: string) => {
    if (!activeContactId) return;

    const newMessage: Message = {
      id: Date.now(),
      text,
      senderId: currentUserId,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    const updatedConversations = { ...conversations };
    updatedConversations[activeContactId] = [...(updatedConversations[activeContactId] || []), newMessage];
    
    setConversations(updatedConversations);
    
    // Simulate a reply
    setTimeout(() => {
        const replyText = randomReplies[Math.floor(Math.random() * randomReplies.length)];
        const replyMessage: Message = {
            id: Date.now() + 1,
            text: replyText,
            senderId: activeContactId,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'delivered',
        };
        const finalConversations = { ...updatedConversations };
         finalConversations[activeContactId] = [...(finalConversations[activeContactId] || []), replyMessage];
         setConversations(finalConversations);
    }, 1500 + Math.random() * 1000);
  };

  const activeContact = contacts.find(c => c.id === activeContactId);
  const activeConversation = activeContactId ? conversations[activeContactId] || [] : [];

  return (
    <div className="flex h-[calc(100vh-112px)] bg-white rounded-lg shadow-lg animate-fade-in overflow-hidden">
      <ChatSidebar
        contacts={contacts}
        conversations={conversations}
        activeContactId={activeContactId}
        onSelectContact={handleSelectContact}
      />
      <div className="flex-1 flex flex-col">
        {activeContact ? (
          <ChatWindow
            contact={activeContact}
            conversation={activeConversation}
            onSendMessage={handleSendMessage}
            colorClasses={currentUserProfile.colorClasses}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-gray-500">
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium">Bem-vindo ao Chat</h3>
                <p className="mt-1 text-sm">Selecione uma conversa para começar a conversar.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
