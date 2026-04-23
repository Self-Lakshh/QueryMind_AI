import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, X } from 'lucide-react';
import { api } from '../services/api';
import { cn } from '../lib/utils';

export const SchemaUpload = ({ onSchemaSet }: { onSchemaSet: (schema: any) => void }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('paste');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePaste = async () => {
    setLoading(true);
    try {
      const name = `schema_${Date.now()}`;
      const res = await api.pasteSchema(name, text);
      onSchemaSet({ name, tables: res.tables });
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel mb-6">
      <div className="flex items-center justify-between mb-4">
        <span className="label-tag">Database Schema</span>
        {success && (
          <div className="flex items-center gap-2 text-gn-400 text-xs font-semibold animate-fadeUp">
            <CheckCircle2 size={14} /> Active
          </div>
        )}
      </div>

      <div className="flex gap-2 p-1 bg-surface-base/50 rounded-lg mb-4 border border-white/[0.03]">
        <button 
          onClick={() => setActiveTab('paste')}
          className={cn("flex-1 py-2 text-xs font-medium rounded-md transition-all", activeTab === 'paste' ? "bg-gn-500/10 text-gn-400 border border-gn-500/20" : "text-white/40 hover:text-white/60")}
        >
          Paste SQL/JSON
        </button>
        <button 
          onClick={() => setActiveTab('upload')}
          className={cn("flex-1 py-2 text-xs font-medium rounded-md transition-all", activeTab === 'upload' ? "bg-gn-500/10 text-gn-400 border border-gn-500/20" : "text-white/40 hover:text-white/60")}
        >
          Upload File
        </button>
      </div>

      {activeTab === 'paste' ? (
        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="CREATE TABLE users (id INT, name TEXT...)"
          className="input-dark min-h-[120px] font-mono text-[13px] resize-none mb-4"
        />
      ) : (
        <div className="border-2 border-dashed border-white/[0.08] rounded-xl py-12 flex flex-col items-center gap-4 hover:border-gn-500/40 transition-colors cursor-pointer mb-4">
          <Upload className="text-white/20" />
          <span className="text-white/30 text-sm">Drop your .sql or .json file here</span>
        </div>
      )}

      <button 
        disabled={loading || !text}
        onClick={handlePaste}
        className={cn("w-full py-3 rounded-xl font-semibold transition-all", loading || !text ? "bg-white/5 text-white/20 cursor-not-allowed" : "bg-white/10 text-white hover:bg-white/20")}
      >
        {loading ? "Processing..." : "Set Schema"}
      </button>
    </div>
  );
};
