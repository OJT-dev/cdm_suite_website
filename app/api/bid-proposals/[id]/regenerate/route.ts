
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma as db } from '@/lib/db';
import { uploadFile, downloadFile } from '@/lib/s3';
import { 
  extractBidInformationFromDocuments, 
  generateTechnicalProposal, 
  generateCostProposal,
  extractPricingFromEmail,
  generateFollowUpEmail
} from '@/lib/bid-ai-generator';
import { AIGenerationRequest } from '@/lib/bid-proposal-types';
import { extractTextFromFile, categorizeDocuments } from '@/lib/document-extractor';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bidId = params.id;

    // Get existing bid proposal
    const existingBid = await db.bidProposal.findUnique({
      where: { id: bidId },
    });

    if (!existingBid) {
      return NextResponse.json({ error: 'Bid proposal not found' }, { status: 404 });
    }

    // Parse existing documents
    const existingDocuments = existingBid.bidDocuments ? JSON.parse(existingBid.bidDocuments) : [];
    const existingEmail = existingBid.preliminaryEmail ? JSON.parse(existingBid.preliminaryEmail) : null;

    const formData = await req.formData();
    const newFiles = formData.getAll('files') as File[];
    const regenerateNotes = formData.get('notes') as string | null;

    console.log(`Regenerating bid ${bidId} with ${newFiles.length} new files${regenerateNotes ? ' and custom notes' : ''}...`);
    if (regenerateNotes) {
      console.log(`User instructions: ${regenerateNotes}`);
    }

    // Step 1: Extract text from new files
    const newExtractedDocs = newFiles.length > 0 
      ? await Promise.all(newFiles.map(file => extractTextFromFile(file)))
      : [];

    // Step 1.5: If no new files, download and extract existing files
    let existingExtractedDocs: any[] = [];
    if (newFiles.length === 0 && existingDocuments.length > 0) {
      console.log(`No new files uploaded. Extracting ${existingDocuments.length} existing file(s)...`);
      
      for (const doc of existingDocuments) {
        try {
          // Download file from S3
          const fileBuffer = await downloadFile(doc.url);
          
          // Create a File object from the buffer for extraction
          const fileName = doc.name || 'document';
          const fileType = doc.type || 'application/octet-stream';
          const file = new File([fileBuffer], fileName, { type: fileType });
          
          // Extract text from document
          const extractedDoc = await extractTextFromFile(file);
          existingExtractedDocs.push(extractedDoc);
          
          console.log(`✓ Extracted ${extractedDoc.content.length} characters from ${fileName}`);
        } catch (error: any) {
          console.error(`Failed to download/extract ${doc.name}:`, error);
          // Continue with other files even if one fails
        }
      }
    }

    // Combine new and existing extracted docs
    const allExtractedDocs = [...newExtractedDocs, ...existingExtractedDocs];

    // Categorize all documents
    const { rfpDocuments: newRfpDocs, emailDocuments: newEmailDocs } = categorizeDocuments(allExtractedDocs);

    console.log(`Found ${newRfpDocs.length} RFP documents and ${newEmailDocs.length} email documents (${newFiles.length} new, ${existingExtractedDocs.length} existing)`);

    // Step 2: Upload new files to S3
    const uploadedDocuments = [...existingDocuments];
    let preliminaryEmailData = existingEmail;

    for (const file of newFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `bid-documents/${Date.now()}-${file.name}`;
      const s3Key = await uploadFile(buffer, fileName, file.type || 'application/octet-stream');
      
      const extractedDoc = newExtractedDocs.find(doc => doc.name === file.name);
      const isEmail = extractedDoc?.type === 'email' || file.name.toLowerCase().includes('email');
      
      if (isEmail) {
        // Update or set preliminary email (keep the most recent one)
        preliminaryEmailData = {
          name: file.name,
          url: s3Key,
          size: file.size,
          content: extractedDoc?.content || '',
        };
      } else {
        // Add to regular documents
        uploadedDocuments.push({
          name: file.name,
          url: s3Key,
          size: file.size,
          type: extractedDoc?.type || 'unknown',
        });
      }
    }

    console.log('New files uploaded to S3. Re-extracting bid information with AI...');

    // Step 3: Re-extract information from ALL documents (old + new)
    // Combine all RFP document contents
    const allDocumentContents = newRfpDocs.map(doc => ({
      name: doc.name,
      content: doc.content,
    }));

    // Re-extract information
    let extractedInfo: any = existingBid;
    let aiExtractionError: string | null = null;
    let extractedPrice: number | null = existingBid.proposedPrice;
    let priceSource: string | null = existingBid.priceSource;
    let pricingNotes: string | null = existingBid.pricingNotes;
    
    try {
      if (newRfpDocs.length > 0) {
        const newExtractedInfo = await extractBidInformationFromDocuments(allDocumentContents);
        // Merge with existing info (prefer new data if available)
        extractedInfo = {
          ...existingBid,
          title: newExtractedInfo.title || existingBid.title,
          description: newExtractedInfo.description || existingBid.description,
          organizationName: newExtractedInfo.organizationName || existingBid.issuingOrg,
          city: newExtractedInfo.city,
          state: newExtractedInfo.state,
          closingDate: newExtractedInfo.closingDate || existingBid.closingDate,
          contactName: newExtractedInfo.contactName || existingBid.contactName,
          contactEmail: newExtractedInfo.contactEmail || existingBid.contactEmail,
          contactPhone: newExtractedInfo.contactPhone || existingBid.contactPhone,
          estimatedBudget: newExtractedInfo.estimatedBudget,
          budgetDetails: newExtractedInfo.budgetDetails,
        };
        
        // Re-extract pricing if new info available
        if (newExtractedInfo.estimatedBudget) {
          const budgetMatch = newExtractedInfo.estimatedBudget.match(/\$?\s*[\d,]+(?:\.\d{2})?/);
          if (budgetMatch) {
            const budgetStr = budgetMatch[0].replace(/[$,\s]/g, '');
            extractedPrice = parseFloat(budgetStr);
            priceSource = 'extracted';
            pricingNotes = newExtractedInfo.budgetDetails || newExtractedInfo.estimatedBudget;
          }
        }
      }
      
      // Try to extract price from new preliminary email
      if (newEmailDocs.length > 0 && preliminaryEmailData?.content) {
        const emailPricing = await extractPricingFromEmail(preliminaryEmailData.content);
        if (emailPricing.price) {
          extractedPrice = emailPricing.price;
          priceSource = 'email';
          pricingNotes = emailPricing.notes;
          console.log(`Extracted price from new email: $${extractedPrice}`);
        }
      }
    } catch (error) {
      console.error('Error re-extracting bid information:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      aiExtractionError = errorMessage.includes('no remaining credits') || errorMessage.includes('credits')
        ? 'AI extraction failed: Out of LLM API credits.'
        : `AI extraction failed: ${errorMessage}`;
    }

    // Step 4: Update bid proposal in database
    await db.bidProposal.update({
      where: { id: bidId },
      data: {
        bidDocuments: JSON.stringify(uploadedDocuments),
        preliminaryEmail: preliminaryEmailData ? JSON.stringify(preliminaryEmailData) : null,
        proposedPrice: extractedPrice,
        priceSource: priceSource,
        pricingNotes: pricingNotes,
        workflowStage: aiExtractionError ? 'documents_uploaded' : 'documents_uploaded',
        envelope1Status: 'in_progress',
        envelope2Status: 'in_progress',
        lastEditedById: session.user.id,
        lastEditedAt: new Date(),
      },
    });

    console.log(`Updated bid proposal ${bidId}. Starting regeneration...`);

    // Step 5: Regenerate proposals asynchronously
    if (!aiExtractionError) {
      (async () => {
        try {
          // Fetch the updated bid
          const updatedBid = await db.bidProposal.findUnique({
            where: { id: bidId },
          });

          if (!updatedBid) return;

          // Prepare context for AI generation
          const generationContext: AIGenerationRequest = {
            bidProposalId: bidId,
            envelopeType: 1,
            context: {
              bidDetails: {
                id: updatedBid.id,
                solicitationNumber: updatedBid.solicitationNumber,
                title: updatedBid.title,
                description: updatedBid.description || undefined,
                issuingOrg: updatedBid.issuingOrg || undefined,
                solicitationType: updatedBid.solicitationType || undefined,
                location: updatedBid.location || undefined,
                closingDate: updatedBid.closingDate || undefined,
                contactName: updatedBid.contactName || undefined,
                contactEmail: updatedBid.contactEmail || undefined,
                contactPhone: updatedBid.contactPhone || undefined,
                bidSource: updatedBid.bidSource,
                envelope1Status: updatedBid.envelope1Status as any,
                envelope2Status: updatedBid.envelope2Status as any,
                submissionStatus: updatedBid.submissionStatus as any,
                createdById: updatedBid.createdById,
                createdAt: updatedBid.createdAt,
                updatedAt: updatedBid.updatedAt,
              },
              bidDocumentsContent: [...allDocumentContents].map(doc => doc.content).join('\n\n'),
              selectedServices: [],
              baseEmailProposal: preliminaryEmailData?.content || undefined,
              customInstructions: `Regenerate a comprehensive and professional proposal based on all uploaded documents, including any new files.${preliminaryEmailData ? ' Reference the preliminary email for tone and context.' : ''}${regenerateNotes ? `\n\nUser Instructions: ${regenerateNotes}` : ''}`,
            },
          };

          // Regenerate technical proposal
          console.log(`Regenerating technical proposal for bid ${bidId}...`);
          const technicalResult = await generateTechnicalProposal(generationContext);
          
          await db.bidProposal.update({
            where: { id: bidId },
            data: {
              envelope1Content: technicalResult.content,
              envelope1Status: 'completed',
              envelope1GeneratedAt: new Date(),
              envelope1GenerationPrompt: 'AI-regenerated from all documents',
            },
          });
          console.log(`Technical proposal regenerated for bid ${bidId}`);

          // Regenerate cost proposal
          console.log(`Regenerating cost proposal for bid ${bidId}...`);
          const costContext = { ...generationContext, envelopeType: 2 as const };
          const costResult = await generateCostProposal(costContext);
          
          // Generate updated follow-up email
          const followUpEmail = await generateFollowUpEmail(updatedBid);
          
          await db.bidProposal.update({
            where: { id: bidId },
            data: {
              envelope2Content: costResult.content,
              envelope2Status: 'completed',
              envelope2GeneratedAt: new Date(),
              envelope2GenerationPrompt: 'AI-regenerated from all documents',
              workflowStage: 'generated',
              nextSteps: JSON.stringify([
                'Review regenerated technical proposal',
                'Review regenerated cost proposal',
                'Verify updated pricing information',
                'Download updated PDF and slides',
                'Submit to the issuing organization',
              ]),
              suggestedFollowUp: followUpEmail,
            },
          });
          console.log(`Cost proposal regenerated for bid ${bidId}`);
        } catch (error) {
          console.error(`Error regenerating proposals for bid ${bidId}:`, error);
          await db.bidProposal.update({
            where: { id: bidId },
            data: {
              envelope1Status: 'draft',
              envelope2Status: 'draft',
            },
          });
        }
      })();
    }

    return NextResponse.json({
      success: true,
      message: aiExtractionError 
        ? `Bid proposal updated, but regeneration failed. ${aiExtractionError}`
        : 'Bid proposal updated. Proposals are being regenerated...',
      warning: aiExtractionError || undefined,
    });
  } catch (error) {
    console.error('Error in bid regeneration endpoint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
