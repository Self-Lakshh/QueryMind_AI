import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  onStart: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onStart, isDark, toggleTheme }) => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [prevOffset, setPrevOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentOffset = window.pageYOffset;
      if (currentOffset > prevOffset && currentOffset > 100) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }
      setPrevOffset(currentOffset);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevOffset]);

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: scrollDirection === 'down' ? -100 : 0 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-surface-base/60 border-b border-white/[0.05] h-20 flex items-center px-6 md:px-12 justify-between transition-colors duration-500"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gn-500 rounded-lg flex items-center justify-center">
          <Database size={18} className="text-black" />
        </div>
        <span className="text-gn-400 font-bold tracking-[0.2em] text-sm uppercase">QueryMind</span>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button onClick={onStart} className="glow-btn hidden md:block px-6 py-2.5 text-sm">
          Launch App
        </button>
      </div>
    </motion.nav>
  );
};
