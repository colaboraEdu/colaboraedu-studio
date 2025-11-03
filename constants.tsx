import React from 'react';
import type { UserProfile } from './types';

const iconClasses = "h-8 w-8 text-white";

export const PROFILES: UserProfile[] = [
  {
    id: 'admin',
    name: 'Administrador',
    description: 'Gerencia todo o sistema educacional, usuários e configurações globais.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
      </svg>
    ),
    colorClasses: {
      bg: 'bg-teal-100',
      text: 'text-teal-600',
      ring: 'ring-teal-500',
      button: 'bg-teal-500',
      buttonHover: 'hover:bg-teal-600',
      focusBorder: 'focus:border-teal-500'
    }
  },
  {
    id: 'professor',
    name: 'Professor',
    description: 'Cria e gerencia aulas, avalia alunos e acompanha o progresso acadêmico.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    colorClasses: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      ring: 'ring-green-500',
      button: 'bg-green-500',
      buttonHover: 'hover:bg-green-600',
      focusBorder: 'focus:border-green-500'
    }
  },
  {
    id: 'aluno',
    name: 'Aluno',
    description: 'Acessa materiais, participa de aulas e acompanha seu desempenho.',
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    colorClasses: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      ring: 'ring-blue-500',
      button: 'bg-blue-500',
      buttonHover: 'hover:bg-blue-600',
      focusBorder: 'focus:border-blue-500'
    }
  },
  {
    id: 'coordenador',
    name: 'Coordenador',
    description: 'Supervisiona departamentos, gerencia currículos e coordena equipes.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962A3 3 0 013 11.175V6.75a3 3 0 013-3h7.5a3 3 0 013 3v4.425m0 0A3 3 0 0118 18.72m-7.5 2.962A3 3 0 013 18.72m0-12v12m15-12v12" />
      </svg>
    ),
    colorClasses: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      ring: 'ring-orange-500',
      button: 'bg-orange-500',
      buttonHover: 'hover:bg-orange-600',
      focusBorder: 'focus:border-orange-500'
    }
  },
  {
    id: 'secretario',
    name: 'Secretário(a)',
    description: 'Gerencia documentos, matrículas e comunicação administrativa.',
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    colorClasses: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      ring: 'ring-red-500',
      button: 'bg-red-500',
      buttonHover: 'hover:bg-red-600',
      focusBorder: 'focus:border-red-500'
    }
  },
  {
    id: 'orientador',
    name: 'Orientador',
    description: 'Acompanha desenvolvimento dos alunos, oferece suporte pedagógico e orienta trajetórias educacionais.',
     icon: (
       <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.07 1.916l-7.5 4.25a2.25 2.25 0 01-2.36 0L3.32 15.219a2.25 2.25 0 01-1.07-1.916V9.61a2.25 2.25 0 011.07-1.916l7.5-4.25a2.25 2.25 0 012.36 0L19.5 7.382z" />
      </svg>
    ),
    colorClasses: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      ring: 'ring-purple-500',
      button: 'bg-purple-500',
      buttonHover: 'hover:bg-purple-600',
      focusBorder: 'focus:border-purple-500'
    }
  },
  {
    id: 'bibliotecario',
    name: 'Bibliotecário',
    description: 'Gerencia acervo, empréstimos e recursos de aprendizagem.',
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
    colorClasses: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-600',
      ring: 'ring-indigo-500',
      button: 'bg-indigo-500',
      buttonHover: 'hover:bg-indigo-600',
      focusBorder: 'focus:border-indigo-500'
    }
  },
  {
    id: 'responsavel',
    name: 'Responsável',
    description: 'Acompanha progresso dos alunos e gerencia informações familiares.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962A3 3 0 013 11.175V6.75a3 3 0 013-3h7.5a3 3 0 013 3v4.425m0 0A3 3 0 0118 18.72m-7.5 2.962A3 3 0 013 18.72m0-12v12m15-12v12" />
      </svg>
    ),
    colorClasses: {
      bg: 'bg-cyan-100',
      text: 'text-cyan-600',
      ring: 'ring-cyan-500',
      button: 'bg-cyan-500',
      buttonHover: 'hover:bg-cyan-600',
      focusBorder: 'focus:border-cyan-500'
    }
  }
];
