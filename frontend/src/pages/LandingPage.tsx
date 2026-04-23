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
      whileHover={{ scale: 1.02, y: -4 }}
      className="glass-card glass-hover group cursor-pointer relative overflow-hidden"
    >
      <div className="w-12 h-12 rounded-xl bg-gn-500/10 flex items-center justify-center mb-4 group-hover:bg-gn-500/20 transition-colors">
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "text-gn-400" }) : icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed mb-4">{desc}</p>
      
      <div className="absolute bottom-6 right-6">
        <motion.div
          initial={{ x: -4, opacity: 0 }}
          whileHover={{ x: 0, opacity: 1 }}
          className="text-gn-400"
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
  
  // Parallax Orbs
  const orb1Y = useParallax(heroRef, 100);
  const orb2Y = useParallax(heroRef, 200);
  const orb3Y = useParallax(heroRef, 300);


  return (
    <div ref={containerRef} className="snap-y snap-mandatory h-screen overflow-y-auto bg-surface-base">
      <Navbar isDark={isDark} toggleTheme={toggleTheme} onStart={onStart} />

      {/* --- SECTION: HERO --- */}
      <section 
        ref={heroRef}
        className="relative min-h-screen snap-start flex flex-center items-center justify-center overflow-hidden bg-grid"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1512] via-[#0F1A14] to-[#061510] animate-gradShift bg-[length:200%_200%]" />
        
        {/* Parallax Orbs */}
        <motion.div 
          style={{ y: orb1Y }}
          className="floating-orb w-[500px] h-[500px] bg-gn-600/10 top-[-100px] left-[-100px] animate-floatSlow"
        />
        <motion.div 
          style={{ y: orb2Y }}
          className="floating-orb w-[400px] h-[400px] bg-gn-500/8 bottom-[-50px] right-[-50px] animate-float"
        />
        <motion.div 
          style={{ y: orb3Y }}
          className="floating-orb w-[200px] h-[200px] bg-gn-400/15 top-[20%] right-[10%] animate-float delay-3s00"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0B1512_100%)] pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gn-500/30 bg-gn-500/[0.08] mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-gn-500 animate-pulse" />
            <span className="text-gn-400 text-xs font-semibold tracking-wider uppercase">AI-Powered · Schema-Aware · Zero Login</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-8xl font-bold text-white mb-2 tracking-tight"
          >
            Query your database
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-8xl font-bold bg-gradient-to-r from-gn-400 to-gn-600 bg-clip-text text-transparent mb-8 tracking-tight"
          >
            in plain English
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-4"
          >
            Paste your schema. Ask anything. Get optimized SQL in under 2 seconds.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 1 }}
            className="text-white/30 text-sm mb-12"
          >
            No account required. No setup. No credit card.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
            className="flex flex-col items-center gap-8"
          >
            <button 
              onClick={onStart}
              className="glow-btn text-lg px-12 py-5 transform transition-transform hover:scale-105 hover:-translate-y-1 active:scale-95"
            >
              Try Free — No Login Required
            </button>

            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: Database, text: "200+ Schemas tested" },
                { icon: Zap, text: "<2s response" },
                { icon: BarChart3, text: "10k+ training pairs" },
                { icon: CheckCircle2, text: "100% free" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + (i * 0.08), duration: 0.5 }}
                  className="glass flex items-center gap-2 px-4 py-2 text-xs text-white/50 border-white/[0.03]"
                >
                  <item.icon size={14} className="text-gn-500/60" />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/20 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
          <ChevronDown size={20} />
        </motion.div>
      </section>

      {/* --- SECTION: FEATURES --- */}
      <section 
        className="min-h-screen snap-start bg-[#0F1A14] flex items-center py-32 px-6 md:px-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-5 flex flex-col justify-center">
            <span className="label-tag mb-4 block">What it does</span>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Schema-aware AI <br />
              <span className="text-white/40">built for accuracy.</span>
            </h2>
            <p className="text-white/50 text-lg max-w-md leading-relaxed">
              Unlike generic LLMs, QueryMind is specialized for database operations. It understands table constraints and relationship hierarchies.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard 
              index={0}
              icon={<Database />}
              title="Schema Aware"
              desc="Upload any SQL schema. AI maps every table, column and relationship instantly."
            />
            <FeatureCard 
              index={1}
              icon={<Code />}
              title="Optimized SQL"
              desc="No SELECT *. Real JOINs, proper WHERE clauses, LIMIT on everything."
            />
            <FeatureCard 
              index={2}
              icon={<Zap />}
              title="Under 2 Seconds"
              desc="HuggingFace inference. Your SQL appears before you finish reading the question."
            />
            <FeatureCard 
              index={3}
              icon={<Lock />}
              title="Zero Login"
              desc="No account. No API key. No credit card. Paste schema, ask, done."
            />
          </div>
        </div>
      </section>

      {/* --- SECTION: CTA FOOTER --- */}
      <section className="min-h-[80vh] snap-start flex items-center justify-center px-6 bg-surface-base">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card max-w-4xl w-full text-center py-20 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gn-500/[0.02] group-hover:bg-gn-500/[0.04] transition-colors pointer-events-none" />
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Ready to query smarter?</h2>
          <p className="text-white/40 text-lg mb-12 max-w-lg mx-auto">
            Takes 30 seconds to start. No setup required. Join 5,000+ developers automating their SQL.
          </p>
          
          <button 
            onClick={onStart}
            className="glow-btn text-xl px-16 py-6 mb-12 transform transition-transform hover:scale-105"
          >
            Get Started Now
          </button>

          <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-xs text-white/30 uppercase tracking-[0.1em]">
            <div className="flex items-center gap-2"><CheckCircle2 size={14} /> No login required</div>
            <div className="hidden md:block w-1 h-1 rounded-full bg-white/10" />
            <div className="flex items-center gap-2"><CheckCircle2 size={14} /> Works with any SQL database</div>
            <div className="hidden md:block w-1 h-1 rounded-full bg-white/10" />
            <div className="flex items-center gap-2"><CheckCircle2 size={14} /> Completely free</div>
          </div>
        </motion.div>
      </section>

      {/* Footer Muted */}
      <footer className="py-12 text-center text-white/10 text-[10px] uppercase tracking-widest border-t border-white/[0.03]">
        &copy; 2026 QueryMind AI — Zero Gravity SQL Engine
      </footer>
    </div>
  );
};
