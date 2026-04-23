import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

interface SQLExplanationProps {
  explanation: string;
}

export const SQLExplanation = React.memo<SQLExplanationProps>(({ explanation }) => {
  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="panel p-6 bg-gn-500/[0.01] border-gn-500/10 shadow-[0_0_40px_rgba(34,197,94,0.03)]"
    >
      <div className="flex gap-5 items-start">
        <div className="w-12 h-12 rounded-2xl bg-gn-500/10 flex items-center justify-center shrink-0 shadow-inner">
          <Brain size={24} className="text-gn-400 animate-pulse" />
        </div>
        <div className="flex-1">
          <span className="text-[11px] font-bold text-gn-400/60 uppercase tracking-[0.2em] mb-3 block">Logical Interpretation</span>
          <p className="text-white/70 text-[14px] leading-relaxed max-w-[65ch]">
            {explanation}
          </p>
        </div>
      </div>
    </motion.div>
  );
});
