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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#09100E] border-l border-white/[0.05] z-[70] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col"
          >
            {/* Header */}
            <div className="p-8 pb-6 border-b border-white/[0.03] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gn-500/10 flex items-center justify-center shadow-inner">
                  <History className="text-gn-400" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Query History</h2>
                  <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">Persistence Engine</p>
                </div>
              </div>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2.5 rounded-xl hover:bg-white/5 text-white/10 hover:text-white transition-all"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                  <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-6">
                    <Clock size={40} className="text-white/5" />
                  </div>
                  <h3 className="text-white/60 font-bold uppercase tracking-widest text-xs mb-2">No queries yet</h3>
                  <p className="text-white/20 text-[11px] max-w-[200px] leading-relaxed">Generated SQL will be indexed here for quick retrieval.</p>
                </div>
              ) : (
                <AnimatePresence initial={false} mode="popLayout">
                  {history.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index < 10 ? index * 0.05 : 0 }}
                      className="group relative"
                    >
                      <motion.button
                        whileHover={{ y: -2, scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => {
                          onSelect(item);
                          onClose();
                        }}
                        className="w-full text-left bg-white/[0.02] border border-white/[0.04] hover:border-gn-500/20 p-5 rounded-2xl flex flex-col gap-4 transition-all hover:bg-white/[0.04] shadow-sm hover:shadow-gn-500/5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-[14px] text-white/70 font-medium line-clamp-2 leading-snug">
                            {item.question}
                          </p>
                          <span className={cn(
                            "shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-tighter shadow-sm",
                            item.cost === 'LOW' ? 'bg-gn-500/10 text-gn-400 border border-gn-500/10' :
                            item.cost === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/10' :
                            'bg-red-500/10 text-red-400 border border-red-500/10'
                          )}>
                            {item.cost}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/[0.02] pt-3">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-white/20 text-[10px] font-bold uppercase tracking-wider">
                              <Database size={10} className="text-gn-500/30" />
                              <span>{item.tables_used.length} {item.tables_used.length === 1 ? 'Table' : 'Tables'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-white/20 text-[10px] font-bold uppercase tracking-wider">
                              <Clock size={10} className="text-gn-500/30" />
                              <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                      </motion.button>

                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.id);
                        }}
                        className="absolute -top-1 -right-1 p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all z-10 shadow-lg"
                      >
                        <Trash2 size={12} />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {history.length > 0 && (
              <div className="p-8 border-t border-white/[0.03] bg-black/20">
                <motion.button 
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClear}
                  className="w-full py-4 flex items-center justify-center gap-3 text-[11px] font-bold text-red-400/40 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 rounded-2xl transition-all uppercase tracking-[0.2em] border border-red-500/5"
                >
                  <Trash2 size={14} />
                  Purge History
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
