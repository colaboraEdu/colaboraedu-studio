export interface AlunoOrientador {
  id: number;
  nome: string;
  serie: string;
  email: string;
  ultimoAtendimento: string;
  nivelRisco: 'Baixo' | 'Médio' | 'Alto';
  avatar: string;
}

export interface Atendimento {
  id: number;
  aluno: string;
  data: string;
  horario: string;
  tipo: string;
}

export interface Ocorrencia {
  id: number;
  aluno: string;
  data: string;
  tipo: 'Comportamental' | 'Acadêmica' | 'Frequência' | 'Social';
  status: 'Em Aberto' | 'Resolvida' | 'Arquivada';
  avatar: string;
}

export const orientadorStats = {
  totalAlunos: 42,
  atendimentosHoje: 3,
  ocorrenciasAbertas: 5,
  proximosCompromissos: 2,
};

export const orientadorAlunos: AlunoOrientador[] = [
  { id: 1, nome: 'Carla Dias', serie: '9º Ano A', email: 'carla.dias@example.com', ultimoAtendimento: '2023-10-15', nivelRisco: 'Baixo', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: 2, nome: 'Eduarda Lima', serie: '2º Ano B', email: 'eduarda.lima@example.com', ultimoAtendimento: '2023-10-20', nivelRisco: 'Médio', avatar: 'https://i.pravatar.cc/150?u=5' },
  { id: 3, nome: 'Heitor Rocha', serie: '8º Ano C', email: 'heitor.rocha@example.com', ultimoAtendimento: '2023-09-28', nivelRisco: 'Alto', avatar: 'https://i.pravatar.cc/150?u=8' },
  { id: 4, nome: 'Isabela Santos', serie: '1º Ano A', email: 'isabela.santos@example.com', ultimoAtendimento: '2023-10-22', nivelRisco: 'Baixo', avatar: 'https://i.pravatar.cc/150?u=9' },
  { id: 5, nome: 'Larissa Mendes', serie: '3º Ano B', email: 'larissa.mendes@example.com', ultimoAtendimento: '2023-10-05', nivelRisco: 'Médio', avatar: 'https://i.pravatar.cc/150?u=11' },
  { id: 6, nome: 'Otávio Rodrigues', serie: '9º Ano B', email: 'otavio.rodrigues@example.com', ultimoAtendimento: '2023-10-18', nivelRisco: 'Baixo', avatar: 'https://i.pravatar.cc/150?u=14' },
  { id: 7, nome: 'Sofia Gonçalves', serie: '2º Ano A', email: 'sofia.goncalves@example.com', ultimoAtendimento: '2023-10-01', nivelRisco: 'Alto', avatar: 'https://i.pravatar.cc/150?u=17' },
  { id: 8, nome: 'Aluno Teste 1', serie: '1º Ano C', email: 'teste1@example.com', ultimoAtendimento: '2023-10-25', nivelRisco: 'Baixo', avatar: 'https://i.pravatar.cc/150?u=21' },
  { id: 9, nome: 'Aluna Teste 2', serie: '3º Ano A', email: 'teste2@example.com', ultimoAtendimento: '2023-10-26', nivelRisco: 'Médio', avatar: 'https://i.pravatar.cc/150?u=22' },
  { id: 10, nome: 'Aluno Teste 3', serie: '7º Ano B', email: 'teste3@example.com', ultimoAtendimento: '2023-10-27', nivelRisco: 'Alto', avatar: 'https://i.pravatar.cc/150?u=23' },
];

export const proximosAtendimentos: Atendimento[] = [
    { id: 1, aluno: 'Heitor Rocha', data: 'Hoje', horario: '14:00', tipo: 'Orientação Vocacional' },
    { id: 2, aluno: 'Sofia Gonçalves', data: 'Amanhã', horario: '10:30', tipo: 'Acompanhamento Pedagógico' },
];

export const ocorrencias: Ocorrencia[] = [
  { id: 1, aluno: 'Heitor Rocha', data: '2023-10-25', tipo: 'Comportamental', status: 'Em Aberto', avatar: 'https://i.pravatar.cc/150?u=8' },
  { id: 2, aluno: 'Sofia Gonçalves', data: '2023-10-22', tipo: 'Acadêmica', status: 'Resolvida', avatar: 'https://i.pravatar.cc/150?u=17' },
  { id: 3, aluno: 'Eduarda Lima', data: '2023-10-20', tipo: 'Frequência', status: 'Em Aberto', avatar: 'https://i.pravatar.cc/150?u=5' },
  { id: 4, aluno: 'Heitor Rocha', data: '2023-10-18', tipo: 'Social', status: 'Arquivada', avatar: 'https://i.pravatar.cc/150?u=8' },
  { id: 5, aluno: 'Larissa Mendes', data: '2023-10-15', tipo: 'Acadêmica', status: 'Em Aberto', avatar: 'https://i.pravatar.cc/150?u=11' },
  { id: 6, aluno: 'Carla Dias', data: '2023-10-12', tipo: 'Comportamental', status: 'Resolvida', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: 7, aluno: 'Aluno Teste 3', data: '2023-10-10', tipo: 'Frequência', status: 'Em Aberto', avatar: 'https://i.pravatar.cc/150?u=23' },
];
