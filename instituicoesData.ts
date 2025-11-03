export interface Institution {
  id: number;
  name: string;
  cnpj: string;
  city: string;
  state: string;
  status: 'Ativa' | 'Inativa' | 'Pendente';
  logo: string;
}

export const institutionsData: Institution[] = [
  { id: 1, name: 'Colégio Vanguarda', cnpj: '12.345.678/0001-99', city: 'São Paulo', state: 'SP', status: 'Ativa', logo: 'https://placehold.co/40x40/3B82F6/FFF?text=V' },
  { id: 2, name: 'Escola Horizonte', cnpj: '98.765.432/0001-11', city: 'Rio de Janeiro', state: 'RJ', status: 'Ativa', logo: 'https://placehold.co/40x40/10B981/FFF?text=H' },
  { id: 3, name: 'Instituto Aprender Mais', cnpj: '55.666.777/0001-22', city: 'Belo Horizonte', state: 'MG', status: 'Pendente', logo: 'https://placehold.co/40x40/FBBF24/FFF?text=A' },
  { id: 4, name: 'Centro Educacional Saber', cnpj: '33.444.555/0001-33', city: 'Curitiba', state: 'PR', status: 'Ativa', logo: 'https://placehold.co/40x40/F59E0B/FFF?text=S' },
  { id: 5, name: 'Escola Primária Futuro Brilhante', cnpj: '11.222.333/0001-44', city: 'Salvador', state: 'BA', status: 'Inativa', logo: 'https://placehold.co/40x40/EF4444/FFF?text=F' },
  { id: 6, name: 'Colégio Delta', cnpj: '44.555.666/0001-55', city: 'Porto Alegre', state: 'RS', status: 'Ativa', logo: 'https://placehold.co/40x40/8B5CF6/FFF?text=D' },
  { id: 7, name: 'Escola Nova Geração', cnpj: '77.888.999/0001-66', city: 'Fortaleza', state: 'CE', status: 'Ativa', logo: 'https://placehold.co/40x40/34D399/FFF?text=N' },
  { id: 8, name: 'Academia do Conhecimento', cnpj: '22.333.444/0001-77', city: 'Manaus', state: 'AM', status: 'Pendente', logo: 'https://placehold.co/40x40/6366F1/FFF?text=C' },
  { id: 9, name: 'Liceu de Artes e Ofícios', cnpj: '66.777.888/0001-88', city: 'Recife', state: 'PE', status: 'Ativa', logo: 'https://placehold.co/40x40/EC4899/FFF?text=L' },
  { id: 10, name: 'Escola Montessoriana', cnpj: '99.000.111/0001-99', city: 'Goiânia', state: 'GO', status: 'Inativa', logo: 'https://placehold.co/40x40/84CC16/FFF?text=M' },
  { id: 11, name: 'Colégio Objetivo Central', cnpj: '10.203.405/0001-12', city: 'Brasília', state: 'DF', status: 'Ativa', logo: 'https://placehold.co/40x40/F97316/FFF?text=O' },
  { id: 12, name: 'Escola Técnica Estadual', cnpj: '50.607.809/0001-34', city: 'Vitória', state: 'ES', status: 'Ativa', logo: 'https://placehold.co/40x40/14B8A6/FFF?text=E' },
];
