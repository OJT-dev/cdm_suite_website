export const runtime = 'edge';


export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30'; // days
    
    const daysAgo = parseInt(timeRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get all bids for the user
    const allBids = await prisma.bidProposal.findMany({
      where: {
        createdById: session.user.id,
        createdAt: { gte: startDate }
      },
      select: {
        id: true,
        submissionStatus: true,
        envelope1Status: true,
        envelope2Status: true,
        closingDate: true,
        proposedPrice: true,
        createdAt: true
      }
    });

    // Calculate statistics
    const totalBids = allBids.length;
    const submittedBids = allBids.filter((b: any) => b.submissionStatus === 'fully_submitted').length;
    const pendingBids = allBids.filter((b: any) => b.submissionStatus === 'not_submitted').length;
    const partiallySubmitted = allBids.filter((b: any) =>
      b.submissionStatus === 'envelope1_submitted' || b.submissionStatus === 'envelope2_submitted'
    ).length;

    // Calculate total proposed value
    const totalProposedValue = allBids.reduce((sum: number, bid: any) =>
      sum + (bid.proposedPrice || 0), 0
    );

    // Count by status
    const technicalCompleted = allBids.filter((b: any) => b.envelope1Status === 'completed').length;
    const costCompleted = allBids.filter((b: any) => b.envelope2Status === 'completed').length;

    // Calculate win rate (would need additional field in schema for actual wins)
    // For now, we'll use fully_submitted as a proxy
    const submissionRate = totalBids > 0 ? (submittedBids / totalBids) * 100 : 0;

    // Get upcoming deadlines
    const now = new Date();
    const upcomingBids = allBids.filter((b: any) =>
      b.closingDate && new Date(b.closingDate) > now &&
      b.submissionStatus !== 'fully_submitted'
    ).length;

    // Monthly trend
    const monthlyData: { [key: string]: number } = {};
    allBids.forEach((bid: any) => {
      const month = bid.createdAt.toISOString().substring(0, 7); // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    return NextResponse.json({
      summary: {
        totalBids,
        submittedBids,
        pendingBids,
        partiallySubmitted,
        totalProposedValue,
        submissionRate: Math.round(submissionRate * 10) / 10,
        upcomingBids
      },
      envelopeCompletion: {
        technicalCompleted,
        costCompleted,
        bothCompleted: Math.min(technicalCompleted, costCompleted)
      },
      monthlyTrend: Object.entries(monthlyData).map(([month, count]) => ({
        month,
        count
      })).sort((a, b) => a.month.localeCompare(b.month))
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
