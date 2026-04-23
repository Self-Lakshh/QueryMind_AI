import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Table, Download, AlertCircle, BarChart3, LineChart, Hash } from 'lucide-react';
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
    rows: any[];
    total: number;
    error?: string;
  };
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  const [viewMode, setViewMode] = React.useState<'table' | 'chart'>('table');

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
        <div className="flex flex-col items-center justify-center py-16">
          <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2">{numericCols[0]}</span>
          <span className="text-6xl font-bold text-gn-400 text-glow">{val.toLocaleString()}</span>
        </div>
      );
    }

    if (chartType === 'bar') {
      return (
        <div className="h-[350px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey={textCols[0]} 
                stroke="rgba(255,255,255,0.4)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="rgba(255,255,255,0.4)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0B1512', 
                  border: '1px solid rgba(34,197,94,0.3)', 
                  borderRadius: '12px',
                  fontSize: '12px'
                }} 
                itemStyle={{ color: '#22c55e' }}
              />
              <Bar 
                dataKey={numericCols[0]} 
                fill="#22c55e" 
                radius={[4, 4, 0, 0]} 
                fillOpacity={0.8}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (chartType === 'line') {
      return (
        <div className="h-[350px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey={results.columns[0]} 
                stroke="rgba(255,255,255,0.4)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="rgba(255,255,255,0.4)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0B1512', 
                  border: '1px solid rgba(34,197,94,0.3)', 
                  borderRadius: '12px',
                  fontSize: '12px'
                }} 
              />
              {numericCols.map((col, i) => (
                <Line 
                  key={col}
                  type="monotone" 
                  dataKey={col} 
                  stroke={i === 0 ? "#22c55e" : i === 1 ? "#3b82f6" : "#f59e0b"} 
                  strokeWidth={2}
                  dot={{ fill: i === 0 ? "#22c55e" : i === 1 ? "#3b82f6" : "#f59e0b", r: 3 }}
                  animationDuration={1500}
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
      className="panel overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-gn-500/10 flex items-center justify-center">
            {viewMode === 'table' ? <Table size={16} className="text-gn-400" /> : <BarChart3 size={16} className="text-gn-400" />}
          </div>
          <div className="flex bg-white/5 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('table')}
              className={cn(
                "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                viewMode === 'table' ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50"
              )}
            >
              TABLE
            </button>
            {chartType && (
              <button 
                onClick={() => setViewMode('chart')}
                className={cn(
                  "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                  viewMode === 'chart' ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50"
                )}
              >
                CHART
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {results.rows.length > 50 && viewMode === 'chart' && (
            <span className="text-[9px] text-white/20 uppercase tracking-widest mr-2">Showing first 50 rows</span>
          )}
          <span className="bg-gn-500/10 text-gn-400 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            {results.total} rows
          </span>
          <button className="p-2 rounded-lg hover:bg-white/5 text-white/20 hover:text-white transition-all">
            <Download size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'table' ? (
          <motion.div 
            key="table"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="overflow-x-auto max-h-[400px] overflow-y-auto border border-white/[0.05] rounded-xl scrollbar-thin"
          >
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
          </motion.div>
        ) : (
          <motion.div
            key="chart"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            {renderChart()}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
