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

export const SQLPreview = React.memo<SQLPreviewProps>(({ sql, onExecute, onExplain, loading }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tableCount = (sql.match(/FROM\s+([a-zA-Z_0-9]+)|JOIN\s+([a-zA-Z_0-9]+)/gi) || []).length;
  const hasJoin = sql.toUpperCase().includes('JOIN');
  const cost = tableCount > 2 ? 'HIGH' : tableCount > 1 ? 'MEDIUM' : 'LOW';

  return (
    <div className="flex flex-col gap-6">
      <div className="panel relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gn-500/10 flex items-center justify-center">
              <Zap size={16} className="text-gn-400" />
            </div>
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em]">Generated Statement</span>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleCopy}
            className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-white/30 hover:text-white hover:bg-white/5 transition-all"
          >
            {copied ? <Check size={16} className="text-gn-400" /> : <Copy size={16} />}
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {sql ? (
            <motion.div
              key={sql}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl overflow-hidden border border-white/[0.05] bg-[#06110E] shadow-inner"
            >
              <SyntaxHighlighter 
                language="sql" 
                style={atomDark}
                customStyle={{
                  background: 'transparent',
                  padding: '24px',
                  fontSize: '13px',
                  lineHeight: '1.7',
                  margin: 0,
                  fontFamily: 'JetBrains Mono'
                }}
              >
                {sql}
              </SyntaxHighlighter>
            </motion.div>
          ) : (
            <div className="h-40 glass rounded-2xl flex items-center justify-center border-dashed border-white/5">
              <span className="text-white/10 text-xs font-bold uppercase tracking-widest">Awaiting prompt...</span>
            </div>
          )}
        </AnimatePresence>

        {sql && (
          <div className="mt-6 flex flex-wrap gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05] text-[9px] font-bold text-white/30 uppercase tracking-widest">
              <Database size={11} className="text-gn-500/40" />
              {tableCount} {tableCount === 1 ? 'Table' : 'Tables'}
            </div>
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05] text-[9px] font-bold uppercase tracking-widest",
              cost === 'HIGH' ? "text-red-400/60" : cost === 'MEDIUM' ? "text-orange-400/60" : "text-gn-400/60"
            )}>
              <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]", 
                cost === 'HIGH' ? "bg-red-400" : cost === 'MEDIUM' ? "bg-orange-400" : "bg-gn-400"
              )} />
              Complexity: {cost}
            </div>
            {hasJoin && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05] text-[9px] font-bold text-white/30 uppercase tracking-widest">
                <ArrowRightLeft size={11} className="text-gn-500/40" />
                Relational
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {sql && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-4"
          >
            <motion.button 
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={onExecute}
              disabled={loading}
              className="glow-btn py-4 flex items-center justify-center gap-3 text-[14px] uppercase tracking-widest"
            >
              <Play size={16} fill="currentColor" />
              {loading ? "Running..." : "Run Query"}
            </motion.button>
            <motion.button 
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={onExplain}
              className="panel bg-white/[0.02] py-4 flex items-center justify-center gap-3 text-[14px] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/[0.05]"
            >
              <HelpCircle size={18} />
              Explain
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
