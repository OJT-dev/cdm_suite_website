
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { deductCredits } from "@/lib/credits";

const CREDITS_PER_AUTOFILL = 2;

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admins and employees have unlimited access - skip credit check
    const isAdminOrEmployee = user.role === "admin" || user.role === "employee";

    if (!isAdminOrEmployee) {
      // Check if user has enough credits
      if (user.credits < CREDITS_PER_AUTOFILL) {
        return NextResponse.json(
          { error: "Insufficient credits. Please upgrade your plan." },
          { status: 403 }
        );
      }
    }

    const { prompt, formType } = await request.json();

    if (!prompt || !formType) {
      return NextResponse.json(
        { error: "Prompt and formType are required" },
        { status: 400 }
      );
    }

    let systemPrompt = "";
    if (formType === "business") {
      systemPrompt = `You are helping a user fill out a business information form. Based on their brief description, generate detailed and professional form data.

Generate a JSON response with this exact structure:
{
  "businessName": "Full business name",
  "industry": "Specific industry or niche",
  "services": "Service 1, Service 2, Service 3, Service 4",
  "targetAudience": "Detailed description of target audience",
  "goals": "Goal 1, Goal 2, Goal 3"
}

User's description: ${prompt}

Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`;
    }

    // Call LLM API
    const response = await fetch("https://apps.abacus.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: systemPrompt }],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    // Deduct credits (admins and employees bypass deduction)
    await deductCredits(user.id, CREDITS_PER_AUTOFILL, user.role);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Autofill error:", error);
    return NextResponse.json(
      { error: "Failed to generate form data" },
      { status: 500 }
    );
  }
}
