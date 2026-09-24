import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowLeft,
  Calendar,
  Clock,
  Link as LinkIcon,
  Lock,
  DollarSign,
  FileText,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Download,
  Share2
} from 'lucide-react';
import { IncidentReport, Status } from '../types';

export const IncidentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [incident, setIncident] = useState<IncidentReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);

  const fetchIncidentDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/incidents/${id}`);
      if (!res.ok) {
        throw new Error('Incident report not found or failed to load');
      }
      const data = await res.json();
      setIncident(data);
    } catch (err: any) {
      setError(err.message || 'Error loading incident');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentDetails();
  }, [id]);

  const handleStatusChange = async (newStatus: Status) => {
    if (!incident) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/incidents/${incident.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      const updated = await res.json();
      setIncident(updated);
    } catch (err: any) {
      alert(err.message || 'Could not update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!incident) return;
    try {
      const res = await fetch(`/api/incidents/${incident.id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete incident report');
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Error deleting incident report');
    }
  };

  const handleExportJson = () => {
    if (!incident) return;
    const blob = new Blob([JSON.stringify(incident, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CyberVoice_Incident_${incident.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400 font-mono">Loading incident details from database...</p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Incident Report Not Found</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">{error || 'Could not find this record.'}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO INCIDENT LIST</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-lg glass-panel border border-slate-700 hover:border-cyan-500 text-xs text-slate-300 flex items-center space-x-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>

          {deleteConfirmation ? (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-red-400">Confirm deletion?</span>
              <button
                onClick={handleDelete}
                className="px-2.5 py-1 rounded-md bg-red-900 hover:bg-red-800 text-red-200 text-xs font-bold"
              >
                Yes
              </button>
              <button
                onClick={() => setDeleteConfirmation(false)}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDeleteConfirmation(true)}
              className="px-3 py-1.5 rounded-lg border border-red-900/60 hover:bg-red-950 text-xs text-red-400 flex items-center space-x-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Incident Card */}
      <div className="p-6 sm:p-8 rounded-2xl glass-card bg-slate-900/90 border border-slate-800 space-y-6">
        {/* Top Meta Bar */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">{incident.id}</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-slate-400 uppercase">{incident.incidentType.replace('_', ' ')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{incident.title}</h1>
          </div>

          {/* Status & Urgency Dropdowns */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Report Status</span>
              <select
                value={incident.status}
                onChange={(e) => handleStatusChange(e.target.value as Status)}
                disabled={isUpdatingStatus}
                className="mt-0.5 px-3 py-1 text-xs font-mono font-semibold rounded-lg bg-slate-950 border border-slate-700 text-cyan-300 focus:outline-none focus:border-cyan-400"
              >
                <option value="new">NEW</option>
                <option value="reviewing">UNDER REVIEW</option>
                <option value="resolved">RESOLVED</option>
                <option value="archived">ARCHIVED</option>
              </select>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Urgency</span>
              <span className={`inline-block mt-0.5 px-2.5 py-1 text-xs font-bold rounded-lg uppercase ${
                incident.urgency === 'critical' ? 'bg-red-950 text-red-300 border border-red-800' :
                incident.urgency === 'high' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                'bg-yellow-950 text-yellow-300 border border-yellow-800'
              }`}>
                {incident.urgency}
              </span>
            </div>
          </div>
        </div>

        {/* Narrative Description */}
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Incident Narrative</span>
          </h3>
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-sm text-slate-200 leading-relaxed font-sans">
            {incident.description}
          </div>
        </div>

        {/* Risk Indicators Grid */}
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
            Risk &amp; Exposure Indicators
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-3 rounded-xl border text-xs flex flex-col items-center text-center ${incident.clickedLink ? 'bg-amber-950/40 border-amber-800 text-amber-300' : 'bg-slate-950/40 border-slate-800 text-slate-400'}`}>
              <LinkIcon className="w-4 h-4 mb-1" />
              <span>Clicked Link</span>
              <span className="font-bold text-xs mt-0.5">{incident.clickedLink ? 'YES' : 'NO'}</span>
            </div>

            <div className={`p-3 rounded-xl border text-xs flex flex-col items-center text-center ${incident.sharedCredentials ? 'bg-red-950/40 border-red-800 text-red-300' : 'bg-slate-950/40 border-slate-800 text-slate-400'}`}>
              <Lock className="w-4 h-4 mb-1" />
              <span>Credentials Shared</span>
              <span className="font-bold text-xs mt-0.5">{incident.sharedCredentials ? 'YES' : 'NO'}</span>
            </div>

            <div className={`p-3 rounded-xl border text-xs flex flex-col items-center text-center ${incident.sharedFinancialInformation ? 'bg-red-950/40 border-red-800 text-red-300' : 'bg-slate-950/40 border-slate-800 text-slate-400'}`}>
              <DollarSign className="w-4 h-4 mb-1" />
              <span>Financial Data</span>
              <span className="font-bold text-xs mt-0.5">{incident.sharedFinancialInformation ? 'YES' : 'NO'}</span>
            </div>

            <div className={`p-3 rounded-xl border text-xs flex flex-col items-center text-center ${incident.openedAttachment ? 'bg-amber-950/40 border-amber-800 text-amber-300' : 'bg-slate-950/40 border-slate-800 text-slate-400'}`}>
              <FileText className="w-4 h-4 mb-1" />
              <span>Attachment Opened</span>
              <span className="font-bold text-xs mt-0.5">{incident.openedAttachment ? 'YES' : 'NO'}</span>
            </div>
          </div>
        </div>

        {/* Suspicious URL */}
        {incident.suspiciousUrl && (
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            <span className="text-slate-400 block mb-1 font-mono uppercase">Suspicious URL / Endpoint:</span>
            <span className="text-cyan-300 font-mono break-all bg-slate-900 px-2 py-1 rounded border border-slate-800 inline-block">
              {incident.suspiciousUrl}
            </span>
          </div>
        )}

        {/* Structured Timeline */}
        {incident.timeline && incident.timeline.length > 0 && (
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Incident Timeline</span>
            </h3>
            <div className="space-y-2.5 border-l-2 border-cyan-500/30 pl-4 ml-2">
              {incident.timeline.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,210,255,0.7)]" />
                  <div className="text-xs">
                    <span className="font-mono text-cyan-300 font-semibold mr-2">{item.time || `Phase ${idx + 1}`}:</span>
                    <span className="text-slate-300">{item.event}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Actions */}
        {incident.recommendedActions && incident.recommendedActions.length > 0 && (
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Safety Guidance &amp; Recommended Actions</span>
            </h3>
            <div className="space-y-2">
              {incident.recommendedActions.map((rec, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-start space-x-2.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <div>
                    <p className="font-medium text-slate-200">{rec.action}</p>
                    {rec.cautionNotice && (
                      <p className="text-[11px] text-slate-400 mt-0.5 italic">{rec.cautionNotice}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamps Footer */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between text-[11px] font-mono text-slate-500 gap-2">
          <span>Created: {new Date(incident.createdAt).toLocaleString()}</span>
          <span>Last Updated: {new Date(incident.updatedAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
