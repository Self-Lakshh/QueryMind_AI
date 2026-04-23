import React from 'react';
import { Play, Copy, Info, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '../lib/utils';

interface SQLPreviewProps {
  sql: string;
  onExecute: () => void;
  onExplain: () => void;
  loading: boolean;
}

export const SQLPreview = ({ sql, onExecute, onExplain, loading }: SQLPreviewProps) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="panel mb-6 animate-fadeUp">
      <div className="flex items-center justify-between mb-4">
        <span className="label-tag">Generated SQL</span>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
            {copied ? <Check size={16} className="text-gn-500" /> : <Copy size={16} />}
          </button>
          <button 
            onClick={onExplain}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-white/60 hover:text-white transition-all"
          >
            <Info size={14} /> Explain
          </button>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-white/[0.05] bg-black/40 mb-6">
        <SyntaxHighlighter 
          language="sql" 
          style={atomDark}
          customStyle={{
            background: 'transparent',
            padding: '20px',
            fontSize: '14px',
            margin: 0
          }}
        >
          {sql}
        </SyntaxHighlighter>
      </div>

      <button 
        onClick={onExecute}
        disabled={loading}
        className="w-full glow-btn py-4 flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
        ) : (
          <><Play size={18} fill="currentColor" /> Execute Query</>
        )}
      </button>
    </div>
  );
};
