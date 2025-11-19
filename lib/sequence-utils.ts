
// Utility functions for sequence management

import { SequenceStep, SequencePerformanceMetrics } from './sequence-types';

export function formatSequenceStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pending Approval',
    approved: 'Approved',
    active: 'Active',
    paused: 'Paused',
    archived: 'Archived',
  };
  return statusMap[status] || status;
}

export function getSequenceStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    active: 'bg-blue-100 text-blue-800',
    paused: 'bg-gray-100 text-gray-800',
    archived: 'bg-slate-100 text-slate-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}

export function formatStepType(stepType: string): string {
  const typeMap: Record<string, string> = {
    email: 'Email',
    sms: 'SMS',
    task: 'Task',
    reminder: 'Reminder',
    note: 'Note',
    delay: 'Delay',
  };
  return typeMap[stepType] || stepType;
}

export function getStepTypeIcon(stepType: string): string {
  const iconMap: Record<string, string> = {
    email: '✉️',
    sms: '💬',
    task: '✓',
    reminder: '🔔',
    note: '📝',
    delay: '⏱️',
  };
  return iconMap[stepType] || '•';
}

export function formatDelay(amount: number, unit: string): string {
  if (amount === 0) return 'Immediately';
  const unitLabel = amount === 1 ? unit.slice(0, -1) : unit;
  return `Wait ${amount} ${unitLabel}`;
}

export function calculateSequencePerformance(
  assignments: any[]
): SequencePerformanceMetrics {
  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter((a) => a.status === 'active').length;
  const completedAssignments = assignments.filter((a) => a.status === 'completed').length;

  const emailsSent = assignments.reduce((sum, a) => sum + (a.emailsSent || 0), 0);
  const emailsOpened = assignments.reduce((sum, a) => sum + (a.emailsOpened || 0), 0);
  const emailsClicked = assignments.reduce((sum, a) => sum + (a.emailsClicked || 0), 0);
  const emailsReplied = assignments.reduce((sum, a) => sum + (a.emailsReplied || 0), 0);

  const openRate = emailsSent > 0 ? (emailsOpened / emailsSent) * 100 : 0;
  const clickRate = emailsOpened > 0 ? (emailsClicked / emailsOpened) * 100 : 0;
  const replyRate = emailsSent > 0 ? (emailsReplied / emailsSent) * 100 : 0;

  const conversions = assignments.filter((a) => a.converted).length;
  const conversionRate = totalAssignments > 0 ? (conversions / totalAssignments) * 100 : 0;

  return {
    totalAssignments,
    activeAssignments,
    completedAssignments,
    emailsSent,
    emailsOpened,
    emailsClicked,
    emailsReplied,
    openRate,
    clickRate,
    replyRate,
    conversionRate,
  };
}

export function replaceMergeTags(content: string, leadData: any): string {
  let replaced = content;
  
  // Replace common merge tags
  const tagMap: Record<string, string> = {
    '{{firstName}}': leadData.name?.split(' ')[0] || 'there',
    '{{lastName}}': leadData.name?.split(' ').slice(1).join(' ') || '',
    '{{email}}': leadData.email || '',
    '{{company}}': leadData.company || 'your company',
    '{{phone}}': leadData.phone || '',
    '{{serviceType}}': leadData.interest || 'our services',
    '{{budget}}': leadData.budget || '',
    '{{timeline}}': leadData.timeline || '',
    '{{assignedTo}}': leadData.assignedTo?.name || 'our team',
  };

  Object.entries(tagMap).forEach(([tag, value]) => {
    replaced = replaced.replace(new RegExp(tag, 'g'), value);
  });

  return replaced;
}

export function validateSequenceSteps(steps: SequenceStep[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (steps.length === 0) {
    errors.push('Sequence must have at least one step');
  }

  steps.forEach((step, index) => {
    if (!step.title?.trim()) {
      errors.push(`Step ${index + 1}: Title is required`);
    }

    if (step.stepType === 'email') {
      if (!step.subject?.trim()) {
        errors.push(`Step ${index + 1}: Email subject is required`);
      }
      if (!step.content?.trim()) {
        errors.push(`Step ${index + 1}: Email content is required`);
      }
    }

    if (step.stepType === 'task' && !step.content?.trim()) {
      errors.push(`Step ${index + 1}: Task description is required`);
    }

    if (step.delayAmount < 0) {
      errors.push(`Step ${index + 1}: Delay amount cannot be negative`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function estimateSequenceDuration(steps: SequenceStep[]): {
  totalMinutes: number;
  formatted: string;
} {
  let totalMinutes = 0;

  steps.forEach((step) => {
    const { delayAmount, delayUnit } = step;
    
    switch (delayUnit) {
      case 'minutes':
        totalMinutes += delayAmount;
        break;
      case 'hours':
        totalMinutes += delayAmount * 60;
        break;
      case 'days':
        totalMinutes += delayAmount * 24 * 60;
        break;
      case 'weeks':
        totalMinutes += delayAmount * 7 * 24 * 60;
        break;
    }
  });

  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = Math.floor(totalMinutes % 60);

  let formatted = '';
  if (days > 0) formatted += `${days}d `;
  if (hours > 0) formatted += `${hours}h `;
  if (minutes > 0) formatted += `${minutes}m`;
  
  return {
    totalMinutes,
    formatted: formatted.trim() || '0m',
  };
}

export function getNextStepPreview(step: SequenceStep): string {
  const delay = formatDelay(step.delayAmount, step.delayUnit);
  const type = formatStepType(step.stepType);
  
  return `${delay} → ${type}: ${step.title}`;
}

