import React, { useEffect, useState, useRef } from 'react';
import { Terminal, Activity, CheckCircle2, ShieldAlert, Box, Lock, TerminalSquare, X, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LiveEvaluationProps {
  evalId: string;
  onClose: () => void;
}

export default function LiveEvaluation({ evalId, onClose }: LiveEvaluationProps) {
  const [logs, setLogs] = useState<{time: string, msg: string}[]>([]);
  const [activeStage, setActiveStage] = useState<number>(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!evalId) return;

    // Reset state on new evalId
    setLogs([]);
    setActiveStage(0);

    const sse = new EventSource(`/api/evaluations/${evalId}/events`);
    
    sse.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.event === 'DONE') {
        setActiveStage(5);
        sse.close();
      } else if (data.event === 'LOG') {
        const time = new Date().toISOString().split('T')[1].split('.')[0];
        const msg = data.message;
        setLogs(prev => [...prev, { time, msg }]);
        
        // Track overall matrix progress
        if (msg.includes('[A] Executing artifact')) setActiveStage(1);
        if (msg.includes('[B] Executing artifact')) setActiveStage(2);
        if (msg.includes('[C] Executing artifact')) setActiveStage(3);
        if (msg.includes('[D] Executing artifact')) setActiveStage(4);
      }
    };

    return () => {
      sse.close();
    };
  }, [evalId]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const stages = [
    { id: 1, name: 'Config A (Baseline)', icon: TerminalSquare },
    { id: 2, name: 'Config B (Gateway)', icon: ShieldAlert },
    { id: 3, name: 'Config C (Sandbox)', icon: Box },
    { id: 4, name: 'Config D (Full)', icon: Lock },
    { id: 5, name: 'Complete', icon: CheckCircle2 }
  ];

  return (
    <div className="h-full flex flex-col space-y-4 animate-fade-in">
      <div className="flex justify-between items-center bg-obsidian-900/50 backdrop-blur-md border border-obsidian-700/50 p-4 rounded-xl shadow-panel">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-900/30 rounded-lg border border-cyan-500/30 shadow-neon-cyan relative">
            {activeStage < 5 && <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>}
            <Activity className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-wide">
              Live Operations
            </h1>
            <p className="text-slate-400 text-xs mt-0.5 uppercase tracking-wider font-mono">
              Eval #{evalId}
            </p>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="p-2 text-slate-500 hover:text-white hover:bg-obsidian-800 rounded-lg transition-colors"
          title="Close Panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Visual Pipeline - Compact for side panel */}
      <div className="bg-obsidian-900/50 backdrop-blur-xl border border-obsidian-700/50 rounded-xl p-4 shadow-panel overflow-x-auto">
        <div className="flex items-center justify-between min-w-[400px]">
          {stages.map((stage, idx) => {
            const isActive = activeStage === stage.id;
            const isPast = activeStage > stage.id;
            
            let colorClass = 'text-slate-500 border-slate-700 bg-obsidian-950';
            let glow = '';
            
            if (isActive) {
              colorClass = 'text-cyan-400 border-cyan-500 bg-cyan-900/20';
              glow = 'shadow-neon-cyan';
            } else if (isPast) {
              colorClass = 'text-blue-400 border-blue-500 bg-blue-900/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
            }

            return (
              <React.Fragment key={stage.id}>
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${colorClass} ${glow}`}>
                    <stage.icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-cyan-400' : isPast ? 'text-blue-400' : 'text-slate-500'}`}>
                    {stage.name}
                  </span>
                </div>
                
                {idx < stages.length - 1 && (
                  <div className="flex-1 h-[2px] bg-obsidian-700 mx-1 relative overflow-hidden z-0">
                    {isPast && (
                      <div className="absolute inset-0 bg-blue-500/50"></div>
                    )}
                    {isActive && (
                      <div className="absolute inset-0 bg-cyan-500 w-1/3 animate-[slide_1s_ease-in-out_infinite]"></div>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Premium Terminal */}
      <div className="flex-1 bg-[#030712] rounded-xl border border-obsidian-700 shadow-panel font-mono text-[13px] overflow-hidden flex flex-col relative">
        <div className="bg-obsidian-900/80 px-4 py-2.5 border-b border-obsidian-700 flex items-center justify-between text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-500" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Terminal // Stream</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-slate-700"></div>
            <div className="w-2 h-2 rounded-full bg-slate-700"></div>
            <div className="w-2 h-2 rounded-full bg-slate-700"></div>
          </div>
        </div>
        <div className="p-4 overflow-y-auto flex-1 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
          {logs.map((log, i) => {
            let color = 'text-slate-300';
            if (log.msg.includes('TIP:')) color = 'text-yellow-300 font-bold bg-yellow-900/40 px-2 py-0.5 rounded border border-yellow-700/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]';
            else if (log.msg.includes('BLOCK')) color = 'text-red-400 font-bold';
            else if (log.msg.includes('ALLOW')) color = 'text-green-400 font-bold';
            else if (log.msg.includes('Agent')) color = 'text-blue-400';
            else if (log.msg.includes('Error')) color = 'text-red-500 font-bold';

            return (
              <div key={i} className="mb-1.5 hover:bg-white/5 px-1.5 py-0.5 rounded transition-colors break-words leading-relaxed">
                <span className="text-slate-600 mr-3 select-none">[{log.time}]</span>
                <span className={color}>{log.msg}</span>
              </div>
            );
          })}
          <div ref={logsEndRef} />
        </div>
        
        {/* Completion Overlay */}
        {activeStage === 5 && (
          <div className="absolute bottom-4 left-4 right-4 bg-obsidian-900/90 backdrop-blur border border-cyan-500/50 p-4 rounded-lg flex items-center justify-between shadow-neon-cyan animate-fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-bold text-white tracking-wide">Evaluation Complete</span>
            </div>
            <button 
              onClick={() => navigate('/scorecard')}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
            >
              <Shield className="w-3 h-3" />
              View Scorecard
            </button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}} />
    </div>
  );
}
