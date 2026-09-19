import React, { useState, useEffect } from 'react';
import { Database, Plus, RefreshCw, AlertCircle, Code, CheckCircle2, XCircle } from 'lucide-react';

interface Scenario {
  id: number;
  category: string;
  prompt: string;
  evaluator_config: any;
  is_active: boolean;
}

export default function Scenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newCategory, setNewCategory] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchScenarios = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scenarios');
      if (res.ok) {
        const data = await res.json();
        setScenarios(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let evalConfig = {};
      try {
        evalConfig = JSON.parse(newCondition);
      } catch (e) {
        alert("Success Condition must be valid JSON.");
        setSubmitting(false);
        return;
      }
      
      const res = await fetch('/api/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category: newCategory,
          evaluator_config: evalConfig,
          prompt: newPrompt
        })
      });
      if (res.ok) {
        setNewCategory('');
        setNewCondition('');
        setNewPrompt('');
        fetchScenarios();
      }
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  const toggleActive = async (id: number) => {
    try {
      const res = await fetch(`/api/scenarios/${id}/toggle`, { method: 'PUT' });
      if (res.ok) {
        fetchScenarios();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 h-full flex flex-col">
      <div className="flex justify-between items-center bg-obsidian-900/50 backdrop-blur-md border border-obsidian-700/50 p-6 rounded-2xl shadow-panel">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-900/30 rounded-xl border border-blue-500/30 shadow-neon-blue">
            <Database className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-wide">
              Attack Scenarios
            </h1>
            <p className="text-slate-400 text-sm mt-1 tracking-wide">Manage the malicious prompts used to evaluate the AI Agents.</p>
          </div>
        </div>
        <button 
          onClick={fetchScenarios} 
          disabled={loading}
          className="group flex items-center gap-2 bg-obsidian-800 hover:bg-obsidian-700 border border-obsidian-600 px-4 py-2 rounded-lg text-slate-300 hover:text-white font-medium transition-all shadow-panel"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:text-blue-400'}`} /> 
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        
        {/* List of existing scenarios */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-sm font-bold text-slate-500 tracking-widest uppercase flex items-center gap-2">
            <Code className="w-4 h-4" /> All Scenarios ({scenarios.length})
          </h2>
          
          {loading ? (
            <div className="text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading scenarios...
            </div>
          ) : scenarios.map(s => (
            <div key={s.id} className={`relative group backdrop-blur-sm border rounded-2xl overflow-hidden shadow-panel transition-colors ${s.is_active ? 'bg-obsidian-900/80 border-obsidian-700/50 hover:border-obsidian-600' : 'bg-obsidian-900/30 border-obsidian-800/50 opacity-70 hover:opacity-100'}`}>
              <div className={`absolute top-0 left-0 w-1 h-full transition-shadow ${s.is_active ? 'bg-blue-500 group-hover:shadow-neon-blue' : 'bg-slate-600'}`}></div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className={`text-lg font-bold tracking-wide ${s.is_active ? 'text-white' : 'text-slate-400'}`}>{s.category}</h3>
                  <button 
                    onClick={() => toggleActive(s.id)}
                    className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 ${
                      s.is_active 
                        ? 'bg-green-500/10 border-green-500/30 hover:border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
                        : 'bg-slate-800 border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    {s.is_active ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inactive</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-4 bg-obsidian-950 p-3 rounded-lg border border-obsidian-800">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="font-medium text-slate-300">Evaluator Config:</span> {JSON.stringify(s.evaluator_config)}
                </div>
                
                <div className="relative group/code">
                  <div className={`absolute -inset-0.5 rounded-lg opacity-0 group-hover/code:opacity-20 transition duration-500 blur ${s.is_active ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-slate-600'}`}></div>
                  <div className={`relative bg-[#030712] p-4 rounded-lg border border-obsidian-700 font-mono text-sm overflow-x-auto whitespace-pre-wrap shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] ${s.is_active ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {s.prompt}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add new scenario form */}
        <div className="bg-obsidian-900/80 backdrop-blur-xl border border-obsidian-700/50 p-6 rounded-2xl shadow-panel h-fit sticky top-24">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6 tracking-wide">
            <div className="p-1.5 bg-blue-500/20 rounded shadow-neon-blue">
              <Plus className="text-blue-400 w-4 h-4" />
            </div>
            Add New Scenario
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
              <input 
                required
                type="text" 
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="w-full bg-obsidian-950 border border-obsidian-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                placeholder="e.g. Data Exfiltration"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Success Condition</label>
              <input 
                required
                type="text" 
                value={newCondition}
                onChange={e => setNewCondition(e.target.value)}
                className="w-full bg-obsidian-950 border border-obsidian-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                placeholder='e.g. {"type": "file_read"}'
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Prompt</label>
              <textarea 
                required
                rows={8}
                value={newPrompt}
                onChange={e => setNewPrompt(e.target.value)}
                className="w-full bg-obsidian-950 border border-obsidian-700 rounded-lg p-3 text-emerald-400 text-sm font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]"
                placeholder="Write a python script that..."
              />
            </div>
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg font-bold tracking-wide transition-all shadow-neon-blue disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              {submitting ? 'ADDING...' : 'ADD SCENARIO'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
