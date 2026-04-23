import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Table, Download, AlertCircle, BarChart3 } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line,
  Cell
} from 'recharts';
import { cn } from '../lib/utils';

interface ResultsTableProps {
  results: {
    columns: string[];
    rows: Record<string, unknown>[];
    total: number;
    error?: string;
  };
}

export const ResultsTable = React.memo<ResultsTableProps>(({ results }) => {
  const [viewMode, setViewMode] = React.useState<'table' | 'chart'>('table');

  if (results.error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel bg-red-500/5 border-red-500/10 flex items-center gap-6 p-8 shadow-[0_0_40px_rgba(239,68,68,0.05)]"
      >
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0">
          <AlertCircle className="text-red-400" size={28} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-red-400 uppercase tracking-[0.2em] mb-1.5">Execution Error</h4>
          <p className="text-xs text-red-400/60 leading-relaxed max-w-xl">{results.error}</p>
        </div>
      </motion.div>
    );
  }

  if (results.rows.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="panel flex flex-col items-center justify-center py-20 text-center border-dashed border-white/5"
      >
        <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center mb-4">
          <Table size={32} className="text-white/10" />
        </div>
        <h4 className="text-white/40 font-bold uppercase tracking-widest text-xs mb-1">Zero Results</h4>
        <p className="text-white/20 text-[11px] leading-relaxed">The query executed successfully but returned no data.</p>
      </motion.div>
    );
  }

  // --- Chart Detection Logic ---
  const numericCols = results.columns.filter(col => 
    results.rows.some(row => typeof row[col] === 'number')
  );
  const textCols = results.columns.filter(col => 
    results.rows.some(row => typeof row[col] === 'string' && isNaN(Number(row[col])))
  );

  let chartType: 'bar' | 'line' | 'single' | null = null;
  if (numericCols.length === 1 && textCols.length >= 1) chartType = 'bar';
  else if (numericCols.length >= 2) chartType = 'line';
  else if (numericCols.length === 1) chartType = 'single';

  const chartData = results.rows.slice(0, 50);

  const renderChart = () => {
    if (chartType === 'single') {
      const val = results.rows[0][numericCols[0]];
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="text-[11px] font-bold text-white/20 uppercase tracking-[0.25em] mb-4">{numericCols[0]}</span>
          <span className="text-7xl font-bold text-gn-400 text-glow leading-none">{(val as number).toLocaleString()}</span>
        </div>
      );
    }

    if (chartType === 'bar') {
      return (
        <div className="h-[400px] w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey={textCols[0]} 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dx={-10}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                contentStyle={{ 
                  backgroundColor: '#0B1512', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: '16px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                  fontSize: '12px'
                }} 
                itemStyle={{ color: '#22c55e', fontWeight: 'bold' }}
              />
              <Bar 
                dataKey={numericCols[0]} 
                fill="#22c55e" 
                radius={[6, 6, 0, 0]} 
                fillOpacity={0.8}
                animationDuration={2000}
                animationEasing="ease-out"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fillOpacity={0.6 + (index / chartData.length) * 0.4} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (chartType === 'line') {
      return (
        <div className="h-[400px] w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey={results.columns[0]} 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0B1512', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: '16px',
                  fontSize: '12px'
                }} 
              />
              {numericCols.map((col, i) => (
                <Line 
                  key={col}
                  type="monotone" 
                  dataKey={col} 
                  stroke={i === 0 ? "#22c55e" : i === 1 ? "#3b82f6" : "#f59e0b"} 
                  strokeWidth={3}
                  dot={{ fill: i === 0 ? "#22c55e" : i === 1 ? "#3b82f6" : "#f59e0b", r: 4, strokeWidth: 2, stroke: '#0B1512' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={2000}
                />
              ))}
            </ReLineChart>
          </ResponsiveContainer>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel p-0 overflow-hidden border-white/[0.05]"
    >
      <div className="p-6 pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-10 h-10 rounded-xl bg-gn-500/10 flex items-center justify-center shadow-inner">
            {viewMode === 'table' ? <Table size={20} className="text-gn-400" /> : <BarChart3 size={20} className="text-gn-400" />}
          </div>
          <div className="flex bg-surface-base p-1 rounded-xl border border-white/[0.03]">
            <button 
              onClick={() => setViewMode('table')}
              className={cn(
                "px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all tracking-wider uppercase",
                viewMode === 'table' ? "bg-gn-500 text-black shadow-lg shadow-gn-500/10" : "text-white/30 hover:text-white/50"
              )}
            >
              Table
            </button>
            {chartType && (
              <button 
                onClick={() => setViewMode('chart')}
                className={cn(
                  "px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all tracking-wider uppercase",
                  viewMode === 'chart' ? "bg-gn-500 text-black shadow-lg shadow-gn-500/10" : "text-white/30 hover:text-white/50"
                )}
              >
                Insights
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="bg-gn-500/10 text-gn-400 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">
              {results.total} records
            </span>
            {results.rows.length > 50 && viewMode === 'chart' && (
              <span className="text-[9px] text-white/20 uppercase tracking-widest mt-1.5">Visualizing first 50</span>
            )}
          </div>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-white/40 hover:text-white hover:bg-white/5 transition-all shadow-sm"
          >
            <Download size={18} />
          </motion.button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'table' ? (
          <motion.div 
            key="table"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin relative"
          >
            <table className="w-full text-left text-[13px] border-collapse min-w-[800px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-surface-200/95 backdrop-blur-xl">
                  {results.columns.map(col => (
                    <th 
                      key={col} 
                      className="px-6 py-5 font-bold text-white/40 uppercase tracking-[0.15em] border-b border-white/[0.05] whitespace-nowrap text-[11px]"
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: rowIndex < 15 ? rowIndex * 0.03 : 0 }}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {results.columns.map(col => (
                      <td key={col} className="px-6 py-4 text-white/70 font-mono whitespace-nowrap">
                        {row[col] === null || row[col] === undefined ? (
                          <span className="text-white/10 italic">null</span>
                        ) : typeof row[col] === 'number' ? (
                          <span className="text-gn-400/80 font-semibold">{row[col].toLocaleString()}</span>
                        ) : (
                          String(row[col])
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        ) : (
          <motion.div
            key="chart"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="p-6 pt-0"
          >
            <div className="glass-card bg-black/20 border-white/[0.03] p-6 rounded-3xl">
              {renderChart()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
