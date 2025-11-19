
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { deductCredits } from "@/lib/credits";
import { safeJSONParse } from "@/lib/json-helper";
export const runtime = 'edge';


const CREDITS_PER_MESSAGE = 1;
const FREE_TIER_DAILY_LIMIT = 10; // Free users get 10 messages per day

// Helper to check if it's a new day
function isNewDay(lastDate: Date | null): boolean {
  if (!lastDate) return true;
  const now = new Date();
  const last = new Date(lastDate);
  return (
    now.getDate() !== last.getDate() ||
    now.getMonth() !== last.getMonth() ||
    now.getFullYear() !== last.getFullYear()
  );
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admins and employees have unlimited access - skip all restrictions
    const isAdminOrEmployee = user.role === "admin" || user.role === "employee";

    if (!isAdminOrEmployee) {
      // Check usage limits based on tier
      const isFreeTier = user.tier === "free";

      if (isFreeTier) {
        // Check if we need to reset daily count
        if (isNewDay(user.lastMessageDate)) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              dailyMessageCount: 0,
              lastMessageDate: new Date(),
            },
          });
          user.dailyMessageCount = 0;
        }

        // Check if user has reached daily limit
        if (user.dailyMessageCount >= FREE_TIER_DAILY_LIMIT) {
          return NextResponse.json(
            {
              error: "Daily message limit reached",
              message: `You've reached your daily limit of ${FREE_TIER_DAILY_LIMIT} messages on the free plan. Upgrade to Starter or higher for unlimited AI assistant access!`,
              limit: FREE_TIER_DAILY_LIMIT,
              used: user.dailyMessageCount,
            },
            { status: 403 }
          );
        }
      }

      // Check if user has enough credits for project creation
      if (user.credits < CREDITS_PER_MESSAGE) {
        return NextResponse.json(
          { error: "Insufficient credits. Please upgrade your plan." },
          { status: 403 }
        );
      }
    }

    const { message, conversationId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get or create business context
    let businessContext = await prisma.businessContext.findUnique({
      where: { userId: user.id },
    });

    // Get or create conversation
    let conversation: any = null;
    if (conversationId) {
      conversation = await prisma.assistantConversation.findFirst({
        where: { id: conversationId, userId: user.id },
      });
    }

    const existingMessages = conversation
      ? JSON.parse(conversation.messages || "[]")
      : [];

    // Build system message with business context
    const services = safeJSONParse<string[]>(businessContext?.services, []);
    const goals = safeJSONParse<string[]>(businessContext?.goals, []);

    const systemMessage = {
      role: "system",
      content: `You are an AI business assistant for ${user.name || "the user"} helping them build and grow their business with CDM Suite. 

${businessContext ? `
Business Context:
- Business Name: ${businessContext.businessName || "Not set"}
- Industry: ${businessContext.industry || "Not set"}
- Services: ${services.join(", ") || "Not set"}
- Target Audience: ${businessContext.targetAudience || "Not set"}
- Goals: ${goals.join(", ") || "Not set"}
- Brand Voice: ${businessContext.brandVoice || "Professional and friendly"}

Key Insights: ${businessContext.keyInsights || "None yet"}
` : "The user hasn't set up their business context yet. Help them get started by asking about their business."}

You have access to the user's projects, analytics, and can help them:
- Create and optimize websites
- Develop marketing strategies
- Analyze performance
- Generate content
- Provide business advice
- Answer questions about CDM Suite features

Current user tier: ${user.tier}
Available credits: ${user.credits}

Be helpful, concise, and actionable. Remember previous context from the conversation.`,
    };

    const messages = [
      systemMessage,
      ...existingMessages,
      { role: "user", content: message },
    ];

    // Call LLM API with streaming
    const response = await fetch("https://apps.abacus.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: messages,
        stream: true,
        max_tokens: 2000,
      }),
    });

    // Stream response back to client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let fullResponse = "";

        try {
          while (true) {
            const { done, value } = await reader!.read();
            if (done) {
              // Save conversation and deduct credits
              const updatedMessages = [
                ...existingMessages,
                { role: "user", content: message },
                { role: "assistant", content: fullResponse },
              ];

              if (conversation) {
                await prisma.assistantConversation.update({
                  where: { id: conversation.id },
                  data: {
                    messages: JSON.stringify(updatedMessages),
                    lastMessageAt: new Date(),
                    creditsUsed: conversation.creditsUsed + CREDITS_PER_MESSAGE,
                  },
                });
              } else {
                conversation = await prisma.assistantConversation.create({
                  data: {
                    userId: user.id,
                    messages: JSON.stringify(updatedMessages),
                    context: businessContext
                      ? JSON.stringify(businessContext)
                      : null,
                    creditsUsed: CREDITS_PER_MESSAGE,
                  },
                });
              }

              // Deduct credits (admins and employees bypass deduction)
              await deductCredits(user.id, CREDITS_PER_MESSAGE, user.role);

              // Increment daily message count for free tier users (not for admins/employees)
              const isFreeTier = user.tier === "free";
              if (isFreeTier && !isAdminOrEmployee) {
                await prisma.user.update({
                  where: { id: user.id },
                  data: {
                    dailyMessageCount: { increment: 1 },
                    lastMessageDate: new Date(),
                  },
                });
              }

              // Send completion message with usage info
              const remaining = isFreeTier
                ? FREE_TIER_DAILY_LIMIT - (user.dailyMessageCount + 1)
                : null;

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "done",
                    conversationId: conversation.id,
                    remaining,
                    isFreeTier,
                  })}\n\n`
                )
              );
              break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || "";
                  if (content) {
                    fullResponse += content;
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ type: "content", content })}\n\n`
                      )
                    );
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Assistant chat error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
