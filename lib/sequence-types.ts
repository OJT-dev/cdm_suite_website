
// Type definitions for sequence management

export interface SequenceStep {
  id?: string;
  order: number;
  stepType: 'email' | 'sms' | 'task' | 'reminder' | 'note' | 'delay';
  title: string;
  content?: string;
  subject?: string; // For email steps
  delayAmount: number;
  delayUnit: 'minutes' | 'hours' | 'days' | 'weeks';
  delayFrom: 'previous' | 'start';
  conditions?: any; // JSON conditions
  aiSuggested?: boolean;
  aiReasoning?: string;
  mergeTags?: string[];
  active?: boolean;
}

export interface Sequence {
  id: string;
  name: string;
  description?: string;
  type: 'email' | 'sms' | 'task' | 'mixed';
  targetAudience: string;
  aiGenerated: boolean;
  aiPrompt?: string;
  status: 'pending' | 'approved' | 'active' | 'paused' | 'archived';
  approvedById?: string;
  approvedAt?: Date;
  timesUsed: number;
  successRate?: number;
  activatedAt?: Date;
  deactivatedAt?: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  steps?: SequenceStep[];
  assignments?: SequenceAssignment[];
  approvedBy?: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface SequenceAssignment {
  id: string;
  sequenceId: string;
  leadId: string;
  assignedById: string;
  assignedBy: string;
  approvedById?: string;
  approvedAt?: Date;
  status: 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';
  currentStep: number;
  startedAt?: Date;
  completedAt?: Date;
  pausedAt?: Date;
  stepsCompleted: number;
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  emailsReplied: number;
  tasksCreated: number;
  tasksCompleted: number;
  converted: boolean;
  convertedAt?: Date;
  conversionType?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  sequence?: Sequence;
  lead?: any;
  activities?: SequenceActivity[];
}

export interface SequenceActivity {
  id: string;
  assignmentId: string;
  stepOrder: number;
  actionType: string;
  result?: any;
  messageId?: string;
  emailSubject?: string;
  openedAt?: Date;
  clickedAt?: Date;
  repliedAt?: Date;
  error?: string;
  retryCount: number;
  metadata?: any;
  timestamp: Date;
  createdAt: Date;
}

export interface SequenceFilters {
  status?: string;
  type?: string;
  targetAudience?: string;
  aiGenerated?: boolean;
  createdBy?: string;
  search?: string;
}

export interface SequencePerformanceMetrics {
  totalAssignments: number;
  activeAssignments: number;
  completedAssignments: number;
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  emailsReplied: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  conversionRate: number;
  avgTimeToConversion?: number;
}

// Constants
export const SEQUENCE_TYPES = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'task', label: 'Task' },
  { value: 'mixed', label: 'Mixed' },
] as const;

export const SEQUENCE_STATUSES = [
  { value: 'pending', label: 'Pending Approval', color: 'yellow' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'active', label: 'Active', color: 'blue' },
  { value: 'paused', label: 'Paused', color: 'gray' },
  { value: 'archived', label: 'Archived', color: 'slate' },
] as const;

export const ASSIGNMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'active', label: 'Active', color: 'blue' },
  { value: 'paused', label: 'Paused', color: 'orange' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
] as const;

export const STEP_TYPES = [
  { value: 'email', label: 'Email', icon: '✉️' },
  { value: 'sms', label: 'SMS', icon: '💬' },
  { value: 'task', label: 'Task', icon: '✓' },
  { value: 'reminder', label: 'Reminder', icon: '🔔' },
  { value: 'note', label: 'Note', icon: '📝' },
  { value: 'delay', label: 'Delay', icon: '⏱️' },
] as const;

export const DELAY_UNITS = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
] as const;

export const TARGET_AUDIENCES = [
  { value: 'new_lead', label: 'New Lead' },
  { value: 'consultation_scheduled', label: 'Consultation Scheduled' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'client_onboarding', label: 'Client Onboarding' },
  { value: 'reactivation', label: 'Reactivation' },
  { value: 'custom', label: 'Custom' },
] as const;

export const MERGE_TAGS = [
  { value: '{{firstName}}', label: 'First Name' },
  { value: '{{lastName}}', label: 'Last Name' },
  { value: '{{email}}', label: 'Email' },
  { value: '{{company}}', label: 'Company' },
  { value: '{{phone}}', label: 'Phone' },
  { value: '{{serviceType}}', label: 'Service Type' },
  { value: '{{budget}}', label: 'Budget' },
  { value: '{{timeline}}', label: 'Timeline' },
  { value: '{{assignedTo}}', label: 'Assigned Employee' },
] as const;

