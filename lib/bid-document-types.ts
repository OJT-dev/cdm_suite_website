
/**
 * Bid Document Type Definitions
 * Defines all available document types and their properties
 */

export interface DocumentTypeDefinition {
  type: string;
  title: string;
  description: string;
  category: 'required' | 'optional' | 'custom';
  order: number;
  icon: string;
}

export const DOCUMENT_TYPES: Record<string, DocumentTypeDefinition> = {
  technical: {
    type: 'technical',
    title: 'Technical Proposal',
    description: 'Comprehensive technical approach and methodology',
    category: 'required',
    order: 1,
    icon: 'FileText',
  },
  cost: {
    type: 'cost',
    title: 'Cost Proposal',
    description: 'Detailed pricing breakdown and budget justification',
    category: 'required',
    order: 2,
    icon: 'DollarSign',
  },
  hub_subcontracting: {
    type: 'hub_subcontracting',
    title: 'HUB Subcontracting Plan',
    description: 'Historically Underutilized Business subcontracting plan',
    category: 'optional',
    order: 3,
    icon: 'Users',
  },
  past_performance: {
    type: 'past_performance',
    title: 'Past Performance',
    description: 'Relevant project experience and references',
    category: 'optional',
    order: 4,
    icon: 'Award',
  },
  organizational_chart: {
    type: 'organizational_chart',
    title: 'Organizational Chart',
    description: 'Project team structure and key personnel',
    category: 'optional',
    order: 5,
    icon: 'Sitemap',
  },
  quality_assurance: {
    type: 'quality_assurance',
    title: 'Quality Assurance Plan',
    description: 'QA/QC procedures and quality management approach',
    category: 'optional',
    order: 6,
    icon: 'CheckCircle',
  },
  safety_plan: {
    type: 'safety_plan',
    title: 'Safety Plan',
    description: 'Safety procedures and risk mitigation strategies',
    category: 'optional',
    order: 7,
    icon: 'Shield',
  },
  schedule: {
    type: 'schedule',
    title: 'Project Schedule',
    description: 'Timeline, milestones, and deliverables',
    category: 'optional',
    order: 8,
    icon: 'Calendar',
  },
  references: {
    type: 'references',
    title: 'References',
    description: 'Client references and contact information',
    category: 'optional',
    order: 9,
    icon: 'Phone',
  },
  certifications: {
    type: 'certifications',
    title: 'Certifications & Licenses',
    description: 'Company certifications, licenses, and qualifications',
    category: 'optional',
    order: 10,
    icon: 'Certificate',
  },
};

export const getDocumentType = (type: string): DocumentTypeDefinition | undefined => {
  return DOCUMENT_TYPES[type];
};

export const getRequiredDocuments = (): DocumentTypeDefinition[] => {
  return Object.values(DOCUMENT_TYPES)
    .filter(doc => doc.category === 'required')
    .sort((a, b) => a.order - b.order);
};

export const getOptionalDocuments = (): DocumentTypeDefinition[] => {
  return Object.values(DOCUMENT_TYPES)
    .filter(doc => doc.category === 'optional')
    .sort((a, b) => a.order - b.order);
};

export const getAllDocuments = (): DocumentTypeDefinition[] => {
  return Object.values(DOCUMENT_TYPES).sort((a, b) => a.order - b.order);
};
