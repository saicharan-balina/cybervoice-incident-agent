import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Mic,
  Shield,
  Key,
  AlertTriangle,
  Server,
  Cpu,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';

export const HelpSettingsPage: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<{
    database: string;
    assemblyaiConfigured: boolean;
    service: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setApiStatus({
          database: data.database,
          assemblyaiConfigured: data.assemblyai?.configured,
          service: data.service
        });
      })
      .catch(() => {
        setApiStatus(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Help &amp; Environment Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          System diagnostics, privacy handling guidelines, and voice troubleshooting.
        </p>
      </div>

      {/* System Diagnostic Status */}
      <div className="p-6 rounded-2xl glass-card bg-slate-900/80 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <Server className="w-5 h-5 text-cyan-400" />
          <span>System &amp; API Configuration Status</span>
        </h2>

        {isLoading ? (
          <div className="text-xs text-slate-400 font-mono">Checking backend health...</div>
        ) : apiStatus ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block mb-1">Backend Service</span>
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>ONLINE (port 5000)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block mb-1">SQLite Database</span>
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>CONNECTED ({apiStatus.database})</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block mb-1">AssemblyAI API Key</span>
              <div className="flex items-center space-x-2">
                {apiStatus.assemblyaiConfigured ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    CONFIGURED (Secured)
                  </span>
                ) : (
                  <span className="text-red-400 font-bold flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    NOT CONFIGURED
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Keys remain strictly on the backend. Only temporary session tokens are minted.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-xs text-red-300">
            Cannot connect to backend server. Verify that the server is running on port 5000.
          </div>
        )}
      </div>

      {/* How CyberVoice Works */}
      <div className="p-6 rounded-2xl glass-card bg-slate-900/60 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <span>How CyberVoice AI Operates</span>
        </h2>
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>
            1. <strong>Voice-First Conversation:</strong> You speak naturally into your microphone. Microphone audio is converted into PCM16 24kHz streams and sent via WebSockets directly to the AssemblyAI Voice Agent API.
          </p>
          <p>
            2. <strong>Adaptive Questioning:</strong> Rather than a rigid questionnaire, the voice agent assesses what you've said and asks conversational follow-up questions tailored to your context.
          </p>
          <p>
            3. <strong>Cautious Guidance:</strong> The companion suggests immediate safety steps (such as direct password resets and bank notification) without making false guarantees.
          </p>
          <p>
            4. <strong>Explicit Confirmation Protocol:</strong> A structured incident report draft is generated with timelines and risks. It is <em>never</em> automatically saved to the database until you explicitly confirm via voice or the confirmation button.
          </p>
        </div>
      </div>

      {/* Microphone Troubleshooting */}
      <div className="p-6 rounded-2xl glass-card bg-slate-900/60 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <Mic className="w-5 h-5 text-cyan-400" />
          <span>Microphone &amp; Browser Audio Troubleshooting</span>
        </h2>
        <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
          <li><strong>Permissions:</strong> Ensure your browser displays the microphone permission prompt and click "Allow".</li>
          <li><strong>Echo Cancellation:</strong> Modern browsers provide built-in echo cancellation, which ensures the voice agent doesn't hear itself when speaking through speakers.</li>
          <li><strong>Audio Worklet / Streaming:</strong> If audio is muted, verify your operating system input device selection.</li>
        </ul>
      </div>

      {/* Security Disclaimer & Privacy */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <span>Privacy &amp; Responsible Disclosure Guidelines</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong>No Credential Storage:</strong> CyberVoice AI never asks for, stores, or logs passwords, PINs, OTP codes, authentication tokens, or payment card numbers.
          </p>
          <p>
            <strong>Triage Companion vs. Forensic Guarantee:</strong> CyberVoice AI is designed as a calm, first-response incident reporting companion. It does not replace enterprise forensic analysis or guarantee whether an unverified URL is safe.
          </p>
        </div>
      </div>
    </div>
  );
};
