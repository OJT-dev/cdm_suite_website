
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildWebsiteGenerationPrompt } from "@/lib/builder/prompts";
import { getTemplate } from "@/lib/builder/templates";
import { downloadImagesForContent } from "@/lib/builder/image-generator";
import { validateWebsiteContent, autoFixContent } from "@/lib/builder/validation";


export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      businessName,
      industry,
      services,
      targetAudience,
      goals,
      templateId,
      existingWebsite,
      auditId
    } = body;

    // Validate required fields
    if (!businessName || !industry || !templateId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user has enough credits or if this is their first project
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true, tier: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Admins and employees have unlimited access - skip credit check
    const isAdminOrEmployee = user.role === "admin" || user.role === "employee";

    // Count user's existing projects
    const projectCount = await prisma.project.count({
      where: { userId: session.user.id }
    });

    const isFirstProject = projectCount === 0;

    // First project is free for everyone, admins/employees always have access, otherwise check credits
    if (!isAdminOrEmployee && !isFirstProject && user.credits < 1) {
      return NextResponse.json(
        { 
          error: "Insufficient credits",
          message: "You need at least 1 credit to create a website. Purchase credits or upgrade your plan to continue.",
          credits: user.credits,
          needsCredits: true
        },
        { status: 402 } // Payment Required
      );
    }

    // Get template details
    const template = getTemplate(templateId);
    if (!template) {
      return NextResponse.json({ error: "Invalid template" }, { status: 400 });
    }

    // Fetch audit insights if provided
    let auditInsights = null;
    if (auditId) {
      const audit = await prisma.websiteAudit.findUnique({
        where: { id: auditId }
      });
      if (audit) {
        auditInsights = {
          seoScore: audit.seoScore,
          performanceScore: audit.performanceScore,
          mobileScore: audit.mobileScore,
          securityScore: audit.securityScore,
          issues: JSON.parse(audit.issues),
          recommendations: JSON.parse(audit.recommendations)
        };
      }
    }

    // Build AI prompt
    const prompt = buildWebsiteGenerationPrompt({
      businessName,
      industry,
      services: Array.isArray(services) ? services : [services],
      targetAudience,
      goals: Array.isArray(goals) ? goals : [goals],
      template: template.name,
      existingWebsite,
      auditInsights
    });

    // Call AI API with streaming
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
            content: 'You are an expert website content generator. Create professional, SEO-optimized website content in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        stream: true,
        max_tokens: 6000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    // Stream the response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = '';
        let partialRead = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            partialRead += decoder.decode(value, { stream: true });
            let lines = partialRead.split('\n');
            partialRead = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  // Parse and save the complete result
                  try {
                    let websiteContent = JSON.parse(buffer);
                    
                    // Send progress update for validation
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ status: 'processing', message: 'Validating content...', progress: 90 })}\n\n`
                      )
                    );

                    // Validate and auto-fix content
                    const validationResult = validateWebsiteContent(websiteContent);
                    if (!validationResult.valid) {
                      console.warn('Content validation issues:', validationResult.errors);
                      // Auto-fix common issues
                      websiteContent = autoFixContent(websiteContent);
                    }
                    
                    if (validationResult.warnings.length > 0) {
                      console.warn('Content validation warnings:', validationResult.warnings);
                    }
                    
                    // Send progress update for image download
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ status: 'processing', message: 'Downloading images...', progress: 95 })}\n\n`
                      )
                    );

                    // Download all images for the content
                    const contentWithImages = await downloadImagesForContent(websiteContent);
                    
                    // Generate unique subdomain
                    const subdomain = businessName
                      .toLowerCase()
                      .replace(/[^a-z0-9]/g, '-')
                      .replace(/-+/g, '-')
                      .replace(/^-|-$/g, '')
                      .substring(0, 30) + '-' + Date.now().toString(36).slice(-4);

                    // Create project in database and deduct credit in a transaction (only if not first project and not admin/employee)
                    const transactionOperations: any[] = [
                      prisma.project.create({
                        data: {
                          userId: session.user.id,
                          name: businessName,
                          type: 'website',
                          status: 'draft',
                          subdomain,
                          template: templateId,
                          aiPrompt: prompt,
                          businessData: JSON.stringify({
                            businessName,
                            industry,
                            services,
                            targetAudience,
                            goals
                          }),
                          pages: JSON.stringify(contentWithImages.pages || []),
                          siteConfig: JSON.stringify({
                            siteName: contentWithImages.siteName,
                            tagline: contentWithImages.tagline,
                            contact: contentWithImages.contact,
                            seo: contentWithImages.seo,
                            colors: template.colors
                          }),
                          auditId: auditId || null
                        }
                      })
                    ];

                    // Only deduct credit if not the first project and not an admin/employee
                    if (!isFirstProject && !isAdminOrEmployee) {
                      transactionOperations.push(
                        prisma.user.update({
                          where: { id: session.user.id },
                          data: { credits: { decrement: 1 } }
                        })
                      );
                    }

                    const [project] = await prisma.$transaction(transactionOperations);

                    const finalData = JSON.stringify({
                      status: 'completed',
                      result: {
                        projectId: project.id,
                        subdomain: project.subdomain,
                        content: contentWithImages
                      }
                    });

                    controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
                  } catch (e) {
                    console.error('Error parsing AI response:', e);
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ status: 'error', message: 'Failed to parse AI response' })}\n\n`
                      )
                    );
                  }
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  buffer += parsed.choices?.[0]?.delta?.content || '';
                  
                  // Send progress updates
                  const progressData = JSON.stringify({
                    status: 'processing',
                    message: 'Generating your website...',
                    progress: Math.min(Math.floor((buffer.length / 3000) * 100), 99)
                  });
                  controller.enqueue(encoder.encode(`data: ${progressData}\n\n`));
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ status: 'error', message: 'Generation failed' })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("Website generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate website" },
      { status: 500 }
    );
  }
}
