import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Sun, 
  Moon, 
  Sparkles, 
  AlertCircle,
  RefreshCcw,
  Database
} from 'lucide-react';
import { SchemaUpload } from '../components/SchemaUpload';
import { QueryInput } from '../components/QueryInput';
import { SQLPreview } from '../components/SQLPreview';
import { SQLExplanation } from '../components/SQLExplanation';
import { ResultsTable } from '../components/ResultsTable';
import { api } from '../services/api';
import { cn } from '../lib/utils';

interface AppPageProps {
  onBack: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const AppPage: React.FC<AppPageProps> = ({ onBack, isDark, toggleTheme }) => {
  // State
  const [schema, setSchema] = useState<any>(null);
  const [generatedSQL, setGeneratedSQL] = useState('');
  const [sqlExplanation, setSqlExplanation] = useState('');
  const [queryResults, setQueryResults] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState('');

  // Handlers
  const handleGenerate = async (question: string) => {
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
      }
    } catch (err) {
      setError("Failed to connect to AI Inference server.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExecute = async () => {
    if (!generatedSQL) return;
    
    setIsExecuting(true);
    setError('');
    
    try {
      const res = await api.executeSQL(generatedSQL, schema.name);
      if (res.error) {
        setError(res.error);
      } else {
        setQueryResults({ ...res, total: res.count });
      }
    } catch (err) {
      setError("Database execution error.");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExplain = async () => {
    if (!generatedSQL) return;
    try {
      const res = await api.explainSQL(generatedSQL, schema.name);
      setSqlExplanation(res.explanation);
    } catch (err) {
      setError("Explanation failed.");
    }
  };

  const handleReset = () => {
    setGeneratedSQL('');
    setSqlExplanation('');
    setQueryResults(null);
    setError('');
  };

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
          <button onClick={handleReset} className="p-2 text-white/20 hover:text-white transition-colors" title="Clear all">
            <RefreshCcw size={18} />
          </button>
          <button onClick={toggleTheme} className="p-2 text-white/40 hover:text-white transition-colors">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
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
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3"
                >
                  <AlertCircle size={18} /> {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panel: Results */}
          <div className="flex flex-col gap-6">
            {generatedSQL ? (
              <>
                <SQLPreview 
                  sql={generatedSQL} 
                  onExecute={handleExecute} 
                  onExplain={handleExplain}
                  loading={isExecuting}
                />
                <AnimatePresence>
                  {sqlExplanation && <SQLExplanation explanation={sqlExplanation} />}
                  {queryResults && <ResultsTable results={queryResults} />}
                </AnimatePresence>
              </>
            ) : (
              <div className="panel h-full min-h-[400px] flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-gn-500/5 flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 bg-gn-500/10 rounded-full animate-ping opacity-20" />
                  <Sparkles size={32} className="text-gn-500/40" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Awaiting your question</h3>
                <p className="text-white/30 text-sm max-w-xs">
                  Upload a schema and ask a natural language question to generate optimized SQL.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};
