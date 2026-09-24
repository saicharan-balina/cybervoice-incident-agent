import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Square,
  RefreshCw,
  Trash2,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Terminal,
  Volume2,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { VoiceSessionStatus, ChatMessage, IncidentDraft } from '../types';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { IncidentPreviewModal } from '../components/IncidentPreviewModal';
import {
  base64ToFloat32Array,
  float32ArrayToBase64Pcm16,
  AgentAudioPlayer
} from '../utils/audio';
import { extractIncidentDraftFromConversation } from '../utils/extractor';

export const VoiceAssistantPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [status, setStatus] = useState<VoiceSessionStatus>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userVolume, setUserVolume] = useState<number>(0);
  const [incidentDraft, setIncidentDraft] = useState<IncidentDraft | null>(null);
  const [isSavingReport, setIsSavingReport] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  // References
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playerRef = useRef<AgentAudioPlayer | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 3;

  // Cleanup on unmount
  useEffect(() => {
    playerRef.current = new AgentAudioPlayer(24000);

    return () => {
      stopVoiceSession();
      if (playerRef.current) {
        playerRef.current.stop();
      }
    };
  }, []);

  // System prompt configuration for AssemblyAI Voice Agent
  const getAgentSystemPrompt = () => {
    return `You are CyberVoice, a calm, professional, and beginner-friendly cybersecurity incident response assistant for non-technical users.
Your goals:
1. Listen carefully to user reports of suspicious messages, emails, calls, malware, or account issues.
2. Ask short, relevant, adaptive follow-up questions one at a time based specifically on what the user has already said.
   - For example: if they clicked a link, ask if they entered passwords, OTPs, or financial details.
   - Do NOT ask questions they have already answered.
3. NEVER ask the user to say their real password, OTP, PIN, credit card number, or secrets. Explicitly remind them not to share secrets if they begin to.
4. Provide cautious, practical safety guidance (e.g., reset passwords on the official website, contact the bank directly).
5. Explain uncertainty calmly—do not claim to be a guaranteed forensic tool or law enforcement.
6. When the incident details are clear, summarize the incident concisely and ask the user: "Would you like me to prepare and save this incident report for your dashboard?"
7. If the user confirms (e.g., "yes", "save it", "confirm"), call the tool save_incident_report with the extracted incident details.
Keep all spoken replies short, empathetic, and direct (under 2 sentences per turn whenever possible).`;
  };

  const getToolsDefinition = () => {
    return [
      {
        type: 'function',
        name: 'save_incident_report',
        description: 'Saves the structured incident report to the database after user confirmation.',
        parameters: {
          type: 'object',
          properties: {
            incidentType: {
              type: 'string',
              enum: ['phishing_email', 'suspicious_message', 'suspicious_url', 'scam_call', 'account_compromise', 'malware_concern', 'financial_fraud', 'other']
            },
            title: { type: 'string', description: 'Brief incident title' },
            description: { type: 'string', description: 'Complete factual description of what occurred' },
            clickedLink: { type: 'boolean', description: 'Whether the user clicked a link' },
            sharedCredentials: { type: 'boolean', description: 'Whether passwords or OTP were entered' },
            sharedFinancialInformation: { type: 'boolean', description: 'Whether banking or card details were entered' },
            urgency: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] }
          },
          required: ['incidentType', 'title', 'description', 'urgency']
        }
      }
    ];
  };

  // Start voice session
  const startVoiceSession = async () => {
    setErrorMessage(null);
    setStatus('requesting_permission');

    try {
      // 1. Fetch temporary token from backend
      const tokenRes = await fetch('/api/voice/token');
      if (!tokenRes.ok) {
        const errorData = await tokenRes.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to obtain temporary voice token from server');
      }

      const tokenJson = await tokenRes.json();
      const token = tokenJson.token;
      const wsUrl = tokenJson.ws_url || 'wss://agents.assemblyai.com/v1/ws';

      // 2. Request mic permission
      setStatus('connecting');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 24000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      mediaStreamRef.current = stream;

      // 3. Connect to AssemblyAI Voice Agent WebSocket
      const fullWsUrl = `${wsUrl}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(fullWsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to AssemblyAI Voice Agent');
        setStatus('connected');
        reconnectAttemptsRef.current = 0;

        // Initialize session with CyberVoice prompt and tools
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            system_prompt: getAgentSystemPrompt(),
            greeting: "Hello, I'm CyberVoice, your cybersecurity incident response companion. What suspicious activity or message did you notice?",
            tools: getToolsDefinition(),
            input: {
              format: {
                encoding: 'audio/pcm'
              }
            },
            output: {
              format: {
                encoding: 'audio/pcm'
              }
            }
          }
        }));

        // Start streaming mic audio to WebSocket
        initMicrophoneStreaming(stream, ws);
      };

      ws.onmessage = (event) => {
        handleServerEvent(event.data);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setErrorMessage('Voice connection error. Please verify your connection or try reconnecting.');
        setStatus('error');
      };

      ws.onclose = (event) => {
        console.log('Voice agent WebSocket closed:', event.code, event.reason);
        if (status !== 'saved_successfully' && status !== 'idle') {
          setStatus('disconnected');
        }
        cleanupMicrophone();
      };

    } catch (err: any) {
      console.error('Failed to start voice session:', err);
      setErrorMessage(err.message || 'Microphone access denied or service unavailable');
      setStatus('error');
      cleanupMicrophone();
    }
  };

  // Initialize Mic audio streaming
  const initMicrophoneStreaming = (stream: MediaStream, ws: WebSocket) => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioCtx({ sampleRate: 24000 });
    audioContextRef.current = audioCtx;

    const source = audioCtx.createMediaStreamSource(stream);
    // 4096 buffer size at 24kHz provides approx 170ms audio chunks
    const processor = audioCtx.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    source.connect(processor);
    processor.connect(audioCtx.destination);

    processor.onaudioprocess = (e) => {
      if (ws.readyState !== WebSocket.OPEN) return;

      const inputData = e.inputBuffer.getChannelData(0);

      // Calculate instantaneous volume level for visualizer
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      setUserVolume(Math.min(1, rms * 5));

      // Encode to PCM16 base64 and stream to AssemblyAI
      const base64Audio = float32ArrayToBase64Pcm16(inputData);
      ws.send(JSON.stringify({
        type: 'input.audio',
        audio: base64Audio
      }));
    };

    if (playerRef.current) {
      playerRef.current.init();
    }
  };

  // Process server events from AssemblyAI Voice Agent
  const handleServerEvent = (rawData: any) => {
    try {
      const event = JSON.parse(rawData);

      switch (event.type) {
        case 'session.ready':
        case 'session.updated':
          setStatus('listening');
          break;

        case 'transcript.user':
          if (event.transcript || event.text) {
            const userText = event.transcript || event.text;
            addMessage('user', userText);
            setStatus('processing');
            // Dynamically evaluate and update live incident draft
            updateLiveIncidentDraft(userText);
          }
          break;

        case 'transcript.agent':
          if (event.transcript || event.text) {
            const agentText = event.transcript || event.text;
            addMessage('agent', agentText);
            // Check if agent is presenting confirmation
            if (agentText.toLowerCase().includes('save') || agentText.toLowerCase().includes('report') || agentText.toLowerCase().includes('confirm')) {
              triggerDraftModal();
            }
          }
          break;

        case 'reply.audio':
          if (event.audio && playerRef.current) {
            setStatus('agent_speaking');
            const float32 = base64ToFloat32Array(event.audio);
            playerRef.current.playChunk(float32);
          }
          break;

        case 'reply.done':
          setStatus('listening');
          break;

        case 'tool.call':
          handleToolCall(event);
          break;

        case 'error':
          console.error('AssemblyAI error event:', event);
          setErrorMessage(event.message || 'Voice agent processing error occurred');
          break;

        default:
          break;
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  };

  // Handle AssemblyAI Tool Call (save_incident_report)
  const handleToolCall = async (toolEvent: any) => {
    console.log('Received tool call from AssemblyAI:', toolEvent);
    const callId = toolEvent.call_id;
    const args = toolEvent.parameters || toolEvent.arguments || {};

    // Synthesize latest draft from tool parameters and messages
    const conversationText = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
    const synthesizedDraft = extractIncidentDraftFromConversation(conversationText + '\n' + (args.description || ''));

    const mergedDraft: IncidentDraft = {
      ...synthesizedDraft,
      incidentType: args.incidentType || synthesizedDraft.incidentType,
      title: args.title || synthesizedDraft.title,
      description: args.description || synthesizedDraft.description,
      urgency: args.urgency || synthesizedDraft.urgency,
      clickedLink: args.clickedLink !== undefined ? args.clickedLink : synthesizedDraft.clickedLink,
      sharedCredentials: args.sharedCredentials !== undefined ? args.sharedCredentials : synthesizedDraft.sharedCredentials
    };

    setIncidentDraft(mergedDraft);
    setShowPreviewModal(true);

    // Reply to WebSocket tool call with pending status
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && callId) {
      wsRef.current.send(JSON.stringify({
        type: 'tool.result',
        call_id: callId,
        result: JSON.stringify({ status: 'preview_displayed_awaiting_user_confirmation' })
      }));
    }
  };

  const updateLiveIncidentDraft = (latestUserText: string) => {
    const allText = [...messages.map(m => m.text), latestUserText].join(' ');
    const draft = extractIncidentDraftFromConversation(allText);
    setIncidentDraft(draft);
  };

  const triggerDraftModal = () => {
    if (!incidentDraft) {
      const allText = messages.map(m => m.text).join(' ');
      const draft = extractIncidentDraftFromConversation(allText);
      setIncidentDraft(draft);
    }
    setShowPreviewModal(true);
  };

  // Explicit confirmation and database persistence
  const handleConfirmAndSave = async () => {
    if (!incidentDraft) return;

    setIsSavingReport(true);
    setStatus('saving_report');

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          incidentType: incidentDraft.incidentType,
          title: incidentDraft.title,
          description: incidentDraft.description,
          source: 'voice_agent',
          suspiciousUrl: incidentDraft.suspiciousUrl,
          clickedLink: incidentDraft.clickedLink,
          sharedCredentials: incidentDraft.sharedCredentials,
          sharedFinancialInformation: incidentDraft.sharedFinancialInformation,
          openedAttachment: incidentDraft.openedAttachment,
          urgency: incidentDraft.urgency,
          status: 'new',
          timeline: incidentDraft.timeline,
          recommendedActions: incidentDraft.recommendedActions
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to persist incident in database');
      }

      const savedData = await response.json();
      setSavedSuccessId(savedData.id);
      setShowPreviewModal(false);
      setStatus('saved_successfully');

      addMessage('system', `Incident Report successfully confirmed and saved to database with ID: ${savedData.id}`);

      // Stop session cleanly after persistence
      setTimeout(() => {
        stopVoiceSession();
      }, 1500);

    } catch (err: any) {
      console.error('Failed to confirm and save incident:', err);
      setErrorMessage(err.message || 'Error occurred while saving incident report');
      setStatus('error');
    } finally {
      setIsSavingReport(false);
    }
  };

  const handleDiscardDraft = () => {
    setShowPreviewModal(false);
    setIncidentDraft(null);
    addMessage('system', 'Incident draft discarded. You can continue speaking with CyberVoice or report another concern.');
  };

  // Helper to add chat messages
  const addMessage = (sender: 'user' | 'agent' | 'system', text: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        sender,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Cleanup microphone resources
  const cleanupMicrophone = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setUserVolume(0);
  };

  // Stop session
  const stopVoiceSession = () => {
    cleanupMicrophone();

    if (wsRef.current) {
      try {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'session.end' }));
          wsRef.current.close();
        }
      } catch (e) {}
      wsRef.current = null;
    }

    if (playerRef.current) {
      playerRef.current.stop();
    }

    if (status !== 'saved_successfully') {
      setStatus('disconnected');
    }
  };

  // Clear conversation history
  const handleClearHistory = () => {
    setMessages([]);
    setIncidentDraft(null);
    setSavedSuccessId(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Voice Incident Assistant
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/80">
              Live Session
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Speak naturally to describe any digital threat or suspicious message.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {status === 'idle' || status === 'disconnected' || status === 'error' || status === 'saved_successfully' ? (
            <button
              onClick={startVoiceSession}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-bold text-sm shadow-[0_0_20px_rgba(0,210,255,0.4)] transition-all flex items-center space-x-2"
            >
              <Mic className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Start Voice Session</span>
            </button>
          ) : (
            <button
              onClick={stopVoiceSession}
              className="px-5 py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 font-semibold text-sm transition-all flex items-center space-x-2"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop Session</span>
            </button>
          )}

          {status === 'error' && (
            <button
              onClick={startVoiceSession}
              className="p-2.5 rounded-xl glass-panel border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 transition-all"
              title="Reconnect"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleClearHistory}
            disabled={messages.length === 0}
            className="p-2.5 rounded-xl glass-panel border border-slate-700 hover:border-red-500 text-slate-400 hover:text-red-400 transition-all disabled:opacity-40"
            title="Clear Conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Alert Display */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/80 text-red-200 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-300">Connection Notice</h4>
            <p className="text-xs text-red-200/90 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Success Notification if Saved */}
      {savedSuccessId && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-200 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-300">Report Confirmed and Persisted!</p>
              <p className="text-xs text-emerald-300/80 font-mono">Incident ID: {savedSuccessId}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/incidents/${savedSuccessId}`)}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700 text-xs font-semibold text-emerald-200"
          >
            View Report Details
          </button>
        </div>
      )}

      {/* Audio Visualizer & State Banner */}
      <AudioVisualizer status={status} userVolume={userVolume} />

      {/* Main Conversation Split-View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Transcript / Chat Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono text-slate-400">
            <span>REAL-TIME INTERACTION STREAM</span>
            <span>{messages.length} messages</span>
          </div>

          <div className="min-h-[380px] max-h-[500px] overflow-y-auto p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Terminal className="w-10 h-10 mb-3 text-slate-600" />
                <p className="text-sm font-medium text-slate-400">No active voice dialogue yet</p>
                <p className="text-xs max-w-sm mt-1">
                  Click <strong className="text-cyan-400 font-semibold">Start Voice Session</strong> and tell CyberVoice what you observed.
                </p>
                <div className="mt-4 p-3 rounded-lg bg-slate-900 border border-slate-800 text-left text-xs font-mono text-cyan-300/90 max-w-md">
                  💡 Try saying: "I received a message saying my bank account would be blocked. It included a link, and I clicked it."
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user'
                      ? 'items-end'
                      : msg.sender === 'agent'
                      ? 'items-start'
                      : 'items-center'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-500 mb-1 px-1">
                    <span>
                      {msg.sender === 'user' ? 'YOU' : msg.sender === 'agent' ? 'CYBERVOICE' : 'SYSTEM PROTOCOL'}
                    </span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-none shadow-[0_0_12px_rgba(0,210,255,0.2)]'
                        : msg.sender === 'agent'
                        ? 'bg-slate-900 border border-cyan-900/60 text-slate-200 rounded-bl-none shadow-md'
                        : 'bg-slate-900/90 border border-slate-800 text-cyan-300 text-xs text-center font-mono py-2'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Live Incident Preview & Confirmation Card */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono text-slate-400">
            <span>LIVE INCIDENT EXTRACTION</span>
            {incidentDraft && <span className="text-cyan-400 font-semibold">DRAFT READY</span>}
          </div>

          <div className="p-5 rounded-2xl glass-card bg-slate-900/90 border border-cyan-500/20 space-y-4">
            {incidentDraft ? (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs font-mono text-slate-400 uppercase">Current Triage</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                    incidentDraft.urgency === 'critical' ? 'bg-red-950 text-red-300 border border-red-800' :
                    incidentDraft.urgency === 'high' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                    'bg-yellow-950 text-yellow-300 border border-yellow-800'
                  }`}>
                    {incidentDraft.urgency} Urgency
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{incidentDraft.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-3 font-sans">
                    {incidentDraft.description}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs font-mono pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-slate-400">
                    <span>Link Clicked:</span>
                    <span className={incidentDraft.clickedLink ? 'text-amber-300 font-bold' : 'text-slate-500'}>
                      {incidentDraft.clickedLink ? 'DETECTED' : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Credentials Shared:</span>
                    <span className={incidentDraft.sharedCredentials ? 'text-red-400 font-bold' : 'text-slate-500'}>
                      {incidentDraft.sharedCredentials ? 'YES (HIGH RISK)' : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Financial Data:</span>
                    <span className={incidentDraft.sharedFinancialInformation ? 'text-red-400 font-bold' : 'text-slate-500'}>
                      {incidentDraft.sharedFinancialInformation ? 'YES' : 'None'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <button
                    onClick={triggerDraftModal}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,210,255,0.3)] transition-all flex items-center justify-center space-x-2"
                  >
                    <FileCheck className="w-4 h-4 stroke-[2.5]" />
                    <span>Review & Confirm Report</span>
                  </button>
                  <p className="text-[10px] text-center text-slate-500 mt-1.5">
                    Requires explicit user confirmation before saving
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-slate-500 space-y-2">
                <ShieldAlert className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs font-medium text-slate-400">Waiting for incident details</p>
                <p className="text-[11px] text-slate-500">
                  As you speak, CyberVoice structures facts, timelines, and safety actions in real time.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showPreviewModal && incidentDraft && (
        <IncidentPreviewModal
          draft={incidentDraft}
          onConfirm={handleConfirmAndSave}
          onDiscard={handleDiscardDraft}
          isSaving={isSavingReport}
        />
      )}
    </div>
  );
};
