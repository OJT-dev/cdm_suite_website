
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { uploadFile } from '@/lib/s3';
import { generateTechnicalProposal, generateCostProposal, generateProposalTitle, generateCoverPage } from '@/lib/bid-ai-generator';
import { BidDocument } from '@/lib/bid-proposal-types';


// GET /api/bid-proposals - List all bid proposals
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bidProposals = await prisma.bidProposal.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Parse JSON fields
    const parsedProposals = bidProposals.map((bp: any) => ({
      ...bp,
      bidDocuments: bp.bidDocuments ? JSON.parse(bp.bidDocuments) : [],
      envelope1Documents: bp.envelope1Documents ? JSON.parse(bp.envelope1Documents) : [],
      envelope2Documents: bp.envelope2Documents ? JSON.parse(bp.envelope2Documents) : [],
      envelope2Pricing: bp.envelope2Pricing ? JSON.parse(bp.envelope2Pricing) : null,
      selectedServices: bp.selectedServices ? JSON.parse(bp.selectedServices) : [],
      generationMetadata: bp.generationMetadata ? JSON.parse(bp.generationMetadata) : null,
    }));

    return NextResponse.json({ bidProposals: parsedProposals });
  } catch (error: any) {
    console.error('Error fetching bid proposals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bid proposals', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/bid-proposals - Create new bid proposal with file uploads and auto-generation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    
    // Extract text fields
    const solicitationNumber = formData.get('solicitationNumber') as string;
    const referenceNumber = formData.get('referenceNumber') as string;
    const bidUrl = formData.get('bidUrl') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const issuingOrg = formData.get('issuingOrg') as string;
    const solicitationType = formData.get('solicitationType') as string;
    const location = formData.get('location') as string;
    const publicationDate = formData.get('publicationDate') as string;
    const bidIntentDeadline = formData.get('bidIntentDeadline') as string;
    const questionDeadline = formData.get('questionDeadline') as string;
    const closingDate = formData.get('closingDate') as string;
    const contactName = formData.get('contactName') as string;
    const contactEmail = formData.get('contactEmail') as string;
    const contactPhone = formData.get('contactPhone') as string;
    const bidSource = (formData.get('bidSource') as string) || 'bidnetdirect';

    // Validate required fields
    if (!solicitationNumber || !title) {
      return NextResponse.json(
        { error: 'Solicitation number and title are required' },
        { status: 400 }
      );
    }

    // Handle bid documents upload
    const bidDocuments: BidDocument[] = [];
    const bidDocumentFiles = formData.getAll('bidDocuments');
    
    for (const file of bidDocumentFiles) {
      if (file instanceof File) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const key = await uploadFile(buffer, file.name, file.type);
        bidDocuments.push({
          id: crypto.randomUUID(),
          name: file.name,
          url: key,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        });
      }
    }

    // Handle email file upload
    let emailCorrespondence = null;
    const emailFile = formData.get('emailFile');
    if (emailFile instanceof File) {
      const buffer = Buffer.from(await emailFile.arrayBuffer());
      const key = await uploadFile(buffer, emailFile.name, emailFile.type);
      emailCorrespondence = JSON.stringify({
        id: crypto.randomUUID(),
        name: emailFile.name,
        url: key,
        size: emailFile.size,
        type: emailFile.type,
        uploadedAt: new Date().toISOString(),
      });
    }

    // Create bid proposal in database
    const bidProposal = await prisma.bidProposal.create({
      data: {
        bidSource,
        solicitationNumber,
        referenceNumber: referenceNumber || null,
        bidUrl: bidUrl || null,
        title,
        description: description || null,
        issuingOrg: issuingOrg || null,
        solicitationType: solicitationType || null,
        location: location || null,
        publicationDate: publicationDate ? new Date(publicationDate) : null,
        bidIntentDeadline: bidIntentDeadline ? new Date(bidIntentDeadline) : null,
        questionDeadline: questionDeadline ? new Date(questionDeadline) : null,
        closingDate: closingDate ? new Date(closingDate) : null,
        contactName: contactName || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        bidDocuments: JSON.stringify(bidDocuments),
        baseEmailProposal: emailCorrespondence,
        envelope1Status: 'in_progress',
        envelope2Status: 'in_progress',
        submissionStatus: 'not_submitted',
        createdById: session.user.id,
      },
    });

    // Auto-generate Technical and Cost Proposals in the background
    // We do this asynchronously so the user doesn't have to wait
    generateProposalsInBackground(bidProposal.id);

    // Parse JSON fields for response
    const parsedProposal = {
      ...bidProposal,
      bidDocuments: bidDocuments,
      envelope1Documents: [],
      envelope2Documents: [],
      envelope2Pricing: null,
      selectedServices: [],
      generationMetadata: null,
    };

    return NextResponse.json({ bidProposal: parsedProposal }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating bid proposal:', error);
    return NextResponse.json(
      { error: 'Failed to create bid proposal', details: error.message },
      { status: 500 }
    );
  }
}

