export interface Contact {
  id: number;
  name: string;
  avatar: string;
  online: boolean;
  role: string;
}

export interface Message {
  id: number;
  text: string;
  timestamp: string;
  senderId: number; // 0 for current user, other for contact
  status: 'sent' | 'delivered' | 'read';
}

// Current user is always senderId: 0
export const currentUserId = 0;

export const mockContacts: Contact[] = [
  { id: 1, name: 'Ana Silva (Admin)', avatar: 'https://i.pravatar.cc/150?u=1', online: true, role: 'Administrador' },
  { id: 2, name: 'Bruno Costa (Prof.)', avatar: 'https://i.pravatar.cc/150?u=2', online: false, role: 'Professor' },
  { id: 3, name: 'Carla Dias (Aluna)', avatar: 'https://i.pravatar.cc/150?u=3', online: true, role: 'Aluno' },
  { id: 6, name: 'Fábio Melo (Coord.)', avatar: 'https://i.pravatar.cc/150?u=6', online: true, role: 'Coordenador' },
  { id: 7, name: 'Gabriela Neves (Sec.)', avatar: 'https://i.pravatar.cc/150?u=7', online: false, role: 'Secretário(a)' },
];

export const mockConversations: Record<number, Message[]> = {
  1: [
    { id: 1, text: 'Olá! Preciso de ajuda para resetar a senha de um professor. Você pode me ajudar?', senderId: 0, timestamp: '10:30', status: 'read' },
    { id: 2, text: 'Olá! Claro, qual o nome do professor?', senderId: 1, timestamp: '10:31', status: 'delivered' },
    { id: 3, text: 'É o professor Daniel Alves.', senderId: 0, timestamp: '10:32', status: 'read' },
    { id: 4, text: 'Pronto, senha resetada. O acesso temporário é "mudar123". Peça para ele alterar assim que acessar.', senderId: 1, timestamp: '10:33', status: 'delivered' },
  ],
  2: [
    { id: 1, text: 'Professor Bruno, bom dia! A nota da minha prova já foi lançada?', senderId: 0, timestamp: '09:15', status: 'read' },
    { id: 2, text: 'Bom dia! Ainda não, estou terminando as correções. Acredito que até o final da tarde todas as notas estarão no sistema.', senderId: 2, timestamp: '09:18', status: 'delivered' },
  ],
  3: [
    { id: 1, text: 'Oi Carla, tudo bem? Você pegou o material da aula de hoje?', senderId: 0, timestamp: '14:00', status: 'sent' },
  ],
  6: [
    { id: 1, text: 'Fábio, a pauta da reunião de coordenadores já está disponível?', senderId: 0, timestamp: 'Ontem', status: 'read' },
    { id: 2, text: 'Sim, enviei para o seu e-mail agora há pouco. Por favor, confirme o recebimento.', senderId: 6, timestamp: 'Ontem', status: 'delivered' },
  ],
  7: [],
};
