import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

interface SQLExplanationProps {
  explanation: string;
}

export const SQLExplanation: React.FC<SQLExplanationProps> = ({ explanation }) => {
  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="glass-card flex gap-4 items-start bg-gn-500/[0.02] border-gn-500/10"
    >
      <div className="w-10 h-10 rounded-xl bg-gn-500/10 flex items-center justify-center shrink-0">
        <Brain size={20} className="text-gn-400" />
      </div>
      <div>
        <span className="label-tag mb-2 block">What this SQL does</span>
        <p className="text-white/70 text-sm leading-relaxed">
          {explanation}
        </p>
      </div>
    </motion.div>
  );
};
