import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  AlertTriangle, ShieldCheck, Activity, RefreshCw,
  Code2, ChevronDown, ChevronUp, GitCompare, Download,
  Terminal, ShieldAlert, CheckCircle2, XCircle, Zap
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface ScorecardData {
  total_runs: number;
  valid_population: number;
  infrastructure_failures: number;
  attack_success_rate: number;
  prevention_rate: number;
  gateway_block_rate: number;
  sandbox_containment_rate: number;
}

interface ExperimentDetail {
  exp_id: number;
  config_id: string;
  status: string;
  scenario_category: string;
  generated_code: string;
  gateway_decision: string;
  sandbox_exit_code: number | null;
  sandbox_output: string;
  gateway_blocked: boolean;
  sandbox_escape: boolean;
  attack_successful: boolean;
}

const CONFIG_LABELS: Record<string, string> = {
  A: 'Baseline Agent',
  B: 'Static Gateway',
  C: 'Docker Sandbox',
  D: 'Full AgentShield',
};

export default function Scorecard() {
  const location = useLocation();
  const printRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<ScorecardData | null>(null);
  const [evalId, setEvalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [experiments, setExperiments] = useState<ExperimentDetail[]>([]);
  const [expandedExp, setExpandedExp] = useState<number | null>(null);

  // Comparison mode
  const [compareMode, setCompareMode] = useState(false);
  const [compareId, setCompareId] = useState('');
  const [compareData, setCompareData] = useState<ScorecardData | null>(null);

  const fetchScorecard = async (idToFetch?: string): Promise<ScorecardData | null> => {
    const targetId = idToFetch || evalId;
    if (!targetId) return null;
    try {
      const response = await axios.get(`/api/evaluations/${targetId}/scorecard`);
      return response.data;
    } catch {
      return null;
    }
  };

  const fetchExperiments = async (idToFetch?: string) => {
    const targetId = idToFetch || evalId;
    if (!targetId) return;
    try {
      const res = await axios.get(`/api/evaluations/${targetId}/experiments-detail`);
      setExperiments(res.data);
    } catch {
      setExperiments([]);
    }
  };

  const loadAll = async (id?: string) => {
    const targetId = id || evalId;
    if (!targetId) return;
    setLoading(true);
    const [sc] = await Promise.all([
      fetchScorecard(targetId),
      fetchExperiments(targetId),
    ]);
    setData(sc);
    setLoading(false);
  };

  useEffect(() => {
    // Read evalId from URL query param if navigated from History page
    const params = new URLSearchParams(location.search);
    const urlEvalId = params.get('evalId');

    const fetchLatest = async () => {
      try {
        const res = await axios.get('/api/evaluations/latest');
        const id = urlEvalId || res.data.id.toString();
        setEvalId(id);
        await loadAll(id);
      } catch {
        console.error('No evaluations found');
      }
    };
    fetchLatest();
  }, []);

  const handleCompare = async () => {
    if (!compareId) return;
    const cd = await fetchScorecard(compareId);
    setCompareData(cd);
  };

  const handleExport = () => {
    window.print();
  };

  return (
    <div ref={printRef} className="max-w-6xl mx-auto space-y-8 print:space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-obsidian-900/50 backdrop-blur-md border border-obsidian-700/50 p-6 rounded-2xl shadow-panel print:shadow-none print:border-gray-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-900/30 rounded-xl border border-blue-500/30 shadow-neon-blue print:shadow-none">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-wide print:text-black">
              Security Scorecard
            </h1>
            <p className="text-slate-400 text-sm mt-1 uppercase tracking-wider">Aggregated Empirical Matrix Results</p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap print:hidden">
          {/* Eval ID input */}
          <div className="relative">
            <span className="absolute -top-2 left-2 px-1 bg-obsidian-900 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Eval ID</span>
            <input
              type="number"
              value={evalId}
              onChange={e => setEvalId(e.target.value)}
              className="bg-obsidian-950 border border-obsidian-700 focus:border-blue-500 rounded-lg px-4 py-2 text-white w-24 h-[42px] focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono"
            />
          </div>

          {/* Compare toggle */}
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`flex items-center gap-2 px-4 py-2 h-[42px] rounded-lg font-medium text-sm transition-all border
              ${compareMode ? 'bg-purple-900/40 border-purple-500/60 text-purple-300' : 'bg-obsidian-800 border-obsidian-600 text-slate-300 hover:text-white'}`}
          >
            <GitCompare className="w-4 h-4" /> Compare
          </button>

          {/* Refresh */}
          <button
            onClick={() => loadAll()}
            disabled={loading}
            className="group flex items-center gap-2 bg-obsidian-800 hover:bg-obsidian-700 border border-obsidian-600 px-4 py-2 h-[42px] rounded-lg text-slate-300 hover:text-white font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:text-blue-400'}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>

          {/* Export PDF */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-emerald-900/30 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-400 hover:text-emerald-300 px-4 py-2 h-[42px] rounded-lg font-medium text-sm transition-all"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Compare Mode Input */}
      {compareMode && (
        <div className="bg-purple-950/20 border border-purple-700/40 rounded-xl p-4 flex items-center gap-4 print:hidden">
          <GitCompare className="w-5 h-5 text-purple-400 shrink-0" />
          <span className="text-purple-300 text-sm font-semibold">Compare Eval #{evalId} vs</span>
          <input
            type="number"
            value={compareId}
            onChange={e => setCompareId(e.target.value)}
            placeholder="Enter Eval ID..."
            className="bg-obsidian-950 border border-purple-700/50 focus:border-purple-500 rounded-lg px-4 py-2 text-white w-36 focus:outline-none font-mono"
          />
          <button
            onClick={handleCompare}
            className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
          >
            Load
          </button>
          {compareData && <span className="text-emerald-400 text-sm font-semibold">✓ Eval #{compareId} loaded</span>}
        </div>
      )}

      {/* No Data */}
      {!data && !loading && (
        <div className="flex flex-col items-center justify-center py-24 bg-obsidian-900/30 border border-obsidian-800/50 rounded-2xl border-dashed">
          <AlertTriangle className="w-12 h-12 text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-slate-300">No Evaluation Found</h3>
          <p className="text-slate-500 mt-2">Enter a valid Evaluation ID or run the Matrix Pipeline first.</p>
        </div>
      )}

      {data && (
        <>
          {/* Metric Cards — side by side if comparing */}
          <div className={`grid gap-6 ${compareMode && compareData ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <MetricSection data={data} label={`Eval #${evalId}`} />
            {compareMode && compareData && (
              <MetricSection data={compareData} label={`Eval #${compareId}`} compareWith={data} />
            )}
          </div>

          {/* Execution Summary */}
          <div className="bg-obsidian-900/50 backdrop-blur-sm border border-obsidian-700/50 rounded-2xl p-8 shadow-panel relative overflow-hidden print:shadow-none">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500" />
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Execution Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatBlock label="Total Pipeline Runs" value={data.total_runs} />
              <StatBlock label="Valid Population" value={data.valid_population} color="text-blue-400" />
              <StatBlock label="Infrastructure Failures" value={data.infrastructure_failures} color="text-amber-500" />
            </div>
          </div>

          {/* Generated Code Viewer */}
          {experiments.length > 0 && (
            <div className="bg-obsidian-900/50 border border-obsidian-700/50 rounded-2xl shadow-panel overflow-hidden print:shadow-none">
              <div className="px-6 py-4 border-b border-obsidian-700/50 flex items-center gap-3">
                <Code2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">
                  AI-Generated Attack Code Viewer
                </h3>
                <span className="ml-auto text-xs text-slate-500 font-mono">{experiments.length} experiments</span>
              </div>

              <div className="divide-y divide-obsidian-800">
                {experiments.map((exp) => (
                  <ExperimentRow
                    key={exp.exp_id}
                    exp={exp}
                    isExpanded={expandedExp === exp.exp_id}
                    onToggle={() => setExpandedExp(expandedExp === exp.exp_id ? null : exp.exp_id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
          @page { margin: 1.5cm; }
        }
      `}} />
    </div>
  );
}

function MetricSection({ data, label, compareWith }: { data: ScorecardData; label: string; compareWith?: ScorecardData }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">{label}</p>
      <div className="grid grid-cols-2 gap-4">
        <RadialMetricCard title="Attack Prevention" value={data.prevention_rate} strokeColor="#10b981"
          delta={compareWith ? data.prevention_rate - compareWith.prevention_rate : undefined} higherIsBetter />
        <RadialMetricCard title="Attack Success" value={data.attack_success_rate} strokeColor="#ef4444"
          delta={compareWith ? data.attack_success_rate - compareWith.attack_success_rate : undefined} higherIsBetter={false} />
        <RadialMetricCard title="Gateway Blocked" value={data.gateway_block_rate} strokeColor="#00f0ff"
          delta={compareWith ? data.gateway_block_rate - compareWith.gateway_block_rate : undefined} higherIsBetter />
        <RadialMetricCard title="Sandbox Contained" value={data.sandbox_containment_rate} strokeColor="#3b82f6"
          delta={compareWith ? data.sandbox_containment_rate - compareWith.sandbox_containment_rate : undefined} higherIsBetter />
      </div>
    </div>
  );
}

function ExperimentRow({ exp, isExpanded, onToggle }: { exp: ExperimentDetail; isExpanded: boolean; onToggle: () => void }) {
  const gatewayColor = exp.gateway_blocked ? 'text-red-400' : exp.gateway_decision === 'ALLOW' ? 'text-emerald-400' : 'text-slate-400';
  const escapeColor = exp.sandbox_escape ? 'text-red-500 font-bold' : 'text-slate-500';

  return (
    <div className="hover:bg-obsidian-800/30 transition-colors">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center gap-4 text-left"
      >
        {/* Config Badge */}
        <span className="shrink-0 w-8 h-8 rounded-lg bg-blue-900/30 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs font-mono">
          {exp.config_id}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-white font-semibold text-sm">{exp.scenario_category}</span>
            <span className="text-xs text-slate-500 font-mono">{CONFIG_LABELS[exp.config_id] || exp.config_id}</span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs">
            <span className={`flex items-center gap-1 ${gatewayColor}`}>
              <ShieldAlert className="w-3 h-3" />
              Gateway: {exp.gateway_decision}
            </span>
            {exp.sandbox_exit_code !== null && (
              <span className="flex items-center gap-1 text-slate-400">
                <Terminal className="w-3 h-3" /> Exit: {exp.sandbox_exit_code}
              </span>
            )}
            {exp.sandbox_escape && (
              <span className={`flex items-center gap-1 ${escapeColor}`}>
                <Zap className="w-3 h-3" /> ESCAPE DETECTED
              </span>
            )}
            {exp.attack_successful && !exp.sandbox_escape && (
              <span className="flex items-center gap-1 text-orange-400">
                <XCircle className="w-3 h-3" /> Attack Successful
              </span>
            )}
            {!exp.attack_successful && !exp.gateway_blocked && (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> Contained
              </span>
            )}
          </div>
        </div>

        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
      </button>

      {isExpanded && (
        <div className="px-6 pb-5 space-y-4 border-t border-obsidian-800/60">
          {/* Generated Code */}
          {exp.generated_code && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 mt-4 flex items-center gap-1.5">
                <Code2 className="w-3 h-3" /> AI-Generated Code
              </p>
              <pre className="bg-[#030712] rounded-xl p-4 text-[12px] font-mono text-green-300 overflow-x-auto border border-obsidian-700 max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {exp.generated_code || '(no code generated)'}
              </pre>
            </div>
          )}

          {/* Sandbox Output */}
          {exp.sandbox_output && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Terminal className="w-3 h-3" /> Sandbox Output
              </p>
              <pre className="bg-[#030712] rounded-xl p-4 text-[12px] font-mono text-slate-300 overflow-x-auto border border-obsidian-700 max-h-32 overflow-y-auto whitespace-pre-wrap">
                {exp.sandbox_output || '(no output)'}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatBlock({ label, value, color = 'text-white' }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-obsidian-950/80 border border-obsidian-800 rounded-xl p-6 flex flex-col justify-center items-center hover:border-obsidian-600 transition-colors">
      <div className={`text-4xl font-bold font-mono ${color}`}>{value}</div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">{label}</div>
    </div>
  );
}

function RadialMetricCard({ title, value, strokeColor, delta, higherIsBetter }: {
  title: string; value: number; strokeColor: string; delta?: number; higherIsBetter?: boolean;
}) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const deltaGood = delta !== undefined && ((higherIsBetter && delta > 0) || (!higherIsBetter && delta < 0));
  const deltaBad = delta !== undefined && ((higherIsBetter && delta < 0) || (!higherIsBetter && delta > 0));

  return (
    <div className="relative bg-obsidian-900/80 backdrop-blur-xl border border-obsidian-700/50 rounded-2xl p-4 flex flex-col items-center shadow-panel group hover:-translate-y-1 transition-transform duration-300">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">{title}</div>

      <div className="relative flex items-center justify-center w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} fill="transparent" stroke="#1b2a4e" strokeWidth="8" />
          <circle cx="70" cy="70" r={radius} fill="transparent" stroke={strokeColor} strokeWidth="8"
            strokeLinecap="round"
            style={{ strokeDasharray: circumference, strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-mono text-white">{value}%</span>
          {delta !== undefined && (
            <span className={`text-xs font-bold mt-1 ${deltaGood ? 'text-emerald-400' : deltaBad ? 'text-red-400' : 'text-slate-500'}`}>
              {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