// Background function to generate proposals
async function generateProposalsInBackground(bidProposalId: string) {
  try {
    // Fetch the bid proposal
    const bidProposal = await prisma.bidProposal.findUnique({
      where: { id: bidProposalId },
    });

    if (!bidProposal) {
      console.error('Bid proposal not found for auto-generation');
      return;
    }

    // Parse the bid proposal data
    const parsedBidProposal = {
      ...bidProposal,
      bidDocuments: bidProposal.bidDocuments ? JSON.parse(bidProposal.bidDocuments) : [],
      selectedServices: bidProposal.selectedServices ? JSON.parse(bidProposal.selectedServices) : [],
    };

    // Extract email content if available
    let emailContent = null;
    if (bidProposal.baseEmailProposal) {
      const emailDoc = JSON.parse(bidProposal.baseEmailProposal);
      emailContent = `Email from: ${emailDoc.name}`;
    }

    // Generate proposal title and cover page
    try {
      const proposalTitle = await generateProposalTitle(parsedBidProposal);
      const coverPageContent = await generateCoverPage({ ...parsedBidProposal, proposalTitle });
      
      await prisma.bidProposal.update({
        where: { id: bidProposalId },
        data: {
          proposalTitle,
          coverPageContent,
        },
      });
      console.log(`Generated title and cover page for bid proposal ${bidProposalId}`);
    } catch (error) {
      console.error('Error generating title/cover page:', error);
      // Continue with proposal generation even if title/cover fails
    }

    // Generate Technical Proposal (Envelope 1)
    const technicalResult = await generateTechnicalProposal({
      bidProposalId,
      envelopeType: 1,
      context: {
        bidDetails: parsedBidProposal as any,
        bidDocumentsContent: bidProposal.description || undefined,
        selectedServices: parsedBidProposal.selectedServices,
        baseEmailProposal: emailContent || undefined,
        customInstructions: 'Create a comprehensive and compelling technical proposal that showcases CDM Suite\'s expertise and capabilities.',
      },
    });

    if (technicalResult.success) {
      await prisma.bidProposal.update({
        where: { id: bidProposalId },
        data: {
          envelope1Content: technicalResult.content,
          envelope1Status: 'completed',
          envelope1GeneratedAt: new Date(),
          envelope1GenerationPrompt: 'Auto-generated on bid creation',
          aiModel: technicalResult.metadata?.model || 'gpt-4o',
          generationMetadata: JSON.stringify(technicalResult.metadata),
        },
      });
    }

    // Generate Cost Proposal (Envelope 2)
    const costResult = await generateCostProposal({
      bidProposalId,
      envelopeType: 2,
      context: {
        bidDetails: parsedBidProposal as any,
        bidDocumentsContent: bidProposal.description || undefined,
        selectedServices: parsedBidProposal.selectedServices,
        baseEmailProposal: emailContent || undefined,
        customInstructions: 'Create a detailed and competitive cost proposal with transparent pricing breakdown.',
      },
    });

    if (costResult.success) {
      await prisma.bidProposal.update({
        where: { id: bidProposalId },
        data: {
          envelope2Content: costResult.content,
          envelope2Status: 'completed',
          envelope2GeneratedAt: new Date(),
          envelope2GenerationPrompt: 'Auto-generated on bid creation',
        },
      });
    }

    console.log(`Auto-generation completed for bid proposal ${bidProposalId}`);
  } catch (error) {
    console.error('Error in background proposal generation:', error);
    // Update status to show generation failed
    await prisma.bidProposal.update({
      where: { id: bidProposalId },
      data: {
        envelope1Status: 'draft',
        envelope2Status: 'draft',
      },
    });
  }
}
