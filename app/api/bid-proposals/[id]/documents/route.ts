

/**
 * Bid Proposal Documents API
 * Manages document generation and retrieval for bid proposals
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateDocument } from '@/lib/bid-document-generator';
import { getDocumentType } from '@/lib/bid-document-types';

/**
 * GET /api/bid-proposals/[id]/documents
 * Get all documents for a bid proposal
 */
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
    });

    if (!bidProposal) {
      return NextResponse.json({ error: 'Bid proposal not found' }, { status: 404 });
    }

    // Get all documents for this bid
    const documents = await prisma.bidDocument.findMany({
      where: { bidProposalId: params.id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching bid documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bid-proposals/[id]/documents
 * Generate new documents for a bid proposal
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { documentTypes } = body; // Array of document types to generate

    if (!documentTypes || !Array.isArray(documentTypes) || documentTypes.length === 0) {
      return NextResponse.json(
        { error: 'Document types are required' },
        { status: 400 }
      );
    }

    const bidProposal = await prisma.bidProposal.findUnique({
      where: { id: params.id },
    });

    if (!bidProposal) {
      return NextResponse.json({ error: 'Bid proposal not found' }, { status: 404 });
    }

    // Create document records
    const documentPromises = documentTypes.map(async (docType: string) => {
      const typeInfo = getDocumentType(docType);
      if (!typeInfo) {
        throw new Error(`Invalid document type: ${docType}`);
      }

      // Check if document already exists
      const existing = await prisma.bidDocument.findFirst({
        where: {
          bidProposalId: params.id,
          documentType: docType,
        },
      });

      if (existing) {
        // Update status to regenerating
        return await prisma.bidDocument.update({
          where: { id: existing.id },
          data: {
            status: 'generating',
            errorMessage: null,
          },
        });
      }

      // Create new document record
      return await prisma.bidDocument.create({
        data: {
          bidProposalId: params.id,
          documentType: docType,
          title: typeInfo.title,
          status: 'generating',
        },
      });
    });

    const documents = await Promise.all(documentPromises);

    // Generate documents in background
    generateDocumentsInBackground(params.id, documentTypes, bidProposal).catch(err => {
      console.error('Background document generation error:', err);
    });

    return NextResponse.json({
      message: 'Document generation started',
      documents,
    });
  } catch (error) {
    console.error('Error starting document generation:', error);
    return NextResponse.json(
      { error: 'Failed to start document generation' },
      { status: 500 }
    );
  }
}

/**
 * Background document generation
 */
async function generateDocumentsInBackground(
  bidProposalId: string,
  documentTypes: string[],
  bidProposal: any
) {
  const { downloadFile } = await import('@/lib/s3');
  const { extractTextFromFile } = await import('@/lib/document-extractor');
  
  for (const docType of documentTypes) {
    try {
      // Extract content from existing uploaded files
      let extractedContent = bidProposal.envelope1Content || '';
      const existingDocs = bidProposal.bidDocuments ? JSON.parse(bidProposal.bidDocuments) : [];
      
      if (existingDocs.length > 0) {
        console.log(`Downloading and extracting ${existingDocs.length} existing file(s) for ${docType} generation...`);
        const extractedTexts: string[] = [];
        
        for (const doc of existingDocs) {
          try {
            // Download file from S3
            const fileBuffer = await downloadFile(doc.url);
            
            // Create a File object from the buffer for extraction
            const fileName = doc.name || 'document';
            const fileType = doc.type || 'application/octet-stream';
            const file = new File([fileBuffer], fileName, { type: fileType });
            
            // Extract text from document
            const extractedDoc = await extractTextFromFile(file);
            extractedTexts.push(extractedDoc.content);
            
            console.log(`✓ Extracted ${extractedDoc.content.length} characters from ${fileName}`);
          } catch (error: any) {
            console.error(`Failed to download/extract ${doc.name}:`, error);
            // Continue with other files even if one fails
          }
        }
        
        // Combine all extracted content
        if (extractedTexts.length > 0) {
          extractedContent = extractedTexts.join('\n\n---\n\n');
          console.log(`Total extracted content: ${extractedContent.length} characters`);
        }
      }

      // Build generation context
      const context = {
        bidProposal,
        extractedContent: extractedContent || undefined,
        adoptedBudgetData: bidProposal.adoptedBudgetData
          ? JSON.parse(bidProposal.adoptedBudgetData)
          : undefined,
        competitiveIntelligence: bidProposal.competitiveIntelligence || undefined,
      };

      // Generate document content
      const content = await generateDocument(docType, context);

      // Update document record
      await prisma.bidDocument.updateMany({
        where: {
          bidProposalId,
          documentType: docType,
        },
        data: {
          content,
          status: 'completed',
          generatedAt: new Date(),
          errorMessage: null,
        },
      });

      console.log(`✓ Generated ${docType} for bid ${bidProposalId}`);
    } catch (error) {
      console.error(`Error generating ${docType}:`, error);

      // Update document with error
      await prisma.bidDocument.updateMany({
        where: {
          bidProposalId,
          documentType: docType,
        },
        data: {
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  // Update bid proposal processing status
  await prisma.bidProposal.update({
    where: { id: bidProposalId },
    data: {
      processingCompletedAt: new Date(),
      processingStatus: 'idle',
    },
  });
}
