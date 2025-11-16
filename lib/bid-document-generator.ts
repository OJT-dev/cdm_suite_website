
/**
 * Bid Document Generator
 * Generates different types of bid documents based on RFP content and company knowledge
 */

import { 
  getCompanyOverview, 
  getServiceDetails, 
  getRelevantCaseStudies,
  getLeadershipBackground,
  getCompetitiveAdvantages,
  getTechnologyStack,
  getMethodologyOverview
} from './cdm-suite-knowledge';

interface DocumentGenerationContext {
  bidProposal: any;
  extractedContent?: string;
  adoptedBudgetData?: any;
  competitiveIntelligence?: string;
}

/**
 * Generate Technical Proposal
 */
export async function generateTechnicalProposal(context: DocumentGenerationContext): Promise<string> {
  const { bidProposal, extractedContent } = context;
  const companyOverview = getCompanyOverview();
  const methodology = getMethodologyOverview();
  const techStack = getTechnologyStack();

  const systemPrompt = `You are an expert proposal writer for CDM Suite, a digital marketing agency with extensive infrastructure project experience.

Company Background:
${companyOverview}

Technology & Methodology:
${methodology}

Create a comprehensive technical proposal that includes:
1. Executive Summary
2. Understanding of Requirements
3. Technical Approach and Methodology
4. Project Management Plan
5. Quality Assurance Procedures
6. Team Qualifications
7. Technology Stack and Tools
8. Risk Management
9. Timeline and Deliverables

Use specific examples from our infrastructure portfolio where relevant. Be professional, detailed, and demonstrate technical expertise.`;

  const userPrompt = `Generate a technical proposal for this opportunity:

Title: ${bidProposal.title}
Organization: ${bidProposal.issuingOrg || 'Government Agency'}
Location: ${bidProposal.location || 'Not specified'}

${extractedContent ? `RFP Content:\n${extractedContent.substring(0, 3000)}` : ''}

Description: ${bidProposal.description || 'Not provided'}

Generate a comprehensive technical proposal that showcases our infrastructure expertise and addresses all requirements.`;

  try {
    const response = await fetch(`https://apps.abacus.ai/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Error generating technical proposal';
  } catch (error) {
    console.error('Error generating technical proposal:', error);
    throw error;
  }
}

/**
 * Generate Cost Proposal
 */
export async function generateCostProposal(context: DocumentGenerationContext): Promise<string> {
  const { bidProposal, adoptedBudgetData } = context;
  const companyOverview = getCompanyOverview();

  const systemPrompt = `You are a pricing expert for CDM Suite with experience in infrastructure project budgeting.

Company Context:
${companyOverview}

Pricing Context:
- Starter tier: $5,000-$25,000/month
- Professional tier: $25,000-$100,000/month  
- Enterprise tier: $100,000-$500,000/month
- Infrastructure program management: Custom pricing based on scope

Create a detailed cost proposal that includes:
1. Cost Summary
2. Detailed Breakdown by Phase
3. Labor Costs and Rates
4. Equipment and Materials
5. Overhead and Administrative Costs
6. Payment Schedule
7. Budget Justification
8. Value Proposition

${adoptedBudgetData ? 'Consider budget context but do not reveal specific budget figures.' : ''}`;

  const userPrompt = `Generate a cost proposal for this opportunity:

Title: ${bidProposal.title}
Organization: ${bidProposal.issuingOrg || 'Government Agency'}
${bidProposal.proposedPrice ? `Proposed Price: $${bidProposal.proposedPrice.toLocaleString()}` : ''}

Description: ${bidProposal.description || 'Not provided'}

Generate a professional cost proposal with detailed pricing breakdown and justification.`;

  try {
    const response = await fetch(`https://apps.abacus.ai/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Error generating cost proposal';
  } catch (error) {
    console.error('Error generating cost proposal:', error);
    throw error;
  }
}

/**
 * Generate HUB Subcontracting Plan
 */
export async function generateHUBSubcontractingPlan(context: DocumentGenerationContext): Promise<string> {
  const { bidProposal } = context;
  const companyOverview = getCompanyOverview();

  const systemPrompt = `You are an expert in HUB (Historically Underutilized Business) subcontracting plans for government contracts.

Create a comprehensive HUB Subcontracting Plan that includes:
1. Company Commitment to HUB Program
2. Subcontracting Goals and Percentages
3. Good Faith Effort Methods
4. Identification of HUB Subcontractors
5. Scope of Work for Each HUB
6. Monitoring and Compliance Procedures
7. Past Performance with HUBs

Guidelines:
- Demonstrate genuine commitment to HUB utilization
- Set realistic percentage goals (typically 20-30% for construction/services)
- Detail specific outreach and recruitment efforts
- Include monitoring and reporting procedures`;

  const userPrompt = `Generate a HUB Subcontracting Plan for this opportunity:

Title: ${bidProposal.title}
Organization: ${bidProposal.issuingOrg || 'Government Agency'}
Location: ${bidProposal.location || 'Not specified'}

Generate a comprehensive HUB Subcontracting Plan that demonstrates our commitment to supporting historically underutilized businesses.`;

  try {
    const response = await fetch(`https://apps.abacus.ai/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Error generating HUB plan';
  } catch (error) {
    console.error('Error generating HUB plan:', error);
    throw error;
  }
}

/**
 * Generate Past Performance Document
 */
export async function generatePastPerformance(context: DocumentGenerationContext): Promise<string> {
  const { bidProposal } = context;
  const companyOverview = getCompanyOverview();
  const leadership = getLeadershipBackground();

  const systemPrompt = `You are an expert at showcasing company past performance for government proposals.

Company Background:
${companyOverview}

Leadership Experience:
${leadership}

Create a comprehensive Past Performance document that includes:
1. Company Overview and Capabilities
2. Relevant Project Experience
3. Project Details (scope, value, timeline, outcomes)
4. Client References
5. Performance Metrics and Achievements
6. Lessons Learned and Continuous Improvement

Use specific examples from our infrastructure portfolio.`;

  const userPrompt = `Generate a Past Performance document for this opportunity:

Title: ${bidProposal.title}
Organization: ${bidProposal.issuingOrg || 'Government Agency'}
Description: ${bidProposal.description || 'Not provided'}

Generate a compelling past performance narrative that demonstrates our proven track record in similar work.`;

  try {
    const response = await fetch(`https://apps.abacus.ai/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Error generating past performance';
  } catch (error) {
    console.error('Error generating past performance:', error);
    throw error;
  }
}

/**
 * Generate document based on type
 */
export async function generateDocument(
  documentType: string,
  context: DocumentGenerationContext
): Promise<string> {
  switch (documentType) {
    case 'technical':
      return await generateTechnicalProposal(context);
    case 'cost':
      return await generateCostProposal(context);
    case 'hub_subcontracting':
      return await generateHUBSubcontractingPlan(context);
    case 'past_performance':
      return await generatePastPerformance(context);
    case 'organizational_chart':
    case 'quality_assurance':
    case 'safety_plan':
    case 'schedule':
    case 'references':
    case 'certifications':
      return await generateGenericDocument(documentType, context);
    default:
      throw new Error(`Unknown document type: ${documentType}`);
  }
}

/**
 * Generate generic document (for other document types)
 */
async function generateGenericDocument(
  documentType: string,
  context: DocumentGenerationContext
): Promise<string> {
  const { bidProposal } = context;
  const companyOverview = getCompanyOverview();

  const documentTitles: Record<string, string> = {
    organizational_chart: 'Project Organizational Chart',
    quality_assurance: 'Quality Assurance Plan',
    safety_plan: 'Safety Plan',
    schedule: 'Project Schedule',
    references: 'Client References',
    certifications: 'Certifications and Licenses',
  };

  const systemPrompt = `You are an expert proposal writer creating a ${documentTitles[documentType]} for CDM Suite.

Company Background:
- Managed $9.3B+ infrastructure programs
- 120%+ profit growth with project controls
- Expert in Oracle Primavera P6, BIM, and infrastructure analytics
- 98% client satisfaction, 95% on-time delivery

Create a comprehensive ${documentTitles[documentType]} that is professional, detailed, and demonstrates our expertise.`;

  const userPrompt = `Generate a ${documentTitles[documentType]} for this opportunity:

Title: ${bidProposal.title}
Organization: ${bidProposal.issuingOrg || 'Government Agency'}
Description: ${bidProposal.description || 'Not provided'}

Generate a professional document that showcases our capabilities and addresses the requirements.`;

  try {
    const response = await fetch(`https://apps.abacus.ai/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || `Error generating ${documentTitles[documentType]}`;
  } catch (error) {
    console.error(`Error generating ${documentTitles[documentType]}:`, error);
    throw error;
  }
}
