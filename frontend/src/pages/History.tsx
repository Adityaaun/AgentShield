import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Clock, CheckCircle2, XCircle, AlertTriangle, Activity, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EvaluationSummary {
  id: number;
  name: string;
  status: string;
  created_at: string | null;
}

export default function History() {
  const [evaluations, setEvaluations] = useState<EvaluationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('/api/evaluations');
        setEvaluations(res.data);
      } catch (err) {
        console.error('Failed to load evaluation history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; glow: string }> = {
    COMPLETED: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-900/20', glow: 'border-emerald-500/40' },
    RUNNING:   { icon: Activity,     color: 'text-cyan-400',    bg: 'bg-cyan-900/20',    glow: 'border-cyan-500/40' },
    FAILED:    { icon: XCircle,      color: 'text-red-400',     bg: 'bg-red-900/20',     glow: 'border-red-500/40' },
    UNKNOWN:   { icon: AlertTriangle, color: 'text-slate-400',  bg: 'bg-slate-900/20',   glow: 'border-slate-600/40' },
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return 'Unknown date';
    const d = new Date(iso);
    return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 bg-obsidian-900/50 backdrop-blur-md border border-obsidian-700/50 p-6 rounded-2xl shadow-panel">
        <div className="p-3 bg-blue-900/30 rounded-xl border border-blue-500/30 shadow-neon-blue">
          <Clock className="w-8 h-8 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-wide">
            Evaluation History
          </h1>
          <p className="text-slate-400 text-sm mt-1 uppercase tracking-wider">All Matrix Pipeline Runs</p>
        </div>
        <div className="ml-auto text-right">
          <span className="text-3xl font-bold font-mono text-white">{evaluations.length}</span>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Total Runs</p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && evaluations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 bg-obsidian-900/30 border border-obsidian-800/50 rounded-2xl border-dashed">
          <Clock className="w-12 h-12 text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-slate-300">No Evaluations Yet</h3>
          <p className="text-slate-500 mt-2">Run the Matrix Pipeline to see results here.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors"
          >
            Go to Overview
          </button>
        </div>
      )}

      {/* Timeline */}
      {!loading && evaluations.length > 0 && (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[27px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-blue-500/50 via-obsidian-700 to-transparent" />

          <div className="space-y-4">
            {evaluations.map((ev, index) => {
              const cfg = statusConfig[ev.status] || statusConfig.UNKNOWN;
              const StatusIcon = cfg.icon;

              return (
                <div key={ev.id} className="flex gap-6 group">
                  {/* Timeline dot */}
                  <div className={`relative z-10 w-14 h-14 shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${cfg.bg} ${cfg.glow} border group-hover:scale-110`}>
                    <StatusIcon className={`w-5 h-5 ${cfg.color} ${ev.status === 'RUNNING' ? 'animate-pulse' : ''}`} />
                  </div>

                  {/* Card */}
                  <div
                    className="flex-1 bg-obsidian-900/60 backdrop-blur border border-obsidian-700/50 rounded-xl p-5 cursor-pointer hover:border-blue-500/50 hover:bg-obsidian-800/60 transition-all duration-300 hover:-translate-y-0.5 shadow-panel"
                    onClick={() => navigate(`/scorecard?evalId=${ev.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xs font-bold text-slate-500 font-mono uppercase tracking-widest">
                            #{ev.id}
                          </span>
                          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.glow}`}>
                            {ev.status}
                          </span>
                        </div>
                        <h3 className="text-white font-semibold">{ev.name}</h3>
                        <p className="text-slate-500 text-sm mt-1 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {formatDate(ev.created_at)}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
