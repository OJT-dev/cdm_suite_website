
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma as db } from '@/lib/db';
import { uploadFile } from '@/lib/s3';
import { extractBidInformationFromDocuments, generateTechnicalProposal, generateCostProposal, extractPricingFromEmail, generateFollowUpEmail } from '@/lib/bid-ai-generator';
import { AIGenerationRequest, AIGenerationResponse } from '@/lib/bid-proposal-types';
import { extractTextFromFile, extractTextFromFilesSequentially, categorizeDocuments } from '@/lib/document-extractor';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds

/**
 * Helper function to update processing status in database
 */
async function updateProcessingStatus(
  bidId: string,
  status: 'idle' | 'extracting' | 'generating' | 'completed' | 'error',
  stage: string | null,
  progress: number,
  message: string | null,
  error: string | null = null
) {
  try {
    await db.bidProposal.update({
      where: { id: bidId },
      data: {
        processingStatus: status,
        processingStage: stage,
        processingProgress: progress,
        processingMessage: message,
        processingError: error,
        ...(status === 'extracting' && progress === 0 ? { processingStartedAt: new Date() } : {}),
        ...(status === 'completed' || status === 'error' ? { processingCompletedAt: new Date() } : {}),
      },
    });
    console.log(`[Status Update] Bid ${bidId}: ${status} - ${stage} (${progress}%) - ${message}`);
  } catch (err) {
    console.error(`[Status Update] Failed to update status for bid ${bidId}:`, err);
  }
}

/**
 * Retry wrapper for proposal generation with exponential backoff
 */
async function retryProposalGeneration(
  fn: () => Promise<AIGenerationResponse>,
  proposalType: string,
  bidId: string,
  maxRetries: number = MAX_RETRIES,
  retryDelay: number = INITIAL_RETRY_DELAY
): Promise<AIGenerationResponse> {
  let lastResult: AIGenerationResponse | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[${proposalType}] Bid ${bidId} - Attempt ${attempt + 1}/${maxRetries + 1}...`);
      const result = await fn();
      
      if (result.success && result.content) {
        console.log(`[${proposalType}] Bid ${bidId} - ✓ Success on attempt ${attempt + 1}`);
        return result;
      }
      
      // If the result is unsuccessful, treat it as a retry-able error
      lastResult = result;
      throw new Error(result.error || 'Generation failed without content');
    } catch (error: any) {
      console.warn(`[${proposalType}] Bid ${bidId} - Attempt ${attempt + 1} failed:`, error.message);
      lastResult = lastResult || { success: false, error: error.message };
      
      // Don't wait after the last attempt
      if (attempt < maxRetries) {
        const delayMs = retryDelay * Math.pow(2, attempt); // Exponential backoff: 2s, 4s, 8s
        console.log(`[${proposalType}] Bid ${bidId} - Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  // All retries exhausted
  console.error(`[${proposalType}] Bid ${bidId} - All ${maxRetries + 1} attempts failed`);
  return lastResult || { success: false, error: 'All retry attempts failed' };
}

/**
 * Generate next steps based on the current state of the bid proposal
 */
function generateNextSteps(hasError: boolean, hasPrice: boolean): string[] {
  if (hasError) {
    return [
      'Review and complete bid details manually',
      'Upload additional documents if needed',
      'Add pricing information',
      'Generate proposal content',
    ];
  }
  
  const steps = [
    'Review extracted bid information',
    'Wait for AI to generate proposal content',
  ];
  
  if (!hasPrice) {
    steps.push('Add pricing information');
  }
  
  steps.push('Review and refine generated proposals');
  steps.push('Download PDF and slides for submission');
  
  return steps;
}

