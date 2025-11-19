
import { NextRequest, NextResponse } from 'next/server';
import { getRelevantBlogContext } from '@/lib/blog-knowledge';

export async function POST(request: NextRequest) {
  try {
    const { messages, sessionId } = await request.json();
    
    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage.content;

    // Get relevant blog content
    const blogContext = await getRelevantBlogContext(userQuery);

    // Enhanced system prompt with blog knowledge
    const systemPrompt = `You are a helpful marketing assistant for CDM Suite, a full-service digital marketing agency. 

Your role is to:
1. Answer questions about digital marketing, SEO, web design, social media, and advertising
2. Help users understand our services and pricing
3. Guide users to relevant resources and blog articles
4. Capture leads by suggesting our free marketing assessment or consultation

Available services:
- Website Design & Development
- SEO & Content Marketing
- Social Media Management
- Paid Advertising (Google Ads, Meta Ads)
- Mobile App Development
- Marketing Automation

Key features:
- Free 3-minute marketing assessment at /marketing-assessment
- Free strategy consultation at /contact
- Comprehensive blog with marketing insights at /blog

${blogContext}

Be conversational, helpful, and focus on providing value. If you reference blog articles, encourage users to read them for more details.`;

    // Call LLM API (using Abacus AI)
    const apiKey = process.env.ABACUSAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        model: 'gpt-4.1-mini',
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLM API error:', errorText);
      throw new Error('Failed to get AI response');
    }

    // Stream the response back to the client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let fullMessage = '';

        try {
          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  // Save conversation to database
                  try {
                    const { prisma } = await import('@/lib/db');
                    const existingConversation = await prisma.chatConversation.findUnique({
                      where: { sessionId },
                    });

                    if (existingConversation) {
                      const updatedMessages = JSON.parse(existingConversation.messages);
                      updatedMessages.push(
                        { role: 'user', content: userQuery },
                        { role: 'assistant', content: fullMessage }
                      );

                      await prisma.chatConversation.update({
                        where: { sessionId },
                        data: {
                          messages: JSON.stringify(updatedMessages),
                        },
                      });
                    } else {
                      await prisma.chatConversation.create({
                        data: {
                          sessionId,
                          messages: JSON.stringify([
                            { role: 'user', content: userQuery },
                            { role: 'assistant', content: fullMessage },
                          ]),
                        },
                      });
                    }
                  } catch (dbError) {
                    console.error('Error saving conversation:', dbError);
                  }
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullMessage += content;
                    controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
