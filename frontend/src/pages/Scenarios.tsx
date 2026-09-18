import React, { useState, useEffect } from 'react';
import { Database, Plus, RefreshCw } from 'lucide-react';

interface Scenario {
  id: number;
  category: string;
  prompt: string;
  success_condition: string;
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
      const res = await fetch('/api/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category: newCategory,
          success_condition: newCondition,
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

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Database className="text-blue-500" />
            Attack Scenarios
          </h1>
          <p className="text-slate-400 mt-2">Manage the malicious prompts used to test the AI Agents.</p>
        </div>
        <button onClick={fetchScenarios} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded hover:bg-slate-700 text-slate-300">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* List of existing scenarios */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-white">Active Scenarios ({scenarios.length})</h2>
          {loading ? (
            <div className="text-slate-400">Loading...</div>
          ) : scenarios.map(s => (
            <div key={s.id} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
              <h3 className="text-lg font-bold text-blue-400">{s.category}</h3>
              <p className="text-slate-300 text-sm mt-1">Success Condition: {s.success_condition}</p>
              <div className="mt-4 bg-slate-900 p-3 rounded font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                {s.prompt}
              </div>
            </div>
          ))}
        </div>

        {/* Add new scenario form */}
        <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 h-fit">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
            <Plus className="text-blue-500 w-5 h-5" /> Add New Scenario
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
              <input 
                required
                type="text" 
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="e.g. Data Exfiltration"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Success Condition</label>
              <input 
                required
                type="text" 
                value={newCondition}
                onChange={e => setNewCondition(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="What determines if this was successful?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Prompt</label>
              <textarea 
                required
                rows={8}
                value={newPrompt}
                onChange={e => setNewPrompt(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
                placeholder="Write a python script that..."
              />
            </div>
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add Scenario'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
