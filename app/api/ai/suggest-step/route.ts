
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';


// POST /api/ai/suggest-step - Suggest next step using AI
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sequenceId, currentSteps, leadContext } = await request.json();

    const lastStep = currentSteps[currentSteps.length - 1];
    const stepCount = currentSteps.length;

    const prompt = `
Given the following email sequence and lead context, suggest the next step:

Current Sequence Steps:
${currentSteps.map((s: any, i: number) => `${i + 1}. ${s.stepType}: ${s.title}`).join('\n')}

Lead Context:
- Interest: ${leadContext.interest || 'Not specified'}
- Budget: ${leadContext.budget || 'Not specified'}
- Timeline: ${leadContext.timeline || 'Not specified'}
- Source: ${leadContext.source || 'Unknown'}

Suggest the next step that would:
1. Maintain engagement without being pushy
2. Provide additional value
3. Move the lead closer to conversion
4. Feel natural in the sequence flow

Return a JSON object with the following structure:
{
  "stepType": "email",
  "title": "Step title",
  "subject": "Email subject (if email)",
  "content": "Step content",
  "delayAmount": 2,
  "delayUnit": "days",
  "delayFrom": "previous",
  "aiReasoning": "Why this step makes sense"
}
    `.trim();

    const response = await fetch('https://api.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert email marketing strategist. Suggest the next best step in a lead nurture sequence. Always return valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error('AI suggestion failed');
    }

    const aiResponse = await response.json();
    const suggestedStep = JSON.parse(aiResponse.choices[0].message.content);

    return NextResponse.json({
      ...suggestedStep,
      order: stepCount + 1,
      aiSuggested: true,
    });
  } catch (error) {
    console.error('Error suggesting step:', error);
    
    // Fallback suggestion
    const { currentSteps } = await request.json();
    const stepCount = currentSteps.length;
    
    return NextResponse.json({
      order: stepCount + 1,
      stepType: 'email',
      title: 'Follow-up Email',
      subject: 'Still interested?',
      content: 'Hi {{firstName}},\n\nI wanted to check in and see if you had any questions about {{serviceType}}.\n\nFeel free to reply if you\'d like to chat!\n\nBest,\n{{assignedTo}}',
      delayAmount: 3,
      delayUnit: 'days',
      delayFrom: 'previous',
      aiSuggested: true,
      aiReasoning: 'Simple follow-up to maintain engagement',
    });
  }
}

