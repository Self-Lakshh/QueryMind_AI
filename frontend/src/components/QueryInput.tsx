import React, { useState } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
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
    <div className="panel">
      <div className="flex items-center justify-between mb-4">
        <span className="label-tag">Ask Question</span>
        <span className={cn("text-[10px] font-mono", question.length > 450 ? "text-red-400" : "text-white/20")}>
          {question.length}/500
        </span>
      </div>

      <div className="relative mb-6">
        <textarea 
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, 500))}
          placeholder="Ask anything about your data..."
          className="input-dark p-6 pr-14 text-base resize-none"
          disabled={loading}
        />
        <button 
          onClick={() => handleSubmit()}
          disabled={loading || !question.trim()}
          className={cn(
            "absolute bottom-4 right-4 p-3 rounded-xl transition-all",
            question.trim() ? "bg-gn-500 text-black shadow-lg hover:scale-105 active:scale-95" : "bg-white/5 text-white/10"
          )}
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => setQuestion(ex)}
            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[11px] text-white/40 hover:bg-white/10 hover:text-white transition-all"
          >
            {ex}
          </button>
        ))}
      </div>

      <button 
        onClick={() => handleSubmit()}
        disabled={loading || !question.trim()}
        className="glow-btn w-full py-4 flex items-center justify-center gap-3 text-base"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Generating SQL...
          </>
        ) : (
          <>
            <Sparkles size={20} />
            Generate SQL
          </>
        )}
      </button>
    </div>
  );
};
