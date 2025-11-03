export type User = {
  id: number;
  name: string;
  email: string;
  role: 'Administrador' | 'Professor' | 'Aluno' | 'Coordenador' | 'Secretário(a)' | 'Orientador' | 'Bibliotecário' | 'Responsável';
  status: 'Ativo' | 'Inativo';
  avatar: string;
  createdAt: string;
};

export const mockUsers: User[] = [
  { id: 1, name: 'Ana Silva', email: 'ana.silva@example.com', role: 'Administrador', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=1', createdAt: '2023-01-15' },
  { id: 2, name: 'Bruno Costa', email: 'bruno.costa@example.com', role: 'Professor', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=2', createdAt: '2023-02-20' },
  { id: 3, name: 'Carla Dias', email: 'carla.dias@example.com', role: 'Aluno', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=3', createdAt: '2023-03-10' },
  { id: 4, name: 'Daniel Alves', email: 'daniel.alves@example.com', role: 'Professor', status: 'Inativo', avatar: 'https://i.pravatar.cc/150?u=4', createdAt: '2023-01-30' },
  { id: 5, name: 'Eduarda Lima', email: 'eduarda.lima@example.com', role: 'Aluno', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=5', createdAt: '2023-03-11' },
  { id: 6, name: 'Fábio Melo', email: 'fabio.melo@example.com', role: 'Coordenador', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=6', createdAt: '2023-01-05' },
  { id: 7, name: 'Gabriela Neves', email: 'gabriela.neves@example.com', role: 'Secretário(a)', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=7', createdAt: '2023-02-01' },
  { id: 8, name: 'Heitor Rocha', email: 'heitor.rocha@example.com', role: 'Aluno', status: 'Inativo', avatar: 'https://i.pravatar.cc/150?u=8', createdAt: '2023-03-12' },
  { id: 9, name: 'Isabela Santos', email: 'isabela.santos@example.com', role: 'Aluno', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=9', createdAt: '2023-03-14' },
  { id: 10, name: 'João Pereira', email: 'joao.pereira@example.com', role: 'Responsável', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=10', createdAt: '2023-04-01' },
  { id: 11, name: 'Larissa Mendes', email: 'larissa.mendes@example.com', role: 'Aluno', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=11', createdAt: '2023-05-02' },
  { id: 12, name: 'Marcos Oliveira', email: 'marcos.oliveira@example.com', role: 'Professor', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=12', createdAt: '2023-05-03' },
  { id: 13, name: 'Natália Souza', email: 'natalia.souza@example.com', role: 'Bibliotecário', status: 'Inativo', avatar: 'https://i.pravatar.cc/150?u=13', createdAt: '2023-05-04' },
  { id: 14, name: 'Otávio Rodrigues', email: 'otavio.rodrigues@example.com', role: 'Aluno', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=14', createdAt: '2023-05-05' },
  { id: 15, name: 'Patrícia Ferreira', email: 'patricia.ferreira@example.com', role: 'Orientador', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=15', createdAt: '2023-05-06' },
  { id: 16, name: 'Ricardo Almeida', email: 'ricardo.almeida@example.com', role: 'Responsável', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=16', createdAt: '2023-05-07' },
  { id: 17, name: 'Sofia Gonçalves', email: 'sofia.goncalves@example.com', role: 'Aluno', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=17', createdAt: '2023-05-08' },
  { id: 18, name: 'Thiago Martins', email: 'thiago.martins@example.com', role: 'Secretário(a)', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=18', createdAt: '2023-05-09' },
  { id: 19, name: 'Úrsula Barbosa', email: 'ursula.barbosa@example.com', role: 'Coordenador', status: 'Inativo', avatar: 'https://i.pravatar.cc/150?u=19', createdAt: '2023-05-10' },
  { id: 20, name: 'Vitor Ribeiro', email: 'vitor.ribeiro@example.com', role: 'Professor', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=20', createdAt: '2023-05-11' },
];