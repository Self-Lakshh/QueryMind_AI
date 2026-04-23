import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Sun, 
  Moon, 
  AlertCircle,
  RefreshCcw,
  Database,
  Clock
} from 'lucide-react';
import { SchemaUpload } from '../components/SchemaUpload';
import { QueryInput } from '../components/QueryInput';
import { SQLPreview } from '../components/SQLPreview';
import { SQLExplanation } from '../components/SQLExplanation';
import { ResultsTable } from '../components/ResultsTable';
import { QueryHistory } from '../components/QueryHistory';
import type { HistoryItem } from '../components/QueryHistory';
import { api } from '../services/api';

interface AppPageProps {
  onBack: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const AppPage: React.FC<AppPageProps> = ({ onBack, isDark, toggleTheme }) => {
  // State
  const [schema, setSchema] = useState<{name: string, tables: string[] | null} | null>(null);
  const [generatedSQL, setGeneratedSQL] = useState('');
  const [sqlExplanation, setSqlExplanation] = useState('');
  const [queryResults, setQueryResults] = useState<{ columns: string[], rows: Record<string, unknown>[], total: number } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('querymind_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Error Auto-Fade
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const humanizeError = (err: string) => {
    if (err.includes("ECONNREFUSED")) return "AI service is offline. Please start the inference server.";
    if (err.includes("SELECT queries are allowed")) return "Security Block: Only SELECT operations are permitted.";
    return err;
  };

  // Handlers
  const handleGenerate = useCallback(async (question: string) => {
    if (!schema) {
      setError("Please set a database schema first.");
      return;
    }
    
    setError('');
    setIsGenerating(true);
    setQueryResults(null);
    setSqlExplanation('');
    
    try {
      const res = await api.generateSQL(question, schema.name);
      if (res.error) {
        setError(res.error);
      } else {
        setGeneratedSQL(res.sql);
        
        try {
          const { cost } = await api.getQueryCost(res.sql, schema.name);
          const newItem: HistoryItem = {
            id: Date.now().toString(),
            question,
            sql: res.sql,
            timestamp: Date.now(),
            tables_used: res.tables_used,
            cost: cost
          };
          
          setHistory(prev => {
            const updated = [newItem, ...prev].slice(0, 50);
            localStorage.setItem('querymind_history', JSON.stringify(updated));
            return updated;
          });
        } catch {
          console.error("Could not fetch query cost for history");
        }
      }
    } catch {
      setError("Failed to connect to AI Inference server.");
    } finally {
      setIsGenerating(false);
    }
  }, [schema]);

  const handleExecute = useCallback(async () => {
    if (!generatedSQL || !schema) return;
    
    setIsExecuting(true);
    setError('');
    
    try {
      const res = await api.executeSQL(generatedSQL, schema.name);
      if (res.error) {
        setError(res.error);
      } else {
        setQueryResults({ ...res, total: res.total || res.count || 0 });
      }
    } catch {
      setError("Database execution error.");
    } finally {
      setIsExecuting(false);
    }
  }, [generatedSQL, schema]);

  const handleExplain = useCallback(async () => {
    if (!generatedSQL || !schema) return;
    try {
      const res = await api.explainSQL(generatedSQL, schema.name);
      setSqlExplanation(res.explanation);
    } catch {
      setError("Explanation failed.");
    }
  }, [generatedSQL, schema]);

  const handleReset = useCallback(() => {
    setGeneratedSQL('');
    setSqlExplanation('');
    setQueryResults(null);
    setError('');
  }, []);

  const handleHistorySelect = useCallback((item: HistoryItem) => {
    setGeneratedSQL(item.sql);
    setQueryResults(null);
    setSqlExplanation('');
  }, []);

  const handleHistoryDelete = useCallback((id: string) => {
    setHistory(prev => {
      const updated = prev.filter(i => i.id !== id);
      localStorage.setItem('querymind_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleHistoryClear = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('querymind_history');
  }, []);

  return (
    <div className="flex flex-col h-screen bg-surface-base">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-surface-100/80 border-b border-white/[0.05] h-16 flex items-center px-6 justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft size={18} /> Back
        </button>
        
        <div className="flex items-center gap-2">
          <Database size={18} className="text-gn-500" />
          <span className="text-gn-400 font-bold tracking-[0.2em] text-sm uppercase">QueryMind</span>
        </div>

        <div className="flex items-center gap-4">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsHistoryOpen(true)} 
            className="p-2 text-white/40 hover:text-white transition-colors relative"
            title="Query History"
          >
            <Clock size={18} />
            {history.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-gn-500 rounded-full border border-surface-100" />
            )}
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleReset} 
            className="p-2 text-white/20 hover:text-white transition-colors" 
            title="Clear all"
          >
            <RefreshCcw size={18} />
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme} 
            className="p-2 text-white/40 hover:text-white transition-colors"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 overflow-y-auto bg-grid px-6 py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Panel: Inputs */}
          <div className="flex flex-col gap-6">
            <SchemaUpload onLoaded={setSchema} />
            <QueryInput 
              onSubmit={handleGenerate} 
              loading={isGenerating} 
            />
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 shadow-[0_0_30px_rgba(239,68,68,0.1)]"
                >
                  <AlertCircle size={18} />
                  <span className="font-medium">{humanizeError(error)}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panel: Results */}
          <div className="flex flex-col gap-6">
            {generatedSQL ? (
              <div className="flex flex-col gap-6">
                <SQLPreview 
                  sql={generatedSQL} 
                  onExecute={handleExecute} 
                  onExplain={handleExplain}
                  loading={isExecuting}
                />
                <AnimatePresence mode="wait">
                  {sqlExplanation && <SQLExplanation explanation={sqlExplanation} key="explanation" />}
                  {queryResults && <ResultsTable results={queryResults} key="results" />}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="panel h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 border-dashed border-white/5 bg-transparent"
              >
                <div className="w-24 h-24 rounded-3xl bg-gn-500/5 flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 bg-gn-500/10 rounded-3xl animate-ping opacity-10" />
                  <Database size={40} className="text-gn-500/30" />
                </div>
                <h3 className="text-white/60 font-bold text-xl mb-3 tracking-tight">Upload a schema to start</h3>
                <p className="text-white/20 text-sm max-w-[280px] leading-relaxed">
                  Provide your database structure to enable AI-powered SQL generation and analysis.
                </p>
              </motion.div>
            )}
          </div>

        </div>
      </main>

      <QueryHistory 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleHistorySelect}
        onDelete={handleHistoryDelete}
        onClear={handleHistoryClear}
      />
    </div>
  );
};
