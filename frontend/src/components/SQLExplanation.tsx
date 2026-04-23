import React from 'react';
import { Info } from 'lucide-react';

export const SQLExplanation = ({ explanation }: { explanation: string }) => {
  return (
    <div className="panel mb-6 animate-fadeUp bg-gn-500/[0.02] border-gn-500/10">
      <div className="flex items-center gap-2 mb-3">
        <Info size={16} className="text-gn-400" />
        <span className="text-xs font-bold text-gn-400 uppercase tracking-widest">Query Explanation</span>
      </div>
      <p className="text-sm text-white/70 leading-relaxed italic">
        "{explanation}"
      </p>
    </div>
  );
};
