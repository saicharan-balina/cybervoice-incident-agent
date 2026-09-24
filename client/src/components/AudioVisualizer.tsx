import React from 'react';
import { VoiceSessionStatus } from '../types';

interface AudioVisualizerProps {
  status: VoiceSessionStatus;
  userVolume?: number; // 0 to 1
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ status, userVolume = 0 }) => {
  const isListening = status === 'listening';
  const isAgentSpeaking = status === 'agent_speaking';
  const isConnecting = status === 'connecting' || status === 'requesting_permission';

  const barCount = 24;

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-inner">
      <div className="flex items-center justify-center space-x-1.5 h-16 w-full max-w-md">
        {Array.from({ length: barCount }).map((_, idx) => {
          let heightPercent = 15;

          if (isAgentSpeaking) {
            // Simulated rhythmic pulse for agent speech
            const phase = (idx + Date.now() / 150) % barCount;
            const factor = Math.sin((phase / barCount) * Math.PI);
            heightPercent = Math.max(20, Math.floor(factor * 90));
          } else if (isListening) {
            // Reactive height to user microphone input
            const centerDistance = Math.abs(idx - barCount / 2);
            const dynamicScale = Math.max(0.2, 1 - centerDistance / (barCount / 1.5));
            const level = userVolume * 100 * dynamicScale;
            heightPercent = Math.min(100, Math.max(15, Math.floor(level + Math.random() * 20)));
          } else if (isConnecting) {
            heightPercent = 25 + Math.sin(idx * 0.5) * 15;
          }

          return (
            <div
              key={idx}
              className={`w-1.5 rounded-full transition-all duration-75 ${
                isAgentSpeaking
                  ? 'bg-gradient-to-t from-purple-600 via-indigo-400 to-cyan-300 shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                  : isListening
                  ? 'bg-gradient-to-t from-cyan-600 via-sky-400 to-emerald-300 shadow-[0_0_8px_rgba(0,210,255,0.6)]'
                  : 'bg-slate-700/50'
              }`}
              style={{
                height: `${heightPercent}%`,
              }}
            />
          );
        })}
      </div>

      <div className="mt-4 flex items-center space-x-2">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isAgentSpeaking
              ? 'bg-purple-400 animate-ping'
              : isListening
              ? 'bg-cyan-400 animate-pulse'
              : isConnecting
              ? 'bg-yellow-400 animate-bounce'
              : 'bg-slate-600'
          }`}
        />
        <span className="text-xs font-mono font-medium tracking-wide uppercase text-slate-300">
          {status === 'idle' && 'Session Inactive'}
          {status === 'requesting_permission' && 'Requesting Microphone Permission...'}
          {status === 'connecting' && 'Connecting to AssemblyAI...'}
          {status === 'connected' && 'Session Ready - Speak freely'}
          {status === 'listening' && 'Listening to your voice...'}
          {status === 'agent_speaking' && 'CyberVoice Speaking...'}
          {status === 'processing' && 'Synthesizing Incident Context...'}
          {status === 'saving_report' && 'Saving Incident Report...'}
          {status === 'saved_successfully' && 'Report Confirmed & Persisted'}
          {status === 'disconnected' && 'Session Concluded'}
          {status === 'error' && 'Connection Error Encountered'}
        </span>
      </div>
    </div>
  );
};
