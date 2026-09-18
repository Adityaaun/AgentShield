import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, ShieldCheck, Activity, Target, RefreshCw } from 'lucide-react';

interface ScorecardData {
  total_runs: number;
  valid_population: number;
  infrastructure_failures: number;
  attack_success_rate: number;
  prevention_rate: number;
  gateway_block_rate: number;
  sandbox_containment_rate: number;
}

export default function Scorecard() {
  const [data, setData] = useState<ScorecardData | null>(null);
  const [evalId, setEvalId] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchScorecard = async (idToFetch?: string) => {
    const targetId = idToFetch || evalId;
    if (!targetId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/evaluations/${targetId}/scorecard`);
      setData(response.data);
    } catch (err) {
      console.error(err);
      // Fallback if the evaluation doesn't exist yet
      setData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Fetch the latest eval ID on load
    const fetchLatest = async () => {
      try {
        const res = await axios.get('/api/evaluations/latest');
        if (res.data && res.data.id) {
          setEvalId(res.data.id.toString());
          fetchScorecard(res.data.id.toString());
        }
      } catch (err) {
        console.error("No evaluations found");
      }
    };
    fetchLatest();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-obsidian-900/50 backdrop-blur-md border border-obsidian-700/50 p-6 rounded-2xl shadow-panel">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-900/30 rounded-xl border border-blue-500/30 shadow-neon-blue">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-wide">
              Security Scorecard
            </h1>
            <p className="text-slate-400 text-sm mt-1 uppercase tracking-wider">Aggregated Empirical Matrix Results</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <span className="absolute -top-2 left-2 px-1 bg-obsidian-900 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Eval ID</span>
            <input 
              type="number" 
              value={evalId} 
              onChange={e => setEvalId(e.target.value)}
              className="bg-obsidian-950 border border-obsidian-700 focus:border-blue-500 rounded-lg px-4 py-2 text-white w-24 h-[42px] focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono"
            />
          </div>
          <button 
            onClick={() => fetchScorecard()}
            disabled={loading}
            className="group flex items-center gap-2 bg-obsidian-800 hover:bg-obsidian-700 border border-obsidian-600 px-4 py-2 h-[42px] rounded-lg text-slate-300 hover:text-white font-medium transition-all shadow-panel"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:text-blue-400'}`} /> 
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {!data && !loading && (
        <div className="flex flex-col items-center justify-center py-24 bg-obsidian-900/30 border border-obsidian-800/50 rounded-2xl border-dashed">
          <AlertTriangle className="w-12 h-12 text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-slate-300">No Evaluation Found</h3>
          <p className="text-slate-500 mt-2">Enter a valid Evaluation ID or run the Matrix Pipeline first.</p>
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <RadialMetricCard 
              title="Attack Prevention"
              value={data.prevention_rate}
              color="emerald"
              glow="shadow-neon-green"
              strokeColor="#10b981"
            />
            
            <RadialMetricCard 
              title="Attack Success"
              value={data.attack_success_rate}
              color="rose"
              glow="shadow-neon-red"
              strokeColor="#ef4444"
            />
            
            <RadialMetricCard 
              title="Gateway Blocked"
              value={data.gateway_block_rate}
              color="cyan"
              glow="shadow-neon-cyan"
              strokeColor="#00f0ff"
            />
            
            <RadialMetricCard 
              title="Sandbox Contained"
              value={data.sandbox_containment_rate}
              color="blue"
              glow="shadow-neon-blue"
              strokeColor="#3b82f6"
            />
          </div>

          <div className="bg-obsidian-900/50 backdrop-blur-sm border border-obsidian-700/50 rounded-2xl p-8 shadow-panel relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500"></div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Execution Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatBlock label="Total Pipeline Runs" value={data.total_runs} />
              <StatBlock label="Valid Population" value={data.valid_population} color="text-blue-400" />
              <StatBlock label="Infrastructure Failures" value={data.infrastructure_failures} color="text-amber-500" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatBlock({ label, value, color = "text-white" }: { label: string, value: number, color?: string }) {
  return (
    <div className="bg-obsidian-950/80 border border-obsidian-800 rounded-xl p-6 flex flex-col justify-center items-center relative group overflow-hidden hover:border-obsidian-600 transition-colors">
      <div className={`text-4xl font-bold font-mono ${color} z-10`}>{value}</div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2 z-10">{label}</div>
    </div>
  );
}

function RadialMetricCard({ title, value, color, glow, strokeColor }: any) {
  // Calculate SVG arc parameters
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative bg-obsidian-900/80 backdrop-blur-xl border border-obsidian-700/50 rounded-2xl p-6 flex flex-col items-center shadow-panel group hover:-translate-y-1 transition-transform duration-300">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 w-full text-center">
        {title}
      </div>
      
      <div className="relative flex items-center justify-center w-36 h-36">
        {/* Background Track */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="transparent"
            stroke="#1b2a4e" // obsidian-700
            strokeWidth="8"
          />
          {/* Progress Arc */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transition: 'stroke-dashoffset 1s ease-in-out',
            }}
            className={`drop-shadow-[0_0_8px_${strokeColor}80]`}
          />
        </svg>
        
        {/* Center Percentage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold font-mono text-${color}-400 drop-shadow-md`}>
            {value}%
          </span>
        </div>
      </div>

      {/* Decorative Glow Line */}
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-${color}-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${glow}`}></div>
    </div>
  );
}
