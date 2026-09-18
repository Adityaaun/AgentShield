import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Shield, BarChart3, Settings, Database, Clock } from 'lucide-react';
import Overview from './pages/Overview';
import Scorecard from './pages/Scorecard';
import Scenarios from './pages/Scenarios';
import History from './pages/History';
import SettingsPage from './pages/Settings';

const NAV_ITEMS = [
  { path: '/',          label: 'Overview',          icon: BarChart3 },
  { path: '/scenarios', label: 'Scenarios',          icon: Database },
  { path: '/history',   label: 'History',            icon: Clock },
  { path: '/scorecard', label: 'Security Scorecard', icon: Shield },
];

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen flex bg-transparent text-slate-50 selection:bg-blue-500/30">
      {/* Sidebar */}
      <div className="w-64 border-r border-obsidian-700/50 bg-obsidian-900/80 backdrop-blur-xl flex flex-col relative z-10 shadow-panel shrink-0">
        <div className="p-6 flex items-center justify-between border-b border-obsidian-700/50">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
            <div>
              <h1 className="text-xl font-bold tracking-wide bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                AgentShield
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">v3.0 Security Lab</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = isActive(path);
            return (
              <NavLink
                key={path}
                to={path}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 relative group
                  ${active
                    ? 'bg-gradient-to-r from-blue-900/40 to-transparent text-white'
                    : 'hover:bg-obsidian-800 text-slate-400 hover:text-slate-200'
                  }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r shadow-neon-blue" />
                )}
                <Icon className={`w-5 h-5 transition-colors ${active ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'text-slate-500 group-hover:text-slate-400'}`} />
                <span className="text-sm font-medium">{label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-obsidian-700/50">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 w-full rounded-lg transition-all duration-300 relative group
              ${isActive
                ? 'bg-gradient-to-r from-blue-900/40 to-transparent text-white'
                : 'hover:bg-obsidian-800 text-slate-400 hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r shadow-neon-blue" />}
                <Settings className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
                <span className="text-sm font-medium">Settings</span>
              </>
            )}
          </NavLink>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col relative z-0">
        {/* Top Header */}
        <header className="h-16 border-b border-obsidian-700/30 bg-obsidian-900/40 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20 print:hidden">
          <div className="text-sm font-medium tracking-wider text-slate-300 uppercase flex items-center gap-2">
            <span className="text-blue-400 font-bold">AgentShield</span>
            <span className="text-slate-600">/</span>
            <span>Security Laboratory</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-obsidian-800/50 border border-obsidian-700/50">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-neon-green animate-pulse-slow" />
            <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">System Operational</span>
          </div>
        </header>

        <main className="flex-1 p-8 print:p-4">
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
          <Route path="/"          element={<Overview />} />
          <Route path="/scenarios" element={<Scenarios />} />
          <Route path="/history"   element={<History />} />
          <Route path="/scorecard" element={<Scorecard />} />
          <Route path="/settings"  element={<SettingsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
