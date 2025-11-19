
import { LeadStatus, LeadPriority, Lead } from './crm-types';

export const LEAD_STATUSES: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: 'bg-blue-500' },
  { value: 'qualified', label: 'Qualified', color: 'bg-purple-500' },
  { value: 'proposal', label: 'Proposal', color: 'bg-yellow-500' },
  { value: 'closed-won', label: 'Closed Won', color: 'bg-green-500' },
  { value: 'closed-lost', label: 'Closed Lost', color: 'bg-red-500' },
];

export const LEAD_PRIORITIES: { value: LeadPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'text-gray-500' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
  { value: 'high', label: 'High', color: 'text-red-500' },
];

export const LEAD_SOURCES = [
  { value: 'chat', label: 'AI Chatbot' },
  { value: 'welcome-popup', label: 'Welcome Popup' },
  { value: 'exit-intent', label: 'Exit Intent' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'assessment', label: 'Marketing Assessment' },
  { value: 'contact-form', label: 'Contact Form' },
  { value: 'referral', label: 'Referral' },
  { value: 'bulk-import', label: 'Bulk Import' },
  { value: 'manual', label: 'Manual Entry' },
  { value: 'other', label: 'Other' },
];

export function getStatusColor(status: LeadStatus): string {
  return LEAD_STATUSES.find(s => s.value === status)?.color || 'bg-gray-500';
}

export function getPriorityColor(priority: LeadPriority): string {
  return LEAD_PRIORITIES.find(p => p.value === priority)?.color || 'text-gray-500';
}

export function calculateLeadScore(lead: Lead): number {
  let score = 0;

  // Source scoring
  const sourceScores: Record<string, number> = {
    'assessment': 30,
    'chat': 25,
    'contact-form': 20,
    'referral': 20,
    'bulk-import': 15,
    'welcome-popup': 15,
    'manual': 15,
    'exit-intent': 10,
    'newsletter': 10,
  };
  score += sourceScores[lead.source] || 10;

  // Interest scoring
  if (lead.interest) score += 15;

  // Contact info completeness
  if (lead.phone) score += 10;
  if (lead.company) score += 10;

  // Budget and timeline
  if (lead.budget) score += 15;
  if (lead.timeline) score += 10;

  // Engagement scoring
  if (lead.chatHistory) {
    try {
      const history = JSON.parse(lead.chatHistory);
      score += Math.min(history.length * 2, 10); // Up to 10 points
    } catch (e) {
      // Invalid JSON, skip
    }
  }

  return Math.min(score, 100);
}

export function formatLeadSource(source: string): string {
  return LEAD_SOURCES.find(s => s.value === source)?.label || source;
}

export function getLeadTimeframe(createdAt: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(createdAt).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export function isLeadOverdue(nextFollowUpAt?: Date | null): boolean {
  if (!nextFollowUpAt) return false;
  return new Date(nextFollowUpAt) < new Date();
}
