
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateAllIntelligence } from '@/lib/bid-intelligence-generator';


export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bidProposalId = params.id;

    // Fetch bid proposal
    const bidProposal = await prisma.bidProposal.findUnique({
      where: { id: bidProposalId },
    });

    if (!bidProposal) {
      return NextResponse.json(
        { error: 'Bid proposal not found' },
        { status: 404 }
      );
    }

    // Check if user has access
    if (bidProposal.createdById !== session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (user?.role !== 'admin' && user?.role !== 'employee') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    console.log('Generating intelligence insights for bid:', bidProposalId);

    // Generate all intelligence insights
    const intelligence = await generateAllIntelligence(bidProposal as any);

    // Update bid proposal with intelligence
    const updatedBid = await prisma.bidProposal.update({
      where: { id: bidProposalId },
      data: {
        competitiveIntelligence: JSON.stringify(intelligence.competitiveIntelligence),
        winProbabilityScore: intelligence.winProbability.score,
        winProbabilityFactors: JSON.stringify(intelligence.winProbability),
        riskAssessment: JSON.stringify(intelligence.riskAssessment),
        outreachRecommendations: JSON.stringify(intelligence.outreachRecommendations),
        intelligenceGeneratedAt: new Date(),
        lastEditedById: session.user.id,
        lastEditedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Intelligence insights generated successfully',
      data: {
        competitiveIntelligence: intelligence.competitiveIntelligence,
        winProbability: intelligence.winProbability,
        riskAssessment: intelligence.riskAssessment,
        outreachRecommendations: intelligence.outreachRecommendations,
      },
    });
  } catch (error: any) {
    console.error('Error generating intelligence:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate intelligence insights' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bidProposalId = params.id;

    // Fetch bid proposal with intelligence
    const bidProposal = await prisma.bidProposal.findUnique({
      where: { id: bidProposalId },
      select: {
        id: true,
        competitiveIntelligence: true,
        winProbabilityScore: true,
        winProbabilityFactors: true,
        riskAssessment: true,
        outreachRecommendations: true,
        intelligenceGeneratedAt: true,
      },
    });

    if (!bidProposal) {
      return NextResponse.json(
        { error: 'Bid proposal not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const intelligence = {
      competitiveIntelligence: bidProposal.competitiveIntelligence 
        ? JSON.parse(bidProposal.competitiveIntelligence) 
        : null,
      winProbability: bidProposal.winProbabilityFactors
        ? JSON.parse(bidProposal.winProbabilityFactors)
        : null,
      riskAssessment: bidProposal.riskAssessment
        ? JSON.parse(bidProposal.riskAssessment)
        : null,
      outreachRecommendations: bidProposal.outreachRecommendations
        ? JSON.parse(bidProposal.outreachRecommendations)
        : null,
      intelligenceGeneratedAt: bidProposal.intelligenceGeneratedAt,
    };

    return NextResponse.json({
      success: true,
      data: intelligence,
    });
  } catch (error: any) {
    console.error('Error fetching intelligence:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch intelligence' },
      { status: 500 }
    );
  }
}
