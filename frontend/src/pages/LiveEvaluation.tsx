import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Terminal } from 'lucide-react';

export default function LiveEvaluation() {
  const location = useLocation();
  const evalId = location.state?.evalId;
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!evalId) return;

    const sse = new EventSource(`/api/evaluations/${evalId}/events`);
    
    sse.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.event === 'DONE') {
        sse.close();
      } else if (data.event === 'LOG') {
        setLogs(prev => [...prev, data.message]);
      }
    };

    return () => {
      sse.close();
    };
  }, [evalId]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (!evalId) {
    return <div className="p-8 text-slate-400">No active evaluation selected. Start one from the Overview page.</div>;
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-2">Live Evaluation Stream</h1>
      <p className="text-slate-400 mb-6">Monitoring execution of Evaluation #{evalId}</p>

      <div className="flex-1 bg-black rounded-lg border border-slate-700 font-mono text-sm overflow-hidden flex flex-col">
        <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center gap-2 text-slate-400">
          <Terminal className="w-4 h-4" />
          <span>Matrix Runner Output</span>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {logs.map((log, i) => (
            <div key={i} className="text-green-400 mb-1">
              <span className="text-slate-600 mr-4">{new Date().toISOString().split('T')[1].split('.')[0]}</span>
              {log}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
