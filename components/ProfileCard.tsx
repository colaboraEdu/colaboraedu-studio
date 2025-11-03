import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import type { UserProfile } from '../types';

interface ProfileCardProps {
  profile: UserProfile;
  onSelect: (profile: UserProfile) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onSelect }) => {
  const { name, description, icon, colorClasses } = profile;
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group cursor-pointer"
      onClick={() => onSelect(profile)}
    >
      {/* Glow effect on hover */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${colorClasses.button} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 rounded-2xl`}></div>
      
      {/* Card container */}
      <div className={`relative flex flex-col text-center items-center p-6 bg-white rounded-2xl shadow-lg border-2 border-transparent group-hover:border-current transition-all duration-300 ${colorClasses.text} h-full`}>
        {/* Icon container with enhanced styling */}
        <motion.div 
          className={`relative w-20 h-20 rounded-2xl flex items-center justify-center mb-4 ${colorClasses.button} shadow-lg`}
          animate={{ 
            rotate: isHovered ? [0, -10, 10, -10, 0] : 0,
            scale: isHovered ? 1.1 : 1
          }}
          transition={{ duration: 0.5 }}
        >
          {/* Glow ring */}
          <div className={`absolute inset-0 rounded-2xl ${colorClasses.button} opacity-50 blur-md`}></div>
          <div className="relative">
            {icon}
          </div>
        </motion.div>

        {/* Badge for profile type */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${colorClasses.bg} ${colorClasses.text}`}
        >
          ✓
        </motion.div>

        {/* Title with gradient on hover */}
        <h3 className={`text-xl font-bold mb-3 ${colorClasses.text} transition-all duration-300`}>
          {name}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 flex-grow mb-5 leading-relaxed">
          {description}
        </p>

        {/* Access button with icon */}
        <motion.div 
          className={`w-full flex items-center justify-center gap-2 mt-auto text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 ${colorClasses.button} ${colorClasses.buttonHover} shadow-md group-hover:shadow-lg`}
          whileHover={{ gap: '1rem' }}
        >
          <span>Acessar</span>
          <motion.div
            animate={{ x: isHovered ? 5 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <FiArrowRight className="w-5 h-5" />
          </motion.div>
        </motion.div>

        {/* Decorative corner element */}
        <div className={`absolute top-0 left-0 w-16 h-16 ${colorClasses.bg} opacity-10 rounded-br-full`}></div>
      </div>
    </motion.div>
  );
};
