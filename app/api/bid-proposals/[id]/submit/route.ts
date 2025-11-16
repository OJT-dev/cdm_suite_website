
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { envelopeType, submissionNotes } = await request.json();

    if (!envelopeType || (envelopeType !== 1 && envelopeType !== 2 && envelopeType !== 'both')) {
      return NextResponse.json(
        { error: 'Invalid envelope type. Must be 1, 2, or "both"' },
        { status: 400 }
      );
    }

    // Fetch bid proposal
    const bid = await prisma.bidProposal.findUnique({
      where: { id: params.id }
    });

    if (!bid) {
      return NextResponse.json({ error: 'Bid proposal not found' }, { status: 404 });
    }

    // Determine new submission status
    let newSubmissionStatus = bid.submissionStatus;
    const updateData: any = {
      lastEditedById: session.user.id,
      lastEditedAt: new Date(),
    };

    if (envelopeType === 'both') {
      // Mark both as submitted
      if (!bid.envelope1Content || !bid.envelope2Content) {
        return NextResponse.json(
          { error: 'Both proposals must be generated before marking as fully submitted' },
          { status: 400 }
        );
      }
      newSubmissionStatus = 'fully_submitted';
      updateData.envelope1SubmittedAt = new Date();
      updateData.envelope2SubmittedAt = new Date();
    } else if (envelopeType === 1) {
      // Mark envelope 1 as submitted
      if (!bid.envelope1Content) {
        return NextResponse.json(
          { error: 'Technical Proposal must be generated before submission' },
          { status: 400 }
        );
      }
      updateData.envelope1SubmittedAt = new Date();
      
      // Update submission status
      if (bid.envelope2SubmittedAt) {
        newSubmissionStatus = 'fully_submitted';
      } else {
        newSubmissionStatus = 'envelope1_submitted';
      }
    } else if (envelopeType === 2) {
      // Mark envelope 2 as submitted
      if (!bid.envelope2Content) {
        return NextResponse.json(
          { error: 'Cost Proposal must be generated before submission' },
          { status: 400 }
        );
      }
      updateData.envelope2SubmittedAt = new Date();
      
      // Update submission status
      if (bid.envelope1SubmittedAt) {
        newSubmissionStatus = 'fully_submitted';
      } else {
        newSubmissionStatus = 'envelope2_submitted';
      }
    }

    updateData.submissionStatus = newSubmissionStatus;

    // Add submission notes if provided
    if (submissionNotes) {
      const currentNotes = bid.envelope1Notes || '';
      updateData.envelope1Notes = currentNotes 
        ? `${currentNotes}\n\n[Submission Notes - ${new Date().toLocaleString()}]\n${submissionNotes}`
        : `[Submission Notes - ${new Date().toLocaleString()}]\n${submissionNotes}`;
    }

    // Update the bid proposal
    await prisma.bidProposal.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Submission status updated successfully',
      submissionStatus: newSubmissionStatus,
    });
  } catch (error) {
    console.error('Error updating submission status:', error);
    return NextResponse.json(
      { error: 'Failed to update submission status' },
      { status: 500 }
    );
  }
}
