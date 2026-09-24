import React from 'react';
import { IncidentDraft } from '../types';
import { ShieldAlert, AlertTriangle, CheckCircle, Clock, Link as LinkIcon, Lock, DollarSign, FileText, Check, X } from 'lucide-react';

interface IncidentPreviewModalProps {
  draft: IncidentDraft;
  onConfirm: () => void;
  onDiscard: () => void;
  isSaving: boolean;
}

export const IncidentPreviewModal: React.FC<IncidentPreviewModalProps> = ({
  draft,
  onConfirm,
  onDiscard,
  isSaving
}) => {
  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-950 text-red-300 border border-red-800">Critical Urgency</span>;
      case 'high':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-950 text-orange-300 border border-orange-800">High Urgency</span>;
      case 'medium':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-950 text-yellow-300 border border-yellow-800">Medium Urgency</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">Low Urgency</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 rounded-2xl glass-card bg-slate-900/95 border border-cyan-500/40 p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-wider font-mono text-cyan-400 font-semibold">Incident Confirmation Required</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">{draft.title}</h2>
            </div>
          </div>
          <div>{getUrgencyBadge(draft.urgency)}</div>
        </div>

        {/* Content Body */}
        <div className="py-5 space-y-5 max-h-[60vh] overflow-y-auto pr-1">
          {/* Incident Type & Source */}
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Category:</span>
              <p className="text-cyan-300 font-semibold uppercase mt-0.5">{draft.incidentType.replace('_', ' ')}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Source:</span>
              <p className="text-slate-200 font-semibold mt-0.5">Voice Agent Consultation</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              Incident Narrative
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-sm text-slate-200 leading-relaxed font-sans">
              {draft.description}
            </div>
          </div>

          {/* Risk Factors & Exposed Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Identified Risk Indicators</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className={`p-2.5 rounded-lg border text-xs flex flex-col items-center justify-center text-center ${draft.clickedLink ? 'bg-amber-950/40 border-amber-800/60 text-amber-300' : 'bg-slate-950/40 border-slate-800 text-slate-400'}`}>
                <LinkIcon className="w-4 h-4 mb-1" />
                <span>Clicked Link</span>
                <span className="font-bold text-[11px] mt-0.5">{draft.clickedLink ? 'YES' : 'NO'}</span>
              </div>
              <div className={`p-2.5 rounded-lg border text-xs flex flex-col items-center justify-center text-center ${draft.sharedCredentials ? 'bg-red-950/40 border-red-800/60 text-red-300' : 'bg-slate-950/40 border-slate-800 text-slate-400'}`}>
                <Lock className="w-4 h-4 mb-1" />
                <span>Credentials Shared</span>
                <span className="font-bold text-[11px] mt-0.5">{draft.sharedCredentials ? 'YES' : 'NO'}</span>
              </div>
              <div className={`p-2.5 rounded-lg border text-xs flex flex-col items-center justify-center text-center ${draft.sharedFinancialInformation ? 'bg-red-950/40 border-red-800/60 text-red-300' : 'bg-slate-950/40 border-slate-800 text-slate-400'}`}>
                <DollarSign className="w-4 h-4 mb-1" />
                <span>Financial Data</span>
                <span className="font-bold text-[11px] mt-0.5">{draft.sharedFinancialInformation ? 'YES' : 'NO'}</span>
              </div>
              <div className={`p-2.5 rounded-lg border text-xs flex flex-col items-center justify-center text-center ${draft.openedAttachment ? 'bg-amber-950/40 border-amber-800/60 text-amber-300' : 'bg-slate-950/40 border-slate-800 text-slate-400'}`}>
                <FileText className="w-4 h-4 mb-1" />
                <span>Attachment Opened</span>
                <span className="font-bold text-[11px] mt-0.5">{draft.openedAttachment ? 'YES' : 'NO'}</span>
              </div>
            </div>
          </div>

          {/* Structured Timeline */}
          {draft.timeline && draft.timeline.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Structured Incident Timeline
              </h4>
              <div className="space-y-2 border-l-2 border-cyan-500/30 pl-3 ml-1">
                {draft.timeline.map((item, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,210,255,0.8)]" />
                    <div className="text-xs">
                      <span className="font-mono text-cyan-300 font-medium mr-2">{item.time || `Phase ${idx + 1}`}:</span>
                      <span className="text-slate-300">{item.event}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Actions */}
          {draft.recommendedActions && draft.recommendedActions.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Safety Guidance & Recommended Actions
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {draft.recommendedActions.map((rec, idx) => (
                  <li key={idx} className="p-2 rounded bg-slate-950/60 border border-slate-800 flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <div>
                      <p className="font-medium text-slate-200">{rec.action}</p>
                      {rec.cautionNotice && (
                        <p className="text-[11px] text-slate-400 mt-0.5 italic">{rec.cautionNotice}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-900/40 text-xs text-blue-300 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              <strong>Security Protocol Notice:</strong> This report will only be saved to the database upon your explicit confirmation. Passwords and secret credentials are intentionally omitted.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={onDiscard}
            disabled={isSaving}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-all flex items-center justify-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Discard Draft</span>
          </button>

          <button
            onClick={onConfirm}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-sm shadow-[0_0_20px_rgba(0,210,255,0.4)] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4 stroke-[3]" />
            )}
            <span>Confirm & Save Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
