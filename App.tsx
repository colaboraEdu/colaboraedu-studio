import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiUsers, FiTrendingUp, FiZap, FiLogIn } from 'react-icons/fi';
import { useAuthService } from './src/lib/auth-service';
import { LoginForm } from './components/LoginForm';
import { Modal } from './components/Modal';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { ProfessorDashboard } from './components/dashboard/professor/ProfessorDashboard';
import { AlunoDashboard } from './components/dashboard/aluno/AlunoDashboard';
import { CoordenadorDashboard } from './components/dashboard/coordenador/CoordenadorDashboard';
import { SecretarioDashboard } from './components/dashboard/secretario/SecretarioDashboard';
import { OrientadorDashboard } from './components/dashboard/orientador/OrientadorDashboard';
import { BibliotecarioDashboard } from './components/dashboard/bibliotecario/BibliotecarioDashboard';
import { ResponsavelDashboard } from './components/dashboard/responsavel/ResponsavelDashboard';
import { PlaceholderDashboard } from './components/dashboard/PlaceholderDashboard';
import { toast, Toaster } from 'sonner';
import { PROFILES } from './constants';

// Logo Component with proper branding
const Logo = ({ className, size = 'default' }: { className?: string; size?: 'small' | 'default' | 'large' | 'hero' }) => {
  const sizes = {
    small: 'h-10',
    default: 'h-16',
    large: 'h-20',
    hero: 'h-24'
  };
  
  return (
    <motion.div 
      className={`flex items-center ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`${sizes[size]} flex items-center justify-center`}>
        <span className="text-2xl font-bold text-white">colaboraEDU</span>
      </div>
    </motion.div>
  );
};

// Feature Badge Component
const FeatureBadge = ({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string; size?: number }> ; text: string }) => (
  <motion.div
    className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
    transition={{ duration: 0.2 }}
  >
    <Icon className="text-blue-300 w-4 h-4" />
    <span className="text-sm text-white font-medium">{text}</span>
  </motion.div>
);

// Stats Component
const StatsSection = () => {
  const stats = [
    { value: '10k+', label: 'Alunos Ativos', color: 'from-blue-500 to-cyan-500' },
    { value: '500+', label: 'Professores', color: 'from-green-500 to-emerald-500' },
    { value: '98%', label: 'Satisfação', color: 'from-orange-500 to-amber-500' },
    { value: '24/7', label: 'Suporte', color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl mx-auto mb-16">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative group"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
          <div className="relative bg-white rounded-2xl p-6 text-center shadow-xl">
            <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}
            </div>
            <div className="text-sm text-slate-600 mt-2 font-medium">{stat.label}</div>
          </div>
        </motion.div>
      ))}
  </div>
);
};

// Modern Footer Component
const Footer = () => (
  <footer className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 mt-auto">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="col-span-1 md:col-span-2">
          <div className="h-14 mb-4 flex items-center">
            <span className="text-2xl font-bold text-white">colaboraEDU</span>
          </div>
          <p className="text-slate-400 text-sm max-w-md">
            Transformando a educação através da tecnologia. Uma plataforma completa para gestão educacional moderna e eficiente.
          </p>
          <div className="flex gap-4 mt-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <span className="text-xl">📘</span>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <span className="text-xl">🐦</span>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <span className="text-xl">📸</span>
            </a>
          </div>
        </div>
        
        <div>
          <h3 className="font-bold mb-4 text-white">Produto</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Funcionalidades</a></li>
            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Preços</a></li>
            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Integrações</a></li>
            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">FAQ</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-bold mb-4 text-white">Empresa</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Sobre Nós</a></li>
            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Blog</a></li>
            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Carreiras</a></li>
            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Contato</a></li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-slate-400">
        &copy; {new Date().getFullYear()} colaboraEDU. Todos os direitos reservados.
      </p>
        <div className="flex gap-6 text-sm">
          <a href="#" className="text-slate-400 hover:text-white transition-colors">Termos de Uso</a>
          <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacidade</a>
          <a href="#" className="text-slate-400 hover:text-white transition-colors">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
);

const App: React.FC = () => {
  const { 
    isAuthenticated, 
    user, 
    isLoading: authLoading, 
    initializeAuth,
    logout
  } = useAuthService();
  
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Initialize authentication on app start - ONLY ONCE
  useEffect(() => {
    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - run only once on mount

  const handleLoginSuccess = useCallback(() => {
    setShowLoginModal(false);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  // Show loading while checking auth or if auth state is inconsistent
  if (authLoading || (isAuthenticated && !user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-slate-600 font-medium">
            {authLoading ? 'Carregando...' : 'Verificando dados do usuário...'}
          </p>
        </div>
      </div>
    );
  }

  // Show dashboard if authenticated
  if (isAuthenticated && user) {
    // Find the matching profile
    const userProfile = PROFILES.find(profile => profile.id === user.role);
    
    if (!userProfile) {
      console.error('Profile not found for role:', user.role);
      toast.error(`Perfil não encontrado: ${user.role}`);
      return <PlaceholderDashboard profile={{
        id: user.role,
        name: user.role.charAt(0).toUpperCase() + user.role.slice(1),
        description: 'Perfil personalizado',
        icon: React.createElement('div', { className: 'w-8 h-8 bg-gray-500 rounded' }),
        colorClasses: {
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          ring: 'ring-gray-500',
          button: 'bg-gray-500',
          buttonHover: 'hover:bg-gray-600',
          focusBorder: 'focus:border-gray-500'
        }
      }} onLogout={handleLogout} />;
    }

    const dashboardProps = { 
      profile: userProfile, 
      onLogout: handleLogout 
    };

    try {
      switch (user.role) {
        case 'admin':
          return <AdminDashboard {...dashboardProps} />;
        case 'professor':
          return <ProfessorDashboard {...dashboardProps} />;
        case 'aluno':
          return <AlunoDashboard {...dashboardProps} />;
        case 'coordenador':
          return <CoordenadorDashboard {...dashboardProps} />;
        case 'secretario':
          return <SecretarioDashboard {...dashboardProps} />;
        case 'orientador':
          return <OrientadorDashboard {...dashboardProps} />;
        case 'bibliotecario':
          return <BibliotecarioDashboard {...dashboardProps} />;
        case 'responsavel':
          return <ResponsavelDashboard {...dashboardProps} />;
        default:
          return <PlaceholderDashboard {...dashboardProps} />;
      }
    } catch (error) {
      console.error('Error rendering dashboard:', error);
      toast.error('Erro ao carregar dashboard');
      return <PlaceholderDashboard {...dashboardProps} />;
    }
  }

  // Show landing page if not authenticated
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 font-sans antialiased">
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <main className="relative flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative w-full py-20 px-4 overflow-hidden">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 opacity-95"></div>
          
          {/* Animated Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          </div>

          <div className="relative container mx-auto max-w-7xl">
            {/* Top Navigation */}
            <motion.nav 
              className="flex justify-between items-center mb-16"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Logo size="large" className="filter brightness-0 invert" />
              <div className="flex gap-2 md:gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-2 px-4 md:px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-yellow-300 hover:to-orange-300 transition-all"
                >
                  <FiLogIn size={16} />
                  <span className="hidden sm:inline">Login</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 md:px-6 py-2 text-white font-medium rounded-lg hover:bg-white/10 transition-colors hidden sm:block"
                >
                  Sobre
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 md:px-6 py-2 bg-white text-blue-600 font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Contato
                </motion.button>
              </div>
            </motion.nav>

            {/* Hero Content */}
            <div className="text-center text-white">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8"
                  whileHover={{ scale: 1.05 }}
                >
                  <FiZap size={16} color="#fde047" />
                  <span className="text-sm font-medium">Plataforma educacional completa</span>
                </motion.div>

                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                  Transforme a
                  <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 bg-clip-text text-transparent">
                    Gestão Educacional
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto font-light">
                  Uma plataforma integrada que conecta toda a comunidade escolar em um ambiente digital colaborativo, moderno e eficiente.
                </p>

                <div className="flex flex-wrap justify-center gap-4 mb-12">
                  <FeatureBadge icon={FiShield} text="Seguro e Confiável" />
                  <FeatureBadge icon={FiUsers} text="Multi-perfil" />
                  <FeatureBadge icon={FiTrendingUp} text="Análises em Tempo Real" />
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLoginModal(true)}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 font-bold rounded-xl shadow-xl hover:shadow-2xl hover:from-yellow-300 hover:to-orange-300 transition-all text-lg"
                >
                  <FiLogIn size={20} />
                  Acessar Plataforma
                </motion.button>
              </motion.div>
            </div>
          </div>

          {/* Wave Separator */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
            <svg className="relative block w-full h-20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="rgb(248 250 252)"></path>
            </svg>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4">
          <StatsSection />
        </section>

        {/* Feature Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Funcionalidades <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Principais</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Descubra as ferramentas que vão revolucionar a gestão da sua instituição educacional.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: FiUsers,
                  title: 'Gestão Multi-perfil',
                  description: 'Diferentes perfis para administradores, professores, alunos e responsáveis.',
                  color: 'from-blue-500 to-cyan-500'
                },
                {
                  icon: FiTrendingUp,
                  title: 'Análises Avançadas',
                  description: 'Dashboards interativos com métricas em tempo real e relatórios detalhados.',
                  color: 'from-green-500 to-emerald-500'
                },
                {
                  icon: FiShield,
                  title: 'Segurança Total',
                  description: 'Autenticação segura e controle de acesso baseado em perfis.',
                  color: 'from-purple-500 to-pink-500'
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                  <div className="relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                      <feature.icon size={32} color="white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                    <p className="text-slate-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Login Modal */}
        {showLoginModal && (
          <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
            <LoginForm 
              onSuccess={handleLoginSuccess}
            />
          </Modal>
        )}
        
        <Footer />
      </main>
    </div>
  );
};

export default App;