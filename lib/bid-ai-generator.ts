
// AI-Powered Bid Proposal Generator using Abacus AI

import { AIGenerationRequest, AIGenerationResponse, BidProposalData, AdoptedBudgetData } from './bid-proposal-types';
import { 
  CDM_SUITE_KNOWLEDGE,
  getCompanyOverview, 
  getServiceDetails, 
  getIndustryExpertise, 
  getRelevantCaseStudies,
  getMethodologyOverview,
  getTechnologyStack,
  getTeamOverview,
  getQualityAssurance,
  getSupportOptions,
  getPricingPhilosophy,
  generatePricingJustification
} from './cdm-suite-knowledge';

const ABACUS_API_KEY = process.env.ABACUSAI_API_KEY;
const ABACUS_API_URL = 'https://apps.abacus.ai/v1/chat/completions';
const AI_REQUEST_TIMEOUT = 60000; // 60 seconds timeout for generation tasks (increased from 45s)
const MAX_RETRIES = 3; // Maximum retry attempts for proposal generation
const INITIAL_RETRY_DELAY = 2000; // Initial delay before retry (2 seconds)

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
 * Retry wrapper with exponential backoff for proposal generation
 * Ensures we get complete results even under high API load
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  operationName: string,
  maxRetries: number = MAX_RETRIES,
  retryDelay: number = INITIAL_RETRY_DELAY
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[${operationName}] Attempt ${attempt + 1}/${maxRetries + 1}...`);
      const result = await fn();
      console.log(`[${operationName}] ✓ Success on attempt ${attempt + 1}`);
      return result;
    } catch (error: any) {
      lastError = error;
      console.warn(`[${operationName}] Attempt ${attempt + 1} failed:`, error.message);
      
      // Don't wait after the last attempt
      if (attempt < maxRetries) {
        const delayMs = retryDelay * Math.pow(2, attempt); // Exponential backoff: 2s, 4s, 8s
        console.log(`[${operationName}] Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  // All retries exhausted
  console.error(`[${operationName}] All ${maxRetries + 1} attempts failed`);
  throw lastError || new Error(`All retry attempts failed for ${operationName}`);
}

/**
 * Detect if the client is a government or large enterprise organization
 */
function detectClientType(bidDetails: BidProposalData): 'government' | 'enterprise' | 'commercial' {
  const issuingOrg = (bidDetails.issuingOrg || '').toLowerCase();
  const description = (bidDetails.description || '').toLowerCase();
  const title = (bidDetails.title || '').toLowerCase();
  const combined = `${issuingOrg} ${description} ${title}`;
  
  // Government indicators
  const govKeywords = [
    'city of', 'county of', 'state of', 'federal', 'government', 'municipal',
    'department of', 'agency', 'public works', 'transportation authority',
    'school district', 'university', 'college', 'public safety', 'police',
    'fire department', 'water district', 'port authority', 'transit authority'
  ];
  
  for (const keyword of govKeywords) {
    if (combined.includes(keyword)) {
      return 'government';
    }
  }
  
  // Large enterprise indicators (Fortune 1000 type companies)
  const enterpriseKeywords = [
    'corporation', 'international', 'global', 'fortune', 'inc.', 'corp.',
    'limited', 'holdings', 'group', 'enterprises'
  ];
  
  // Check for enterprise indicators and high complexity/value signals
  let enterpriseScore = 0;
  for (const keyword of enterpriseKeywords) {
    if (combined.includes(keyword)) {
      enterpriseScore++;
    }
  }
  
  // Additional enterprise signals
  if (description.length > 3000 || title.length > 200) enterpriseScore++;
  if (combined.includes('multi-year') || combined.includes('multi-million')) enterpriseScore++;
  
  if (enterpriseScore >= 2) {
    return 'enterprise';
  }
  
  return 'commercial';
}

/**
 * Fetch and analyze client's adopted budget data for government/enterprise clients
 * Looks for official budget documents, fiscal year allocations, and funding priorities
 */
async function fetchAdoptedBudgetData(
  bidDetails: BidProposalData,
  clientType: 'government' | 'enterprise' | 'commercial'
): Promise<AdoptedBudgetData | null> {
  // Only fetch budget data for government and enterprise clients
  if (clientType === 'commercial') {
    return null;
  }
  
  try {
    console.log(`[Budget Analysis] Fetching adopted budget data for ${clientType} client: ${bidDetails.issuingOrg}`);
    
    const currentYear = new Date().getFullYear();
    const fiscalYears = [currentYear.toString(), (currentYear + 1).toString(), (currentYear + 2).toString()];
    
    const prompt = `You are a financial research analyst specializing in government and enterprise budgets.

Analyze this ${clientType} client and provide budget intelligence:

CLIENT: ${bidDetails.issuingOrg || 'Unknown'}
LOCATION: ${bidDetails.location || 'Unknown'}
PROJECT TITLE: ${bidDetails.title}
PROJECT DESCRIPTION: ${bidDetails.description || 'Not provided'}
SOLICITATION TYPE: ${bidDetails.solicitationType || 'Unknown'}

Your task:
1. Research the client's official adopted budget for fiscal years ${fiscalYears.join(', ')}
2. Identify total annual budget, relevant department budgets, and capital program allocations
3. Identify key funding priorities and strategic initiatives
4. Provide budget source references (URLs or document names)

Provide budget intelligence in this EXACT JSON format:
{
  "totalAnnualBudget": <number or null if not found>,
  "relevantDepartmentBudget": <number or null if not found>,
  "capitalProgramBudget": <number or null if not found>,
  "fiscalYear": "<most recent fiscal year found>",
  "budgetSource": "<URL or document reference, or null>",
  "fundingPriorities": ["<list of 3-5 key funding priorities if found>"],
  "notes": "<2-3 sentences about budget context and strategic alignment opportunities>"
}

Guidelines:
1. For government clients: Look for Adopted Budget documents, CAFR (Comprehensive Annual Financial Reports), Capital Improvement Programs
2. For enterprise clients: Look for annual reports, SEC filings, investor relations data
3. Focus on fiscal years 2025-2027
4. If specific budget data is not available, set numeric fields to null
5. fundingPriorities should reflect actual stated priorities from budget documents
6. Be specific and factual - cite real budget line items when possible

Respond with ONLY the JSON object, no markdown formatting.`;

    const response = await retryWithBackoff(
      async () => {
        const res = await fetchWithTimeout(
          ABACUS_API_URL,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${ABACUS_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                {
                  role: 'system',
                  content: 'You are a financial research analyst with access to public budget data. Always respond with valid JSON without markdown formatting.'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.2, // Lower temperature for factual research
              max_tokens: 800
            })
          },
          AI_REQUEST_TIMEOUT
        );

        if (!res.ok) {
          throw new Error(`Budget research API error: ${res.status}`);
        }

        return res;
      },
      'Adopted Budget Research'
    );

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No budget data received');
    }

    // Parse JSON response
    const budgetData = JSON.parse(content.trim());
    const notes = budgetData.notes || '';
    
    // Construct adopted budget data
    const adoptedBudgetData: AdoptedBudgetData = {
      clientType,
      totalAnnualBudget: budgetData.totalAnnualBudget,
      relevantDepartmentBudget: budgetData.relevantDepartmentBudget,
      capitalProgramBudget: budgetData.capitalProgramBudget,
      fiscalYear: budgetData.fiscalYear || currentYear.toString(),
      budgetSource: budgetData.budgetSource,
      fundingPriorities: budgetData.fundingPriorities || [],
      budgetAlignment: notes,
      proportionalityAnalysis: null, // Will be filled in later with pricing context
      strategicAlignment: null // Will be filled in later with pricing context
    };
    
    console.log(`[Budget Analysis] ✓ Found budget data for FY ${adoptedBudgetData.fiscalYear}`);
    if (adoptedBudgetData.totalAnnualBudget) {
      console.log(`[Budget Analysis] Total annual budget: $${adoptedBudgetData.totalAnnualBudget.toLocaleString()}`);
    }
    if (adoptedBudgetData.fundingPriorities && adoptedBudgetData.fundingPriorities.length > 0) {
      console.log(`[Budget Analysis] Key priorities: ${adoptedBudgetData.fundingPriorities.slice(0, 2).join(', ')}`);
    }
    
    return adoptedBudgetData;
  } catch (error: any) {
    console.warn('[Budget Analysis] Could not fetch adopted budget data:', error.message);
    return null;
  }
}

/**
 * Analyze project complexity based on requirements
 */
function analyzeProjectComplexity(
  bidDetails: BidProposalData,
  bidDocumentsContent?: string,
  selectedServices?: string[]
): 'low' | 'medium' | 'high' {
  let complexityScore = 0;
  
  // Analyze description length and keywords
  const description = (bidDetails.description || '') + (bidDocumentsContent || '');
  const descriptionLength = description.length;
  
  // Length-based scoring
  if (descriptionLength > 5000) complexityScore += 3;
  else if (descriptionLength > 2000) complexityScore += 2;
  else complexityScore += 1;
  
  // Keyword-based scoring
  const highComplexityKeywords = ['enterprise', 'integration', 'api', 'database', 'authentication', 'complex', 'advanced', 'custom', 'scalable', 'microservices', 'migration'];
  const mediumComplexityKeywords = ['responsive', 'cms', 'e-commerce', 'payment', 'booking', 'dashboard', 'analytics', 'reporting'];
  
  highComplexityKeywords.forEach(keyword => {
    if (description.toLowerCase().includes(keyword)) complexityScore += 0.5;
  });
  
  mediumComplexityKeywords.forEach(keyword => {
    if (description.toLowerCase().includes(keyword)) complexityScore += 0.3;
  });
  
  // Service-based scoring
  if (selectedServices && selectedServices.length > 3) complexityScore += 1;
  
  // Budget indicators
  const budgetIndicators = ['million', 'large scale', 'multi-phase', 'multi-year'];
  budgetIndicators.forEach(indicator => {
    if (description.toLowerCase().includes(indicator)) complexityScore += 1;
  });
  
  // Determine complexity level
  if (complexityScore >= 6) return 'high';
  if (complexityScore >= 3) return 'medium';
  return 'low';
}

