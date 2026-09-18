import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Shield, Activity, BarChart3, Settings, Database } from 'lucide-react';
import Overview from './pages/Overview';
import LiveEvaluation from './pages/LiveEvaluation';
import Scorecard from './pages/Scorecard';
import Scenarios from './pages/Scenarios';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-50">
      {/* Sidebar */}
      <div className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <Shield className="w-8 h-8 text-blue-500" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            AgentShield
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
            <BarChart3 className="w-5 h-5" />
            Overview
          </Link>
          <Link to="/scenarios" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
            <Database className="w-5 h-5" />
            Scenarios
          </Link>
          <Link to="/live" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
            <Activity className="w-5 h-5" />
            Live Evaluation
          </Link>
          <Link to="/scorecard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
            <Shield className="w-5 h-5" />
            Security Scorecard
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 p-3 w-full rounded-lg hover:bg-slate-800 transition-colors text-slate-400">
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-slate-900/50">
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/scenarios" element={<Scenarios />} />
          <Route path="/live" element={<LiveEvaluation />} />
          <Route path="/scorecard" element={<Scorecard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
