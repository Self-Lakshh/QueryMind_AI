import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Zap, 
  Code, 
  Lock, 
  ArrowRight, 
  ChevronDown, 
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { useParallax } from '../hooks/useParallax';

// --- Types ---
interface LandingPageProps {
  onStart: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

import { Navbar } from '../components/Navbar';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string; index: number }> = ({ icon, title, desc, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="panel p-8 group cursor-pointer border-white/[0.05] relative overflow-hidden"
    >
      <div className="w-14 h-14 rounded-2xl bg-gn-500/10 flex items-center justify-center mb-6 group-hover:bg-gn-500/20 transition-all duration-300 shadow-inner">
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "text-gn-400 group-hover:scale-110 transition-transform duration-300", size: 28 }) : icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-white/40 text-[14px] leading-relaxed mb-4 max-w-[30ch] group-hover:text-white/60 transition-colors">{desc}</p>
      
      <div className="absolute bottom-8 right-8">
        <motion.div
          initial={{ x: -10, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          className="text-gn-500/30 group-hover:text-gn-400 transition-colors"
        >
          <ArrowRight size={20} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, isDark, toggleTheme }) => {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  
  const orb1Y = useParallax(heroRef, 100);
  const orb2Y = useParallax(heroRef, 200);
  const orb3Y = useParallax(heroRef, 300);

  return (
    <div ref={containerRef} className="snap-y snap-mandatory h-screen overflow-y-auto bg-surface-base scrollbar-none">
      <Navbar isDark={isDark} toggleTheme={toggleTheme} onStart={onStart} />

      {/* --- SECTION: HERO --- */}
      <section 
        ref={heroRef}
        className="relative min-h-screen snap-start flex items-center justify-center overflow-hidden bg-grid py-20 lg:py-32"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1512] via-[#0F1A14] to-[#061510] animate-gradShift bg-[length:200%_200%]" />
        
        {/* Parallax Orbs */}
        <motion.div style={{ y: orb1Y }} className="floating-orb w-[600px] h-[600px] bg-gn-600/5 top-[-200px] left-[-200px] animate-floatSlow" />
        <motion.div style={{ y: orb2Y }} className="floating-orb w-[500px] h-[500px] bg-gn-500/5 bottom-[-100px] right-[-100px] animate-float" />
        <motion.div style={{ y: orb3Y }} className="floating-orb w-[300px] h-[300px] bg-gn-400/10 top-[20%] right-[5%] animate-floatSlow delay-1000" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0B1512_100%)] pointer-events-none" />

        <div className="relative z-10 text-center px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/[0.05] bg-white/[0.02] mb-10 shadow-2xl"
          >
            <div className="w-2 h-2 rounded-full bg-gn-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
            <span className="text-white/50 text-[10px] font-bold tracking-[0.25em] uppercase">V2.0 · Fine-Tuned LLM · Now Open</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-4 tracking-tighter leading-[0.95]"
          >
            Query data
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl lg:text-9xl font-bold bg-gradient-to-r from-gn-400 via-gn-500 to-gn-300 bg-clip-text text-transparent mb-10 tracking-tighter leading-[0.95]"
          >
            in plain English
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto mb-14 leading-relaxed font-medium"
          >
            Synthesize optimized SQL from natural language in seconds. <br className="hidden md:block" />
            No account, no setup, no friction. Just your schema and your curiosity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-12"
          >
            <motion.button 
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStart}
              className="glow-btn text-xl px-16 py-6 shadow-gn-500/20"
            >
              Launch Query Engine
            </motion.button>

            <div className="flex flex-wrap justify-center gap-6">
              {[
                { icon: Database, text: "Multi-Engine Support" },
                { icon: Zap, text: "Sub-2s Latency" },
                { icon: BarChart3, text: "Relationship Aware" },
                { icon: CheckCircle2, text: "Privacy First" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + (i * 0.1) }}
                  className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] shadow-sm"
                >
                  <item.icon size={14} className="text-gn-500/40" />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 12, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/20 flex flex-col items-center gap-3"
        >
          <span className="text-[9px] uppercase font-bold tracking-[0.4em]">Scroll</span>
          <ChevronDown size={20} />
        </motion.div>
      </section>

      {/* --- SECTION: FEATURES --- */}
      <section className="min-h-screen snap-start bg-[#09100E] flex items-center py-24 lg:py-32 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          <div className="lg:col-span-5">
            <span className="label-tag mb-6 block tracking-[0.3em]">Core Intelligence</span>
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-10 leading-[1.05] tracking-tight">
              A brain built for <br />
              <span className="text-white/20">relational data.</span>
            </h2>
            <p className="text-white/40 text-lg max-w-md leading-relaxed font-medium mb-12">
              Unlike generic LLMs, QueryMind is fine-tuned on 15,000+ complex SQL scenarios, ensuring accurate JOINs and optimized performance.
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className="flex items-center gap-3 text-gn-400 font-bold uppercase tracking-widest text-sm group"
            >
              Learn about our architecture 
              <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </motion.button>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard index={0} icon={<Database />} title="Schema Deep-Link" desc="Recursive mapping of tables, foreign keys, and column constraints." />
            <FeatureCard index={1} icon={<Code />} title="Production SQL" desc="Zero-blob generation. Only indexed columns and optimized subqueries." />
            <FeatureCard index={2} icon={<Zap />} title="Hyper-Inference" desc="Sub-second processing via specialized transformer architectures." />
            <FeatureCard index={3} icon={<Lock />} title="Privacy by Design" desc="Your schema data never leaves your browser's persistent storage." />
          </div>
        </div>
      </section>

      {/* --- SECTION: CTA FOOTER --- */}
      <section className="min-h-screen snap-start flex items-center justify-center px-6 bg-surface-base py-24 lg:py-32">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="panel max-w-5xl w-full text-center py-24 px-12 relative overflow-hidden group border-white/[0.03] bg-transparent"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.03)_0%,transparent_70%)] pointer-events-none" />
          
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight leading-tight">
            Stop writing boilerplate. <br />
            <span className="text-white/20">Start asking questions.</span>
          </h2>
          <p className="text-white/30 text-lg mb-16 max-w-xl mx-auto leading-relaxed">
            Takes 30 seconds to configure. 100% free while in beta. Join thousands of data engineers today.
          </p>
          
          <motion.button 
            whileHover={{ y: -5, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="glow-btn text-xl px-20 py-7 mb-16 shadow-gn-500/20"
          >
            Enter The Engine
          </motion.button>

          <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-[10px] font-bold text-white/20 uppercase tracking-[0.25em]">
            <div className="flex items-center gap-3"><CheckCircle2 size={16} className="text-gn-500/40" /> Zero Authentication</div>
            <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/5" />
            <div className="flex items-center gap-3"><CheckCircle2 size={16} className="text-gn-500/40" /> Any SQL Dialect</div>
            <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/5" />
            <div className="flex items-center gap-3"><CheckCircle2 size={16} className="text-gn-500/40" /> Private Storage</div>
          </div>
        </motion.div>
      </section>

      <footer className="py-16 text-center text-white/10 text-[10px] uppercase tracking-[0.5em] font-bold border-t border-white/[0.02]">
        &copy; 2026 QueryMind AI &bull; The Zero Gravity SQL Protocol
      </footer>
    </div>
  );
};