/**
 * Generate proportionality analysis comparing proposed price to client's budget
 */
function generateProportionalityAnalysis(
  proposedPrice: number,
  budgetData: AdoptedBudgetData,
  bidDetails: BidProposalData
): string {
  const analyses: string[] = [];
  
  // Calculate percentages relative to various budget levels
  if (budgetData.totalAnnualBudget && budgetData.totalAnnualBudget > 0) {
    const percentOfTotal = (proposedPrice / budgetData.totalAnnualBudget * 100).toFixed(3);
    analyses.push(`The proposed investment of $${proposedPrice.toLocaleString()} represents ${percentOfTotal}% of ${bidDetails.issuingOrg}'s total annual budget of $${budgetData.totalAnnualBudget.toLocaleString()} (FY ${budgetData.fiscalYear}). This demonstrates the project's proportional scale relative to the organization's overall financial capacity.`);
  }
  
  if (budgetData.relevantDepartmentBudget && budgetData.relevantDepartmentBudget > 0) {
    const percentOfDept = (proposedPrice / budgetData.relevantDepartmentBudget * 100).toFixed(2);
    analyses.push(`As a percentage of the relevant department budget ($${budgetData.relevantDepartmentBudget.toLocaleString()}), this investment represents ${percentOfDept}%, indicating a manageable allocation within the department's fiscal envelope.`);
  }
  
  if (budgetData.capitalProgramBudget && budgetData.capitalProgramBudget > 0) {
    const percentOfCapital = (proposedPrice / budgetData.capitalProgramBudget * 100).toFixed(2);
    analyses.push(`Within the context of the capital program budget ($${budgetData.capitalProgramBudget.toLocaleString()}), this project comprises ${percentOfCapital}% of capital allocations, aligning with typical capital project sizing for organizations of this scale.`);
  }
  
  // Add context about budget alignment
  if (analyses.length > 0) {
    analyses.push('This proportionality analysis demonstrates that our pricing is calibrated to your organization\'s financial scale and aligns with typical budget allocations for technology modernization initiatives of this scope.');
  } else {
    analyses.push('Our pricing is structured to align with your organization\'s budget planning processes and represents fair market value for the proposed scope of work.');
  }
  
  return analyses.join('\n\n');
}

/**
 * Generate strategic alignment analysis linking project to client's funding priorities
 */
function generateStrategicAlignment(
  bidDetails: BidProposalData,
  budgetData: AdoptedBudgetData
): string {
  const alignments: string[] = [];
  
  if (budgetData.fundingPriorities && budgetData.fundingPriorities.length > 0) {
    alignments.push(`${bidDetails.issuingOrg}'s FY ${budgetData.fiscalYear} Adopted Budget identifies the following strategic funding priorities:`);
    
    budgetData.fundingPriorities.forEach((priority, index) => {
      alignments.push(`${index + 1}. ${priority}`);
    });
    
    alignments.push('');
    alignments.push(`This project directly supports these organizational priorities by delivering technology capabilities that enable ${bidDetails.issuingOrg} to achieve its strategic objectives. Our solution is designed to maximize return on investment within the context of your stated funding priorities and fiscal year planning.`);
  } else {
    alignments.push(`This project aligns with ${bidDetails.issuingOrg}'s strategic objectives and fiscal year planning, delivering technology capabilities that support organizational mission and goals.`);
  }
  
  // Add budgetAlignment context if available
  if (budgetData.budgetAlignment) {
    alignments.push('');
    alignments.push(budgetData.budgetAlignment);
  }
  
  return alignments.join('\n');
}

/**
 * Calculate internal budget cap based on adopted budget data (CONFIDENTIAL)
 * This function is used ONLY for internal pricing validation and is NEVER exposed to clients
 */
function calculateInternalBudgetCap(
  budgetData: AdoptedBudgetData,
  bidDetails: BidProposalData
): number | null {
  // Determine reasonable maximum project cost based on budget context
  const potentialCaps: number[] = [];
  
  // For capital program budgets, use a percentage (typically 5-15% for single projects)
  if (budgetData.capitalProgramBudget && budgetData.capitalProgramBudget > 0) {
    // Use 10% of capital program budget as reasonable cap
    potentialCaps.push(Math.round(budgetData.capitalProgramBudget * 0.10));
  }
  
  // For department budgets, use a smaller percentage (typically 2-5%)
  if (budgetData.relevantDepartmentBudget && budgetData.relevantDepartmentBudget > 0) {
    // Use 3% of department budget as reasonable cap
    potentialCaps.push(Math.round(budgetData.relevantDepartmentBudget * 0.03));
  }
  
  // For total annual budget, use even smaller percentage (typically 0.1-1%)
  if (budgetData.totalAnnualBudget && budgetData.totalAnnualBudget > 0) {
    // Use 0.5% of total budget as reasonable cap
    potentialCaps.push(Math.round(budgetData.totalAnnualBudget * 0.005));
  }
  
  // Return the minimum of all calculated caps (most conservative approach)
  if (potentialCaps.length > 0) {
    const minCap = Math.min(...potentialCaps);
    console.log(`[Budget Cap] Calculated internal cap: $${minCap.toLocaleString()} (from ${potentialCaps.length} budget references)`);
    return minCap;
  }
  
  console.log('[Budget Cap] No budget data available for cap calculation');
  return null;
}

/**
 * Fetch locality-specific market rate data using AI
 */
async function fetchLocalityMarketRates(
  location: string,
  serviceType: string,
  complexity: 'low' | 'medium' | 'high',
  projectDescription: string
): Promise<{
  localityFactor: number;
  marketInsights: string;
  averageRate: number | null;
}> {
  try {
    console.log(`[Market Research] Fetching market rates for ${location}...`);
    
    const prompt = `You are a market research analyst specializing in technology services pricing. Research and provide current market rates for the following:

LOCATION: ${location}
SERVICE TYPE: ${serviceType}
COMPLEXITY: ${complexity}
PROJECT DESCRIPTION: ${projectDescription}

Provide market intelligence in this EXACT JSON format:
{
  "averageRate": <number or null if cannot determine>,
  "localityFactor": <number between 0.7 and 1.5>,
  "marketInsights": "<2-3 sentences about local market conditions, competition, and pricing trends for this specific location and service type>"
}

Guidelines:
1. localityFactor represents cost adjustment for this location (1.0 = baseline, 1.3 = 30% higher than baseline, 0.8 = 20% lower)
2. Consider: local cost of living, competition density, demand levels, government vs commercial rates
3. For US locations: NYC/SF/Boston typically 1.2-1.5x, smaller cities 0.8-0.9x, mid-tier cities 1.0-1.1x
4. For government projects: typically 10-20% lower than commercial due to budget constraints
5. If specific rate data available, provide averageRate, otherwise set to null
6. Base insights on current 2025 market conditions

Respond with ONLY the JSON object, no markdown formatting.`;

    const response = await retryWithBackoff(
      async () => {
        const res = await fetchWithTimeout(
          ABACUS_API_URL,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${ABACUS_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                {
                  role: 'system',
                  content: 'You are a market research analyst. Always respond with valid JSON without markdown formatting.'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.3,
              max_tokens: 500
            })
          },
          AI_REQUEST_TIMEOUT
        );

        if (!res.ok) {
          throw new Error(`Market research API error: ${res.status}`);
        }

        return res;
      },
      'Locality Market Research'
    );

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No market data received');
    }

    // Parse JSON response
    const marketData = JSON.parse(content.trim());
    
    // Validate and sanitize data
    const localityFactor = Math.max(0.7, Math.min(1.5, marketData.localityFactor || 1.0));
    const averageRate = marketData.averageRate && marketData.averageRate >= 5000 ? marketData.averageRate : null;
    const marketInsights = marketData.marketInsights || 'Market research data not available for this location.';
    
    console.log(`[Market Research] Locality factor: ${localityFactor}x`);
    if (averageRate) {
      console.log(`[Market Research] Average market rate: $${averageRate.toLocaleString()}`);
    }
    
    return {
      localityFactor,
      marketInsights,
      averageRate
    };
  } catch (error: any) {
    console.warn('[Market Research] Could not fetch locality data:', error.message);
    // Return conservative defaults on failure
    return {
      localityFactor: 1.0,
      marketInsights: 'Market research data not available. Using baseline national rates.',
      averageRate: null
    };
  }
}

/**
 * Conduct market research and calculate competitive pricing with locality-specific adjustments
 */
