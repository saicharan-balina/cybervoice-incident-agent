export type IncidentType =
  | 'phishing_email'
  | 'suspicious_message'
  | 'suspicious_url'
  | 'scam_call'
  | 'account_compromise'
  | 'malware_concern'
  | 'financial_fraud'
  | 'other';

export type Urgency = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'new' | 'reviewing' | 'resolved' | 'archived';

export interface TimelineItem {
  time?: string;
  event: string;
  category: 'reported_event' | 'user_action' | 'information_exposure' | 'observed_consequence' | 'recommended_next_step';
  verified: boolean;
}

export interface RecommendedAction {
  action: string;
  priority: 'immediate' | 'high' | 'standard';
  cautionNotice?: string;
}

export interface IncidentReport {
  id: string;
  incidentType: IncidentType;
  title: string;
  description: string;
  source: string;
  suspiciousUrl: string | null;
  clickedLink: boolean;
  sharedCredentials: boolean;
  sharedFinancialInformation: boolean;
  openedAttachment: boolean;
  urgency: Urgency;
  status: Status;
  conversationId?: string | null;
  timeline: TimelineItem[];
  recommendedActions: RecommendedAction[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentDraft {
  incidentType: IncidentType;
  title: string;
  description: string;
  suspiciousUrl?: string | null;
  clickedLink: boolean;
  sharedCredentials: boolean;
  sharedFinancialInformation: boolean;
  openedAttachment: boolean;
  urgency: Urgency;
  status: Status;
  timeline: TimelineItem[];
  recommendedActions: RecommendedAction[];
}

export type VoiceSessionStatus =
  | 'idle'
  | 'requesting_permission'
  | 'connecting'
  | 'connected'
  | 'listening'
  | 'agent_speaking'
  | 'processing'
  | 'saving_report'
  | 'saved_successfully'
  | 'disconnected'
  | 'error';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
}
