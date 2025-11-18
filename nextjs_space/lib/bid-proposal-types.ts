
// Types for Bid Proposal System

export interface BidDocument {
  id: string;
  name: string;
  url: string; // S3 URL or cloud storage path
  size: number;
  type: string; // MIME type
  uploadedAt: Date | string;
}

export interface BidProposalData {
  id: string;
  proposalId?: string | null;
  bidSource: string;
  solicitationNumber: string;
  referenceNumber?: string | null;
  bidUrl?: string | null;
  title: string;
  description?: string | null;
  issuingOrg?: string | null;
  solicitationType?: string | null;
  location?: string | null;
  publicationDate?: Date | string | null;
  bidIntentDeadline?: Date | string | null;
  questionDeadline?: Date | string | null;
  closingDate?: Date | string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  bidDocuments?: BidDocument[];
  envelope1Status: EnvelopeStatus;
  envelope1Content?: string | null;
  envelope1Documents?: BidDocument[];
  envelope1Notes?: string | null;
  envelope1GeneratedAt?: Date | string | null;
  envelope1GenerationPrompt?: string | null;
  envelope2Status: EnvelopeStatus;
  envelope2Content?: string | null;
  envelope2Pricing?: PricingStructure;
  envelope2Documents?: BidDocument[];
  envelope2Notes?: string | null;
  envelope2GeneratedAt?: Date | string | null;
  envelope2GenerationPrompt?: string | null;
  submissionStatus: SubmissionStatus;
  envelope1SubmittedAt?: Date | string | null;
  envelope2SubmittedAt?: Date | string | null;
  fullySubmittedAt?: Date | string | null;
  baseEmailProposal?: string | null;
  selectedServices?: string[];
  aiModel?: string | null;
  generationMetadata?: any;
  proposedPrice?: number | null;
  priceSource?: string | null;
  pricingNotes?: string | null;
  workflowStage?: string;
  nextSteps?: string | null;
  suggestedFollowUp?: string | null;
  competitiveIntelligence?: string | null;
  winProbabilityScore?: number | null;
  winProbabilityFactors?: string | null;
  riskAssessment?: string | null;
  outreachRecommendations?: string | null;
  intelligenceGeneratedAt?: Date | string | null;
  adoptedBudgetData?: AdoptedBudgetData | null;
  adoptedBudgetAnalyzedAt?: Date | string | null;
  processingStatus?: ProcessingStatus;
  processingStage?: ProcessingStage | null;
  processingProgress?: number;
  processingMessage?: string | null;
  processingError?: string | null;
  processingStartedAt?: Date | string | null;
  processingCompletedAt?: Date | string | null;
  
  // Phase 1 Enhancements
  generalProposalComment?: string | null;
  
  // HUB/Subcontracting Plan Logic
  hubPlanRequired?: boolean;
  hubFeeThreshold?: number | null;
  hubIntentWaiverGenerated?: boolean;
  hubIntentWaiverContent?: string | null;
  
  // Business Listing Verification
  businessListings?: BusinessListing[] | null;
  businessVerificationStatus?: BusinessVerificationStatus;
  businessVerificationResults?: BusinessVerificationResult[] | null;
  businessVerificationNote?: string | null;
  
  // Title and Cover Page Management
  proposalTitle?: string | null;
  coverPageContent?: string | null;
  
