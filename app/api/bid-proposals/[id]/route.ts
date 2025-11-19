
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
export const runtime = 'edge';


// GET /api/bid-proposals/[id] - Get single bid proposal
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bidProposal = await prisma.bidProposal.findUnique({
      where: { id: params.id },
      include: {
        bidAttachments: true,
      },
    });

    if (!bidProposal) {
      return NextResponse.json({ error: 'Bid proposal not found' }, { status: 404 });
    }

    // Parse JSON fields
    const parsedProposal = {
      ...bidProposal,
      bidDocuments: bidProposal.bidDocuments ? JSON.parse(bidProposal.bidDocuments) : [],
      envelope1Documents: bidProposal.envelope1Documents ? JSON.parse(bidProposal.envelope1Documents) : [],
      envelope2Documents: bidProposal.envelope2Documents ? JSON.parse(bidProposal.envelope2Documents) : [],
      envelope2Pricing: bidProposal.envelope2Pricing ? JSON.parse(bidProposal.envelope2Pricing) : null,
      selectedServices: bidProposal.selectedServices ? JSON.parse(bidProposal.selectedServices) : [],
      generationMetadata: bidProposal.generationMetadata ? JSON.parse(bidProposal.generationMetadata) : null,
    };

    return NextResponse.json({ bidProposal: parsedProposal });
  } catch (error: any) {
    console.error('Error fetching bid proposal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bid proposal', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/bid-proposals/[id] - Update bid proposal
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updateData: any = {};

    // Basic fields
    const basicFields = [
      'title', 'description', 'issuingOrg', 'solicitationType', 'location',
      'contactName', 'contactEmail', 'contactPhone', 'bidUrl', 'referenceNumber',
      'envelope1Status', 'envelope2Status', 'submissionStatus',
      'envelope1Content', 'envelope1Notes', 'envelope2Content', 'envelope2Notes',
      'envelope1GenerationPrompt', 'envelope2GenerationPrompt', 'baseEmailProposal', 'aiModel',
    ];

    basicFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Date fields
    const dateFields = [
      'publicationDate', 'bidIntentDeadline', 'questionDeadline', 'closingDate',
      'envelope1SubmittedAt', 'envelope2SubmittedAt', 'fullySubmittedAt',
      'envelope1GeneratedAt', 'envelope2GeneratedAt',
    ];

    dateFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field] ? new Date(body[field]) : null;
      }
    });

    // JSON fields
    const jsonFields = [
      'bidDocuments', 'envelope1Documents', 'envelope2Documents',
      'envelope2Pricing', 'selectedServices', 'generationMetadata',
    ];

    jsonFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = JSON.stringify(body[field]);
      }
    });

    // Track last edit
    updateData.lastEditedById = session.user.id;
    updateData.lastEditedAt = new Date();

    const updatedProposal = await prisma.bidProposal.update({
      where: { id: params.id },
      data: updateData,
    });

    // Parse JSON fields for response
    const parsedProposal = {
      ...updatedProposal,
      bidDocuments: updatedProposal.bidDocuments ? JSON.parse(updatedProposal.bidDocuments) : [],
      envelope1Documents: updatedProposal.envelope1Documents ? JSON.parse(updatedProposal.envelope1Documents) : [],
      envelope2Documents: updatedProposal.envelope2Documents ? JSON.parse(updatedProposal.envelope2Documents) : [],
      envelope2Pricing: updatedProposal.envelope2Pricing ? JSON.parse(updatedProposal.envelope2Pricing) : null,
      selectedServices: updatedProposal.selectedServices ? JSON.parse(updatedProposal.selectedServices) : [],
      generationMetadata: updatedProposal.generationMetadata ? JSON.parse(updatedProposal.generationMetadata) : null,
    };

    return NextResponse.json({ bidProposal: parsedProposal });
  } catch (error: any) {
    console.error('Error updating bid proposal:', error);
    return NextResponse.json(
      { error: 'Failed to update bid proposal', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/bid-proposals/[id] - Delete bid proposal
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.bidProposal.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting bid proposal:', error);
    return NextResponse.json(
      { error: 'Failed to delete bid proposal', details: error.message },
      { status: 500 }
    );
  }
}
