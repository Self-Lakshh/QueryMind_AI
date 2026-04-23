import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, Trash2, History, Database, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export interface HistoryItem {
  id: string;
  question: string;
  sql: string;
  timestamp: number;
  tables_used: string[];
  cost: string;
}

interface QueryHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: HistoryItem) => void;
  history: HistoryItem[];
  onClear: () => void;
  onDelete: (id: string) => void;
}

export const QueryHistory: React.FC<QueryHistoryProps> = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  history, 
  onClear,
  onDelete 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-surface-base border-l border-white/5 z-[70] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gn-500/10 flex items-center justify-center">
                  <History className="text-gn-400" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Query History</h2>
                  <p className="text-xs text-white/30 uppercase tracking-widest">Recent SQL Generations</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-4">
                    <Clock size={32} className="text-white/10" />
                  </div>
                  <h3 className="text-white/40 font-medium mb-1">No queries yet</h3>
                  <p className="text-white/20 text-sm max-w-[200px]">Your generated SQL queries will appear here for quick access.</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {history.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative"
                    >
                      <button
                        onClick={() => {
                          onSelect(item);
                          onClose();
                        }}
                        className="w-full text-left glass-card glass-hover border-white/[0.05] p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-sm text-white/80 line-clamp-2 leading-relaxed">
                            {item.question}
                          </p>
                          <span className={cn(
                            "shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
                            item.cost === 'LOW' ? 'bg-gn-500/10 text-gn-400' :
                            item.cost === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-red-500/10 text-red-400'
                          )}>
                            {item.cost}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-white/30 text-[10px]">
                              <Database size={10} />
                              <span>{item.tables_used.length} tables</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-white/30 text-[10px]">
                              <Clock size={10} />
                              <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                      </button>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.id);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-md bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all z-10"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {history.length > 0 && (
              <div className="p-4 border-t border-white/5">
                <button 
                  onClick={onClear}
                  className="w-full py-3 flex items-center justify-center gap-2 text-xs font-bold text-red-400/60 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 rounded-xl transition-all uppercase tracking-widest"
                >
                  <Trash2 size={14} />
                  Clear History
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