  createdById: string;
  lastEditedById?: string | null;
  lastEditedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Business Listing Types
export interface BusinessListing {
  id: string;
  businessName: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  certifications?: string[];
  role: 'subcontractor' | 'helper' | 'partner' | 'consultant';
  proposedScope?: string | null;
  estimatedValue?: number | null;
}

export interface BusinessVerificationResult {
  businessId: string;
  businessName: string;
  exists: boolean;
  status?: 'active' | 'inactive' | 'suspended' | 'unknown';
  verificationDate: string;
  verificationSource?: string;
  notes?: string;
  requiresPartnershipConfirmation?: boolean;
}

export type BusinessVerificationStatus = 'not_verified' | 'verifying' | 'verified' | 'failed';

// Processing Status Types
export type ProcessingStatus = 'idle' | 'extracting' | 'generating' | 'completed' | 'error';

export type ProcessingStage = 
  | 'uploading_files'
  | 'extracting_pdf'
  | 'extracting_email'
  | 'analyzing_content'
  | 'detecting_client_type'
  | 'researching_budget'
  | 'generating_proposal'
  | 'generating_intelligence'
  | 'finalizing';

export interface ProcessingStatusInfo {
  status: ProcessingStatus;
  stage: ProcessingStage | null;
  progress: number;
  message: string | null;
  error: string | null;
  startedAt: Date | string | null;
  completedAt: Date | string | null;
}

// Adopted Budget Data for Government/Enterprise Clients
export interface AdoptedBudgetData {
  clientType: 'government' | 'enterprise' | 'commercial';
  totalAnnualBudget?: number | null;
  relevantDepartmentBudget?: number | null;
  capitalProgramBudget?: number | null;
  fiscalYear: string;
  budgetSource?: string | null; // URL or document reference
  fundingPriorities?: string[];
  budgetAlignment?: string | null; // AI analysis of alignment
  proportionalityAnalysis?: string | null; // How our price compares to their budget
  strategicAlignment?: string | null; // How project aligns with their priorities
}

// Intelligence Types
export interface CompetitiveIntelligence {
  strengths: string[];
  opportunities: string[];
  differentiators: string[];
  recommendations: string[];
}

export interface WinProbabilityFactors {
  score: number; // 0-100
  factors: {
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
    description: string;
  }[];
  summary: string;
}

export interface RiskAssessment {
  risks: {
    id: string;
    category: 'timeline' | 'budget' | 'technical' | 'competitive' | 'compliance';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    mitigation: string;
    probability: number; // 0-100
  }[];
  overallRiskLevel: 'low' | 'medium' | 'high';
}

export interface OutreachRecommendations {
  timing: {
    bestDays: string[];
    bestTimes: string[];
    frequencyGuidance: string;
  };
  messaging: {
    keyPoints: string[];
    tone: string;
    approach: string;
  };
  followUp: {
    schedule: { when: string; purpose: string; }[];
    templates: { name: string; content: string; }[];
  };
  strategicTips: string[];
}

export type EnvelopeStatus = 'draft' | 'in_progress' | 'completed' | 'submitted';
export type SubmissionStatus = 'not_submitted' | 'envelope1_submitted' | 'envelope2_submitted' | 'fully_submitted';

export interface PricingStructure {
  totalBidPrice: number;
  breakdown?: PricingBreakdownItem[];
  taxes?: number;
  notes?: string;
}

export interface PricingBreakdownItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category?: string;
}

export interface BidProposalFormData {
  solicitationNumber: string;
  referenceNumber?: string;
  bidUrl?: string;
  title: string;
  description?: string;
  issuingOrg?: string;
  solicitationType?: string;
  location?: string;
  publicationDate?: string;
  bidIntentDeadline?: string;
  questionDeadline?: string;
  closingDate?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  bidSource?: string;
}

export interface AIGenerationRequest {
  bidProposalId: string;
  envelopeType: 1 | 2; // 1 = Technical, 2 = Cost
  context: {
    bidDetails: BidProposalData;
    bidDocumentsContent?: string; // Extracted text from bid documents
    selectedServices?: string[]; // CDM Suite services to include
    baseEmailProposal?: string; // Previous email proposal as reference
    customInstructions?: string; // User's custom generation instructions
  };
}

export interface AIGenerationResponse {
  success: boolean;
  content?: string;
  pricing?: {
    proposedPrice: number;
    priceSource: 'extracted' | 'market_research' | 'manual';
    pricingNotes?: string;
    complexity?: 'low' | 'medium' | 'high';
    priceRange?: { min: number; max: number };
  };
  adoptedBudgetData?: AdoptedBudgetData | null;
  metadata?: {
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    generatedAt: string;
  };
  error?: string;
}

// Helper functions
export function generateBidProposalNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `BID-${year}-${random}`;
}

export function getEnvelopeStatusBadge(status: EnvelopeStatus): {
  label: string;
  className: string;
} {
  const badges = {
    draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
    in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Completed', className: 'bg-green-100 text-green-700' },
    submitted: { label: 'Submitted', className: 'bg-purple-100 text-purple-700' },
  };
  return badges[status];
}

export function getSubmissionStatusBadge(status: SubmissionStatus): {
  label: string;
  className: string;
} {
  const badges = {
    not_submitted: { label: 'Not Submitted', className: 'bg-gray-100 text-gray-700' },
    envelope1_submitted: { label: 'Tech Proposal Submitted', className: 'bg-blue-100 text-blue-700' },
    envelope2_submitted: { label: 'Cost Proposal Submitted', className: 'bg-blue-100 text-blue-700' },
    fully_submitted: { label: 'Fully Submitted', className: 'bg-green-100 text-green-700' },
  };
  return badges[status];
}
