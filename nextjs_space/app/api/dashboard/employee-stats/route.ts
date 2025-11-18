
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = user.role?.toUpperCase();
    if (userRole !== "ADMIN" && userRole !== "EMPLOYEE") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get employee stats - show ALL leads/proposals to all employees
    // No filtering by assignedToId - employees can see everything
    const [
      totalLeads,
      newLeads,
      contactedLeads,
      qualifiedLeads,
      totalProposals,
      draftProposals,
      sentProposals,
      activeSequences,
      recentActivities,
      proposalsValue,
      conversionRate
    ] = await Promise.all([
      // Total leads
      prisma.lead.count(),
      // New leads (created in last 7 days)
      prisma.lead.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Contacted leads
      prisma.lead.count({
        where: {
          status: "contacted",
        },
      }),
      // Qualified leads
      prisma.lead.count({
        where: {
          status: "qualified",
        },
      }),
      // Total proposals
      prisma.proposal.count(),
      // Draft proposals
      prisma.proposal.count({
        where: { status: "draft" },
      }),
      // Sent proposals
      prisma.proposal.count({
        where: { status: "sent" },
      }),
      // Active sequences
      prisma.sequence.count({
        where: { status: "active" },
      }),
      // Recent activities (last 10)
      prisma.leadActivity.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          lead: {
            select: { name: true, email: true },
          },
        },
      }),
      // Proposals total value (ALL proposals including drafts)
      prisma.proposal.aggregate({
        _sum: { total: true },
      }),
      // Conversion rate (accepted / sent)
      prisma.proposal.count({
        where: { status: "accepted" },
      }),
    ]);

    // Calculate conversion rate
    const acceptedProposals = conversionRate;
    const rate = sentProposals > 0 
      ? ((acceptedProposals / (sentProposals + acceptedProposals)) * 100).toFixed(1)
      : "0";

    return NextResponse.json({
      leads: {
        total: totalLeads,
        new: newLeads,
        contacted: contactedLeads,
        qualified: qualifiedLeads,
      },
      proposals: {
        total: totalProposals,
        draft: draftProposals,
        sent: sentProposals,
        accepted: acceptedProposals,
        totalValue: proposalsValue._sum.total || 0,
        conversionRate: rate,
      },
      sequences: {
        active: activeSequences,
      },
      recentActivities: recentActivities.map((activity: any) => ({
        id: activity.id,
        leadId: activity.leadId,
        type: activity.type,
        notes: activity.description || activity.title || "",
        createdAt: activity.createdAt,
        leadName: activity.lead?.name || "Unknown",
        leadEmail: activity.lead?.email || "",
      })),
    });
  } catch (error) {
    console.error("Error fetching employee stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
