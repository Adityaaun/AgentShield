import React, { useState } from 'react';
import axios from 'axios';
import { Play, Shield, TerminalSquare, Box, Lock, Zap } from 'lucide-react';
import LiveEvaluation from './LiveEvaluation';

export default function Overview() {
  const [loading, setLoading] = useState(false);
  const [activeEvalId, setActiveEvalId] = useState<string | null>(null);

  const startMatrix = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/evaluations');
      setActiveEvalId(response.data.id);
    } catch (err) {
      console.error(err);
      alert('Failed to start evaluation matrix');
    }
    setLoading(false);
  };

  const configs = [
    {
      id: 'A',
      title: 'Baseline Agent',
      desc: 'No security controls.',
      icon: TerminalSquare,
      color: 'blue',
      glow: 'shadow-neon-blue'
    },
    {
      id: 'B',
      title: 'Static Gateway',
      desc: 'AST parsing blocks.',
      icon: Shield,
      color: 'cyan',
      glow: 'shadow-neon-cyan'
    },
    {
      id: 'C',
      title: 'Docker Sandbox',
      desc: 'Dynamic containment.',
      icon: Box,
      color: 'green',
      glow: 'shadow-neon-green'
    },
    {
      id: 'D',
      title: 'Full AgentShield',
      desc: 'Defense-in-depth.',
      icon: Lock,
      color: 'purple',
      glow: 'shadow-neon-purple'
    }
  ];

  return (
    <div className={`mx-auto h-full transition-all duration-500 ease-in-out ${activeEvalId ? 'max-w-full flex gap-6' : 'max-w-6xl space-y-12'}`}>
      
      {/* Left Pane (Overview) */}
      <div className={`transition-all duration-500 ease-in-out ${activeEvalId ? 'w-1/3 shrink-0 flex flex-col' : 'w-full'}`}>
        <div className={`flex flex-col items-center text-center mx-auto mt-8 ${activeEvalId ? 'space-y-4' : 'space-y-6 max-w-2xl'}`}>
          {!activeEvalId && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wide uppercase shadow-neon-blue">
              <Zap className="w-3 h-3" /> System Ready
            </div>
          )}
          <h1 className={`${activeEvalId ? 'text-2xl' : 'text-4xl'} font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-md transition-all duration-500`}>
            {activeEvalId ? 'Evaluation Active' : 'AgentShield Security Laboratory'}
          </h1>
          
          {!activeEvalId && (
            <p className="text-slate-400 text-lg leading-relaxed">
              Empirical evaluation of autonomous agent security controls. Execute the full matrix of attack scenarios against baseline and fortified environments.
            </p>
          )}

          {!activeEvalId && (
            <button 
              onClick={startMatrix}
              disabled={loading}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-cyan-600 border border-transparent rounded-xl hover:shadow-neon-cyan focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden mt-4"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -ml-4 w-12"></div>
              {loading ? (
                <span className="flex items-center gap-3 animate-pulse">
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  Initializing Matrix...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <Play className="w-5 h-5 fill-white" />
                  RUN MATRIX PIPELINE
                </span>
              )}
            </button>
          )}
        </div>

        <div className={`pt-8 ${activeEvalId ? 'flex-1 overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
          <h3 className="text-sm font-semibold text-slate-500 tracking-widest uppercase mb-6 text-center">
            {activeEvalId ? 'Matrix Configs' : 'Evaluation Configurations'}
          </h3>
          <div className={`grid gap-4 ${activeEvalId ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
            {configs.map((conf) => (
              <div key={conf.id} className="relative group rounded-2xl bg-obsidian-900/50 backdrop-blur-sm border border-obsidian-700/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-obsidian-600 shadow-panel">
                <div className={`absolute inset-0 bg-gradient-to-br from-${conf.color}-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className={`relative flex ${activeEvalId ? 'flex-row items-center gap-3' : 'flex-col items-start gap-4'}`}>
                  <div className={`p-2.5 rounded-xl bg-obsidian-800 border border-obsidian-700 text-${conf.color}-400 group-hover:${conf.glow} transition-shadow duration-300 shrink-0`}>
                    <conf.icon className="w-5 h-5" />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-bold text-${conf.color}-400 bg-${conf.color}-500/10 px-1.5 py-0.5 rounded`}>CFG {conf.id}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{conf.title}</h3>
                    {!activeEvalId && (
                      <p className="text-xs text-slate-400 leading-relaxed mt-2">
                        {conf.desc}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Pane (Live Evaluation Stream) */}
      {activeEvalId && (
        <div className="w-2/3 h-full animate-fade-in pl-6 border-l border-obsidian-700/50">
          <LiveEvaluation evalId={activeEvalId} onClose={() => setActiveEvalId(null)} />
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in {
          0% { opacity: 0; transform: translateX(20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #1e293b;
          border-radius: 10px;
        }
      `}} />
    </div>
  );
}
