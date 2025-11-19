
// AI-powered sequence generation using Abacus AI

interface LeadContext {
  name?: string;
  email: string;
  company?: string;
  interest?: string;
  budget?: string;
  timeline?: string;
  source?: string;
  score?: number;
  preferredChannels?: string; // User's preference for communication
}

interface GeneratedSequence {
  name: string;
  description: string;
  type: 'email' | 'sms' | 'task' | 'mixed';
  targetAudience: string;
  steps: any[];
  aiPrompt: string;
  reasoning: string;
}

export async function generateSequenceForLead(
  leadContext: LeadContext,
  preferredType?: 'email' | 'sms' | 'task' | 'mixed'
): Promise<GeneratedSequence> {
  try {
    const prompt = buildSequencePrompt(leadContext, preferredType);

    const response = await fetch('/api/ai/generate-sequence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadContext, prompt, preferredType }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate sequence');
    }

    return await response.json();
  } catch (error) {
    console.error('AI sequence generation error:', error);
    throw error;
  }
}

export async function suggestNextStep(
  sequenceId: string,
  currentSteps: any[],
  leadContext: LeadContext
): Promise<any> {
  try {
    const response = await fetch('/api/ai/suggest-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sequenceId, currentSteps, leadContext }),
    });

    if (!response.ok) {
      throw new Error('Failed to suggest step');
    }

    return await response.json();
  } catch (error) {
    console.error('AI step suggestion error:', error);
    throw error;
  }
}

export async function optimizeSequenceTiming(
  sequenceId: string,
  performanceData: any
): Promise<any> {
  try {
    const response = await fetch('/api/ai/optimize-sequence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sequenceId, performanceData }),
    });

    if (!response.ok) {
      throw new Error('Failed to optimize sequence');
    }

    return await response.json();
  } catch (error) {
    console.error('AI sequence optimization error:', error);
    throw error;
  }
}

function buildSequencePrompt(
  leadContext: LeadContext,
  preferredType?: 'email' | 'sms' | 'task' | 'mixed'
): string {
  const type = preferredType || 'email';
  
  // Build channel-specific instructions
  let channelInstructions = '';
  let stepExample: any = {};
  
  if (type === 'email') {
    channelInstructions = `Create a multi-step EMAIL sequence that:
1. Welcomes the lead and acknowledges their interest
2. Provides value through relevant content or insights
3. Addresses potential concerns or questions
4. Encourages engagement with a clear call-to-action
5. Follows up appropriately based on response (or lack thereof)

Each email step should include:
- Compelling subject line (70 characters or less)
- Personalized email content (professional yet approachable tone)
- Appropriate delay timing (consider business hours and response patterns)
- Clear next action`;

    stepExample = {
      order: 1,
      stepType: 'email',
      title: 'Step title',
      subject: 'Email subject line (max 70 chars)',
      content: 'Email body with personalization tokens like {{firstName}}',
      delayAmount: 0,
      delayUnit: 'hours',
      delayFrom: 'start',
      aiReasoning: 'Why this step is included'
    };
  } else if (type === 'sms') {
    channelInstructions = `Create a multi-step SMS sequence that:
1. Welcomes the lead with a brief, friendly message
2. Provides immediate value or quick tips
3. Encourages engagement with simple CTAs
4. Follows up with timely, concise messages

Each SMS step should include:
- Brief, conversational content (160 characters or less for single SMS)
- Direct and clear call-to-action
- Appropriate delay timing (avoid late nights/early mornings)
- Personalization where possible
- Consider SMS best practices (no spam, clear opt-out)`;

    stepExample = {
      order: 1,
      stepType: 'sms',
      title: 'Step title',
      content: 'SMS content - keep it under 160 characters, personalized like: Hi {{firstName}}! Thanks for reaching out. Ready to chat? Reply YES',
      delayAmount: 0,
      delayUnit: 'hours',
      delayFrom: 'start',
      aiReasoning: 'Why this SMS is included'
    };
  } else if (type === 'mixed') {
    channelInstructions = `Create a multi-channel MIXED sequence that combines EMAIL and SMS for maximum engagement:
1. Start with the most appropriate channel based on urgency and content length
2. Mix channels strategically (e.g., email for detailed info, SMS for quick reminders)
3. Use SMS for time-sensitive or action-oriented messages
4. Use email for value-driven, detailed content
5. Create a cohesive journey across all channels

Guidelines:
- EMAIL: Detailed content, value propositions, case studies, long-form
- SMS: Quick check-ins, reminders, urgent CTAs, appointment confirmations
- Alternate channels thoughtfully (don't overwhelm with same channel)
- Consider the lead's response pattern and preferences`;

    stepExample = {
      order: 1,
      stepType: 'email', // or 'sms'
      title: 'Step title',
      subject: 'Email subject (only for email steps)',
      content: 'Content appropriate for the channel type',
      delayAmount: 0,
      delayUnit: 'hours',
      delayFrom: 'start',
      aiReasoning: 'Why this channel and message at this point'
    };
  }

  return `
Generate a personalized lead nurture sequence for the following lead:

Name: ${leadContext.name || 'Unknown'}
Email: ${leadContext.email}
Company: ${leadContext.company || 'Not provided'}
Interest: ${leadContext.interest || 'General services'}
Budget: ${leadContext.budget || 'Not specified'}
Timeline: ${leadContext.timeline || 'Not specified'}
Source: ${leadContext.source || 'Unknown'}
Lead Score: ${leadContext.score || 0}/100
Preferred Channels: ${leadContext.preferredChannels || 'No preference'}

${channelInstructions}

IMPORTANT: The sequence type MUST be "${type}". All steps must align with this type.
${type === 'mixed' ? 'For mixed sequences, strategically combine email and sms steps.' : ''}

Make the tone professional yet approachable, and ensure the content aligns with CDM Suite's services in digital marketing, web development, and business growth.

Return the sequence in JSON format with the following structure:
{
  "name": "Sequence name",
  "description": "Brief description of the sequence strategy",
  "type": "${type}",
  "targetAudience": "new_lead",
  "steps": [
    ${JSON.stringify(stepExample, null, 2)}
  ],
  "reasoning": "Overall strategy explanation - why this channel mix/type and approach"
}

Create 3-5 highly effective steps that will convert this lead.
  `.trim();
}

