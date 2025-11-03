export interface AlunoAula {
  id: number;
  nome: string;
  professor: string;
  horario: string;
  cor: string;
}

export interface AlunoNota {
  materia: string;
  n1: number | null;
  n2: number | null;
  n3: number | null;
  n4: number | null;
}

export interface AlunoPresencaData {
  totalAulas: number;
  presencas: number;
  faltas: number;
  historicoFaltas: { data: string; materia: string; }[];
}

export const alunoAulas: AlunoAula[] = [
  { id: 1, nome: 'Matemática', professor: 'Prof. Bruno Costa', horario: 'Seg, 07:30 - 09:10', cor: 'bg-blue-500' },
  { id: 2, nome: 'Física', professor: 'Prof. Daniel Alves', horario: 'Ter, 09:30 - 11:10', cor: 'bg-orange-500' },
  { id: 3, nome: 'Química', professor: 'Prof. Marcos Oliveira', horario: 'Qua, 07:30 - 09:10', cor: 'bg-green-500' },
  { id: 4, nome: 'Português', professor: 'Prof. Ana Silva', horario: 'Qui, 09:30 - 11:10', cor: 'bg-red-500' },
  { id: 5, nome: 'História', professor: 'Prof. Vitor Ribeiro', horario: 'Sex, 07:30 - 09:10', cor: 'bg-purple-500' },
  { id: 6, nome: 'Geografia', professor: 'Prof. Carla Dias', horario: 'Seg, 09:30 - 11:10', cor: 'bg-yellow-500' },
];

export const alunoNotas: AlunoNota[] = [
  { materia: 'Matemática', n1: 8.5, n2: 7.0, n3: 9.0, n4: 7.5 },
  { materia: 'Física', n1: 7.0, n2: 6.5, n3: 8.0, n4: 9.0 },
  { materia: 'Química', n1: 9.0, n2: 9.5, n3: 10.0, n4: 8.5 },
  { materia: 'Português', n1: 6.0, n2: 7.5, n3: 7.0, n4: 6.5 },
  { materia: 'História', n1: 10.0, n2: 9.0, n3: 9.5, n4: 10.0 },
  { materia: 'Geografia', n1: 5.5, n2: 4.0, n3: 6.0, n4: 7.0 },
];

export const alunoPresencaData: AlunoPresencaData = {
  totalAulas: 250,
  presencas: 242,
  faltas: 8,
  historicoFaltas: [
    { data: '2023-03-15', materia: 'Física' },
    { data: '2023-04-01', materia: 'Português' },
    { data: '2023-04-22', materia: 'Matemática' },
    { data: '2023-05-10', materia: 'Física' },
    { data: '2023-05-12', materia: 'Geografia' },
  ],
};