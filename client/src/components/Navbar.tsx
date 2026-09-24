import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, Mic, LayoutDashboard, HelpCircle, Activity } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-cyan-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <NavLink to="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 group-hover:border-cyan-400/60 transition-all duration-300">
              <Shield className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                  CyberVoice AI
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 rounded-full uppercase">
                  AssemblyAI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Voice-First Incident Response Companion
              </p>
            </div>
          </NavLink>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`
              }
            >
              Overview
            </NavLink>

            <NavLink
              to="/assistant"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'text-black bg-cyan-400 shadow-[0_0_15px_rgba(0,210,255,0.4)]'
                    : 'text-cyan-300 bg-cyan-950/30 border border-cyan-500/30 hover:bg-cyan-900/30 hover:border-cyan-400/60'
                }`
              }
            >
              <Mic className="w-4 h-4" />
              <span>Voice Agent</span>
            </NavLink>

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Incidents</span>
            </NavLink>

            <NavLink
              to="/help"
              className={({ isActive }) =>
                `flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`
              }
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden md:inline">Help & Settings</span>
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};
