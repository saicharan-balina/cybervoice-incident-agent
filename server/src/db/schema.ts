import { z } from 'zod';

export const IncidentTypeEnum = z.enum([
  'phishing_email',
  'suspicious_message',
  'suspicious_url',
  'scam_call',
  'account_compromise',
  'malware_concern',
  'financial_fraud',
  'other'
]);

export const UrgencyEnum = z.enum(['low', 'medium', 'high', 'critical']);
export const StatusEnum = z.enum(['new', 'reviewing', 'resolved', 'archived']);

export const TimelineItemSchema = z.object({
  time: z.string().optional(),
  event: z.string().min(1, 'Event description required'),
  category: z.enum(['reported_event', 'user_action', 'information_exposure', 'observed_consequence', 'recommended_next_step']),
  verified: z.boolean().default(false)
});

export const RecommendedActionSchema = z.object({
  action: z.string().min(1),
  priority: z.enum(['immediate', 'high', 'standard']),
  cautionNotice: z.string().optional()
});

export const CreateIncidentSchema = z.object({
  incidentType: IncidentTypeEnum,
  title: z.string().min(3).max(200),
  description: z.string().min(5).max(5000),
  source: z.string().max(100).default('voice_agent'),
  suspiciousUrl: z.string().max(1000).nullable().optional(),
  clickedLink: z.boolean().default(false),
  sharedCredentials: z.boolean().default(false),
  sharedFinancialInformation: z.boolean().default(false),
  openedAttachment: z.boolean().default(false),
  urgency: UrgencyEnum.default('medium'),
  status: StatusEnum.default('new'),
  conversationId: z.string().max(200).nullable().optional(),
  timeline: z.array(TimelineItemSchema).optional().default([]),
  recommendedActions: z.array(RecommendedActionSchema).optional().default([]),
  metadata: z.record(z.any()).optional().default({})
});

export const UpdateIncidentSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  incidentType: IncidentTypeEnum.optional(),
  description: z.string().min(5).max(5000).optional(),
  suspiciousUrl: z.string().max(1000).nullable().optional(),
  clickedLink: z.boolean().optional(),
  sharedCredentials: z.boolean().optional(),
  sharedFinancialInformation: z.boolean().optional(),
  openedAttachment: z.boolean().optional(),
  urgency: UrgencyEnum.optional(),
  status: StatusEnum.optional(),
  timeline: z.array(TimelineItemSchema).optional(),
  recommendedActions: z.array(RecommendedActionSchema).optional(),
  metadata: z.record(z.any()).optional()
});

export type CreateIncidentInput = z.infer<typeof CreateIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof UpdateIncidentSchema>;

export interface IncidentRecord {
  id: string;
  incidentType: string;
  title: string;
  description: string;
  source: string;
  suspiciousUrl: string | null;
  clickedLink: boolean;
  sharedCredentials: boolean;
  sharedFinancialInformation: boolean;
  openedAttachment: boolean;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'reviewing' | 'resolved' | 'archived';
  conversationId: string | null;
  timeline: any[];
  recommendedActions: any[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
