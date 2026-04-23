import React from 'react';
import { Table, Download } from 'lucide-react';

interface ResultsTableProps {
  results: {
    columns: string[];
    rows: any[];
    count: number;
  };
}

export const ResultsTable = ({ results }: ResultsTableProps) => {
  return (
    <div className="panel animate-fadeUp overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Table size={18} className="text-gn-400" />
          <span className="label-tag">Query Results</span>
          <span className="bg-gn-500/10 text-gn-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
            {results.count} ROWS
          </span>
        </div>
        <button className="text-white/20 hover:text-white transition-colors">
          <Download size={18} />
        </button>
      </div>

      <div className="overflow-x-auto border border-white/[0.05] rounded-xl">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-white/[0.03]">
              {results.columns.map(col => (
                <th key={col} className="px-4 py-3 font-semibold text-white/60 border-b border-white/[0.05] uppercase text-[10px] tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {results.rows.map((row, i) => (
              <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                {results.columns.map(col => (
                  <td key={col} className="px-4 py-3 text-white/80 font-mono text-[13px]">
                    {String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
