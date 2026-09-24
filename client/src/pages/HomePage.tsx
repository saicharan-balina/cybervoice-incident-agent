import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mic,
  Shield,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Terminal,
  Activity,
  Lock
} from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/20 via-blue-600/15 to-purple-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-8 backdrop-blur-md shadow-lg">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span>AssemblyAI Voice Agent Hackathon</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Official Voice-First Submission</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
            Cyber<span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">Voice</span> AI
          </h1>

          <p className="text-xl sm:text-2xl font-medium text-cyan-100/90 max-w-3xl mx-auto mb-4 tracking-tight">
            Voice-First Cybersecurity Incident Response Companion
          </p>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Report phishing attempts, suspicious messages, compromised accounts, and scams naturally using your voice. Powered by AssemblyAI Voice Agent technology for real-time adaptive questioning and cautious incident triage.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/assistant"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-bold text-base shadow-[0_0_30px_rgba(0,210,255,0.4)] transition-all flex items-center justify-center space-x-2.5 group"
            >
              <Mic className="w-5 h-5 text-black group-hover:scale-110 transition-transform" />
              <span>Start Voice Session</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl glass-panel border border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-800/50 text-white font-medium text-base transition-all flex items-center justify-center space-x-2"
            >
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>View Incident Dashboard</span>
            </Link>
          </div>

          {/* Quick Demo Preview Banner */}
          <div className="p-4 rounded-2xl glass-card bg-slate-900/60 border border-cyan-900/40 max-w-3xl mx-auto text-left flex items-start space-x-4">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-400 shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-1">
              <div className="flex items-center space-x-2 font-mono text-cyan-300">
                <span className="font-semibold">Golden Demo Trigger:</span>
                <span className="text-slate-400">Say out loud:</span>
              </div>
              <p className="text-slate-200 font-mono italic bg-slate-950/80 px-2.5 py-1.5 rounded border border-slate-800">
                "I received a message saying my bank account would be blocked. It included a link, and I clicked it."
              </p>
              <p className="text-slate-400 text-[11px]">
                The agent will ask adaptive follow-up questions, provide immediate safety guidance, and request your explicit confirmation before saving the incident report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Intelligent Incident Response, Built for Humans
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Nontechnical users need calm guidance during panic moments. CyberVoice guides you through incident containment without jargon or premature guarantees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl glass-card border border-slate-800 hover:border-cyan-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Adaptive Voice Questioning</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Dynamically tailors follow-up questions according to your previous responses. Does not ask robotic, fixed questionnaire scripts.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl glass-card border border-slate-800 hover:border-cyan-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400 mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Structured Incident Timeline</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Transforms conversational speech into an itemized chronological timeline distinguishing user action, data exposure, and consequence.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl glass-card border border-slate-800 hover:border-cyan-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400 mb-4">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Explicit Confirmation Protocol</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                No automatic or accidental persistence. Reports are displayed in preview and saved only after your verbal or visual confirmation.
              </p>
            </div>
          </div>

          {/* Architecture / Disclaimer Card */}
          <div className="mt-12 p-6 rounded-2xl glass-panel border border-slate-800/90 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Lock className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>
                <strong>Privacy &amp; Security Disclaimer:</strong> CyberVoice AI never asks for passwords, PINs, OTPs, or credit card numbers. Permanent API credentials remain strictly secured on the backend.
              </span>
            </div>
            <div className="shrink-0 font-mono text-[11px] text-cyan-400/80 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              AssemblyAI Voice Agent API v1
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500 font-mono">
        CyberVoice AI — Built for AssemblyAI Voice Agent Hackathon 2026
      </footer>
    </div>
  );
};
