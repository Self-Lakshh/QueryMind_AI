import React, { createContext, useContext, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LandingPage } from './pages/LandingPage';
import { AppPage } from './pages/AppPage';
import { cn } from './lib/utils';

// --- Theme Context ---
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className={cn("min-h-screen transition-colors duration-500", isDark ? "dark bg-surface-base" : "bg-white")}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// --- Main App Component ---
const App: React.FC = () => {
  const [page, setPage] = useState<'landing' | 'app'>('landing');

  return (
    <ThemeProvider>
      <ThemeContext.Consumer>
        {({ isDark, toggleTheme }) => (
          <AnimatePresence mode="wait">
            {page === 'landing' ? (
              <motion.div
                key="landing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                <LandingPage 
                  onStart={() => setPage('app')} 
                  isDark={isDark} 
                  toggleTheme={toggleTheme} 
                />
              </motion.div>
            ) : (
              <motion.div
                key="app"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                <AppPage 
                  onBack={() => setPage('landing')} 
                  isDark={isDark} 
                  toggleTheme={toggleTheme} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </ThemeContext.Consumer>
    </ThemeProvider>
  );
};

export default App;
