import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle2, AlertCircle, BookmarkPlus, ChevronDown, Trash2, Library } from 'lucide-react';
import { api } from '../services/api';
import { cn } from '../lib/utils';

interface SchemaUploadProps {
  onLoaded: (schema: any) => void;
}

export const SchemaUpload: React.FC<SchemaUploadProps> = ({ onLoaded }) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<string[] | null>(null);
  const [savedSchemas, setSavedSchemas] = useState<{name: string, sql: string}[]>(() => {
    const saved = localStorage.getItem('querymind_schemas');
    return saved ? JSON.parse(saved) : [];
  });
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoad = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setSuccess(null);
    try {
      const name = `schema_${Date.now()}`;
      const res = await api.pasteSchema(name, text);
      setSuccess(res.tables);
      onLoaded({ name, tables: res.tables });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to parse schema structure");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setError('');
    setSuccess(null);
    try {
      const res = await api.uploadSchema(file);
      setSuccess(res.tables);
      onLoaded(res); 
    } catch (err: any) {
      setError("File upload failed. Ensure the format is valid .sql or .txt");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchema = () => {
    if (!saveName.trim() || !text.trim()) return;
    const newSchemas = [{ name: saveName, sql: text }, ...savedSchemas].slice(0, 10);
    setSavedSchemas(newSchemas);
    localStorage.setItem('querymind_schemas', JSON.stringify(newSchemas));
    setSaveName('');
    setIsSaving(false);
  };

  const handleDeleteSchema = (name: string) => {
    const newSchemas = savedSchemas.filter(s => s.name !== name);
    setSavedSchemas(newSchemas);
    localStorage.setItem('querymind_schemas', JSON.stringify(newSchemas));
  };

  const handleLoadSaved = async (schema: {name: string, sql: string}) => {
    setText(schema.sql);
    setActiveTab('paste');
    setLibraryOpen(false);
    
    setLoading(true);
    setError('');
    setSuccess(null);
    try {
      const res = await api.pasteSchema(schema.name, schema.sql);
      setSuccess(res.tables);
      onLoaded(res);
    } catch (err) {
      setError("Failed to reload saved schema");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel overflow-hidden border-white/[0.05] p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex p-1 bg-surface-base/50 rounded-xl border border-white/[0.03] shadow-inner">
          <motion.button 
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab('paste')}
            className={cn(
              "px-5 py-2 text-[11px] font-bold rounded-lg transition-all tracking-wider uppercase",
              activeTab === 'paste' ? "bg-gn-500 text-black shadow-lg shadow-gn-500/10" : "text-white/30 hover:text-white"
            )}
          >
            Paste Text
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab('upload')}
            className={cn(
              "px-5 py-2 text-[11px] font-bold rounded-lg transition-all tracking-wider uppercase",
              activeTab === 'upload' ? "bg-gn-500 text-black shadow-lg shadow-gn-500/10" : "text-white/30 hover:text-white"
            )}
          >
            Upload File
          </motion.button>
        </div>
        <span className="label-tag text-[10px] bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.05]">Data Source</span>
      </div>

      {/* Schema Library Dropdown */}
      {savedSchemas.length > 0 && (
        <div className="relative mb-6">
          <motion.button 
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setLibraryOpen(!libraryOpen)}
            className="w-full flex items-center justify-between px-5 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-gn-500/10 flex items-center justify-center">
                <Library size={12} className="text-gn-400" />
              </div>
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-[0.12em] group-hover:text-white/80 transition-colors">
                Schema Library ({savedSchemas.length})
              </span>
            </div>
            <ChevronDown size={14} className={cn("text-white/20 transition-transform duration-300", libraryOpen && "rotate-180")} />
          </motion.button>

          <AnimatePresence>
            {libraryOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                className="absolute top-full left-0 right-0 mt-3 z-20 glass-card p-2 shadow-[0_30px_60px_rgba(0,0,0,0.6)] border-white/[0.08]"
              >
                {savedSchemas.map((s, i) => (
                  <div key={i} className="group relative">
                    <button
                      onClick={() => handleLoadSaved(s)}
                      className="w-full text-left px-4 py-3 rounded-xl hover:bg-gn-500/10 text-[13px] text-white/60 hover:text-gn-400 transition-all font-mono"
                    >
                      {s.name}
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteSchema(s.name)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all bg-red-500/0 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'paste' ? (
          <motion.div
            key="paste"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <div className="relative group">
              <textarea 
                rows={8}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100));"
                className="input-dark font-mono text-[13px] mb-6 min-h-[180px] leading-relaxed resize-none transition-all group-hover:border-white/15"
              />
              <div className="absolute top-4 right-4 pointer-events-none text-white/5 uppercase text-[9px] font-bold tracking-widest group-hover:text-white/10 transition-colors">SQL Syntax</div>
            </div>
            <motion.button 
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLoad}
              disabled={loading || !text.trim()}
              className="glow-btn w-full shadow-gn-500/20"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  <span>Processing Schema...</span>
                </div>
              ) : "Load Structure"}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            onClick={() => fileInputRef.current?.click()}
            className="group border-2 border-dashed border-white/5 rounded-2xl py-16 flex flex-col items-center gap-5 hover:border-gn-500/30 hover:bg-gn-500/[0.02] transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gn-500/[0.01] opacity-0 group-hover:opacity-100 transition-opacity" />
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".sql,.txt"
              onChange={handleFileSelect}
            />
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center shadow-sm"
            >
              <Upload className="text-white/20 group-hover:text-gn-400 transition-colors" size={28} />
            </motion.div>
            <div className="text-center relative z-10">
              <p className="text-[15px] text-white/70 font-bold mb-1 tracking-tight">Drop your .sql file</p>
              <p className="text-[11px] text-white/20 uppercase tracking-widest font-medium">or click to browse filesystem</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ height: 0, opacity: 0, y: 20 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            className="mt-8 p-6 rounded-2xl bg-gn-500/[0.03] border border-gn-500/10 flex items-start gap-5 shadow-[0_10px_30px_rgba(34,197,94,0.03)]"
          >
            <div className="w-10 h-10 rounded-xl bg-gn-500/10 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} className="text-gn-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[11px] font-bold text-gn-400 uppercase tracking-[0.15em]">Schema Synchronized</h4>
                {!isSaving ? (
                  <motion.button 
                    whileHover={{ x: -2 }}
                    onClick={() => setIsSaving(true)}
                    className="flex items-center gap-2 text-[10px] font-bold text-white/20 hover:text-gn-400 transition-colors uppercase tracking-widest"
                  >
                    <BookmarkPlus size={12} />
                    Save To Library
                  </motion.button>
                ) : (
                  <div className="flex items-center gap-3 bg-white/[0.03] p-1 rounded-lg border border-white/5">
                    <input 
                      autoFocus
                      value={saveName}
                      onChange={e => setSaveName(e.target.value)}
                      placeholder="Name..."
                      className="bg-transparent text-[10px] text-white outline-none w-20 px-2 font-bold"
                      onKeyDown={e => e.key === 'Enter' && handleSaveSchema()}
                    />
                    <button onClick={handleSaveSchema} className="text-[10px] font-bold text-gn-400 hover:text-gn-300 transition-colors uppercase">OK</button>
                    <button onClick={() => setIsSaving(false)} className="text-[10px] font-bold text-white/20 hover:text-white transition-colors uppercase">ESC</button>
                  </div>
                )}
              </div>
              <p className="text-[12px] text-white/40 leading-relaxed truncate">
                Mapped {success.length} tables: {success.join(', ')}
              </p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ height: 0, opacity: 0, y: 20 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            className="mt-8 p-5 rounded-2xl bg-red-500/[0.03] border border-red-500/10 flex items-center gap-4 text-red-400 shadow-[0_10px_30px_rgba(239,68,68,0.03)]"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertCircle size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1 text-red-400/80">Structure Error</p>
              <p className="text-[12px] text-red-400/60 leading-tight">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
