import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Play, HelpCircle, Database, Zap, ArrowRightLeft } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '../lib/utils';

interface SQLPreviewProps {
  sql: string;
  onExecute: () => void;
  onExplain: () => void;
  loading: boolean;
}

export const SQLPreview: React.FC<SQLPreviewProps> = ({ sql, onExecute, onExplain, loading }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Basic metadata detection
  const tableCount = (sql.match(/FROM\s+([a-zA-Z_0-9]+)|JOIN\s+([a-zA-Z_0-9]+)/gi) || []).length;
  const hasJoin = sql.toUpperCase().includes('JOIN');
  const cost = tableCount > 2 ? 'HIGH' : tableCount > 1 ? 'MEDIUM' : 'LOW';

  return (
    <div className="flex flex-col gap-6">
      <div className="panel relative">
        <div className="flex items-center justify-between mb-4">
          <span className="label-tag">Generated SQL</span>
          <button 
            onClick={handleCopy}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
          >
            {copied ? <Check size={16} className="text-gn-500" /> : <Copy size={16} />}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {sql ? (
            <motion.div
              key={sql}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#0F1A14]"
            >
              <SyntaxHighlighter 
                language="sql" 
                style={atomDark}
                customStyle={{
                  background: 'transparent',
                  padding: '24px',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  margin: 0
                }}
              >
                {sql}
              </SyntaxHighlighter>
            </motion.div>
          ) : (
            <div className="h-36 glass rounded-xl flex items-center justify-center border-dashed border-white/10">
              <span className="text-white/20 text-sm italic">SQL will appear here</span>
            </div>
          )}
        </AnimatePresence>

        {sql && (
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-white/40 uppercase tracking-widest">
              <Database size={12} className="text-gn-500/50" />
              Tables used: {tableCount}
            </div>
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest",
              cost === 'HIGH' ? "text-red-400" : cost === 'MEDIUM' ? "text-orange-400" : "text-gn-400"
            )}>
              <Zap size={12} className="opacity-50" />
              Cost: {cost}
            </div>
            {hasJoin && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                <ArrowRightLeft size={12} className="text-gn-500/50" />
                Has JOIN
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {sql && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
          >
            <button 
              onClick={onExecute}
              disabled={loading}
              className="glow-btn flex-1 py-4 flex items-center justify-center gap-3 text-base"
            >
              <Play size={18} fill="currentColor" />
              {loading ? "Executing..." : "Execute Query"}
            </button>
            <button 
              onClick={onExplain}
              className="glass glass-hover flex-1 py-4 flex items-center justify-center gap-3 text-base text-white/60 hover:text-white"
            >
              <HelpCircle size={18} />
              Explain SQL
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
