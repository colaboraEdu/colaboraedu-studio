export interface Livro {
  id: number;
  titulo: string;
  autor: string;
  genero: string;
  copiasDisponiveis: number;
  status: 'Disponível' | 'Emprestado';
}

export interface Emprestimo {
  id: number;
  livro: string;
  aluno: string;
  dataEmprestimo: string;
  dataDevolucao: string;
  status: 'No prazo' | 'Atrasado';
}

export const bibliotecarioStats = {
  totalLivros: 2350,
  livrosEmprestados: 128,
  devolucoesAtrasadas: 15,
  reservasAtivas: 22,
};

export const acervo: Livro[] = [
  { id: 1, titulo: 'O Senhor dos Anéis', autor: 'J.R.R. Tolkien', genero: 'Fantasia', copiasDisponiveis: 3, status: 'Disponível' },
  { id: 2, titulo: 'Dom Quixote', autor: 'Miguel de Cervantes', genero: 'Romance', copiasDisponiveis: 0, status: 'Emprestado' },
  { id: 3, titulo: '1984', autor: 'George Orwell', genero: 'Ficção Científica', copiasDisponiveis: 5, status: 'Disponível' },
  { id: 4, titulo: 'A Arte da Guerra', autor: 'Sun Tzu', genero: 'Estratégia', copiasDisponiveis: 2, status: 'Disponível' },
  { id: 5, titulo: 'O Pequeno Príncipe', autor: 'Antoine de Saint-Exupéry', genero: 'Infantil', copiasDisponiveis: 0, status: 'Emprestado' },
  { id: 6, titulo: 'Memórias Póstumas de Brás Cubas', autor: 'Machado de Assis', genero: 'Romance', copiasDisponiveis: 4, status: 'Disponível' },
  { id: 7, titulo: 'A Revolução dos Bichos', autor: 'George Orwell', genero: 'Sátira', copiasDisponiveis: 1, status: 'Disponível' },
  { id: 8, titulo: 'Cem Anos de Solidão', autor: 'Gabriel García Márquez', genero: 'Realismo Mágico', copiasDisponiveis: 0, status: 'Emprestado' },
  { id: 9, titulo: 'O Alquimista', autor: 'Paulo Coelho', genero: 'Autoajuda', copiasDisponiveis: 6, status: 'Disponível' },
  { id: 10, titulo: 'Sapiens: Uma Breve História da Humanidade', autor: 'Yuval Noah Harari', genero: 'Não-ficção', copiasDisponiveis: 3, status: 'Disponível' },
  { id: 11, titulo: 'O Guia do Mochileiro das Galáxias', autor: 'Douglas Adams', genero: 'Ficção Científica', copiasDisponiveis: 0, status: 'Emprestado' },
  { id: 12, titulo: 'Grande Sertão: Veredas', autor: 'João Guimarães Rosa', genero: 'Romance', copiasDisponiveis: 2, status: 'Disponível' },
];

export const emprestimos: Emprestimo[] = [
    { id: 101, livro: 'Dom Quixote', aluno: 'Carla Dias', dataEmprestimo: '2023-10-15', dataDevolucao: '2023-10-30', status: 'No prazo' },
    { id: 102, livro: 'O Pequeno Príncipe', aluno: 'Heitor Rocha', dataEmprestimo: '2023-10-05', dataDevolucao: '2023-10-20', status: 'Atrasado' },
    { id: 103, livro: 'Cem Anos de Solidão', aluno: 'Sofia Gonçalves', dataEmprestimo: '2023-10-22', dataDevolucao: '2023-11-06', status: 'No prazo' },
    { id: 104, livro: 'O Guia do Mochileiro das Galáxias', aluno: 'Otávio Rodrigues', dataEmprestimo: '2023-09-28', dataDevolucao: '2023-10-13', status: 'Atrasado' },
    { id: 105, livro: '1984', aluno: 'Isabela Santos', dataEmprestimo: '2023-10-25', dataDevolucao: '2023-11-09', status: 'No prazo' },
];