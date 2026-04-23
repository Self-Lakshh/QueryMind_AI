import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export const QueryInput = ({ onGenerate, disabled }: { onGenerate: (q: string) => void; disabled: boolean }) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) onGenerate(question);
  };

  return (
    <div className="panel">
      <span className="label-tag mb-4 block">Ask Question</span>
      <form onSubmit={handleSubmit} className="relative">
        <textarea 
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Show me all users who joined last month from London"
          className="input-dark min-h-[100px] pr-12 resize-none"
          disabled={disabled}
        />
        <button 
          type="submit"
          disabled={disabled || !question.trim()}
          className={cn(
            "absolute bottom-4 right-4 p-2 rounded-lg transition-all",
            disabled || !question.trim() ? "bg-white/5 text-white/10" : "bg-gn-500 text-black hover:bg-gn-400"
          )}
        >
          <Send size={18} />
        </button>
      </form>
      <div className="mt-4 flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest">
        <Sparkles size={12} className="text-gn-500/50" />
        AI will generate optimized SQL
      </div>
    </div>
  );
};
