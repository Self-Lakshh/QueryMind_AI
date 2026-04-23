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
      setError(err.response?.data?.detail || "Failed to parse schema");
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
      // For upload, we might not have the raw text easily if it's sent as multipart.
      // But the backend returns the schema_dict.
      // Let's assume the user usually pastes if they want to save.
      onLoaded(res); 
    } catch (err: any) {
      setError("File upload failed");
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
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex p-1 bg-surface-base/50 rounded-xl border border-white/[0.03]">
          <button 
            onClick={() => setActiveTab('paste')}
            className={cn(
              "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all",
              activeTab === 'paste' ? "bg-gn-500 text-black shadow-lg" : "text-white/40 hover:text-white"
            )}
          >
            Paste Text
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className={cn(
              "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all",
              activeTab === 'upload' ? "bg-gn-500 text-black shadow-lg" : "text-white/40 hover:text-white"
            )}
          >
            Upload File
          </button>
        </div>
        <span className="label-tag">Database Schema</span>
      </div>

      {/* Schema Library Dropdown */}
      {savedSchemas.length > 0 && (
        <div className="relative mb-6">
          <button 
            onClick={() => setLibraryOpen(!libraryOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all group"
          >
            <div className="flex items-center gap-3">
              <Library size={14} className="text-gn-500/60" />
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider group-hover:text-white/80 transition-colors">
                Saved Schemas ({savedSchemas.length})
              </span>
            </div>
            <ChevronDown size={14} className={cn("text-white/20 transition-transform duration-300", libraryOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {libraryOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-2 z-20 glass-card p-2 shadow-2xl border-white/[0.08]"
              >
                {savedSchemas.map((s, i) => (
                  <div key={i} className="group relative">
                    <button
                      onClick={() => handleLoadSaved(s)}
                      className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-gn-500/10 text-[12px] text-white/60 hover:text-gn-400 transition-all"
                    >
                      {s.name}
                    </button>
                    <button
                      onClick={() => handleDeleteSchema(s.name)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
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
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            <textarea 
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100));"
              className="input-dark font-mono text-[13px] mb-4"
            />
            <button 
              onClick={handleLoad}
              disabled={loading || !text.trim()}
              className="glow-btn w-full"
            >
              {loading ? "Processing..." : "Load Schema"}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onClick={() => fileInputRef.current?.click()}
            className="group border-2 border-dashed border-white/10 rounded-2xl py-12 flex flex-col items-center gap-4 hover:border-gn-500/40 hover:bg-white/[0.02] transition-all cursor-pointer"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".sql,.txt"
              onChange={handleFileSelect}
            />
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="text-white/40 group-hover:text-gn-400" />
            </div>
            <div className="text-center">
              <p className="text-sm text-white/60 font-medium">Drop your .sql file</p>
              <p className="text-xs text-white/20">or click to browse</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        {success && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-6 p-4 rounded-xl bg-gn-500/5 border border-gn-500/10 flex items-start gap-3"
          >
            <CheckCircle2 size={18} className="text-gn-500 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-gn-400 uppercase tracking-wider">Schema Loaded</p>
                {!isSaving ? (
                  <button 
                    onClick={() => setIsSaving(true)}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-white/20 hover:text-gn-400 transition-colors"
                  >
                    <BookmarkPlus size={12} />
                    Save Library
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input 
                      autoFocus
                      value={saveName}
                      onChange={e => setSaveName(e.target.value)}
                      placeholder="Schema name..."
                      className="bg-transparent border-b border-gn-500/40 text-[10px] text-white outline-none w-24"
                      onKeyDown={e => e.key === 'Enter' && handleSaveSchema()}
                    />
                    <button onClick={handleSaveSchema} className="text-[10px] font-bold text-gn-400">Save</button>
                    <button onClick={() => setIsSaving(false)} className="text-[10px] font-bold text-white/20">Cancel</button>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed">
                Found tables: {success.join(', ')}
              </p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-6 p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center gap-3 text-red-400 text-xs"
          >
            <AlertCircle size={18} /> {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
