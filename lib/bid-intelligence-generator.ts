
/**
 * Bid Intelligence Generator
 * 
 * Generates AI-powered insights for bid proposals including:
 * - Competitive Intelligence
 * - Win Probability Score
 * - Risk Assessment
 * - Outreach Recommendations
 */

import { BidProposalData, CompetitiveIntelligence, WinProbabilityFactors, RiskAssessment, OutreachRecommendations } from './bid-proposal-types';

// Use the same API endpoint as bid-ai-generator.ts for consistency
const ABACUS_AI_ENDPOINT = 'https://apps.abacus.ai/v1/chat/completions';
const ABACUS_AI_KEY = process.env.ABACUSAI_API_KEY || '';
const AI_REQUEST_TIMEOUT = 30000; // 30 seconds timeout
const MAX_RETRIES = 3; // Maximum retry attempts
const INITIAL_RETRY_DELAY = 1000; // Initial delay before retry (1 second)

/**
 * Fetch with timeout to prevent hanging requests
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = AI_REQUEST_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - AI API took too long to respond');
    }
    throw error;
  }
}

/**
 * Retry wrapper with exponential backoff
 * Ensures we get complete results instead of placeholders
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  retryDelay: number = INITIAL_RETRY_DELAY
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}/${maxRetries + 1} for intelligence generation...`);
      const result = await fn();
      console.log(`✓ Success on attempt ${attempt + 1}`);
      return result;
    } catch (error: any) {
      lastError = error;
      console.warn(`Attempt ${attempt + 1} failed:`, error.message);
      
      // Don't wait after the last attempt
      if (attempt < maxRetries) {
        const delayMs = retryDelay * Math.pow(2, attempt); // Exponential backoff
        console.log(`Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  // All retries exhausted
  console.error(`All ${maxRetries + 1} attempts failed for intelligence generation`);
  throw lastError || new Error('All retry attempts failed');
}

/**
 * Generate competitive intelligence analysis (internal implementation)
 */
async function _generateCompetitiveIntelligence(
  bidProposal: BidProposalData
): Promise<CompetitiveIntelligence> {
  const prompt = `You are a competitive intelligence analyst specializing in government and commercial bids.

Analyze this bid proposal and provide competitive intelligence:

TITLE: ${bidProposal.title}
ISSUING ORG: ${bidProposal.issuingOrg || 'Unknown'}
TYPE: ${bidProposal.solicitationType || 'Unknown'}
DESCRIPTION: ${bidProposal.description || 'Not provided'}
LOCATION: ${bidProposal.location || 'Unknown'}
PROPOSED PRICE: ${bidProposal.proposedPrice ? `$${bidProposal.proposedPrice.toLocaleString()}` : 'Not set'}

Provide a competitive intelligence analysis in this EXACT JSON format:
{
  "strengths": ["List 3-5 key strengths we have for this bid"],
  "opportunities": ["List 3-5 opportunities to capitalize on"],
  "differentiators": ["List 3-5 unique differentiators that set us apart"],
  "recommendations": ["List 3-5 strategic recommendations to increase win probability"]
}

Focus on actionable insights. Be specific and strategic.`;

  const response = await fetchWithTimeout(ABACUS_AI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ABACUS_AI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert competitive intelligence analyst. Always respond with valid JSON only, no additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content.trim();
  
  // Parse JSON response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON response from AI');
  }
  
  return JSON.parse(jsonMatch[0]);
}

/**
 * Generate competitive intelligence analysis with automatic retry
 */
export async function generateCompetitiveIntelligence(
  bidProposal: BidProposalData
): Promise<CompetitiveIntelligence> {
  return retryWithBackoff(() => _generateCompetitiveIntelligence(bidProposal));
}

/**
 * Calculate win probability and contributing factors (internal implementation)
 */
