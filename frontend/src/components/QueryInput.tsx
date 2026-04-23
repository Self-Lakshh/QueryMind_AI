import { motion } from 'framer-motion';
import { Send, Sparkles, Loader2, Command } from 'lucide-react';
import { cn } from '../lib/utils';

interface QueryInputProps {
  onSubmit: (q: string) => void;
  loading: boolean;
}

const EXAMPLES = [
  "Show all users who signed up last month",
  "What are the top 5 products by revenue?",
  "List all orders with their customer names"
];

export const QueryInput: React.FC<QueryInputProps> = ({ onSubmit, loading }) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (question.trim() && !loading) onSubmit(question);
  };

  return (
    <div className="panel p-6 border-white/[0.05]">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gn-500/10 flex items-center justify-center">
            <Command size={16} className="text-gn-400" />
          </div>
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em]">Prompt Engine</span>
        </div>
        <span className={cn(
          "text-[10px] font-mono transition-colors", 
          question.length > 450 ? "text-red-400" : "text-white/10"
        )}>
          {question.length}/500
        </span>
      </div>

      <div className="relative mb-6 group">
        <textarea 
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, 500))}
          placeholder="Ask anything about your data in plain English..."
          className="input-dark p-6 pr-14 text-[15px] resize-none min-h-[140px] leading-relaxed group-hover:border-white/15 shadow-inner"
          disabled={loading}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
        />
        <motion.button 
          whileHover={question.trim() ? { scale: 1.1, rotate: -5 } : {}}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSubmit()}
          disabled={loading || !question.trim()}
          className={cn(
            "absolute bottom-4 right-4 p-3 rounded-xl transition-all shadow-xl",
            question.trim() 
              ? "bg-gn-500 text-black shadow-gn-500/20" 
              : "bg-white/[0.03] text-white/10"
          )}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </motion.button>
      </div>

      <div className="flex flex-wrap gap-2.5 mb-8">
        {EXAMPLES.map((ex, i) => (
          <motion.button
            key={i}
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setQuestion(ex)}
            className="px-4 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px] font-bold text-white/30 uppercase tracking-wider hover:bg-white/[0.05] hover:text-white/70 transition-all shadow-sm"
          >
            {ex}
          </motion.button>
        ))}
      </div>

      <motion.button 
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleSubmit()}
        disabled={loading || !question.trim()}
        className="glow-btn w-full py-4.5 flex items-center justify-center gap-4 text-sm tracking-[0.1em] uppercase shadow-gn-500/10"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Synthesizing SQL...
          </>
        ) : (
          <>
            <Sparkles size={18} className="animate-glow-pulse" />
            Generate Statement
          </>
        )}
      </motion.button>
    </div>
  );
};