async function conductMarketResearch(
  bidDetails: BidProposalData,
  selectedServices?: string[],
  bidDocumentsContent?: string
): Promise<{
  proposedPrice: number;
  priceRange: { min: number; max: number };
  complexity: 'low' | 'medium' | 'high';
  justification: string;
  adoptedBudgetData?: AdoptedBudgetData | null;
}> {
  console.log('[Market Research] Analyzing project requirements...');
  
  // Analyze complexity
  const complexity = analyzeProjectComplexity(bidDetails, bidDocumentsContent, selectedServices);
  console.log(`[Market Research] Complexity level: ${complexity}`);
  
  // Detect client type and fetch adopted budget data if applicable
  const clientType = detectClientType(bidDetails);
  console.log(`[Market Research] Client type: ${clientType}`);
  
  let adoptedBudgetData: AdoptedBudgetData | null = null;
  if (clientType === 'government' || clientType === 'enterprise') {
    adoptedBudgetData = await fetchAdoptedBudgetData(bidDetails, clientType);
  }
  
  // Base pricing ranges by service type and complexity (national baseline)
  const pricingMatrix: { [key: string]: { [key in 'low' | 'medium' | 'high']: { min: number; max: number } } } = {
    'web design': {
      low: { min: 15000, max: 35000 },
      medium: { min: 35000, max: 75000 },
      high: { min: 75000, max: 150000 }
    },
    'web development': {
      low: { min: 20000, max: 45000 },
      medium: { min: 45000, max: 95000 },
      high: { min: 95000, max: 200000 }
    },
    'mobile app': {
      low: { min: 30000, max: 60000 },
      medium: { min: 60000, max: 120000 },
      high: { min: 120000, max: 200000 }
    },
    'e-commerce': {
      low: { min: 40000, max: 80000 },
      medium: { min: 80000, max: 150000 },
      high: { min: 150000, max: 250000 }
    },
    'ai solutions': {
      low: { min: 25000, max: 50000 },
      medium: { min: 50000, max: 100000 },
      high: { min: 100000, max: 200000 }
    },
    'consulting': {
      low: { min: 15000, max: 30000 },
      medium: { min: 30000, max: 70000 },
      high: { min: 70000, max: 150000 }
    },
    'marketing': {
      low: { min: 10000, max: 25000 },
      medium: { min: 25000, max: 60000 },
      high: { min: 60000, max: 120000 }
    },
    'default': {
      low: { min: 20000, max: 40000 },
      medium: { min: 40000, max: 85000 },
      high: { min: 85000, max: 175000 }
    }
  };
  
  // Determine primary service type
  let primaryService = 'default';
  if (selectedServices && selectedServices.length > 0) {
    const serviceKey = selectedServices[0].toLowerCase();
    for (const key in pricingMatrix) {
      if (serviceKey.includes(key) || key.includes(serviceKey)) {
        primaryService = key;
        break;
      }
    }
  }
  
  // Get base price range for this service and complexity
  const basePriceRange = pricingMatrix[primaryService][complexity];
  
  // Fetch locality-specific market data
  const location = bidDetails.location || 'United States';
  const projectDescription = bidDetails.description || bidDetails.title || '';
  const marketData = await fetchLocalityMarketRates(
    location,
    primaryService,
    complexity,
    projectDescription
  );
  
  // Apply locality factor to price range
  const adjustedMin = Math.round(basePriceRange.min * marketData.localityFactor);
  const adjustedMax = Math.round(basePriceRange.max * marketData.localityFactor);
  const priceRange = { min: adjustedMin, max: adjustedMax };
  
  // Calculate proposed price
  let proposedPrice: number;
  
  if (marketData.averageRate) {
    // If we have specific market rate data, use it as primary reference
    console.log(`[Market Research] Using market average rate: $${marketData.averageRate.toLocaleString()}`);
    proposedPrice = Math.round(marketData.averageRate * 1.05); // 5% above market average for our expertise
    
    // Ensure proposed price is within adjusted range
    proposedPrice = Math.max(adjustedMin, Math.min(adjustedMax, proposedPrice));
  } else {
    // Use midpoint with locality adjustment
    const midPoint = (adjustedMin + adjustedMax) / 2;
    proposedPrice = Math.round(midPoint * 1.08); // 8% above midpoint
  }
  
  // Estimate timeline
  const timelineEstimates = {
    low: '4-8 weeks',
    medium: '8-16 weeks',
    high: '16-24 weeks'
  };
  const timeline = timelineEstimates[complexity];
  
  // Generate enhanced justification with market insights
  const projectScope = bidDetails.description || 'Based on the requirements outlined';
  const baseJustification = generatePricingJustification(proposedPrice, projectScope, complexity, timeline);
  
  // Apply budget cap internally for government/enterprise clients (CONFIDENTIAL - NOT included in proposal)
  let budgetAdjustedPrice = proposedPrice;
  if (adoptedBudgetData) {
    // Internal validation: ensure proposed price doesn't exceed reasonable budget limits
    const budgetCap = calculateInternalBudgetCap(adoptedBudgetData, bidDetails);
    
    if (budgetCap && proposedPrice > budgetCap) {
      console.log(`[Budget Validation] Adjusting price from $${proposedPrice.toLocaleString()} to fit within budget constraints: $${budgetCap.toLocaleString()}`);
      budgetAdjustedPrice = budgetCap;
    } else {
      console.log(`[Budget Validation] ✓ Proposed price $${proposedPrice.toLocaleString()} is within budget constraints`);
    }
    
    // Fill in internal analysis (for database storage only, NOT for proposal output)
    const proportionalityAnalysis = generateProportionalityAnalysis(
      budgetAdjustedPrice,
      adoptedBudgetData,
      bidDetails
    );
    const strategicAlignment = generateStrategicAlignment(
      bidDetails,
      adoptedBudgetData
    );
    
    adoptedBudgetData.proportionalityAnalysis = proportionalityAnalysis;
    adoptedBudgetData.strategicAlignment = strategicAlignment;
  }
  
  // Update proposed price after budget validation
  proposedPrice = budgetAdjustedPrice;
  
  // Build client-facing justification (NO BUDGET DATA - CONFIDENTIAL)
  let enhancedJustification = `${baseJustification}

**Market Research & Locality Analysis**

Location: ${location}
${marketData.marketInsights}

${marketData.averageRate ? `Current market average for similar projects in this location: $${marketData.averageRate.toLocaleString()}` : 'Market research indicates local cost adjustment factor applied.'}

Our proposed price of $${proposedPrice.toLocaleString()} is positioned competitively within the ${location} market for ${primaryService} projects of ${complexity} complexity, reflecting both current market rates and the value of our proven track record.`;

  // Add prudent budget management language for government/enterprise clients (NO SPECIFIC FIGURES)
  if (adoptedBudgetData && clientType === 'government') {
    enhancedJustification += `

**Budgetary Prudence & Project Controls**

CDM Suite LLC's pricing reflects a commitment to fiscal responsibility and budget adherence. Our cost analysis incorporates:

• **Internal Cost Controls**: Rigorous cost analysis and earned value methodologies ensure pricing aligns with typical funding constraints for projects of this nature
• **Budget Optimization**: Strategic resource allocation to deliver maximum value within prudent budget parameters
• **Fiscal Year Alignment**: Project planning and payment schedules designed to align with standard fiscal year requirements
• **Project Controls Framework**: Proven methodologies from infrastructure program management ensuring cost discipline throughout execution

This pricing approach reflects our deep understanding of public sector budgetary processes and our commitment to delivering exceptional value while maintaining strict fiscal accountability. Our project controls guarantee that all work will be managed using proven cost management techniques, providing confidence that the investment will be delivered on-time and within the committed budget envelope.`;
  } else if (adoptedBudgetData && clientType === 'enterprise') {
    enhancedJustification += `

**Financial Discipline & Value Delivery**

CDM Suite LLC's pricing is developed through rigorous internal cost analysis and strategic budget planning:

• **Cost Optimization**: Our pricing reflects comprehensive cost modeling to ensure optimal resource allocation
• **Budget Adherence**: Commitment to delivering within agreed-upon budget parameters using proven project controls
• **Value Engineering**: Strategic approach to maximizing ROI while maintaining fiscal discipline
• **Financial Transparency**: Clear milestone-based payment schedules aligned with deliverable completion

This approach ensures that our pricing delivers maximum strategic value while respecting typical funding constraints for enterprise technology initiatives of this scope and complexity.`;
  }
  
  console.log(`[Market Research] Proposed price: $${proposedPrice.toLocaleString()}`);
  console.log(`[Market Research] Locality-adjusted range: $${priceRange.min.toLocaleString()} - $${priceRange.max.toLocaleString()}`);
  console.log(`[Market Research] Locality factor: ${marketData.localityFactor}x`);
  if (adoptedBudgetData) {
    console.log(`[Market Research] ✓ Budgetary alignment analysis included for ${clientType} client`);
  }
  
  return {
    proposedPrice,
    priceRange,
    complexity,
    justification: enhancedJustification,
    adoptedBudgetData
  };
}

/**
 * Extract pricing from generated cost proposal content with comprehensive pattern matching
 */
function extractPricingFromContent(content: string): number | null {
  console.log('[Price Extraction] Analyzing generated content...');
  console.log('[Price Extraction] Content preview:', content.substring(0, 500));
  
  // Look for total project cost patterns (comprehensive list)
  const patterns = [
    /\*\*Total\s+Project\s+Cost\*\*[:\s]*\$?([\d,]+)/i,
    /Total\s+Project\s+Cost[:\s]*\$?([\d,]+)/i,
    /\*\*Total\s+Investment\*\*[:\s]*\$?([\d,]+)/i,
    /Total\s+Investment[:\s]*\$?([\d,]+)/i,
    /\*\*Grand\s+Total\*\*[:\s]*\$?([\d,]+)/i,
    /Grand\s+Total[:\s]*\$?([\d,]+)/i,
    /\*\*Total\s+Cost\*\*[:\s]*\$?([\d,]+)/i,
    /Total\s+Cost[:\s]*\$?([\d,]+)/i,
    /\*\*Total\*\*[:\s]*\$?([\d,]+)/i,
    /Total[:\s]+\$?([\d,]+)/i,
    /\|\s*\*\*Total[^|]*\|\s*\*\*\$?([\d,]+)\*\*/i, // Table total row
    /\|\s*Total[^|]*\|\s*\$?([\d,]+)/i, // Table total row without bold
    /^Total[:\s]*\$?([\d,]+)/im, // Line starting with Total
    /Investment[:\s]+\$?([\d,]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      const priceStr = match[1].replace(/,/g, '');
      const price = parseInt(priceStr, 10);
      
      console.log(`[Price Extraction] Pattern matched: ${pattern}, extracted: ${priceStr}, parsed: ${price}`);
      
      // Validate price is reasonable (between $5K and $5M)
      if (price >= 5000 && price <= 5000000) {
        console.log(`[Price Extraction] ✓ Found valid price: $${price.toLocaleString()}`);
        return price;
      } else {
        console.log(`[Price Extraction] ✗ Price ${price} outside valid range (5K-5M)`);
      }
    }
  }
  
  console.log('[Price Extraction] No valid price found in content');
  console.log('[Price Extraction] Full content:', content);
  return null;
}

