
// AI-powered content improvement utilities

export interface ContentImprovementRequest {
  content: string;
  action: 'shorten' | 'professional' | 'casual' | 'formal' | 'friendly' | 'authoritative' | 'grammar' | 'expand' | 'simplify';
  context?: string;
}

export async function improveContent(request: ContentImprovementRequest): Promise<string> {
  const { content, action, context } = request;

  const prompts: Record<string, string> = {
    shorten: `Make this text shorter and more concise while keeping the key message:\n\n"${content}"`,
    professional: `Rewrite this text in a more professional tone:\n\n"${content}"`,
    casual: `Rewrite this text in a more casual, friendly tone:\n\n"${content}"`,
    formal: `Rewrite this text in a formal, authoritative tone:\n\n"${content}"`,
    friendly: `Rewrite this text in a warm, friendly, approachable tone:\n\n"${content}"`,
    authoritative: `Rewrite this text to sound more authoritative and confident:\n\n"${content}"`,
    grammar: `Fix any grammar, spelling, and punctuation errors in this text:\n\n"${content}"`,
    expand: `Expand this text with more details and examples:\n\n"${content}"`,
    simplify: `Simplify this text to make it easier to understand:\n\n"${content}"`,
  };

  const prompt = prompts[action] || prompts.professional;
  const fullPrompt = context 
    ? `${context}\n\n${prompt}\n\nRespond with ONLY the improved text, no explanations.`
    : `${prompt}\n\nRespond with ONLY the improved text, no explanations.`;

  try {
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content editor. Improve the given text according to the specified action. Return only the improved text without any explanations or additional commentary.'
          },
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const improvedText = data.choices?.[0]?.message?.content || content;
    
    // Clean up response - remove quotes if AI added them
    return improvedText.replace(/^["']|["']$/g, '').trim();
  } catch (error) {
    console.error('Content improvement error:', error);
    return content; // Return original on error
  }
}

// Batch improve multiple content pieces
export async function batchImproveContent(
  requests: ContentImprovementRequest[]
): Promise<string[]> {
  const results = await Promise.all(
    requests.map(request => improveContent(request))
  );
  return results;
}
