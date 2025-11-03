export interface Matricula {
  id: number;
  aluno: string;
  curso: string;
  data: string;
  status: 'Pendente' | 'Concluída' | 'Cancelada';
}

export interface Documento {
  id: number;
  nome: string;
  tipo: 'Histórico Escolar' | 'Declaração' | 'Requerimento';
  dataEnvio: string;
  status: 'Recebido' | 'Em Análise' | 'Aprovado';
}

export const secretarioStats = {
  novasMatriculas: 12,
  documentosPendentes: 8,
  certificadosEmitidos: 45,
  comunicadosEnviados: 7,
};

export const recentesMatriculas: Matricula[] = [
  { id: 101, aluno: 'Sofia Gonçalves', curso: '3º Ano - Ensino Médio', data: '2023-10-28', status: 'Pendente' },
  { id: 102, aluno: 'Otávio Rodrigues', curso: '9º Ano - Ensino Fundamental', data: '2023-10-27', status: 'Concluída' },
  { id: 103, aluno: 'Larissa Mendes', curso: '1º Ano - Ensino Médio', data: '2023-10-27', status: 'Pendente' },
  { id: 104, aluno: 'Heitor Rocha', curso: '8º Ano - Ensino Fundamental', data: '2023-10-26', status: 'Cancelada' },
  { id: 105, aluno: 'Eduarda Lima', curso: '2º Ano - Ensino Médio', data: '2023-10-25', status: 'Concluída' },
];

export const documentos: Documento[] = [
  { id: 201, nome: 'Histórico - Carla Dias', tipo: 'Histórico Escolar', dataEnvio: '2023-10-20', status: 'Aprovado' },
  { id: 202, nome: 'Declaração de Matrícula - Sofia G.', tipo: 'Declaração', dataEnvio: '2023-10-25', status: 'Em Análise' },
  { id: 203, nome: 'Requerimento de Transferência - O. R.', tipo: 'Requerimento', dataEnvio: '2023-10-26', status: 'Recebido' },
  { id: 204, nome: 'Histórico - Heitor Rocha', tipo: 'Histórico Escolar', dataEnvio: '2023-10-22', status: 'Aprovado' },
];
