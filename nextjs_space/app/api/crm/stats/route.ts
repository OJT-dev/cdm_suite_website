
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/crm/stats - Get CRM statistics
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { employeeProfile: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build where clause based on user role
    const where: any = {};
    if (user.role?.toLowerCase() !== 'admin' && user.employeeProfile) {
      where.assignedToId = user.employeeProfile.id;
    }

    // Get all leads
    const allLeads = await prisma.lead.findMany({ where });

    // Calculate stats
    const total = allLeads.length;
    
    const byStatus = allLeads.reduce(
      (acc: Record<string, number>, lead: any) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byPriority = allLeads.reduce(
      (acc: Record<string, number>, lead: any) => {
        acc[lead.priority] = (acc[lead.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const bySource = allLeads.reduce(
      (acc: Record<string, number>, lead: any) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalScore = allLeads.reduce(
      (sum: number, lead: any) => sum + lead.score,
      0
    );
    const avgScore = total > 0 ? totalScore / total : 0;

    const closedWon = byStatus['closed-won'] || 0;
    const totalClosed = (byStatus['closed-won'] || 0) + (byStatus['closed-lost'] || 0);
    const conversionRate = totalClosed > 0 ? (closedWon / totalClosed) * 100 : 0;

    // Get recent activities
    const recentActivities = await prisma.leadActivity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        lead: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        createdBy: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    const stats = {
      total,
      byStatus,
      byPriority,
      bySource,
      avgScore: Math.round(avgScore),
      conversionRate: Math.round(conversionRate),
      recentActivities
    };

    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    );
  }
}
