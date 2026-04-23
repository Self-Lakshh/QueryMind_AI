import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  onStart: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const Navbar = React.memo<NavbarProps>(({ onStart, isDark, toggleTheme }) => {
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
      initial={{ y: -100, opacity: 0 }}
      animate={{ 
        y: scrollDirection === 'down' ? -100 : 0,
        opacity: 1 
      }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-surface-base/40 border-b border-white/[0.03] h-20 flex items-center px-8 md:px-16 justify-between"
    >
      <div className="flex items-center gap-3">
        <motion.div 
          whileHover={{ rotate: 15, scale: 1.1 }}
          className="w-10 h-10 bg-gn-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.2)] shadow-inner"
        >
          <Database size={20} className="text-black" />
        </motion.div>
        <div className="flex flex-col">
          <span className="text-white font-bold tracking-[0.3em] text-[11px] uppercase leading-none">QueryMind</span>
          <span className="text-gn-500/60 font-bold text-[8px] uppercase tracking-[0.2em] mt-1">Intelligence</span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-white/5 transition-all text-white/20 hover:text-white border border-transparent hover:border-white/5"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </motion.button>
        <motion.button 
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={onStart} 
          className="glow-btn hidden md:block px-8 py-3 text-[11px] font-bold uppercase tracking-widest shadow-gn-500/10"
        >
          Launch Engine
        </motion.button>
      </div>
    </motion.nav>
  );
});
