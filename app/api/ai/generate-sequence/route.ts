
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/ai/generate-sequence - Generate a sequence using AI
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let leadContext, prompt, preferredType;
  
  try {
    const body = await request.json();
    leadContext = body.leadContext;
    prompt = body.prompt;
    preferredType = body.preferredType || 'email';
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    // Build a prompt from the lead context if not provided
    if (!prompt && leadContext) {
      const interest = leadContext.interest || 'digital marketing services';
      const channelDescription = 
        preferredType === 'email' ? 'email nurture sequence' :
        preferredType === 'sms' ? 'SMS text message sequence' :
        preferredType === 'mixed' ? 'multi-channel sequence combining email and SMS' :
        'email sequence';
      
      prompt = `Generate a 3-5 step ${channelDescription} for a lead interested in ${interest}. Return JSON with: name (string), description (string), type (string: "${preferredType}"), targetAudience (string), and steps array. Each step should have: order (number), stepType (string: "${preferredType === 'mixed' ? 'email or sms' : preferredType}"), title (string), ${preferredType !== 'sms' ? 'subject (string for email steps only), ' : ''}content (string - ${preferredType === 'sms' ? 'max 160 chars' : 'full length'}), delayAmount (number), delayUnit (string: "hours"|"days"|"weeks"), delayFrom (string: "start"|"previous"), aiSuggested (boolean: true), aiReasoning (string). Make the content professional, personalized, and compelling.`;
    }

    if (!prompt) {
      throw new Error('No prompt or lead context provided');
    }

    // Use Abacus AI to generate sequence
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert multi-channel marketing strategist for CDM Suite, a digital marketing agency. 

CRITICAL RULES:
1. If the user requests a "mixed" sequence type, you MUST create a sequence that includes BOTH email AND SMS steps
2. For mixed sequences, alternate between email and SMS channels strategically
3. For SMS-only sequences, ALL steps must be SMS with content under 160 characters
4. For email-only sequences, ALL steps must be email
5. Always return valid JSON with the exact structure requested
6. The "type" field in your response MUST match the requested type exactly

Channel Usage Guidelines:
- EMAIL: Use for detailed information, value propositions, case studies, educational content
- SMS: Use for urgent reminders, quick check-ins, appointment confirmations, time-sensitive CTAs
- MIXED: Combine both strategically (e.g., email for intro → SMS reminder → email with details → SMS follow-up)`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error('AI generation failed');
    }

    const aiResponse = await response.json();
    const generatedSequence = JSON.parse(aiResponse.choices[0].message.content);

    // Validate that the AI respected the type
    if (generatedSequence.type !== preferredType) {
      console.warn(`AI generated ${generatedSequence.type} but ${preferredType} was requested. Correcting...`);
      generatedSequence.type = preferredType;
    }

    // For mixed sequences, validate we have both email and SMS
    if (preferredType === 'mixed' && generatedSequence.steps) {
      const hasEmail = generatedSequence.steps.some((s: any) => s.stepType === 'email');
      const hasSMS = generatedSequence.steps.some((s: any) => s.stepType === 'sms');
      
      if (!hasEmail || !hasSMS) {
        console.warn('Mixed sequence missing email or SMS steps. Using fallback...');
        throw new Error('Invalid mixed sequence structure');
      }
    }

    return NextResponse.json({
      ...generatedSequence,
      aiPrompt: prompt,
    });
  } catch (error) {
    console.error('Error generating sequence with AI:', error);
    
    // Fallback to template-based generation
    console.log(`Using fallback sequence generation for type: ${preferredType}`);
    const fallbackSequence = generateFallbackSequence(leadContext || {}, preferredType);
    
    return NextResponse.json(fallbackSequence);
  }
}

function generateFallbackSequence(leadContext: any, preferredType: string = 'email') {
  const firstName = leadContext.name?.split(' ')[0] || 'there';
  const interest = leadContext.interest || 'our services';
  const company = leadContext.company || 'your business';

  // Generate steps based on sequence type
  let steps: any[] = [];

  if (preferredType === 'email') {
    steps = [
      {
        order: 1,
        stepType: 'email',
        title: 'Welcome & Introduction',
        subject: `Thanks for your interest, ${firstName}!`,
        content: `Hi ${firstName},\n\nThank you for reaching out to CDM Suite! We're excited to help you achieve your digital marketing goals.\n\nI wanted to personally introduce myself and let you know that we've received your inquiry about ${interest}.\n\nTo better understand your needs, I'd love to schedule a quick 15-minute call this week. What day works best for you?\n\nLooking forward to connecting!\n\nBest regards,\nThe CDM Suite Team`,
        delayAmount: 0,
        delayUnit: 'hours',
        delayFrom: 'start',
        aiSuggested: true,
        aiReasoning: 'Initial contact to acknowledge interest and build rapport',
      },
      {
        order: 2,
        stepType: 'email',
        title: 'Value Proposition',
        subject: `Quick insight for ${company}`,
        content: `Hi ${firstName},\n\nI wanted to share a quick insight that could help you right away with ${interest}.\n\nHave you had a chance to think about that call we discussed? I have a few slots open this week if you'd like to chat.\n\nBest,\nThe CDM Suite Team`,
        delayAmount: 2,
        delayUnit: 'days',
        delayFrom: 'previous',
        aiSuggested: true,
        aiReasoning: 'Provide value before asking for commitment, with soft CTA',
      },
      {
        order: 3,
        stepType: 'email',
        title: 'Final Follow-up',
        subject: 'Checking in one last time',
        content: `Hi ${firstName},\n\nI wanted to reach out one more time to see if you're still interested in improving your ${interest}.\n\nIf now isn't the right time, no worries at all! Feel free to reach out whenever you're ready.\n\nBest,\nThe CDM Suite Team`,
        delayAmount: 4,
        delayUnit: 'days',
        delayFrom: 'previous',
        aiSuggested: true,
        aiReasoning: 'Respectful final touchpoint that keeps the door open',
      },
    ];
  } else if (preferredType === 'sms') {
    steps = [
      {
        order: 1,
        stepType: 'sms',
        title: 'Welcome SMS',
        content: `Hi ${firstName}! Thanks for reaching out to CDM Suite. We'd love to chat about ${interest}. When's a good time for a quick call? Reply YES if interested!`,
        delayAmount: 0,
        delayUnit: 'hours',
        delayFrom: 'start',
        aiSuggested: true,
        aiReasoning: 'Quick, friendly introduction with clear CTA',
      },
      {
        order: 2,
        stepType: 'sms',
        title: 'Quick Value',
        content: `Hey ${firstName}, quick tip: Most businesses see 40% more leads with professional digital marketing. Want to see how we can help ${company}? 📈`,
        delayAmount: 2,
        delayUnit: 'days',
        delayFrom: 'previous',
        aiSuggested: true,
        aiReasoning: 'Provide immediate value with statistics',
      },
      {
        order: 3,
        stepType: 'sms',
        title: 'Final Check-in',
        content: `Hi ${firstName}, just checking if you're still interested in ${interest}? No pressure - just reach out when ready! 👍`,
        delayAmount: 3,
        delayUnit: 'days',
        delayFrom: 'previous',
        aiSuggested: true,
        aiReasoning: 'Respectful final touchpoint',
      },
    ];
  } else if (preferredType === 'mixed') {
    steps = [
      {
        order: 1,
        stepType: 'email',
        title: 'Welcome Email',
        subject: `Thanks for your interest, ${firstName}!`,
        content: `Hi ${firstName},\n\nThank you for reaching out to CDM Suite! We're excited to help you achieve your digital marketing goals.\n\nI wanted to personally introduce myself and let you know that we've received your inquiry about ${interest}.\n\nI'll follow up with you shortly to schedule a quick call.\n\nBest regards,\nThe CDM Suite Team`,
        delayAmount: 0,
        delayUnit: 'hours',
        delayFrom: 'start',
        aiSuggested: true,
        aiReasoning: 'Initial detailed introduction via email',
      },
      {
        order: 2,
        stepType: 'sms',
        title: 'SMS Reminder',
        content: `Hi ${firstName}! Just sent you an email about ${interest}. Check your inbox and let me know if you have questions! 📧`,
        delayAmount: 4,
        delayUnit: 'hours',
        delayFrom: 'previous',
        aiSuggested: true,
        aiReasoning: 'Quick SMS to ensure they saw the email',
      },
      {
        order: 3,
        stepType: 'email',
        title: 'Value Proposition',
        subject: `Quick insight for ${company}`,
        content: `Hi ${firstName},\n\nI wanted to share some insights that could help ${company} with ${interest}.\n\n[Personalized value proposition based on their needs]\n\nWould you be available for a 15-minute call this week?\n\nBest,\nThe CDM Suite Team`,
        delayAmount: 2,
        delayUnit: 'days',
        delayFrom: 'previous',
        aiSuggested: true,
        aiReasoning: 'Detailed value proposition via email',
      },
      {
        order: 4,
        stepType: 'sms',
        title: 'Quick Follow-up',
        content: `Hey ${firstName}! Still interested in growing ${company}? Let's chat - reply YES and I'll call you this week! 🚀`,
        delayAmount: 3,
        delayUnit: 'days',
        delayFrom: 'previous',
        aiSuggested: true,
        aiReasoning: 'Urgent SMS follow-up with clear action',
      },
      {
        order: 5,
        stepType: 'email',
        title: 'Final Touchpoint',
        subject: 'Last check-in',
        content: `Hi ${firstName},\n\nI wanted to reach out one final time. If you're still interested in ${interest}, I'm here to help.\n\nIf now isn't the right time, feel free to reach out whenever you're ready.\n\nBest,\nThe CDM Suite Team`,
        delayAmount: 5,
        delayUnit: 'days',
        delayFrom: 'previous',
        aiSuggested: true,
        aiReasoning: 'Professional final email keeping the door open',
      },
    ];
  }

  return {
    name: `${preferredType === 'email' ? 'Email' : preferredType === 'sms' ? 'SMS' : 'Multi-Channel'} Nurture - ${company}`,
    description: `Automated ${preferredType} nurture sequence for ${firstName} interested in ${interest}`,
    type: preferredType,
    targetAudience: 'new_lead',
    steps,
    reasoning: `This ${preferredType} sequence follows a proven nurture pattern designed to engage leads through their preferred communication channels while respecting their time and attention.`,
  };
}

