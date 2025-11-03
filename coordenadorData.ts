export interface Professor {
  id: number;
  name: string;
  email: string;
  departamento: string;
  especialidade: string;
  status: 'Ativo' | 'Inativo';
  avatar: string;
}

export const coordenadorStats = {
  totalDepartamentos: 5,
  totalProfessores: 12,
  projetosAtivos: 8,
  reunioesAgendadas: 3,
};

export const departamentos = [
    { id: 1, nome: 'Ciências Exatas', chefe: 'Prof. Bruno Costa' },
    { id: 2, nome: 'Ciências Humanas', chefe: 'Prof. Ana Silva' },
    { id: 3, nome: 'Linguagens e Códigos', chefe: 'Prof. Vitor Ribeiro' },
    { id: 4, nome: 'Ciências da Natureza', chefe: 'Prof. Marcos Oliveira' },
    { id: 5, nome: 'Artes e Educação Física', chefe: 'Prof. Daniel Alves' },
];

export const coordenadorProfessores: Professor[] = [
  { id: 1, name: 'Bruno Costa', email: 'bruno.costa@example.com', departamento: 'Ciências Exatas', especialidade: 'Matemática', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 2, name: 'Daniel Alves', email: 'daniel.alves@example.com', departamento: 'Artes e Educação Física', especialidade: 'Educação Física', status: 'Inativo', avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: 3, name: 'Marcos Oliveira', email: 'marcos.oliveira@example.com', departamento: 'Ciências da Natureza', especialidade: 'Química', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=12' },
  { id: 4, name: 'Vitor Ribeiro', email: 'vitor.ribeiro@example.com', departamento: 'Linguagens e Códigos', especialidade: 'Português', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=20' },
  { id: 5, name: 'Ana Silva', email: 'ana.silva@example.com', departamento: 'Ciências Humanas', especialidade: 'História', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 6, name: 'Carla Dias', email: 'carla.dias@example.com', departamento: 'Ciências Humanas', especialidade: 'Geografia', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: 7, name: 'Fábio Melo', email: 'fabio.melo@example.com', departamento: 'Ciências Exatas', especialidade: 'Física', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=6' },
  { id: 8, name: 'Gabriela Neves', email: 'gabriela.neves@example.com', departamento: 'Linguagens e Códigos', especialidade: 'Inglês', status: 'Inativo', avatar: 'https://i.pravatar.cc/150?u=7' },
  { id: 9, name: 'Heitor Rocha', email: 'heitor.rocha@example.com', departamento: 'Ciências da Natureza', especialidade: 'Biologia', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=8' },
  { id: 10, name: 'Isabela Santos', email: 'isabela.santos@example.com', departamento: 'Artes e Educação Física', especialidade: 'Artes', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=9' },
  { id: 11, name: 'João Pereira', email: 'joao.pereira@example.com', departamento: 'Ciências Humanas', especialidade: 'Sociologia', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=10' },
  { id: 12, name: 'Larissa Mendes', email: 'larissa.mendes@example.com', departamento: 'Ciências Humanas', especialidade: 'Filosofia', status: 'Ativo', avatar: 'https://i.pravatar.cc/150?u=11' },
];
