export interface Filho {
  id: number;
  nome: string;
  serie: string;
  avatar: string;
  desempenho: 'Bom' | 'Regular' | 'Atenção';
  cor: string;
}

export interface Boletim {
  filhoId: number;
  notas: { materia: string; n1: number; n2: number; n3: number; n4: number; }[];
}

export interface Frequencia {
   filhoId: number;
   totalAulas: number;
   presencas: number;
   faltas: number;
}

export interface Pagamento {
  id: number;
  referencia: string;
  vencimento: string;
  valor: number;
  status: 'Pago' | 'Pendente' | 'Atrasado';
}

export const filhos: Filho[] = [
    { id: 1, nome: 'Carla Dias', serie: '9º Ano A', avatar: 'https://i.pravatar.cc/150?u=3', desempenho: 'Bom', cor: 'border-green-500' },
    { id: 2, nome: 'Heitor Rocha', serie: '8º Ano C', avatar: 'https://i.pravatar.cc/150?u=8', desempenho: 'Atenção', cor: 'border-red-500' },
];

export const boletins: Boletim[] = [
    {
        filhoId: 1,
        notas: [
            { materia: 'Matemática', n1: 9.0, n2: 8.5, n3: 9.5, n4: 8.0 },
            { materia: 'Português', n1: 8.0, n2: 7.5, n3: 8.5, n4: 9.0 },
            { materia: 'Ciências', n1: 9.5, n2: 9.0, n3: 10.0, n4: 9.0 },
        ]
    },
    {
        filhoId: 2,
        notas: [
            { materia: 'Matemática', n1: 6.0, n2: 5.5, n3: 7.0, n4: 6.5 },
            { materia: 'Português', n1: 7.0, n2: 6.5, n3: 6.0, n4: 7.5 },
            { materia: 'Ciências', n1: 5.0, n2: 6.0, n3: 5.5, n4: 6.5 },
        ]
    }
];

export const frequencias: Frequencia[] = [
    { filhoId: 1, totalAulas: 250, presencas: 248, faltas: 2 },
    { filhoId: 2, totalAulas: 250, presencas: 235, faltas: 15 },
];

export const pagamentos: Pagamento[] = [
    { id: 1, referencia: 'Outubro/2023', vencimento: '2023-10-10', valor: 850.00, status: 'Pago' },
    { id: 2, referencia: 'Setembro/2023', vencimento: '2023-09-10', valor: 850.00, status: 'Pago' },
    { id: 3, referencia: 'Agosto/2023', vencimento: '2023-08-10', valor: 850.00, status: 'Pago' },
    { id: 4, referencia: 'Julho/2023', vencimento: '2023-07-10', valor: 800.00, status: 'Pago' },
];