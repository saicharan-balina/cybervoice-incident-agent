import { IncidentDraft, IncidentType, Urgency } from '../types';

export function extractIncidentDraftFromConversation(transcript: string): IncidentDraft {
  const lower = transcript.toLowerCase();

  let incidentType: IncidentType = 'other';
  if (lower.includes('email') || lower.includes('inbox') || lower.includes('mail')) {
    incidentType = 'phishing_email';
  } else if (lower.includes('sms') || lower.includes('text message') || lower.includes('message') || lower.includes('whatsapp')) {
    incidentType = 'suspicious_message';
  } else if (lower.includes('call') || lower.includes('phone') || lower.includes('voice message')) {
    incidentType = 'scam_call';
  } else if (lower.includes('malware') || lower.includes('virus') || lower.includes('ransomware') || lower.includes('hacked pc')) {
    incidentType = 'malware_concern';
  } else if (lower.includes('bank') || lower.includes('credit card') || lower.includes('wire') || lower.includes('money') || lower.includes('charge')) {
    incidentType = 'financial_fraud';
  } else if (lower.includes('password') || lower.includes('logged in') || lower.includes('hacked') || lower.includes('unauthorized access')) {
    incidentType = 'account_compromise';
  } else if (lower.includes('link') || lower.includes('website') || lower.includes('url')) {
    incidentType = 'suspicious_url';
  }

  // Boolean flags extraction
  const clickedLink = /clicked|opened the link|pressed the link|followed the link|visited the page/.test(lower) && !lower.includes("didn't click") && !lower.includes("did not click");
  const sharedCredentials = /password|otp|one time password|pin|security code|login details/.test(lower) && (lower.includes('entered') || lower.includes('gave') || lower.includes('typed') || lower.includes('provided') || lower.includes('shared'));
  const sharedFinancialInformation = /credit card|cvv|bank account number|debit card|routing number|transferred money|paid/.test(lower) && (lower.includes('entered') || lower.includes('provided') || lower.includes('gave') || lower.includes('shared') || lower.includes('sent'));
  const openedAttachment = /opened the attachment|downloaded the file|opened the pdf|downloaded an exe|ran the file/.test(lower);

  // URL extraction
  let suspiciousUrl: string | null = null;
  const urlMatch = transcript.match(/https?:\/\/[^\s]+/i) || transcript.match(/www\.[^\s]+/i);
  if (urlMatch) {
    suspiciousUrl = urlMatch[0].replace(/[.,;]$/, '');
  }

  // Urgency calculation
  let urgency: Urgency = 'medium';
  if (sharedCredentials || sharedFinancialInformation) {
    urgency = 'critical';
  } else if (clickedLink || openedAttachment) {
    urgency = 'high';
  } else if (lower.includes('blocked') || lower.includes('frozen') || lower.includes('compromised')) {
    urgency = 'high';
  }

  // Timeline synthesis
  const timeline: any[] = [];
  timeline.push({
    time: 'Step 1',
    event: 'User encountered suspicious communication or alert',
    category: 'reported_event',
    verified: true
  });

  if (clickedLink) {
    timeline.push({
      time: 'Step 2',
      event: 'User clicked on the unverified link or web address',
      category: 'user_action',
      verified: true
    });
  }

  if (openedAttachment) {
    timeline.push({
      time: 'Step 2B',
      event: 'User opened or executed suspicious attachment',
      category: 'user_action',
      verified: true
    });
  }

  if (sharedCredentials) {
    timeline.push({
      time: 'Step 3',
      event: 'Potential credential exposure (passwords, PIN, or OTP entered)',
      category: 'information_exposure',
      verified: true
    });
  }

  if (sharedFinancialInformation) {
    timeline.push({
      time: 'Step 3B',
      event: 'Potential financial exposure (banking or payment card data entered)',
      category: 'information_exposure',
      verified: true
    });
  }

  timeline.push({
    time: 'Next Steps',
    event: 'Initiate triage, credential isolation, and containment measures',
    category: 'recommended_next_step',
    verified: false
  });

  // Recommended actions synthesis
  const recommendedActions: any[] = [];
  if (sharedCredentials) {
    recommendedActions.push({
      action: 'Immediately reset your account password directly via the official service (do not use links from the message).',
      priority: 'immediate',
      cautionNotice: 'Enable two-factor authentication (2FA) with an authenticator app if available.'
    });
  }

  if (sharedFinancialInformation) {
    recommendedActions.push({
      action: 'Contact your bank or card issuer through the official number on the back of your card to freeze/monitor accounts.',
      priority: 'immediate',
      cautionNotice: 'Review recent statements for unauthorized pending authorizations.'
    });
  }

  if (clickedLink) {
    recommendedActions.push({
      action: 'Do not enter any further credentials or download files from the destination page.',
      priority: 'high',
      cautionNotice: 'Clear browser cookies and cache for that suspicious domain.'
    });
  }

  recommendedActions.push({
    action: 'Avoid clicking links or calling phone numbers provided inside suspicious messages.',
    priority: 'standard',
    cautionNotice: 'Always independently verify sender contacts through known official websites.'
  });

  // Title generation
  let title = 'Suspicious Cyber Incident Report';
  if (incidentType === 'suspicious_message') {
    title = clickedLink ? 'Suspicious SMS / Message with Clicked Link' : 'Suspicious Message Alert';
  } else if (incidentType === 'phishing_email') {
    title = clickedLink ? 'Phishing Email with Malicious Link Interaction' : 'Suspicious Phishing Email Received';
  } else if (incidentType === 'account_compromise') {
    title = 'Suspected Account Compromise & Access Concern';
  } else if (incidentType === 'financial_fraud') {
    title = 'Urgent Financial Fraud & Bank Impersonation Alert';
  }

  return {
    incidentType,
    title,
    description: transcript.length > 3000 ? transcript.slice(0, 3000) + '...' : transcript,
    suspiciousUrl,
    clickedLink,
    sharedCredentials,
    sharedFinancialInformation,
    openedAttachment,
    urgency,
    status: 'new',
    timeline,
    recommendedActions
  };
}
