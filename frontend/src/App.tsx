import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Shield, BarChart3, Settings, Database } from 'lucide-react';
import Overview from './pages/Overview';
import Scorecard from './pages/Scorecard';
import Scenarios from './pages/Scenarios';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const getNavLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-3 p-3 rounded-lg transition-all duration-300 relative group
      ${isActive 
        ? 'bg-gradient-to-r from-blue-900/40 to-transparent text-white' 
        : 'hover:bg-obsidian-800 text-slate-400 hover:text-slate-200'
      }`;
  };

  const getIconClass = (path: string) => {
    return location.pathname === path ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'text-slate-500 group-hover:text-slate-400';
  };

  return (
    <div className="min-h-screen flex bg-transparent text-slate-50 selection:bg-blue-500/30">
      {/* Sidebar */}
      <div className="w-64 border-r border-obsidian-700/50 bg-obsidian-900/80 backdrop-blur-xl flex flex-col relative z-10 shadow-panel shrink-0">
        <div className="p-6 flex items-center justify-between border-b border-obsidian-700/50">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
            <h1 className="text-xl font-bold tracking-wide bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
              AgentShield
            </h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavLink to="/" className={getNavLinkClass('/')}>
            {location.pathname === '/' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r shadow-neon-blue"></div>}
            <BarChart3 className={`w-5 h-5 ${getIconClass('/')}`} />
            Overview
          </NavLink>
          <NavLink to="/scenarios" className={getNavLinkClass('/scenarios')}>
            {location.pathname === '/scenarios' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r shadow-neon-blue"></div>}
            <Database className={`w-5 h-5 ${getIconClass('/scenarios')}`} />
            Scenarios
          </NavLink>
          <NavLink to="/scorecard" className={getNavLinkClass('/scorecard')}>
            {location.pathname === '/scorecard' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r shadow-neon-blue"></div>}
            <Shield className={`w-5 h-5 ${getIconClass('/scorecard')}`} />
            Security Scorecard
          </NavLink>
        </nav>
        
        <div className="p-4 border-t border-obsidian-700/50">
          <button className="flex items-center gap-3 p-3 w-full rounded-lg hover:bg-obsidian-800 transition-colors text-slate-400 hover:text-slate-200">
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col relative z-0">
        {/* Premium Top Header */}
        <header className="h-16 border-b border-obsidian-700/30 bg-obsidian-900/40 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="text-sm font-medium tracking-wider text-slate-300 uppercase flex items-center gap-2">
            <span className="text-blue-400 font-bold">AgentShield</span>
            <span className="text-slate-600">/</span>
            <span>Security Laboratory</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-obsidian-800/50 border border-obsidian-700/50">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-neon-green animate-pulse-slow"></div>
            <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">System Operational</span>
          </div>
        </header>

        <main className="flex-1 p-8">
          {children}
        </main>
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
          <Route path="/scorecard" element={<Scorecard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
export default App;
