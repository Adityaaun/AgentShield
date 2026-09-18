import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Overview() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const startMatrix = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/evaluations');
      navigate('/live', { state: { evalId: response.data.id } });
    } catch (err) {
      console.error(err);
      alert('Failed to start evaluation matrix');
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">AgentShield Security Laboratory</h1>
      <p className="text-slate-400 mb-8">
        Empirical evaluation of autonomous agent security controls.
      </p>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Start Evaluation Matrix</h2>
        <p className="text-slate-400 mb-8 max-w-lg mx-auto">
          Execute the full suite of attack scenarios against configurations A, B, C, and D. 
          This will spin up Docker sandboxes dynamically and classify outcomes.
        </p>
        
        <button 
          onClick={startMatrix}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 mx-auto transition-colors"
        >
          {loading ? (
            <span className="animate-pulse">Initializing...</span>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Run Matrix Pipeline
            </>
          )}
        </button>
      </div>
    </div>
  );
}