// Route segment config for handling large uploads and long processing
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for file processing

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Set up abort signal handling
    const abortController = new AbortController();
    req.signal?.addEventListener('abort', () => {
      console.log('Client connection aborted during bid extraction');
      abortController.abort();
    });

    const formData = await req.formData();
    const rfpFiles = formData.getAll('rfpFiles') as File[];
    const emailFiles = formData.getAll('emailFiles') as File[];
    
    const totalFiles = rfpFiles.length + emailFiles.length;

    if (totalFiles === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    if (rfpFiles.length === 0) {
      return NextResponse.json({ error: 'At least one RFP document is required' }, { status: 400 });
    }

    console.log(`Processing ${rfpFiles.length} RFP files and ${emailFiles.length} email files for AI extraction...`);

    // Step 1: Quick file validation and upload to S3 FIRST
    // This ensures we respond quickly to the client
    const uploadedDocuments: { name: string; url: string; size: number; type: string }[] = [];
    let preliminaryEmailData: { name: string; url: string; size: number } | null = null;

    console.log('Uploading files to S3...');

    // Upload RFP files
    for (const file of rfpFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `bid-documents/${Date.now()}-${file.name}`;
      const s3Key = await uploadFile(buffer, fileName, file.type || 'application/octet-stream');
      
      uploadedDocuments.push({
        name: file.name,
        url: s3Key,
        size: file.size,
        type: file.type || 'unknown',
      });
    }

    // Upload email files
    for (const file of emailFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `bid-emails/${Date.now()}-${file.name}`;
      const s3Key = await uploadFile(buffer, fileName, file.type || 'application/octet-stream');
      
      if (!preliminaryEmailData) {
        preliminaryEmailData = {
          name: file.name,
          url: s3Key,
          size: file.size,
        };
      } else {
        uploadedDocuments.push({
          name: `[EMAIL] ${file.name}`,
          url: s3Key,
          size: file.size,
          type: 'email',
        });
      }
    }

    console.log('Files uploaded to S3. Creating bid proposal...');

    // Step 2: Create bid proposal in database immediately with minimal data
    // We'll extract and analyze in the background
    const bidProposal = await db.bidProposal.create({
      data: {
        createdById: session.user.id,
        solicitationNumber: 'Pending Extraction',
        title: 'Processing Documents...',
        description: null,
        
        // Organization details
        issuingOrg: null,
        solicitationType: null,
        location: null,
        
        // Dates
        publicationDate: null,
        closingDate: null,
        
        // Contact information
        contactName: null,
        contactEmail: null,
        contactPhone: null,
        
        // Documents (stored as JSON strings)
        bidDocuments: JSON.stringify(uploadedDocuments),
        preliminaryEmail: preliminaryEmailData ? JSON.stringify(preliminaryEmailData) : null,
        
        // Pricing information - will be extracted in background
        proposedPrice: null,
        priceSource: null,
        pricingNotes: null,
        
        // Workflow guidance
        workflowStage: 'documents_uploaded',
        nextSteps: JSON.stringify([
          'Documents are being analyzed...',
          'AI is extracting bid information',
          'Proposals are being generated',
          'This will take a few minutes'
        ]),
        
        // Envelope statuses
        envelope1Status: 'in_progress',
        envelope2Status: 'in_progress',
        
        // Processing status
        processingStatus: 'extracting',
        processingStage: 'uploading_files',
        processingProgress: 10,
        processingMessage: 'Files uploaded successfully. Starting document analysis...',
        processingStartedAt: new Date(),
      },
    });

    console.log(`Created bid proposal ${bidProposal.id}. Starting background extraction and generation...`);

    // Step 3: Return response immediately so client doesn't timeout
    // All extraction and generation happens in background
    const responsePromise = NextResponse.json({
      success: true,
      id: bidProposal.id,
      message: 'Bid proposal created. AI is analyzing documents and generating proposals in the background. This may take a few minutes.',
    });

    // Step 4: Extract and generate proposals in the background
    // This runs after the response is sent
    (async () => {
      try {
        console.log(`[Background] Starting extraction for bid ${bidProposal.id}...`);
        
        // Update status: extracting PDFs
        await updateProcessingStatus(
          bidProposal.id,
          'extracting',
          'extracting_pdf',
          20,
          `Extracting text from ${rfpFiles.length} RFP document(s)...`,
          null
        );
        
        // Extract text content from files
        const rfpExtractedDocs = await extractTextFromFilesSequentially(rfpFiles);
        
        // Update status: extracting emails
        if (emailFiles.length > 0) {
          await updateProcessingStatus(
            bidProposal.id,
            'extracting',
            'extracting_email',
            30,
            `Extracting text from ${emailFiles.length} email file(s)...`,
            null
          );
        }
        
        const emailExtractedDocs = await extractTextFromFilesSequentially(emailFiles);
        
        // Check if any PDF extraction was limited
        const pdfExtractionLimited = [...rfpExtractedDocs, ...emailExtractedDocs].some(doc => 
          doc.type === 'pdf' && doc.content.includes('automatic text extraction is currently unavailable')
        );

        console.log(`[Background] Extracted ${rfpExtractedDocs.length} RFP docs and ${emailExtractedDocs.length} email docs`);

        // Update status: analyzing content
        await updateProcessingStatus(
          bidProposal.id,
          'extracting',
          'analyzing_content',
          40,
          'Analyzing documents with AI to extract bid information...',
          null
        );

        // Prepare document contents for AI analysis
        const documentContents = rfpExtractedDocs.map(doc => ({
          name: doc.name,
          content: doc.content,
        }));

        // Extract bid information with AI
        let extractedInfo: any = null;
        let aiExtractionError: string | null = null;
        let extractedPrice: number | null = null;
        let priceSource: string | null = null;
        let pricingNotes: string | null = null;
        
        try {
          extractedInfo = await extractBidInformationFromDocuments(documentContents);
          console.log('[Background] Extracted bid info:', extractedInfo);
          
          // Get email content for pricing extraction
          const emailDoc = emailExtractedDocs.find(doc => doc.name === preliminaryEmailData?.name);
          
          // Try to extract price from preliminary email first
          if (emailDoc?.content) {
            const emailPricing = await extractPricingFromEmail(emailDoc.content);
            if (emailPricing.price) {
              extractedPrice = emailPricing.price;
              priceSource = 'email';
              pricingNotes = emailPricing.notes;
              console.log(`[Background] Extracted price from email: $${extractedPrice}`);
            }
          }
          
          // If no price from email, try to extract from RFP documents
          if (!extractedPrice && extractedInfo.estimatedBudget) {
            const budgetMatch = extractedInfo.estimatedBudget.match(/\$?\s*[\d]{1,3}(?:,?\d{3})+(?:\.\d{2})?|\$?\s*[\d]{4,}(?:\.\d{2})?/);
            if (budgetMatch) {
              const budgetStr = budgetMatch[0].replace(/[$,\s]/g, '');
              const price = parseFloat(budgetStr);
              
              if (price >= 10000) {
                extractedPrice = price;
                priceSource = 'extracted';
                pricingNotes = extractedInfo.budgetDetails || extractedInfo.estimatedBudget;
                console.log(`[Background] Extracted budget from RFP: $${extractedPrice.toLocaleString()}`);
              } else {
                console.log(`[Background] Rejected unrealistic price: $${price.toLocaleString()}`);
              }
            }
          }
          
          // Update bid proposal with extracted information
          await db.bidProposal.update({
            where: { id: bidProposal.id },
            data: {
              solicitationNumber: extractedInfo.solicitationNumber || 'N/A',
              title: extractedInfo.title || 'Untitled Bid',
              description: extractedInfo.description || null,
              issuingOrg: extractedInfo.organizationName || null,
              solicitationType: extractedInfo.organizationType || null,
              location: `${extractedInfo.city || ''}, ${extractedInfo.state || ''}`.trim() || null,
              publicationDate: extractedInfo.issueDate ? new Date(extractedInfo.issueDate) : null,
              closingDate: extractedInfo.closingDate ? new Date(extractedInfo.closingDate) : null,
              contactName: extractedInfo.contactName || null,
              contactEmail: extractedInfo.contactEmail || null,
              contactPhone: extractedInfo.contactPhone || null,
              proposedPrice: extractedPrice,
              priceSource: priceSource,
              pricingNotes: pricingNotes,
            },
          });
          
          console.log(`[Background] Updated bid ${bidProposal.id} with extracted information`);
          
          // Update status: extraction complete, starting generation
          await updateProcessingStatus(
            bidProposal.id,
            'generating',
            'generating_proposal',
            50,
            'Bid information extracted successfully. Generating technical proposal...',
            null
          );
        } catch (error) {
          console.error('[Background] Error extracting bid information:', error);
          
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('no remaining credits') || errorMessage.includes('credits')) {
            aiExtractionError = 'AI extraction failed: You have run out of LLM API credits. Please add more credits to enable AI-powered bid extraction. You can still manually fill in the bid details.';
          } else {
            aiExtractionError = `AI extraction failed: ${errorMessage}. You can still manually fill in the bid details.`;
          }
          
          // Update with default values and error status
          await db.bidProposal.update({
            where: { id: bidProposal.id },
            data: {
              solicitationNumber: 'N/A',
              title: 'Untitled Bid - Please Update',
              envelope1Status: 'draft',
              envelope2Status: 'draft',
              workflowStage: 'initial',
              nextSteps: JSON.stringify(generateNextSteps(true, false)),
              processingStatus: 'error',
              processingStage: null,
              processingProgress: 100,
              processingMessage: 'Extraction failed. Please review and update bid details manually.',
              processingError: aiExtractionError,
              processingCompletedAt: new Date(),
            },
          });
          
          console.log(`[Background] Set default values for bid ${bidProposal.id} due to extraction error`);
          return; // Don't generate proposals if extraction failed
        }

        // Generate proposals with retry logic
        try {
          // Prepare context for AI generation
          const generationContext: AIGenerationRequest = {
            bidProposalId: bidProposal.id,
            envelopeType: 1,
            context: {
              bidDetails: {
                id: bidProposal.id,
                solicitationNumber: extractedInfo.solicitationNumber || 'N/A',
                title: extractedInfo.title || 'Untitled Bid',
                description: extractedInfo.description || undefined,
                issuingOrg: extractedInfo.organizationName || undefined,
                solicitationType: extractedInfo.organizationType || undefined,
                location: `${extractedInfo.city || ''}, ${extractedInfo.state || ''}`.trim() || undefined,
                closingDate: extractedInfo.closingDate ? new Date(extractedInfo.closingDate) : undefined,
                contactName: extractedInfo.contactName || undefined,
                contactEmail: extractedInfo.contactEmail || undefined,
                contactPhone: extractedInfo.contactPhone || undefined,
                bidSource: 'upload',
                envelope1Status: 'in_progress' as any,
                envelope2Status: 'in_progress' as any,
                submissionStatus: 'not_submitted' as any,
                createdById: bidProposal.createdById,
                createdAt: bidProposal.createdAt,
                updatedAt: new Date(),
              },
              bidDocumentsContent: documentContents.map(doc => doc.content).join('\n\n'),
              selectedServices: [],
              baseEmailProposal: emailExtractedDocs.find(doc => doc.name === preliminaryEmailData?.name)?.content,
              customInstructions: `Generate a comprehensive and professional proposal based on the extracted RFP requirements.${preliminaryEmailData ? ' A preliminary email proposal was provided - use it as reference for tone and initial ideas.' : ''} Additional context: ${JSON.stringify(extractedInfo)}`,
            },
          };

          // Generate technical proposal with retry logic
          console.log(`Generating technical proposal for bid ${bidProposal.id}...`);
          const technicalResult = await retryProposalGeneration(
            () => generateTechnicalProposal(generationContext),
            'Technical Proposal',
            bidProposal.id
          );
          
          if (technicalResult.success && technicalResult.content) {
            await db.bidProposal.update({
              where: { id: bidProposal.id },
              data: {
                envelope1Content: technicalResult.content,
                envelope1Status: 'completed',
                envelope1GeneratedAt: new Date(),
                envelope1GenerationPrompt: 'AI-generated from uploaded documents',
              },
            });
            console.log(`Technical proposal generated for bid ${bidProposal.id}`);
            
            // Update status: technical proposal complete, generating cost proposal
            await updateProcessingStatus(
              bidProposal.id,
              'generating',
              'generating_proposal',
              70,
              'Technical proposal generated successfully. Generating cost proposal...',
              null
            );
          } else {
            throw new Error(technicalResult.error || 'Technical proposal generation failed');
          }

          // Generate cost proposal with retry logic
          console.log(`Generating cost proposal for bid ${bidProposal.id}...`);
          const costContext = { ...generationContext, envelopeType: 2 as const };
          const costResult = await retryProposalGeneration(
            () => generateCostProposal(costContext),
            'Cost Proposal',
            bidProposal.id
          );
          
          if (!costResult.success || !costResult.content) {
            throw new Error(costResult.error || 'Cost proposal generation failed');
          }
          
          // Generate follow-up email suggestion
          const followUpEmail = await generateFollowUpEmail(bidProposal);
          
          await db.bidProposal.update({
            where: { id: bidProposal.id },
            data: {
              envelope2Content: costResult.content,
              envelope2Status: 'completed',
              envelope2GeneratedAt: new Date(),
              envelope2GenerationPrompt: 'AI-generated from uploaded documents',
              workflowStage: 'generated',
              nextSteps: JSON.stringify([
                'Review technical proposal',
                'Review cost proposal',
                'Verify pricing information',
                'Download PDF and slides',
                'Submit to the issuing organization',
              ]),
              suggestedFollowUp: followUpEmail,
              processingStatus: 'completed',
              processingStage: 'finalizing',
              processingProgress: 100,
              processingMessage: 'All proposals generated successfully! Ready for review.',
              processingError: null,
              processingCompletedAt: new Date(),
            },
          });
          console.log(`[Background] Cost proposal generated for bid ${bidProposal.id}`);
        } catch (error) {
          console.error(`[Background] Error generating proposals for bid ${bidProposal.id}:`, error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          // Update status to indicate failure
          await db.bidProposal.update({
            where: { id: bidProposal.id },
            data: {
              envelope1Status: 'draft',
              envelope2Status: 'draft',
              workflowStage: 'initial',
              nextSteps: JSON.stringify([
                'Proposal generation failed',
                'Review extracted information',
                'Try regenerating proposals',
                'Or manually edit content',
              ]),
              processingStatus: 'error',
              processingStage: null,
              processingProgress: 100,
              processingMessage: 'Proposal generation failed. Please try regenerating.',
              processingError: errorMessage,
              processingCompletedAt: new Date(),
            },
          });
        }
      } catch (error) {
        console.error(`[Background] Fatal error processing bid ${bidProposal.id}:`, error);
      }
    })();

    // Return the response immediately
    return responsePromise;
  } catch (error) {
    // Handle aborted connections gracefully
    if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('aborted'))) {
      console.log('Request aborted by client - this is normal for long-running operations');
      return NextResponse.json(
        { error: 'Request was cancelled. If this happens frequently, try uploading smaller files or fewer files at once.' },
        { status: 499 } // Client Closed Request
      );
    }
    
    console.error('Error in bid extraction endpoint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