/**
 * Export market research function for direct use
 */
export { conductMarketResearch };

export async function generateTechnicalProposal(request: AIGenerationRequest): Promise<AIGenerationResponse> {
  try {
    const { bidDetails, bidDocumentsContent, selectedServices, baseEmailProposal, customInstructions } = request.context;

    const prompt = buildTechnicalProposalPrompt(bidDetails, bidDocumentsContent, selectedServices, baseEmailProposal, customInstructions);

    const response = await fetchWithTimeout(ABACUS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACUS_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert proposal writer specializing in government and corporate RFPs for CDM Suite LLC. 

CRITICAL RULE #1 - USE ONLY PROVIDED CDM SUITE INFORMATION:
You MUST EXCLUSIVELY use information from the CDM Suite knowledge base sections provided in the prompt. Every single detail about company capabilities, experience, technology, team qualifications, and methodologies MUST come directly from the sections titled:
- "Company Information"
- "Relevant Services & Expertise" 
- "Relevant Case Studies & Success Stories"
- "Our Team & Qualifications"
- "Methodology Overview"
- "Technology Stack"
- "Quality Assurance & Security"

DO NOT:
- Invent capabilities, technologies, or experience not listed in the provided sections
- Use generic phrases like "our experienced team" without citing specific qualifications from the knowledge base
- Create fictional metrics, testimonials, or case study results
- Add technologies not explicitly listed in the "Technology Stack" section
- Reference certifications or credentials not mentioned in the provided information

EVERY claim you make must be traceable to the provided knowledge base. If CDM Suite doesn't offer a specific service or use a specific technology according to the provided info, DO NOT include it.

CRITICAL RULE #2 - NO INVENTED PERSONNEL:
NEVER create or mention individual team member names (NO "John Carter", "Sarah Lopez", "Michael Tan", etc.). When describing Team Qualifications & Experience, reference ONLY the verifiable leadership background provided (infrastructure programs, Primavera certification, project controls, etc.) WITHOUT naming individuals. Use collective language like "our leadership team", "our certified professionals", "our project managers".

CRITICAL RULE #3 - SPECIFIC OVER GENERIC:
Replace ALL generic statements with specific CDM Suite details:
- Instead of "experienced team" → reference "$5.1B LaGuardia Terminal B and $4.2B JFK Terminal 6 program experience"
- Instead of "proven methodology" → reference "Critical Path Method (CPM) scheduling from multi-billion dollar infrastructure programs"  
- Instead of "modern technologies" → list exact stack: "React, Next.js, TypeScript, Tailwind CSS, Node.js, PostgreSQL, AWS"
- Instead of "successful projects" → cite "120%+ profit growth through operational efficiency" or "$368K+ in documented sales generation"

Your proposals must be professional, persuasive, and tailored to requirements while strictly adhering to CDM Suite's actual capabilities and experience.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated by AI');
    }

    return {
      success: true,
      content,
      metadata: {
        model: data.model || 'gpt-4o',
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error('Error generating technical proposal:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate technical proposal',
    };
  }
}

export async function generateCostProposal(request: AIGenerationRequest): Promise<AIGenerationResponse> {
  try {
    const { bidDetails, bidDocumentsContent, selectedServices, baseEmailProposal, customInstructions } = request.context;

    // Conduct market research and cost analysis (now includes adopted budget data for gov/enterprise clients)
    const marketResearch = await conductMarketResearch(bidDetails, selectedServices, bidDocumentsContent);
    
    const prompt = buildCostProposalPrompt(bidDetails, bidDocumentsContent, selectedServices, baseEmailProposal, customInstructions, marketResearch);

    const response = await fetchWithTimeout(ABACUS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACUS_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert pricing strategist and cost proposal writer for CDM Suite LLC.

CRITICAL RULE #1 - USE ONLY PROVIDED CDM SUITE INFORMATION:
You MUST EXCLUSIVELY use CDM Suite's actual track record and capabilities from the provided knowledge base. DO NOT invent metrics, testimonials, or value propositions. Use ONLY these verified CDM Suite credentials:
- Infrastructure experience: $5.1B LaGuardia Terminal B, $4.2B JFK Terminal 6 program management
- Operational track record: 120%+ profit growth, $250M+ in assets managed
- Sales performance: $368K+ in documented sales generation
- Technical certifications: Oracle Primavera Specialist, BIM certified
- Team leadership: 50+ professionals managed across infrastructure and operations
- Education: Airport/Airline Management, Project Management, BIM certifications

Every value statement must reference specific CDM Suite achievements from the knowledge base.

CRITICAL RULE #2 - STRICT CONFIDENTIALITY:
NEVER include or reference any client budget figures (annual budget, department budget, capital program budget, fiscal year allocations, percentages, or budget document sources). Pricing must be justified ONLY through:
- Market research data provided in the prompt
- Project complexity analysis
- CDM Suite's demonstrated expertise and value
- Industry standard rates for the service type and location

You may use general terms like "budget adherence" and "fiscal responsibility" but NEVER specific client budget data.

CRITICAL RULE #3 - TRANSPARENT VALUE JUSTIFICATION:
Clearly explain pricing based on:
- Market rates for the specific location and service type (from provided market research)
- Project complexity level (provided in prompt)
- CDM Suite's infrastructure-grade project management approach
- Specific deliverables and scope
- Support tiers with clear feature breakdowns
- ROI potential based on CDM Suite's operational efficiency track record

Your cost proposals must be detailed, transparent, and competitive while demonstrating exceptional value through CDM Suite's unique combination of infrastructure experience and digital expertise.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated by AI');
    }

    // Try to extract price from content, fallback to market research price
    const extractedPrice = extractPricingFromContent(content);
    const finalPrice = extractedPrice || marketResearch.proposedPrice;

    return {
      success: true,
      content,
      pricing: {
        proposedPrice: finalPrice,
        priceSource: extractedPrice ? 'extracted' : 'market_research',
        pricingNotes: marketResearch.justification,
        complexity: marketResearch.complexity,
        priceRange: marketResearch.priceRange
      },
      adoptedBudgetData: marketResearch.adoptedBudgetData,
      metadata: {
        model: data.model || 'gpt-4o',
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error('Error generating cost proposal:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate cost proposal',
    };
  }
}

function buildTechnicalProposalPrompt(
  bidDetails: BidProposalData,
  bidDocumentsContent?: string,
  selectedServices?: string[],
  baseEmailProposal?: string,
  customInstructions?: string
): string {
  // Extract industry from bid details
  const industry = bidDetails.issuingOrg || bidDetails.title || '';
  const services = selectedServices && selectedServices.length > 0 ? selectedServices : ['web design', 'digital marketing'];
  
  const sections = [
    `# Generate a Comprehensive Technical Proposal`,
    ``,
    `## Bid Information`,
    `- **Solicitation Number:** ${bidDetails.solicitationNumber}`,
    `- **Title:** ${bidDetails.title}`,
    `- **Issuing Organization:** ${bidDetails.issuingOrg || 'N/A'}`,
    `- **Location:** ${bidDetails.location || 'N/A'}`,
    `- **Closing Date:** ${bidDetails.closingDate ? new Date(bidDetails.closingDate).toLocaleDateString() : 'N/A'}`,
    ``,
    `## Company Information`,
    getCompanyOverview(),
    ``,
    `## Relevant Services & Expertise`,
    getServiceDetails(services),
    ``,
    getIndustryExpertise(industry),
    ``,
    `## Relevant Case Studies & Success Stories`,
    getRelevantCaseStudies(industry, services),
    ``,
    `## Our Team & Qualifications`,
    getTeamOverview(),
    ``
  ];

  // Add General Proposal Comment if provided
  if (bidDetails.generalProposalComment && bidDetails.generalProposalComment.trim()) {
    sections.push(`## IMPORTANT: General Proposal Message`);
    sections.push(`**CRITICAL:** This message MUST be prominently included in the Executive Summary or as a standalone section at the beginning of the proposal:`);
    sections.push(``);
    sections.push(bidDetails.generalProposalComment);
    sections.push(``);
  }

  if (bidDetails.description) {
    sections.push(`## Bid Description & Requirements`);
    sections.push(bidDetails.description);
    sections.push(``);
  }

  if (bidDocumentsContent) {
    sections.push(`## Additional Bid Documents Content`);
    sections.push(bidDocumentsContent);
    sections.push(``);
  }

  if (selectedServices && selectedServices.length > 0) {
    sections.push(`## Services to Emphasize`);
    sections.push(`Please highlight our expertise in: ${selectedServices.join(', ')}`);
    sections.push(``);
  }

  if (customInstructions) {
    sections.push(`## Custom Instructions`);
    sections.push(customInstructions);
    sections.push(``);
  }

  // Check if we have a substantial email proposal to organize vs creating from scratch
  const hasSubstantialEmail = baseEmailProposal && baseEmailProposal.trim().length > 200;

  if (hasSubstantialEmail) {
    sections.push(`## EXISTING PROPOSAL TO ORGANIZE`);
    sections.push(`IMPORTANT: You already sent the client the following proposal via email. Your task is to ORGANIZE and REFORMAT this existing proposal into the official structure - DO NOT create a brand new proposal from scratch.`);
    sections.push(``);
    sections.push(`Existing Email Proposal:`);
    sections.push(baseEmailProposal);
    sections.push(``);
    sections.push(`## Your Task`);
    sections.push(`**ORGANIZE the existing email proposal above** into a professional, structured technical proposal (Envelope 1) with these sections:`);
    sections.push(`1. **Executive Summary** - Extract and refine the key points from the email`);
    sections.push(`2. **Understanding of Requirements** - Organize the requirements discussion from the email`);
    sections.push(`3. **Technical Approach & Methodology** - Structure the approach described in the email`);
    sections.push(`4. **Project Timeline & Milestones** - Extract and format any timeline mentioned`);
    sections.push(`5. **Team Qualifications & Experience** - Organize team/expertise info from the email`);
    sections.push(`6. **Technology Stack & Tools** - List technologies mentioned in the email`);
    sections.push(`7. **Quality Assurance & Testing** - Extract QA processes mentioned`);
    sections.push(`8. **Risk Management** - Organize any risks/mitigation discussed`);
    sections.push(`9. **Post-Launch Support & Maintenance** - Extract support commitments`);
    sections.push(`10. **Why Choose CDM Suite** - Organize value propositions from the email`);
    sections.push(``);
    sections.push(`**CRITICAL Requirements:**`);
    sections.push(`- PRESERVE all key commitments, timelines, and deliverables from the email`);
    sections.push(`- MAINTAIN the same overall scope and approach - do NOT change the fundamental proposal`);
    sections.push(`- ORGANIZE and STRUCTURE the existing content professionally`);
    sections.push(`- ADD professional polish and formatting but keep the substance identical`);
    sections.push(`- If the email is missing a section, add brief professional content for completeness using the "Our Team & Qualifications" section above`);
    sections.push(`- NEVER INVENT individual team member names - reference only the verifiable qualifications provided (infrastructure experience, certifications, etc.)`);
    sections.push(`- Use collective language: "our team", "our leadership", "our certified professionals" (NOT individual names)`);
    sections.push(`- Use professional business writing style with clear section headings`);
    sections.push(`- NO PRICING INFORMATION (this is for the technical proposal only)`);
  } else {
    if (baseEmailProposal) {
      sections.push(`## Reference Notes`);
      sections.push(`Previous communication with client:`);
      sections.push(baseEmailProposal);
      sections.push(``);
    }
    
    sections.push(`## Methodology Overview`);
    sections.push(getMethodologyOverview());
    sections.push(``);
    sections.push(`## Technology Stack`);
    sections.push(getTechnologyStack());
    sections.push(``);
    sections.push(`## Quality Assurance & Security`);
    sections.push(getQualityAssurance());
    sections.push(``);
    
    sections.push(`## Your Task`);
    sections.push(`Generate a professional, compelling technical proposal (Envelope 1) that:`);
    sections.push(`1. **Executive Summary** - Compelling overview of our approach and qualifications, referencing specific CDM Suite strengths`);
    sections.push(`2. **Understanding of Requirements** - Demonstrate deep understanding of the project needs using specific examples from our case studies`);
    sections.push(`3. **Technical Approach & Methodology** - Detailed explanation of how we'll execute using our proven methodology (discovery, design, development, testing, launch)`);
    sections.push(`4. **Project Timeline & Milestones** - Realistic timeline with key deliverables based on project complexity`);
    sections.push(`5. **Team Qualifications & Experience** - Showcase our team expertise, certifications, and relevant case study results`);
    sections.push(`6. **Technology Stack & Tools** - Specific technologies from our stack that are relevant to this project`);
    sections.push(`7. **Quality Assurance & Testing** - Our comprehensive QA process including accessibility, security, and performance testing`);
    sections.push(`8. **Risk Management** - Potential risks and mitigation strategies based on our experience`);
    sections.push(`9. **Post-Launch Support & Maintenance** - Specific support tiers and what they include`);
    sections.push(`10. **Why Choose CDM Suite** - Unique value propositions with specific metrics (98% client satisfaction, 3.5x ROI, etc.)`);
    sections.push(``);
    sections.push(`**CRITICAL Requirements:**`);
    sections.push(`- MANDATORY: EVERY capability, technology, qualification, and achievement you mention MUST come directly from the sections above`);
    sections.push(`- PULL ACTUAL INFORMATION from the company overview, case studies, and expertise sections - DO NOT add anything not explicitly stated`);
    sections.push(`- Include SPECIFIC METRICS: "$5.1B LaGuardia Terminal B", "$4.2B JFK Terminal 6", "120%+ profit growth", "$368K+ sales", "$250M+ assets managed"`);
    sections.push(`- Reference EXACT TECHNOLOGIES from the Technology Stack section: React, Next.js, TypeScript, Tailwind CSS, Node.js, PostgreSQL, AWS - DO NOT add other tech`);
    sections.push(`- Reference SPECIFIC TEAM QUALIFICATIONS: Oracle Primavera Specialist, BIM certified, Airport/Airline Management degree, 50+ team leadership - NO INVENTED DETAILS`);
    sections.push(`- NEVER INVENT individual team member names - use collective language: "our leadership team", "our certified professionals", "our project managers"`);
    sections.push(`- NO GENERIC LANGUAGE: Replace "experienced team" with "$5.1B infrastructure program experience", "proven methodology" with "Critical Path Method (CPM) from multi-billion dollar programs"`);
    sections.push(`- Make it UNIQUE to this bid's requirements while using ONLY CDM Suite's actual capabilities from the knowledge base`);
    sections.push(`- Use professional business writing style with clear section headings and bullet points`);
    sections.push(`- Highlight measurable outcomes: "120%+ profit growth", "$368K+ sales generation", "50+ team leadership"`);
    sections.push(`- NO PRICING INFORMATION (this is for the technical proposal only)`);
    sections.push(``);
    sections.push(`**VERIFICATION CHECK BEFORE GENERATING:**`);
    sections.push(`Before you write each section, verify that every claim can be traced to the knowledge base sections above. If you cannot find a specific detail in the provided information, DO NOT include it. Use only what is explicitly stated in:`);
    sections.push(`✓ Company Information section`);
    sections.push(`✓ Relevant Services & Expertise section`);
    sections.push(`✓ Relevant Case Studies & Success Stories section`);
    sections.push(`✓ Our Team & Qualifications section`);
    sections.push(`✓ Methodology Overview section`);
    sections.push(`✓ Technology Stack section`);
    sections.push(`✓ Quality Assurance & Security section`);
  }
  
  sections.push(``);
  sections.push(`NOW generate the complete technical proposal, ensuring every detail comes directly from CDM Suite's actual capabilities and experience documented above:`);

  return sections.join('\n');
}

function buildCostProposalPrompt(
  bidDetails: BidProposalData,
  bidDocumentsContent?: string,
  selectedServices?: string[],
  baseEmailProposal?: string,
  customInstructions?: string,
  marketResearch?: {
    proposedPrice: number;
    priceRange: { min: number; max: number };
    complexity: 'low' | 'medium' | 'high';
    justification: string;
    adoptedBudgetData?: AdoptedBudgetData | null;
  }
): string {
  // Extract industry and services for context
  const industry = bidDetails.issuingOrg || bidDetails.title || '';
  const services = selectedServices && selectedServices.length > 0 ? selectedServices : ['web design', 'digital marketing'];
  
  const sections = [
    `# Generate a Comprehensive Cost Proposal`,
    ``,
    `## Bid Information`,
    `- **Solicitation Number:** ${bidDetails.solicitationNumber}`,
    `- **Title:** ${bidDetails.title}`,
    `- **Issuing Organization:** ${bidDetails.issuingOrg || 'N/A'}`,
    `- **Project Scope:** ${bidDetails.description || 'See bid documents'}`,
    ``,
    `## Company Overview & Track Record`,
    getCompanyOverview(),
    ``,
  ];

  // Add General Proposal Comment if provided
  if (bidDetails.generalProposalComment && bidDetails.generalProposalComment.trim()) {
    sections.push(`## IMPORTANT: General Proposal Message`);
    sections.push(`**CRITICAL:** This message MUST be prominently included in the Executive Summary or as a standalone section at the beginning of the proposal:`);
    sections.push(``);
    sections.push(bidDetails.generalProposalComment);
    sections.push(``);
  }

  sections.push(
    `## Market Research & Cost Analysis`,
    getPricingPhilosophy(),
    ``,
    `### Locality-Specific Market Research`,
    marketResearch ? `
**Location:** ${bidDetails.location || 'United States'}

**Project Complexity:** ${marketResearch.complexity.charAt(0).toUpperCase() + marketResearch.complexity.slice(1)}

${marketResearch.justification}

**Price Range for Similar Projects in ${bidDetails.location || 'This Market'}:** $${marketResearch.priceRange.min.toLocaleString()} - $${marketResearch.priceRange.max.toLocaleString()}

**Proposed Total Project Cost:** $${marketResearch.proposedPrice.toLocaleString()}

This pricing reflects:
- Current ${bidDetails.location || 'local'} market rates for ${marketResearch.complexity}-complexity projects
- Comprehensive competitive analysis for this specific location
- Assessment of project requirements and scope
- Our enterprise-grade quality standards (98% satisfaction, 3.5x ROI, 95% on-time delivery)
- Fair market value that is competitive yet reflects our proven expertise
` : '',
    ``,
    `## Pricing Context - Our Track Record`,
    `CDM Suite provides competitive, transparent pricing that reflects the value and expertise we bring. Our pricing is based on:`,
    `- Project complexity and scope`,
    `- Timeline and urgency`,
    `- Technology stack requirements`,
    `- Level of customization needed`,
    `- Ongoing support and maintenance`,
    ``,
    `**Our Value Proposition:**`,
    `- Average 3.5x ROI within first year`,
    `- 95% of projects delivered on-time and within budget`,
    `- 98% client satisfaction rate`,
    `- 87% client retention year-over-year`,
    ``,
    `## Support & Maintenance Options`,
    getSupportOptions(),
    ``
  );

  if (bidDocumentsContent) {
    sections.push(`## Bid Requirements`);
    sections.push(bidDocumentsContent);
    sections.push(``);
  }

  if (selectedServices && selectedServices.length > 0) {
    sections.push(`## Services Included`);
    sections.push(`Focus on pricing for: ${selectedServices.join(', ')}`);
    sections.push(``);
  }

  if (customInstructions) {
    sections.push(`## Custom Instructions`);
    sections.push(customInstructions);
    sections.push(``);
  }

  // Check if we have a substantial email proposal with pricing to organize
  const hasSubstantialEmail = baseEmailProposal && baseEmailProposal.trim().length > 200;

  if (hasSubstantialEmail) {
    sections.push(`## EXISTING PRICING PROPOSAL TO ORGANIZE`);
    sections.push(`IMPORTANT: You already sent the client the following pricing proposal via email. Your task is to ORGANIZE and REFORMAT this existing pricing into the official structure - DO NOT create brand new pricing from scratch.`);
    sections.push(``);
    sections.push(`Existing Email Pricing Proposal:`);
    sections.push(baseEmailProposal);
    sections.push(``);
    sections.push(`## Your Task`);
    sections.push(`**ORGANIZE the existing email pricing proposal above** into a professional, detailed cost proposal (Envelope 2) that includes:`);
  } else {
    if (baseEmailProposal) {
      sections.push(`## Reference Information`);
      sections.push(`Previous communication with client:`);
      sections.push(baseEmailProposal);
      sections.push(``);
    }
    
    sections.push(`## Your Task`);
    sections.push(`Generate a professional, detailed cost proposal (Envelope 2) that includes:`);
  }
  sections.push(``);
  sections.push(`1. **Executive Summary** - Brief overview of pricing approach, total cost, and value proposition (reference 3.5x average ROI)`);
  sections.push(`2. **Total Project Cost** - MUST include as a standalone section with clear format: "## Total Project Cost: $XXX,XXX" or "**Total Project Cost:** $XXX,XXX"`);
  sections.push(`3. **Detailed Pricing Breakdown** - Use a markdown table format with these columns:`);
  sections.push(`   - Phase/Deliverable`);
  sections.push(`   - Description`);
  sections.push(`   - Cost`);
  sections.push(``);
  sections.push(`   Example table format:`);
  sections.push(`   | Phase/Deliverable | Description | Cost |`);
  sections.push(`   |-------------------|-------------|------|`);
  sections.push(`   | Discovery & Planning | Requirements gathering, wireframes, project plan | $15,000 |`);
  sections.push(`   | Design & Branding | UI/UX design, brand guidelines, mockups | $25,000 |`);
  sections.push(`   | Development | Frontend and backend development, integrations | $60,000 |`);
  sections.push(`   | Testing & QA | Comprehensive testing, bug fixes, optimization | $12,000 |`);
  sections.push(`   | Training & Documentation | User training, technical documentation | $8,000 |`);
  sections.push(`   | Deployment & Launch | Production deployment, monitoring setup | $5,000 |`);
  sections.push(`   | **Total Project Cost** | | **$125,000** |`);
  sections.push(``);
  sections.push(`4. **Payment Schedule** - Milestone-based payments in table format:`);
  sections.push(`   | Milestone | Deliverables | Payment | Timeline |`);
  sections.push(`   |-----------|--------------|---------|----------|`);
  sections.push(`   | Contract Signing | Kickoff meeting, project plan | 30% | Week 1 |`);
  sections.push(`   | Design Approval | Approved designs, prototypes | 25% | Week 4 |`);
  sections.push(`   | Development Complete | Functional application | 25% | Week 10 |`);
  sections.push(`   | Launch & Final Delivery | Live deployment, training | 20% | Week 12 |`);
  sections.push(``);
  sections.push(`5. **Optional Services/Add-ons** (table format if applicable)`);
  sections.push(`6. **Post-Launch Support & Maintenance** - Reference the SPECIFIC support tiers from the "Support & Maintenance Options" section above (Basic, Priority, or Enterprise) with their actual pricing ranges and included services`);
  sections.push(`7. **Assumptions & Exclusions** - What's included and what's not`);
  sections.push(`8. **Pricing Validity** - How long the pricing remains valid`);
  sections.push(`9. **Value Proposition** - Why this represents excellent value (reference our 98% client satisfaction, 95% on-time delivery, and 3.5x average ROI)`);
  sections.push(``);
  sections.push(`**Pricing Guidelines:**`);
  sections.push(`- For enterprise website redesigns: $50K - $150K range`);
  sections.push(`- For complex web applications: $75K - $200K range`);
  sections.push(`- For healthcare/medical websites: $60K - $175K range`);
  sections.push(`- For e-commerce platforms: $80K - $250K range`);
  sections.push(`- For SEO services: $3K - $10K/month (ongoing)`);
  sections.push(`- For advertising management: $5K - $20K/month + ad spend`);
  sections.push(`- For mobile app development: $60K - $200K range`);
  sections.push(`- For AI/automation solutions: $40K - $150K range`);
  sections.push(`- Adjust based on project scope and complexity`);
  sections.push(``);
  sections.push(`**CRITICAL Format Requirements:**`);
  sections.push(`- Use markdown tables for ALL pricing information (use | pipes for columns)`);
  sections.push(`- Tables must be properly formatted with header row and separator row`);
  sections.push(`- Include a total row in bold at the bottom of pricing tables: | **Total Project Cost** | | **$XXX,XXX** |`);
  sections.push(`- MUST include "**Total Project Cost**" or "**Total Investment**" label followed by the dollar amount for automated extraction`);
  sections.push(`- The total MUST be clearly visible both in the table AND as a standalone section header like "## Total Project Cost: $XXX,XXX"`);
  sections.push(`- Use clear section headings with ##`);
  sections.push(`- Professional business writing style`);
  sections.push(`- Transparent and justified pricing with descriptions`);
  sections.push(`- Competitive but not underpriced`);
  sections.push(`- Emphasize value and ROI throughout`);
  sections.push(``);
  sections.push(`**CRITICAL Content Requirements:**`);
  sections.push(`- MANDATORY: Use ONLY CDM Suite's actual track record from the "Company Overview & Track Record" section above`);
  sections.push(`- Reference SPECIFIC CDM Suite credentials: $5.1B LaGuardia Terminal B, $4.2B JFK Terminal 6, 120%+ profit growth, $368K+ sales, $250M+ assets, 50+ team leadership`);
  sections.push(`- Include EXACT support tier options from the "Support & Maintenance Options" section (Basic: $2.5K-$5K, Priority: $5K-$10K, Enterprise: $15K+)`);
  sections.push(`- Reference ACTUAL qualifications: Oracle Primavera Specialist, BIM certified, Airport/Airline Management degree, Project Management certified`);
  sections.push(`- Justify pricing with CDM Suite's infrastructure program experience, operational efficiency, and proven market performance`);
  sections.push(`- Make the value proposition compelling by citing REAL metrics: 120%+ profit growth, $368K+ sales generation, 50+ professionals managed`);
  sections.push(`- DO NOT invent case studies, testimonials, or performance metrics not provided in the knowledge base sections above`);
  sections.push(`- Every value statement must trace back to actual CDM Suite achievements documented in the prompt`);
  sections.push(``);
  sections.push(`**CRITICAL CONFIDENTIALITY REQUIREMENT:**`);
  sections.push(`- NEVER include or reference the client's Adopted Budget figures, totals, allocations, percentages, fund names, or budget document URLs`);
  sections.push(`- NEVER mention specific dollar amounts from the client's annual budget, department budget, or capital program budget`);
  sections.push(`- NEVER reference the client's fiscal year budget documents, CAFR reports, or similar financial documents`);
  sections.push(`- The pricing must be presented ONLY as a figure derived from CDM Suite's own cost analysis and market research`);
  sections.push(`- You may reference "budget adherence," "fiscal responsibility," and "typical funding constraints" in GENERAL terms only`);
  sections.push(`- Focus justification on market rates, project complexity, our track record, and competitive value - NOT on client's budget capacity`);
  
  if (hasSubstantialEmail) {
    sections.push(``);
    sections.push(`**CRITICAL - PRESERVE EXISTING PRICING:**`);
    sections.push(`- Extract the EXACT pricing from the email proposal above`);
    sections.push(`- DO NOT change the total price or major line items`);
    sections.push(`- ONLY reformat and structure the existing pricing professionally`);
    sections.push(`- If pricing tables exist in the email, preserve those values exactly`);
    sections.push(`- You are organizing what was already proposed, not creating new pricing`);
  }
  
  sections.push(``);
  sections.push(`Generate the complete cost proposal now with properly formatted markdown tables:`);

  return sections.join('\n');
}

// AI-Powered Bid Information Extraction from Documents
export interface ExtractedBidInfo {
  title: string;
  solicitationNumber: string;
  description: string;
  organizationName: string;
  organizationType: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  issueDate?: string;
  closingDate?: string;
  technicalOpeningDate?: string;
  costOpeningDate?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  requirements: string[];
  estimatedBudget?: string;
  budgetDetails?: string;
  scope: string;
}

// Helper function to clean JSON from markdown code blocks
function cleanJsonResponse(content: string): string {
  let cleaned = content.trim();
  
  // Remove markdown code block markers
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '');
  }
  
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  
  return cleaned.trim();
}

