
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateTechnicalProposal, generateCostProposal } from '@/lib/bid-ai-generator';
import { AIGenerationRequest } from '@/lib/bid-proposal-types';
export const runtime = 'edge';


// POST /api/bid-proposals/[id]/generate - Generate proposal content using AI
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let envelopeType: number | null = null;
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { envelopeType: bodyEnvelopeType, customInstructions, bidDocumentsContent, selectedServices, baseEmailProposal } = body;
    envelopeType = bodyEnvelopeType;

    if (envelopeType !== 1 && envelopeType !== 2) {
      return NextResponse.json(
        { error: 'Invalid envelope type. Must be 1 or 2' },
        { status: 400 }
      );
    }

    // Fetch bid proposal
    const bidProposal = await prisma.bidProposal.findUnique({
      where: { id: params.id },
    });

    if (!bidProposal) {
      return NextResponse.json({ error: 'Bid proposal not found' }, { status: 404 });
    }

    // Parse JSON fields
    const parsedProposal: any = {
      ...bidProposal,
      bidDocuments: bidProposal.bidDocuments ? JSON.parse(bidProposal.bidDocuments) : [],
      envelope1Documents: bidProposal.envelope1Documents ? JSON.parse(bidProposal.envelope1Documents) : [],
      envelope2Documents: bidProposal.envelope2Documents ? JSON.parse(bidProposal.envelope2Documents) : [],
      envelope2Pricing: bidProposal.envelope2Pricing ? JSON.parse(bidProposal.envelope2Pricing) : null,
      selectedServices: bidProposal.selectedServices ? JSON.parse(bidProposal.selectedServices) : [],
      generationMetadata: bidProposal.generationMetadata ? JSON.parse(bidProposal.generationMetadata) : null,
      adoptedBudgetData: bidProposal.adoptedBudgetData ? JSON.parse(bidProposal.adoptedBudgetData) : null,
    };

    // Update processing status: starting generation
    await prisma.bidProposal.update({
      where: { id: params.id },
      data: {
        processingStatus: 'generating',
        processingStage: 'generating_proposal',
        processingProgress: 50,
        processingMessage: envelopeType === 1 
          ? 'Generating technical proposal with AI...' 
          : 'Generating cost proposal with AI...',
        processingError: null,
        processingStartedAt: new Date(),
      },
    });

    // Prepare AI generation request
    const aiRequest: AIGenerationRequest = {
      bidProposalId: params.id,
      envelopeType,
      context: {
        bidDetails: parsedProposal,
        bidDocumentsContent,
        selectedServices: selectedServices || parsedProposal.selectedServices,
        baseEmailProposal: baseEmailProposal || parsedProposal.baseEmailProposal,
        customInstructions,
      },
    };

    // Generate content
    const result = envelopeType === 1
      ? await generateTechnicalProposal(aiRequest)
      : await generateCostProposal(aiRequest);

    if (!result.success) {
      // Reset the envelope status to 'draft' on failure so UI doesn't hang
      const statusField = envelopeType === 1 ? 'envelope1Status' : 'envelope2Status';
      await prisma.bidProposal.update({
        where: { id: params.id },
        data: {
          [statusField]: 'draft',
          processingStatus: 'error',
          processingStage: null,
          processingProgress: 100,
          processingMessage: envelopeType === 1 
            ? 'Technical proposal generation failed'
            : 'Cost proposal generation failed',
          processingError: result.error || 'Failed to generate proposal',
          processingCompletedAt: new Date(),
        },
      });
      
      return NextResponse.json(
        { error: result.error || 'Failed to generate proposal' },
        { status: 500 }
      );
    }

    // Update bid proposal with generated content
    const updateData: any = {};
    
    if (envelopeType === 1) {
      updateData.envelope1Content = result.content;
      updateData.envelope1GeneratedAt = new Date();
      updateData.envelope1Status = 'completed';
      if (customInstructions) {
        updateData.envelope1GenerationPrompt = customInstructions;
      }
    } else {
      updateData.envelope2Content = result.content;
      updateData.envelope2GeneratedAt = new Date();
      updateData.envelope2Status = 'completed';
      if (customInstructions) {
        updateData.envelope2GenerationPrompt = customInstructions;
      }
      
      // Save pricing information from cost proposal
      if (result.pricing) {
        updateData.proposedPrice = result.pricing.proposedPrice;
        updateData.priceSource = result.pricing.priceSource;
        updateData.pricingNotes = result.pricing.pricingNotes || null;
      }
      
      // Save adopted budget data for government/enterprise clients
      if (result.adoptedBudgetData) {
        updateData.adoptedBudgetData = JSON.stringify(result.adoptedBudgetData);
        updateData.adoptedBudgetAnalyzedAt = new Date();
      }
    }

    if (result.metadata) {
      updateData.aiModel = result.metadata.model;
      const existingMetadata = parsedProposal.generationMetadata || {};
      const envelopeKey = envelopeType === 1 ? 'envelope1' : 'envelope2';
      updateData.generationMetadata = JSON.stringify({
        ...existingMetadata,
        [envelopeKey]: result.metadata,
      });
    }

    if (selectedServices) {
      updateData.selectedServices = JSON.stringify(selectedServices);
    }

    if (baseEmailProposal) {
      updateData.baseEmailProposal = baseEmailProposal;
    }

    updateData.lastEditedById = session.user.id;
    updateData.lastEditedAt = new Date();
    
    // Update processing status: completed
    updateData.processingStatus = 'completed';
    updateData.processingStage = 'finalizing';
    updateData.processingProgress = 100;
    updateData.processingMessage = envelopeType === 1 
      ? 'Technical proposal generated successfully!'
      : 'Cost proposal generated successfully!';
    updateData.processingError = null;
    updateData.processingCompletedAt = new Date();

    const updatedProposal = await prisma.bidProposal.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      content: result.content,
      metadata: result.metadata,
      pricing: result.pricing, // Include pricing information in response
    });
  } catch (error: any) {
    console.error('Error generating proposal:', error);
    
    // Try to reset the envelope status on error to prevent hanging UI
    if (envelopeType === 1 || envelopeType === 2) {
      try {
        const statusField = envelopeType === 1 ? 'envelope1Status' : 'envelope2Status';
        await prisma.bidProposal.update({
          where: { id: params.id },
          data: {
            [statusField]: 'draft',
            processingStatus: 'error',
            processingStage: null,
            processingProgress: 100,
            processingMessage: 'An unexpected error occurred during proposal generation',
            processingError: error.message || 'Unknown error',
            processingCompletedAt: new Date(),
          },
        });
        console.log(`Reset ${statusField} to 'draft' after error`);
      } catch (resetError) {
        console.error('Error resetting envelope status:', resetError);
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to generate proposal', details: error.message },
      { status: 500 }
    );
  }
}
