
// Types for proposal system

export interface ProposalItem {
  id: string;
  type: 'service' | 'custom';
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  serviceId?: string; // Reference to predefined service
}

export interface Proposal {
  id: string;
  leadId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientCompany?: string;
  proposalNumber: string;
  title: string;
  description?: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired';
  items: ProposalItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  terms?: string;
  notes?: string;
  dueDate?: Date;
  validUntil?: Date;
  stripePaymentLinkId?: string;
  stripePaymentUrl?: string;
  createdById: string;
  sentAt?: Date;
  viewedAt?: Date;
  acceptedAt?: Date;
  declinedAt?: Date;
  paidAt?: Date;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  lead?: any;
}

export interface ProposalFormData {
  leadId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientCompany?: string;
  title: string;
  description?: string;
  items: ProposalItem[];
  tax: number;
  discount: number;
  terms?: string;
  notes?: string;
  dueDate?: string;
  validUntil?: string;
}

export const DEFAULT_TERMS = `Payment Terms:
• 50% deposit required to begin work
• Remaining balance due upon project completion
• Payment accepted via credit card, bank transfer, or check
• Late payments subject to 1.5% monthly interest charge

Project Terms:
• All work is subject to our standard service agreement
• Revisions beyond the agreed scope will be billed separately
• Client to provide all required materials and content within agreed timelines
• CDM Suite retains the right to showcase completed work in portfolio

Cancellation Policy:
• Projects may be cancelled with 7 days written notice
• Deposits are non-refundable
• Work completed to date will be billed at our hourly rate

By accepting this proposal, you agree to these terms and conditions.`;

export function generateProposalNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PROP-${year}-${random}`;
}

export function calculateProposalTotals(
  items: ProposalItem[],
  tax: number = 0,
  discount: number = 0
) {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = discount;
  const taxAmount = ((subtotal - discountAmount) * tax) / 100;
  const total = subtotal - discountAmount + taxAmount;

  return {
    subtotal,
    taxAmount,
    discountAmount,
    total,
  };
}
