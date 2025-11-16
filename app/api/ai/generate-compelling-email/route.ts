
import { NextRequest, NextResponse } from 'next/server';

const ABACUS_API_KEY = process.env.ABACUSAI_API_KEY;

interface LeadContext {
  name?: string;
  email?: string;
  company?: string;
  interest?: string;
}

interface ProposalContext {
  title?: string;
  clientName?: string;
  clientCompany?: string;
  total?: number;
  items?: any[];
}

export async function POST(request: NextRequest) {
  try {
    const { leadContext, proposalContext, stepIndex } = await request.json();

    // Build context-specific prompt
    const prompt = buildCompellingEmailPrompt(leadContext, proposalContext, stepIndex);

    // Call Abacus AI
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACUS_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert email copywriter specializing in high-converting sales emails for digital marketing services. Your emails are compelling, benefit-focused, and drive action. You always mention important policies like "no refunds" to set clear expectations.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate email');
    }

    const data = await response.json();
    const emailContent = data.choices[0].message.content;

    // Parse the JSON response from AI
    const parsed = JSON.parse(emailContent);

    return NextResponse.json({
      subject: parsed.subject,
      content: parsed.content,
    });
  } catch (error) {
    console.error('AI email generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate email' },
      { status: 500 }
    );
  }
}

function buildCompellingEmailPrompt(
  leadContext?: LeadContext,
  proposalContext?: ProposalContext,
  stepIndex?: number
): string {
  const isProposal = !!proposalContext;
  
  if (isProposal) {
    return `
Create a HIGHLY COMPELLING sales email for a digital marketing proposal with the following context:

PROPOSAL DETAILS:
- Title: ${proposalContext.title || 'Digital Marketing Services'}
- Client Name: ${proposalContext.clientName || '{{firstName}}'}
- Company: ${proposalContext.clientCompany || '{{company}}'}
- Total Investment: $${proposalContext.total || 0}
- Services Included: ${proposalContext.items?.length || 0} premium services

YOUR GOAL: Write an email that makes the client EXCITED about this investment and eager to move forward.

EMAIL REQUIREMENTS:
1. Subject Line:
   - 40-60 characters
   - Create urgency or curiosity
   - Mention the specific value/benefit
   - Example styles: "Your [Result] Strategy Is Ready", "[Company Name] - Time-Sensitive Offer Inside"

2. Email Body (HTML formatted):
   - Start with a personalized greeting using {{firstName}}
   - Hook: Address their biggest pain point or desire immediately
   - Value Proposition: Clearly explain what they'll GET (results, not just features)
   - Social Proof: Brief mention of results for similar clients
   - Investment Framing: Position the price as an investment, not a cost
   - Highlight specific services from the proposal
   - NO REFUNDS POLICY: Professionally mention "Please note: All services are final sale with no refunds. We're committed to delivering exceptional results."
   - Clear Call-to-Action: "Review your proposal" + "Schedule a call" + Payment link mention
   - Urgency: Mention proposal validity period
   - Use HTML formatting: <strong> for emphasis, <p> for paragraphs, <h2> for subheadings
   - Professional yet enthusiastic tone
   - Focus on transformation and results

3. Copywriting Techniques:
   - Use "you" and "your" language (client-focused)
   - Paint the picture of success they'll experience
   - Address objections preemptively
   - Create excitement about working together
   - Professional scarcity (limited spots, time-sensitive offer)

Return your response in this EXACT JSON format:
{
  "subject": "Subject line here (40-60 chars)",
  "content": "<p>Full HTML-formatted email body here with proper tags</p>"
}
`.trim();
  }

  // For lead nurture sequences
  const stepType = stepIndex === 0 ? 'first touch' : stepIndex === 1 ? 'value email' : 'follow-up';
  
  return `
Create a COMPELLING sales email for a lead nurture sequence with the following context:

LEAD DETAILS:
- Name: ${leadContext?.name || '{{firstName}}'}
- Company: ${leadContext?.company || '{{company}}'}
- Interest: ${leadContext?.interest || 'digital marketing services'}
- Email Type: ${stepType}

YOUR GOAL: Write an email that builds relationship, provides value, and moves the lead closer to a sale.

EMAIL REQUIREMENTS:
1. Subject Line:
   - 40-60 characters
   - Personalized and benefit-driven
   - Create curiosity or urgency
   - For ${stepType}: ${
     stepType === 'first touch' ? 'Welcoming and value-focused' :
     stepType === 'value email' ? 'Educational with a specific benefit' :
     'Final follow-up with urgency'
   }

2. Email Body (HTML formatted):
   - Personalized greeting with {{firstName}}
   - ${stepType === 'first touch' ? 
     'Acknowledge their interest and set expectations for value you\'ll provide' :
     stepType === 'value email' ?
     'Share a specific, actionable tip or insight they can use immediately' :
     'Last chance approach with urgency but not pushy'
   }
   - Highlight CDM Suite's expertise in: Web Design, SEO, Social Media Marketing, Ad Management, App Development
   - NO REFUNDS POLICY (brief mention): "All our services come with a no-refund policy, ensuring we\'re both committed to success."
   - Social proof: Mention results we've achieved
   - Clear next step/CTA
   - Use HTML: <strong>, <p>, <h2>, <ul>, <li>
   - Professional, helpful tone
   - Focus on their business growth

3. Copywriting Techniques:
   - Start with their pain point or goal
   - Provide immediate value
   - Show expertise without being salesy
   - Make it easy to respond
   - Create desire to work together

Return your response in this EXACT JSON format:
{
  "subject": "Subject line here (40-60 chars)",
  "content": "<p>Full HTML-formatted email body here</p>"
}
`.trim();
}
