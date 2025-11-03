export interface Turma {
  id: number;
  nome: string;
  serie: string;
  alunos: number;
  periodo: 'Manhã' | 'Tarde';
  horario: string;
}

export const professorTurmas: Turma[] = [
  { id: 1, nome: 'Matemática', serie: '9º Ano A', alunos: 32, periodo: 'Manhã', horario: '07:30 - 09:10' },
  { id: 2, nome: 'Matemática', serie: '9º Ano B', alunos: 31, periodo: 'Manhã', horario: '09:30 - 11:10' },
  { id: 3, nome: 'Física', serie: '2º Ano A', alunos: 28, periodo: 'Tarde', horario: '13:30 - 15:10' },
  { id: 4, nome: 'Física', serie: '2º Ano C', alunos: 29, periodo: 'Tarde', horario: '15:30 - 17:10' },
  { id: 5, nome: 'Álgebra Linear', serie: '3º Ano B', alunos: 25, periodo: 'Manhã', horario: '11:10 - 12:00' },
];

export const professorStats = {
  totalTurmas: professorTurmas.length,
  totalAlunos: professorTurmas.reduce((acc, turma) => acc + turma.alunos, 0),
};