export function getDefaultSequenceTemplate(type: string): any[] {
  const templates: Record<string, any[]> = {
    new_lead: [
      {
        order: 1,
        stepType: 'email',
        title: 'Welcome Email',
        subject: 'Thanks for your interest, {{firstName}}!',
        content: `Hi {{firstName}},\n\nThank you for reaching out to CDM Suite! We're excited to help you achieve your digital marketing goals.\n\nI wanted to personally introduce myself and let you know that we've received your inquiry about {{serviceType}}.\n\nTo better understand your needs, I'd love to schedule a quick 15-minute call this week. What day works best for you?\n\nLooking forward to connecting!\n\nBest regards,\n{{assignedTo}}`,
        delayAmount: 0,
        delayUnit: 'hours',
        delayFrom: 'start',
        aiSuggested: false,
      },
      {
        order: 2,
        stepType: 'email',
        title: 'Value Email',
        subject: 'Quick tip for {{company}}',
        content: `Hi {{firstName}},\n\nI wanted to share a quick insight that could help {{company}} right away.\n\n[Personalized tip based on their interest]\n\nHave you had a chance to think about that call we discussed? I have a few slots open this week if you'd like to chat.\n\nBest,\n{{assignedTo}}`,
        delayAmount: 2,
        delayUnit: 'days',
        delayFrom: 'previous',
        aiSuggested: false,
      },
      {
        order: 3,
        stepType: 'email',
        title: 'Last Follow-up',
        subject: 'Checking in one last time',
        content: `Hi {{firstName}},\n\nI wanted to reach out one more time to see if you're still interested in improving your digital presence.\n\nIf now isn't the right time, no worries at all! Feel free to reach out whenever you're ready.\n\nIf you are interested, just reply to this email and we'll get started.\n\nBest,\n{{assignedTo}}`,
        delayAmount: 3,
        delayUnit: 'days',
        delayFrom: 'previous',
        aiSuggested: false,
      },
    ],
    consultation_scheduled: [
      {
        order: 1,
        stepType: 'email',
        title: 'Consultation Confirmation',
        subject: 'Your consultation is confirmed',
        content: `Hi {{firstName}},\n\nGreat! Your consultation is confirmed for [DATE/TIME].\n\nTo make the most of our time together, please review:\n1. Your current digital marketing challenges\n2. Your goals for the next 6-12 months\n3. Any specific questions you have\n\nI'll send you a calendar invite shortly.\n\nSee you soon!\n{{assignedTo}}`,
        delayAmount: 0,
        delayUnit: 'hours',
        delayFrom: 'start',
        aiSuggested: false,
      },
      {
        order: 2,
        stepType: 'task',
        title: 'Send calendar invite',
        content: 'Send calendar invite with Zoom/meeting link',
        delayAmount: 15,
        delayUnit: 'minutes',
        delayFrom: 'previous',
        aiSuggested: false,
      },
      {
        order: 3,
        stepType: 'email',
        title: 'Pre-consultation reminder',
        subject: 'Looking forward to our call tomorrow!',
        content: `Hi {{firstName}},\n\nJust a quick reminder that we're meeting tomorrow at [TIME].\n\nThe meeting link: [LINK]\n\nSee you then!\n{{assignedTo}}`,
        delayAmount: 1,
        delayUnit: 'days',
        delayFrom: 'start',
        aiSuggested: false,
      },
    ],
  };

  return templates[type] || templates.new_lead;
}

