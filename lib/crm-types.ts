
// Lead CRM Type Definitions

export type LeadStatus = 'new' | 'qualified' | 'proposal' | 'closed-won' | 'closed-lost';
export type LeadPriority = 'low' | 'medium' | 'high';
export type ActivityType = 'note' | 'email' | 'call' | 'meeting' | 'status_change' | 'assignment';

export interface Lead {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  company?: string | null;
  source: string;
  interest?: string | null;
  chatHistory?: string | null;
  assessmentResults?: string | null;
  
  // CRM Fields
  status: LeadStatus;
  priority: LeadPriority;
  assignedToId?: string | null;
  
  // Lead scoring
  score: number;
  budget?: string | null;
  timeline?: string | null;
  lastContactedAt?: Date | null;
  nextFollowUpAt?: Date | null;
  
  // Notes and metadata
  notes?: string | null;
  tags: string[];
  customFields?: string | null;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  assignedTo?: {
    id: string;
    user: {
      name: string | null;
      email: string;
    };
  };
  activities?: LeadActivity[];
  sequences?: LeadSequence[];
}

export interface LeadActivity {
  id: string;
  leadId: string;
  type: ActivityType;
  title: string;
  description?: string | null;
  metadata?: string | null;
  createdById?: string | null;
  createdBy?: {
    id: string;
    user: {
      name: string | null;
      email: string;
    };
  };
  createdAt: Date;
}

export interface LeadSequence {
  id: string;
  leadId: string;
  name: string;
  description?: string | null;
  steps: SequenceStep[];
  currentStep: number;
  status: 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';
  aiGenerated: boolean;
  aiRecommendedBy?: string | null;
  approvedBy?: string | null;
  approvedAt?: Date | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SequenceStep {
  stepNumber: number;
  action: 'email' | 'call' | 'task' | 'wait';
  title: string;
  description: string;
  delayDays?: number;
  emailTemplate?: string;
  completed: boolean;
  completedAt?: Date;
}

export interface LeadFilters {
  status?: LeadStatus;
  priority?: LeadPriority;
  assignedToId?: string;
  source?: string;
  search?: string;
  tags?: string[];
}

export interface LeadStats {
  total: number;
  byStatus: Record<LeadStatus, number>;
  byPriority: Record<LeadPriority, number>;
  bySource: Record<string, number>;
  avgScore: number;
  conversionRate: number;
}