async function _calculateWinProbability(
  bidProposal: BidProposalData
): Promise<WinProbabilityFactors> {
  const daysUntilClosing = bidProposal.closingDate
    ? Math.ceil((new Date(bidProposal.closingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const prompt = `You are a bid success prediction analyst with expertise in government and commercial contracts.

Analyze this bid and calculate the win probability:

TITLE: ${bidProposal.title}
ISSUING ORG: ${bidProposal.issuingOrg || 'Unknown'}
TYPE: ${bidProposal.solicitationType || 'Unknown'}
DESCRIPTION: ${bidProposal.description || 'Not provided'}
DAYS UNTIL CLOSING: ${daysUntilClosing !== null ? daysUntilClosing : 'Unknown'}
PROPOSED PRICE: ${bidProposal.proposedPrice ? `$${bidProposal.proposedPrice.toLocaleString()}` : 'Not set'}
WORKFLOW STAGE: ${bidProposal.workflowStage || 'initial'}
HAS TECHNICAL PROPOSAL: ${bidProposal.envelope1Content ? 'Yes' : 'No'}
HAS COST PROPOSAL: ${bidProposal.envelope2Content ? 'Yes' : 'No'}

Provide a win probability analysis in this EXACT JSON format:
{
  "score": <number between 0-100>,
  "factors": [
    {
      "name": "<factor name>",
      "impact": "<positive|negative|neutral>",
      "weight": <number 1-10>,
      "description": "<brief explanation>"
    }
  ],
  "summary": "<2-3 sentence summary of overall assessment>"
}

Consider factors like: timeline readiness, pricing competitiveness, proposal completeness, organizational fit, and technical complexity.`;

  const response = await fetchWithTimeout(ABACUS_AI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ABACUS_AI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert bid success analyst. Always respond with valid JSON only, no additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 1200,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content.trim();
  
  // Parse JSON response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON response from AI');
  }
  
  return JSON.parse(jsonMatch[0]);
}

/**
 * Calculate win probability and contributing factors with automatic retry
 */
export async function calculateWinProbability(
  bidProposal: BidProposalData
): Promise<WinProbabilityFactors> {
  return retryWithBackoff(() => _calculateWinProbability(bidProposal));
}

/**
 * Generate risk assessment with mitigation strategies (internal implementation)
 */
async function _generateRiskAssessment(
  bidProposal: BidProposalData
): Promise<RiskAssessment> {
  const daysUntilClosing = bidProposal.closingDate
    ? Math.ceil((new Date(bidProposal.closingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const prompt = `You are a risk management specialist for bid proposals.

Analyze this bid for potential risks:

TITLE: ${bidProposal.title}
ISSUING ORG: ${bidProposal.issuingOrg || 'Unknown'}
TYPE: ${bidProposal.solicitationType || 'Unknown'}
DESCRIPTION: ${bidProposal.description || 'Not provided'}
DAYS UNTIL CLOSING: ${daysUntilClosing !== null ? daysUntilClosing : 'Unknown'}
PROPOSED PRICE: ${bidProposal.proposedPrice ? `$${bidProposal.proposedPrice.toLocaleString()}` : 'Not set'}
LOCATION: ${bidProposal.location || 'Unknown'}

Provide a comprehensive risk assessment in this EXACT JSON format:
{
  "risks": [
    {
      "id": "<unique-id>",
      "category": "<timeline|budget|technical|competitive|compliance>",
      "severity": "<low|medium|high|critical>",
      "title": "<risk title>",
      "description": "<detailed description>",
      "mitigation": "<specific mitigation strategy>",
      "probability": <number 0-100>
    }
  ],
  "overallRiskLevel": "<low|medium|high>"
}

Identify 4-6 key risks across different categories with practical mitigation strategies.`;

  const response = await fetchWithTimeout(ABACUS_AI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ABACUS_AI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert risk management analyst. Always respond with valid JSON only, no additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 1800,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content.trim();
  
  // Parse JSON response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON response from AI');
  }
  
  return JSON.parse(jsonMatch[0]);
}

/**
 * Generate risk assessment with mitigation strategies and automatic retry
 */
export async function generateRiskAssessment(
  bidProposal: BidProposalData
): Promise<RiskAssessment> {
  return retryWithBackoff(() => _generateRiskAssessment(bidProposal));
}

/**
 * Generate strategic outreach recommendations
 */
export async function generateOutreachRecommendations(
  bidProposal: BidProposalData
): Promise<OutreachRecommendations> {
  const daysUntilClosing = bidProposal.closingDate
    ? Math.ceil((new Date(bidProposal.closingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const prompt = `You are a strategic outreach advisor specializing in government and commercial procurement.

Develop outreach recommendations for this bid:

TITLE: ${bidProposal.title}
ISSUING ORG: ${bidProposal.issuingOrg || 'Unknown'}
TYPE: ${bidProposal.solicitationType || 'Unknown'}
CONTACT NAME: ${bidProposal.contactName || 'Unknown'}
CONTACT EMAIL: ${bidProposal.contactEmail || 'Unknown'}
DAYS UNTIL CLOSING: ${daysUntilClosing !== null ? daysUntilClosing : 'Unknown'}

Provide strategic outreach guidance in this EXACT JSON format:
{
  "timing": {
    "bestDays": ["List best days for contact"],
    "bestTimes": ["List optimal time windows"],
    "frequencyGuidance": "<guidance on contact frequency>"
  },
  "messaging": {
    "keyPoints": ["List 3-5 key points to emphasize"],
    "tone": "<recommended communication tone>",
    "approach": "<recommended approach strategy>"
  },
  "followUp": {
    "schedule": [
      {"when": "<timing>", "purpose": "<purpose>"}
    ],
    "templates": [
      {"name": "<template name>", "content": "<brief template>"}
    ]
  },
  "strategicTips": ["List 4-6 strategic tips for engagement"]
}

Be specific and practical with actionable guidance.`;

  try {
    const response = await fetchWithTimeout(ABACUS_AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACUS_AI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert strategic outreach advisor. Always respond with valid JSON only, no additional text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating outreach recommendations:', error);
    // Return default recommendations
    return {
      timing: {
        bestDays: ['Tuesday', 'Wednesday', 'Thursday'],
        bestTimes: ['9:00-11:00 AM', '2:00-4:00 PM'],
        frequencyGuidance: 'Contact once per week leading up to question deadline, then increase to twice per week as submission deadline approaches.',
      },
      messaging: {
        keyPoints: [
          'Emphasize relevant past performance and expertise',
          'Highlight unique technical capabilities',
          'Demonstrate understanding of requirements',
          'Show commitment to quality and timeline',
          'Build relationship and establish trust',
        ],
        tone: 'Professional, confident, and solution-oriented',
        approach: 'Consultative approach focusing on value and partnership rather than just pricing',
      },
      followUp: {
        schedule: [
          { when: 'Initial contact within 48 hours', purpose: 'Introduce capabilities and express interest' },
          { when: 'Before question deadline', purpose: 'Ask clarifying questions about requirements' },
          { when: 'Mid-point to deadline', purpose: 'Share preliminary thoughts and confirm understanding' },
          { when: 'One week before closing', purpose: 'Confirm submission plans and final details' },
        ],
        templates: [
          {
            name: 'Initial Introduction',
            content: 'Subject: Re: [Solicitation Number] - Our Interest and Capabilities\n\nDear [Contact Name],\n\nWe are writing to express our strong interest in [Bid Title]. Our team has extensive experience in [relevant area] and we believe we can deliver exceptional value. We would welcome the opportunity to discuss your requirements in more detail.\n\nBest regards,\n[Your Name]',
          },
        ],
      },
      strategicTips: [
        'Research the issuing organization\'s past awards and priorities',
        'Attend any pre-bid conferences or site visits',
        'Ask thoughtful questions that demonstrate expertise',
        'Follow up on all communications promptly',
        'Build relationships beyond just the procurement contact',
        'Document all interactions for future reference',
      ],
    };
  }
}

/**
 * Generate all intelligence insights at once
 */
export async function generateAllIntelligence(
  bidProposal: BidProposalData
): Promise<{
  competitiveIntelligence: CompetitiveIntelligence;
  winProbability: WinProbabilityFactors;
  riskAssessment: RiskAssessment;
  outreachRecommendations: OutreachRecommendations;
}> {
  // Generate all insights in parallel for efficiency
  const [competitiveIntelligence, winProbability, riskAssessment, outreachRecommendations] = await Promise.all([
    generateCompetitiveIntelligence(bidProposal),
    calculateWinProbability(bidProposal),
    generateRiskAssessment(bidProposal),
    generateOutreachRecommendations(bidProposal),
  ]);

  return {
    competitiveIntelligence,
    winProbability,
    riskAssessment,
    outreachRecommendations,
  };
}
