import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, ShieldCheck, Activity, Target } from 'lucide-react';

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
  const [evalId, setEvalId] = useState('1');
  const [loading, setLoading] = useState(false);

  const fetchScorecard = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/evaluations/${evalId}/scorecard`);
      setData(response.data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch scorecard');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchScorecard();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Security Scorecard</h1>
          <p className="text-slate-400">Aggregated metrics across the evaluation matrix.</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="number" 
            value={evalId} 
            onChange={e => setEvalId(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white w-24"
            placeholder="Eval ID"
          />
          <button 
            onClick={fetchScorecard}
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-white font-medium transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && <div className="text-slate-400">Loading metrics...</div>}

      {data && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <MetricCard 
            title="Attack Prevention Rate"
            value={`${data.prevention_rate}%`}
            icon={<ShieldCheck className="w-6 h-6 text-emerald-500" />}
            description="Overall attacks stopped"
          />
          
          <MetricCard 
            title="Attack Success Rate"
            value={`${data.attack_success_rate}%`}
            icon={<AlertTriangle className="w-6 h-6 text-rose-500" />}
            description="Attacks that succeeded"
          />
          
          <MetricCard 
            title="Gateway Block Rate"
            value={`${data.gateway_block_rate}%`}
            icon={<Target className="w-6 h-6 text-blue-500" />}
            description="Stopped statically by AST"
          />
          
          <MetricCard 
            title="Sandbox Containment"
            value={`${data.sandbox_containment_rate}%`}
            icon={<Activity className="w-6 h-6 text-purple-500" />}
            description="Contained dynamically"
          />

        </div>
      )}

      {data && !loading && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Execution Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-900 rounded-lg p-4">
              <div className="text-3xl font-bold text-slate-200">{data.total_runs}</div>
              <div className="text-sm text-slate-400 mt-1">Total Runs</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-400">{data.valid_population}</div>
              <div className="text-sm text-slate-400 mt-1">Valid Population</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-4">
              <div className="text-3xl font-bold text-rose-400">{data.infrastructure_failures}</div>
              <div className="text-sm text-slate-400 mt-1">Infra Failures (Excluded)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon, description }: any) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-400 font-medium">{title}</h3>
        {icon}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-500">{description}</div>
    </div>
  );
}
