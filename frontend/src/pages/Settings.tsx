import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Key, Info, Trash2, Save, CheckCircle2, ExternalLink } from 'lucide-react';

const STORAGE_KEYS = {
  GOOGLE_API_KEY: 'agentshield_google_api_key',
  OPENAI_API_KEY: 'agentshield_openai_api_key',
};

export default function Settings() {
  const [googleKey, setGoogleKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setGoogleKey(localStorage.getItem(STORAGE_KEYS.GOOGLE_API_KEY) || '');
    setOpenaiKey(localStorage.getItem(STORAGE_KEYS.OPENAI_API_KEY) || '');
  }, []);

  const handleSave = async () => {
    if (googleKey) localStorage.setItem(STORAGE_KEYS.GOOGLE_API_KEY, googleKey);
    else localStorage.removeItem(STORAGE_KEYS.GOOGLE_API_KEY);
    if (openaiKey) localStorage.setItem(STORAGE_KEYS.OPENAI_API_KEY, openaiKey);
    else localStorage.removeItem(STORAGE_KEYS.OPENAI_API_KEY);
    
    try {
      await axios.post('/api/settings/keys', {
        google_api_key: googleKey || null,
        openai_api_key: openaiKey || null
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Failed to save keys to backend", err);
      alert("Failed to save keys to backend. Check console.");
    }
  };

  const handleClearData = async () => {
    if (confirm('Are you sure? This will clear all saved API keys from this browser and the backend.')) {
      localStorage.removeItem(STORAGE_KEYS.GOOGLE_API_KEY);
      localStorage.removeItem(STORAGE_KEYS.OPENAI_API_KEY);
      setGoogleKey('');
      setOpenaiKey('');
      
      try {
        await axios.post('/api/settings/keys', {
          google_api_key: "",
          openai_api_key: ""
        });
      } catch (err) {
        console.error("Failed to clear keys from backend", err);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 bg-obsidian-900/50 backdrop-blur-md border border-obsidian-700/50 p-6 rounded-2xl shadow-panel">
        <div className="p-3 bg-slate-800 rounded-xl border border-slate-600/40">
          <Key className="w-8 h-8 text-slate-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-wide">
            Settings
          </h1>
          <p className="text-slate-400 text-sm mt-1 uppercase tracking-wider">API Keys & Configuration</p>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-obsidian-900/60 border border-obsidian-700/50 rounded-2xl p-6 shadow-panel space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Key className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">API Keys</h2>
        </div>
        <p className="text-xs text-slate-500">
          Keys are stored in your browser's localStorage and securely updated in the backend <code className="text-blue-400 bg-blue-900/20 px-1 rounded">.env</code> file for live evaluations.
        </p>

        {/* Google Gemini */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Google Gemini API Key
          </label>
          <input
            type="password"
            value={googleKey}
            onChange={e => setGoogleKey(e.target.value)}
            placeholder="AIza..."
            className="w-full bg-obsidian-950 border border-obsidian-700 focus:border-blue-500 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <p className="text-xs text-slate-600 mt-1">
            Get a key at{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer"
              className="text-blue-400 hover:underline inline-flex items-center gap-1">
              aistudio.google.com <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        {/* OpenAI */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            OpenAI API Key <span className="text-xs text-slate-500 font-normal ml-1">(alternative LLM)</span>
          </label>
          <input
            type="password"
            value={openaiKey}
            onChange={e => setOpenaiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full bg-obsidian-950 border border-obsidian-700 focus:border-blue-500 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <p className="text-xs text-slate-600 mt-1">
            Get a key at{' '}
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer"
              className="text-blue-400 hover:underline inline-flex items-center gap-1">
              platform.openai.com <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300
            ${saved ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
        >
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Keys</>}
        </button>
      </div>

      {/* About */}
      <div className="bg-obsidian-900/60 border border-obsidian-700/50 rounded-2xl p-6 shadow-panel space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">About AgentShield</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Version', value: 'v3.0.0' },
            { label: 'Backend', value: 'FastAPI + LangGraph' },
            { label: 'Frontend', value: 'React + Vite + Tailwind' },
            { label: 'Sandbox', value: 'Docker (python:3.10-alpine)' },
            { label: 'Gateway', value: 'AST Static Analysis' },
            { label: 'Database', value: 'SQLite (aiosqlite)' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-obsidian-950/60 rounded-lg p-3 border border-obsidian-800">
              <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
              <p className="text-white font-mono text-sm mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        <a
          href="https://github.com/Adityaaun/AgentShield"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-obsidian-800 hover:bg-obsidian-700 border border-obsidian-600 rounded-xl p-3 text-slate-300 hover:text-white transition-all font-medium text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          View on GitHub
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-950/20 border border-red-800/40 rounded-2xl p-6 shadow-panel">
        <h2 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Danger Zone
        </h2>
        <p className="text-slate-500 text-sm mb-4">
          This will clear all saved API keys from your browser and the backend <code className="text-red-400 bg-red-900/20 px-1 rounded">.env</code> file. Your database and evaluation history will remain intact.
        </p>
        <button
          onClick={handleClearData}
          className="flex items-center gap-2 bg-red-900/30 hover:bg-red-900/60 border border-red-700/50 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Clear Saved Keys
        </button>
      </div>
    </div>
  );
}
