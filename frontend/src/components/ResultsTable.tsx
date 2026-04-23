import React from 'react';
import { motion } from 'framer-motion';
import { Table, Download, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface ResultsTableProps {
  results: {
    columns: string[];
    rows: any[];
    total: number;
    error?: string;
  };
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  if (results.error) {
    return (
      <div className="panel bg-red-500/5 border-red-500/10 flex items-center gap-4 py-8">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="text-red-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-red-400 uppercase tracking-widest mb-1">Execution Error</p>
          <p className="text-xs text-red-400/60 leading-relaxed">{results.error}</p>
        </div>
      </div>
    );
  }

  if (results.rows.length === 0) {
    return (
      <div className="panel flex flex-col items-center justify-center py-12 text-center">
        <Table size={32} className="text-white/10 mb-4" />
        <p className="text-white/30 text-sm italic">Query returned 0 results</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gn-500/10 flex items-center justify-center">
            <Table size={16} className="text-gn-400" />
          </div>
          <span className="label-tag">Query Results</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-gn-500/10 text-gn-400 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            {results.total} rows
          </span>
          <button className="p-2 rounded-lg hover:bg-white/5 text-white/20 hover:text-white transition-all">
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[400px] overflow-y-auto border border-white/[0.05] rounded-xl scrollbar-thin">
        <table className={cn(
          "w-full text-left text-[12px] border-collapse",
          results.columns.length > 6 ? "table-fixed" : "table-auto"
        )}>
          <thead className="sticky top-0 z-10">
            <tr className="bg-surface-200 backdrop-blur-md">
              {results.columns.map(col => (
                <th 
                  key={col} 
                  className="px-4 py-4 font-bold text-gn-400 uppercase tracking-widest border-b border-white/[0.05] whitespace-nowrap"
                  style={{ width: results.columns.length > 6 ? '200px' : 'auto' }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {results.rows.map((row, rowIndex) => (
              <motion.tr 
                key={rowIndex}
                initial={rowIndex < 10 ? { opacity: 0, x: -10 } : {}}
                animate={rowIndex < 10 ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: rowIndex * 0.05 }}
                className={cn(
                  "hover:bg-white/[0.02] transition-colors",
                  rowIndex % 2 === 1 && "bg-white/[0.01]"
                )}
              >
                {results.columns.map(col => (
                  <td key={col} className="px-4 py-4 text-white/70 font-mono whitespace-nowrap overflow-hidden text-ellipsis">
                    {row[col] === null || row[col] === undefined ? (
                      <span className="text-white/20 italic">null</span>
                    ) : (
                      String(row[col])
                    )}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
