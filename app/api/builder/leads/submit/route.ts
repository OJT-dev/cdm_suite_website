
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";


export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, company, message, subdomain, pageSlug } = await request.json();

    if (!email || !subdomain) {
      return NextResponse.json(
        { error: "Email and subdomain are required" },
        { status: 400 }
      );
    }

    // Find the project by subdomain
    const project = await prisma.project.findFirst({
      where: { subdomain },
      select: { id: true, userId: true, name: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Website not found" },
        { status: 404 }
      );
    }

    // Create lead in CRM
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        company,
        notes: message,
        source: `website-${subdomain}`,
        interest: `Contact form submission from ${pageSlug || 'contact'} page`,
        status: "new",
        priority: "medium",
        score: 50, // Default score for website leads
        customFields: JSON.stringify({
          subdomain,
          projectId: project.id,
          projectName: project.name,
          pageSlug: pageSlug || 'contact',
          submittedAt: new Date().toISOString(),
        }),
        tags: JSON.stringify(["website-lead", subdomain]),
      },
    });

    // Create lead activity
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: "form_submission",
        title: "Contact Form Submitted",
        description: `Lead submitted contact form on ${project.name} website`,
        metadata: JSON.stringify({
          subdomain,
          pageSlug,
          formData: { name, email, phone, company, message },
        }),
      },
    });

    // Update project lead count
    await prisma.project.update({
      where: { id: project.id },
      data: { leads: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you! We'll be in touch soon.",
      leadId: lead.id,
    });
  } catch (error) {
    console.error("Lead submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit form. Please try again." },
      { status: 500 }
    );
  }
}
