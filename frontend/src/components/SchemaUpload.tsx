import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
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
      const name = file.name.split('.')[0] + "_" + Date.now();
      const res = await api.uploadSchema(name, file);
      setSuccess(res.tables);
      onLoaded({ name, tables: res.tables });
    } catch (err: any) {
      setError("File upload failed");
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

      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-6 p-4 rounded-xl bg-gn-500/5 border border-gn-500/10 flex items-start gap-3"
          >
            <CheckCircle2 size={18} className="text-gn-500 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-gn-400 uppercase tracking-wider mb-1">Schema Loaded</p>
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