export async function extractBidInformationFromDocuments(
  documents: { name: string; content: string }[]
): Promise<ExtractedBidInfo> {
  try {
    // Combine all document contents
    const combinedContent = documents.map(doc => 
      `=== Document: ${doc.name} ===\n${doc.content}\n\n`
    ).join('');

    const prompt = `You are an expert at analyzing RFP (Request for Proposal) and bid documents. Your job is to extract as much information as possible from the documents, using context clues and reasonable inferences when explicit information is not available.

Documents to analyze:
${combinedContent}

Extract and provide ALL of the following information in JSON format:
{
  "title": "Brief, clear title for this bid opportunity",
  "solicitationNumber": "The solicitation/RFP number (look in headers, footers, reference numbers, ITN numbers, RFP numbers, etc.)",
  "description": "Comprehensive 2-3 sentence description of what this bid is for",
  "organizationName": "Name of the organization issuing the bid (check headers, contact sections, addressee, sender info)",
  "organizationType": "Type (e.g., 'Federal Agency', 'State Government', 'Local Government', 'Private Corporation', 'Healthcare', 'Education') - infer from context if not explicitly stated",
  "address": "Street address of the organization (check letterhead, contact sections, mailing address)",
  "city": "City name (extract from address or contact information)",
  "state": "State/Province (extract from address or contact information)",
  "zipCode": "ZIP/Postal code (extract from address or contact information)",
  "issueDate": "Date when the RFP was issued (YYYY-MM-DD format) - check document date, publication date, or 'issued on' dates",
  "closingDate": "Deadline for bid submission (YYYY-MM-DD format) - look for 'due date', 'submission deadline', 'closing date', 'proposals must be received by'",
  "technicalOpeningDate": "Date for technical proposal opening (YYYY-MM-DD format) if mentioned separately",
  "costOpeningDate": "Date for cost proposal opening (YYYY-MM-DD format) if mentioned separately",
  "contactName": "Primary contact person for questions (check contact sections, 'questions to', procurement officer name)",
  "contactEmail": "Contact email address (any email mentioned for questions or submissions)",
  "contactPhone": "Contact phone number (any phone number for inquiries)",
  "requirements": ["Extract ALL key requirements, qualifications, deliverables, and evaluation criteria - be comprehensive"],
  "estimatedBudget": "Extract ONLY if explicit dollar amounts are mentioned (e.g., '$50,000', 'budget of $100,000', 'not to exceed $150,000'). DO NOT extract year references. Return null if no explicit budget found.",
  "budgetDetails": "Any budget notes, payment terms, funding source, payment schedules, or financial requirements",
  "scope": "Detailed description of the project scope and objectives - extract from scope of work, project description, or purpose sections",
  "keyDeliverables": ["List ALL specific deliverables, milestones, reports, or outputs expected"],
  "timeline": "Expected project duration, start date, completion date, or phased timeline",
  "technicalRequirements": "Specific technical requirements, platforms, technologies, standards, certifications, or compliance requirements"
}

CRITICAL EXTRACTION RULES:
1. **ALWAYS fill every field** - use context clues and reasonable inferences
2. **Organization Details**: Look in letterheads, headers, footers, contact sections, return addresses
3. **Dates**: Parse from various formats (e.g., "December 15, 2024", "12/15/2024", "2024-12-15")
4. **Contact Info**: Check "Questions" sections, "Contact" sections, email signatures, headers
5. **Solicitation Number**: Can be RFP #, ITN #, Solicitation #, Project #, Reference #, Contract #
6. **Timeline**: Look for start dates, duration (e.g., "12 months", "2 years"), completion dates
7. **Requirements**: Be exhaustive - include minimum qualifications, mandatory requirements, evaluation criteria
8. **Only use null/empty for**: dates that truly aren't mentioned, and budgetDetails/estimatedBudget if no financial info exists
9. **Inference allowed for**: organizationType (based on name/context), address components if partial info available
10. **Budget**: Only extract explicit amounts like "$50,000" or "budget not to exceed $100,000" - ignore year mentions

EXAMPLE INFERENCES:
- If you see "Grand Traverse County" → city: "Traverse City", state: "Michigan"
- If you see "Department of Education" → organizationType: "Government"
- If closing date is Jan 15 → issueDate is likely within past 30 days
- If you see "procurement@agency.gov" and "John Smith, Procurement Officer" → contactEmail and contactName

Respond with raw JSON only. Do not wrap in markdown code blocks.`;

    const response = await fetchWithTimeout(ABACUS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACUS_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at extracting structured information from RFP and bid documents. You always respond with valid JSON without markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated by AI');
    }

    // Clean the response to remove any markdown formatting
    const cleanedContent = cleanJsonResponse(content);
    
    // Parse the JSON response
    const extractedInfo = JSON.parse(cleanedContent);
    
    return extractedInfo;
  } catch (error) {
    console.error('Error extracting bid information:', error);
    throw new Error(`Failed to extract bid information: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract pricing information from a preliminary email
 */
export async function extractPricingFromEmail(
  emailContent: string
): Promise<{ price: number | null; notes: string | null }> {
  try {
    const prompt = `You are an expert at extracting pricing information from emails and correspondence. Analyze the following email and extract any pricing or budget information mentioned.

Email content:
${emailContent}

Extract and provide the following information in JSON format:
{
  "price": <number or null if not found>,
  "notes": "Any additional context about the pricing, payment terms, or budget constraints"
}

Look for:
- Direct price quotes (e.g., "$50,000", "fifty thousand dollars")
- Budget ranges (extract the midpoint or maximum)
- Hourly rates × estimated hours
- Line item totals
- "Not to exceed" amounts

Important:
- Return only the numeric value for price (without $, commas, or text)
- If no price is found, return null
- Be conservative - only extract prices if clearly stated

Respond with raw JSON only. Do not wrap the response in markdown code blocks.`;

    const response = await fetchWithTimeout(ABACUS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACUS_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at extracting pricing information from text. You always respond with valid JSON without markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.warn('Failed to extract pricing from email:', await response.text());
      return { price: null, notes: null };
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return { price: null, notes: null };
    }

    const cleanedContent = cleanJsonResponse(content);
    const result = JSON.parse(cleanedContent);
    
    // Validate extracted price is realistic for business proposals
    const extractedPrice = typeof result.price === 'number' ? result.price : null;
    
    if (extractedPrice !== null && extractedPrice < 10000) {
      console.log(`Rejected unrealistic email price: $${extractedPrice.toLocaleString()} (minimum $10,000 required)`);
      return { price: null, notes: result.notes || 'Price mentioned but below minimum threshold' };
    }
    
    return {
      price: extractedPrice,
      notes: result.notes || null,
    };
  } catch (error) {
    console.error('Error extracting pricing from email:', error);
    return { price: null, notes: null };
  }
}

/**
 * Calculate realistic pricing based on bid requirements and scope
 */
export async function calculateRealisticPricing(
  bidDetails: any,
  requirements: string,
  scope: string
): Promise<{ price: number | null; breakdown: string; notes: string }> {
  try {
    const prompt = `You are an expert pricing analyst specializing in government and commercial bids. Calculate a realistic price estimate for this bid opportunity.

BID INFORMATION:
Title: ${bidDetails.title || 'Not specified'}
Issuing Organization: ${bidDetails.issuingOrg || 'Not specified'}
Type: ${bidDetails.solicitationType || 'Not specified'}
Location: ${bidDetails.location || 'Not specified'}
Description: ${bidDetails.description || 'Not specified'}

REQUIREMENTS:
${requirements}

SCOPE OF WORK:
${scope}

Provide a realistic pricing estimate in this EXACT JSON format:
{
  "price": <total numeric value>,
  "breakdown": "<detailed breakdown of cost components>",
  "notes": "<justification and market considerations>",
  "confidence": "<low|medium|high>"
}

Guidelines for realistic pricing:
1. Consider labor costs based on location and complexity
2. Include materials, equipment, and overhead (20-30%)
3. Add profit margin (10-15% for competitive bids, 15-25% for specialized work)
4. Research typical industry rates for similar projects
5. Factor in project duration, team size, and expertise level required
6. Consider travel, training, and other ancillary costs
7. Adjust for government vs commercial pricing expectations

Pricing ranges by project type:
- Small consulting/services: $15,000 - $75,000
- Medium projects: $75,000 - $250,000
- Large projects: $250,000 - $1,000,000+
- Enterprise/multi-year: $1M+

Respond with raw JSON only. Do not wrap in markdown code blocks.`;

    const response = await fetchWithTimeout(ABACUS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACUS_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert pricing analyst. Always respond with valid JSON without markdown formatting. Base your estimates on realistic industry standards and market research.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      console.warn('Failed to calculate realistic pricing:', await response.text());
      return { price: null, breakdown: '', notes: 'Unable to calculate pricing estimate' };
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return { price: null, breakdown: '', notes: 'Unable to calculate pricing estimate' };
    }

    const cleanedContent = cleanJsonResponse(content);
    const result = JSON.parse(cleanedContent);
    
    // Validate calculated price is realistic for business proposals
    const calculatedPrice = typeof result.price === 'number' ? result.price : null;
    
    if (calculatedPrice !== null && calculatedPrice < 10000) {
      console.log(`Rejected unrealistic calculated price: $${calculatedPrice.toLocaleString()} (minimum $10,000 required)`);
      return { 
        price: null, 
        breakdown: result.breakdown || '', 
        notes: `Calculated price below minimum threshold. ${result.notes || ''} (Confidence: ${result.confidence || 'low'})` 
      };
    }
    
    return {
      price: calculatedPrice,
      breakdown: result.breakdown || '',
      notes: `${result.notes || ''} (Confidence: ${result.confidence || 'medium'})`,
    };
  } catch (error) {
    console.error('Error calculating realistic pricing:', error);
    return { price: null, breakdown: '', notes: 'Error calculating pricing estimate' };
  }
}


/**
 * Generate a follow-up email template based on the bid proposal
 */
export async function generateFollowUpEmail(bidProposal: any): Promise<string> {
  try {
    const prompt = `Generate a professional follow-up email to send to the bid issuing organization after submitting a proposal.

Bid Details:
- Title: ${bidProposal.title}
- Solicitation Number: ${bidProposal.solicitationNumber}
- Issuing Organization: ${bidProposal.issuingOrg || 'N/A'}
- Contact Name: ${bidProposal.contactName || 'N/A'}
- Closing Date: ${bidProposal.closingDate ? new Date(bidProposal.closingDate).toLocaleDateString() : 'N/A'}

Generate a brief, professional email (3-4 sentences) that:
1. Confirms submission of the proposal
2. Expresses enthusiasm about the opportunity
3. Offers to answer any questions
4. Provides a clear call-to-action for next steps

Keep it concise, professional, and warm. Do not include subject line or signature - just the body text.`;

    const response = await fetchWithTimeout(ABACUS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACUS_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a professional business email writer. Generate concise, professional follow-up emails.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      console.warn('Failed to generate follow-up email:', await response.text());
      return `Thank you for considering our proposal for ${bidProposal.title}. We look forward to the opportunity to work with you and are available to answer any questions you may have.`;
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    return content || `Thank you for considering our proposal for ${bidProposal.title}. We look forward to the opportunity to work with you and are available to answer any questions you may have.`;
  } catch (error) {
    console.error('Error generating follow-up email:', error);
    return `Thank you for considering our proposal for ${bidProposal.title}. We look forward to the opportunity to work with you and are available to answer any questions you may have.`;
  }
}

/**
 * Generate a professional proposal title
 */
export async function generateProposalTitle(bidProposal: any): Promise<string> {
  try {
    const prompt = `Generate a concise, professional proposal title based on the following bid information. 
The title should be clear, descriptive, and suitable for a government/enterprise contract proposal.
Keep it under 120 characters.

Bid Information:
- Solicitation: ${bidProposal.title || 'Not specified'}
- Solicitation Number: ${bidProposal.solicitationNumber || 'N/A'}
- Organization: ${bidProposal.issuingOrg || 'Not specified'}
- Description: ${bidProposal.description || 'Not specified'}
- Location: ${bidProposal.location || 'Not specified'}

Generate ONLY the title text, nothing else. No quotes, no prefixes, just the title.`;

    const response = await fetchWithTimeout(ABACUS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACUS_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a professional proposal writer. Generate clear, concise proposal titles.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      console.warn('Failed to generate proposal title:', await response.text());
      return `Proposal for ${bidProposal.title}`;
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content?.trim();
    
    // Remove quotes if present
    if (content) {
      content = content.replace(/^["']|["']$/g, '');
    }

    return content || `Proposal for ${bidProposal.title}`;
  } catch (error) {
    console.error('Error generating proposal title:', error);
    return `Proposal for ${bidProposal.title}`;
  }
}

/**
 * Generate a professional cover page for the proposal
 */
export async function generateCoverPage(bidProposal: any): Promise<string> {
  try {
    const companyInfo = getCompanyOverview();
    const proposalTitle = bidProposal.proposalTitle || bidProposal.title;
    
    const prompt = `Generate professional cover page content for a government/enterprise contract proposal.
The content should be formatted as clean HTML (div elements with appropriate classes).

Bid Information:
- Title: ${proposalTitle}
- Solicitation Number: ${bidProposal.solicitationNumber || 'N/A'}
- Organization: ${bidProposal.issuingOrg || 'Not specified'}
- Location: ${bidProposal.location || 'Not specified'}
- Closing Date: ${bidProposal.closingDate ? new Date(bidProposal.closingDate).toLocaleDateString() : 'Not specified'}

Company Information:
${companyInfo}

Generate the cover page content with:
1. Proposal title (prominent heading)
2. Submitted to: [Organization name]
3. Solicitation number
4. Submitted by: CDM Suite
5. Date
6. Brief value proposition (2-3 sentences highlighting our $9.3B+ infrastructure experience)

Return ONLY the HTML content (using div, h1, h2, h3, p tags), no markdown, no code blocks.`;

    const response = await fetchWithTimeout(ABACUS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACUS_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a professional proposal writer. Generate clean HTML content for proposal cover pages.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      console.warn('Failed to generate cover page:', await response.text());
      return getDefaultCoverPage(bidProposal);
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content?.trim();
    
    // Remove markdown code blocks if present
    if (content) {
      content = content.replace(/```html\n?/g, '').replace(/```\n?/g, '');
    }

    return content || getDefaultCoverPage(bidProposal);
  } catch (error) {
    console.error('Error generating cover page:', error);
    return getDefaultCoverPage(bidProposal);
  }
}

/**
 * Get default cover page HTML
 */
function getDefaultCoverPage(bidProposal: any): string {
  const proposalTitle = bidProposal.proposalTitle || bidProposal.title;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return `
<div class="cover-page">
  <h1 style="font-size: 2.5rem; font-weight: bold; color: #1a56db; margin-bottom: 2rem; text-align: center;">
    ${proposalTitle}
  </h1>
  
  <div style="margin: 3rem 0;">
    <h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 1rem;">
      Submitted To:
    </h2>
    <p style="font-size: 1.25rem; color: #6b7280;">
      ${bidProposal.issuingOrg || 'Issuing Organization'}
    </p>
  </div>
  
  <div style="margin: 2rem 0;">
    <h3 style="font-size: 1.25rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
      Solicitation Number:
    </h3>
    <p style="font-size: 1.125rem; color: #6b7280;">
      ${bidProposal.solicitationNumber}
    </p>
  </div>
  
  <div style="margin: 3rem 0;">
    <h2 style="font-size: 1.5rem; font-weight: 600; color: #374151; margin-bottom: 1rem;">
      Submitted By:
    </h2>
    <p style="font-size: 1.25rem; font-weight: 600; color: #1a56db;">
      CDM Suite
    </p>
    <p style="font-size: 1rem; color: #6b7280; margin-top: 0.5rem;">
      Infrastructure Excellence Since 2020
    </p>
  </div>
  
  <div style="margin: 2rem 0;">
    <h3 style="font-size: 1.125rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
      Date:
    </h3>
    <p style="font-size: 1rem; color: #6b7280;">
      ${today}
    </p>
  </div>
  
  <div style="margin: 3rem 0; padding: 1.5rem; background: #f3f4f6; border-left: 4px solid #1a56db;">
    <p style="font-size: 1rem; color: #374151; line-height: 1.6;">
      CDM Suite brings proven expertise from $9.3B+ in infrastructure programs, delivering 120%+ profit growth and exceptional project outcomes. We combine advanced project controls, technical excellence, and client-focused partnership to ensure your project's success.
    </p>
  </div>
</div>`;
}


/**
 * Regenerates content for a specific section of a bid proposal
 */
export async function generateSectionContent(
  bidProposal: any,
  section: string
): Promise<string> {
  const companyKnowledge = CDM_SUITE_KNOWLEDGE;
  
  let prompt = "";
  let systemMessage = "You are an expert proposal writer specializing in government contracting and infrastructure projects.";

  switch (section) {
    case "envelope1Content":
      // Technical Proposal
      prompt = `Generate a comprehensive technical proposal for this bid:
      
Title: ${bidProposal.title}
Description: ${bidProposal.description || "Not provided"}
Issuing Organization: ${bidProposal.issuingOrg || "Not specified"}
Solicitation Type: ${bidProposal.solicitationType || "Not specified"}

Include:
1. Executive Summary
2. Understanding of Requirements
3. Technical Approach
4. Methodology
5. Quality Control
6. Risk Management
7. Deliverables and Timeline
8. Team Qualifications

Use the following company information:
${JSON.stringify(companyKnowledge, null, 2)}

Make it professional, detailed, and winning. Focus on our $9.3B+ infrastructure experience and 120%+ profit growth track record.`;
      break;

    case "envelope2Content":
      // Cost Proposal
      prompt = `Generate a detailed cost proposal for this bid:
      
Title: ${bidProposal.title}
Description: ${bidProposal.description || "Not provided"}
Proposed Price: ${bidProposal.proposedPrice ? `$${bidProposal.proposedPrice.toLocaleString()}` : "To be determined"}

Include:
1. Cost Summary
2. Labor Costs
3. Materials and Equipment
4. Overhead and Indirect Costs
5. Profit/Fee
6. Payment Schedule
7. Cost Breakdown by Phase
8. Value Justification

Use the following company information:
${JSON.stringify(companyKnowledge, null, 2)}

Make it transparent, justified, and competitive. Highlight our value proposition and ROI benefits.`;
      break;

    case "envelope1Notes":
      // Technical Notes
      prompt = `Generate internal technical notes for this proposal:
      
Title: ${bidProposal.title}
Description: ${bidProposal.description || "Not provided"}

Include:
1. Key technical considerations
2. Potential challenges and mitigation strategies
3. Required resources and expertise
4. Timeline considerations
5. Quality control checkpoints
6. Recommended approach variations

Make it actionable for the proposal team.`;
      break;

    case "envelope2Notes":
      // Cost Notes
      prompt = `Generate internal cost notes for this proposal:
      
Title: ${bidProposal.title}
Proposed Price: ${bidProposal.proposedPrice ? `$${bidProposal.proposedPrice.toLocaleString()}` : "To be determined"}

Include:
1. Pricing strategy rationale
2. Cost assumptions and dependencies
3. Risk contingencies
4. Negotiation points
5. Profit margin justification
6. Competitive positioning

Make it useful for pricing decisions and negotiations.`;
      break;

    case "generalProposalComment":
      // General Comment
      prompt = `Generate a general proposal comment that will be included in all documents:
      
Title: ${bidProposal.title}
Description: ${bidProposal.description || "Not provided"}

This should be a compelling 2-3 paragraph statement that:
1. Demonstrates our understanding of the project
2. Highlights our unique qualifications
3. Emphasizes our commitment to excellence
4. References our $9.3B+ infrastructure experience

Make it professional and persuasive.`;
      break;

    default:
      throw new Error(`Invalid section: ${section}`);
  }

  try {
    const response = await fetch("https://apis.abacus.ai/chatllm/chat/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt },
        ],
        model: "gpt-4o-2024-11-20",
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error("Error generating section content:", error);
    throw error;
  }
}