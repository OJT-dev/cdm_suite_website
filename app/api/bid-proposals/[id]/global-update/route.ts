
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { uploadFile, downloadFile } from '@/lib/s3';
import { extractTextFromFile, ExtractedDocument } from '@/lib/document-extractor';
import { extractBidInformationFromDocuments, extractPricingFromEmail, calculateRealisticPricing } from '@/lib/bid-ai-generator';
import { generateCompetitiveIntelligence, calculateWinProbability, generateRiskAssessment } from '@/lib/bid-intelligence-generator';


const ABACUS_API_URL = 'https://apps.abacus.ai/v1/chat/completions';
const ABACUS_API_KEY = process.env.ABACUSAI_API_KEY;

/**
 * Process custom instructions using AI to update bid proposal
 */
async function processCustomInstructions(
  bidProposal: any,
  instructions: string,
  documentContent: string
): Promise<any> {
  try {
    const prompt = `You are an expert bid proposal analyst. A user has provided instructions to update their bid proposal. Analyze the instructions and the current bid data, then determine what changes should be made.

CURRENT BID DATA:
Title: ${bidProposal.title}
Description: ${bidProposal.description || 'Not set'}
Issuing Org: ${bidProposal.issuingOrg || 'Not set'}
Location: ${bidProposal.location || 'Not set'}
Proposed Price: ${bidProposal.proposedPrice ? `$${bidProposal.proposedPrice.toLocaleString()}` : 'Not set'}
Workflow Stage: ${bidProposal.workflowStage || 'Not set'}

${documentContent ? `DOCUMENT CONTENT:\n${documentContent.substring(0, 2000)}` : ''}

USER INSTRUCTIONS:
${instructions}

Based on these instructions, provide updates in this EXACT JSON format:
{
  "description": "<updated description or null if no change>",
  "proposedPrice": <numeric value or null if no change>,
  "pricingNotes": "<notes about pricing calculation or null>",
  "workflowStage": "<updated stage or null if no change>",
  "nextSteps": "<updated next steps or null if no change>",
  "updateSummary": "<brief summary of changes made>"
}

Important:
- Only include fields that should be updated based on the instructions
- If instructions mention pricing, calculate a realistic value
- Be specific and actionable
- Return null for fields that shouldn't change

Respond with raw JSON only. Do not wrap in markdown code blocks.`;

    const response = await fetch(ABACUS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACUS_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert bid proposal analyst. Always respond with valid JSON without markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.warn('Failed to process instructions:', await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return null;
    }

    // Clean up JSON response
    const cleanedContent = content.trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    
    const result = JSON.parse(cleanedContent);
    
    // If pricing is mentioned but not calculated, use realistic pricing calculator
    if (result.proposedPrice === null && instructions.toLowerCase().includes('price')) {
      const pricingResult = await calculateRealisticPricing(
        bidProposal,
        bidProposal.description || '',
        documentContent
      );
      if (pricingResult.price) {
        result.proposedPrice = pricingResult.price;
        result.pricingNotes = pricingResult.notes;
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error processing custom instructions:', error);
    return null;
  }
}

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

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const instructions = formData.get('instructions') as string || '';

    console.log(`Processing global update with ${files.length} file(s) and custom instructions...`);
    if (instructions) {
      console.log(`Custom instructions: ${instructions}`);
    }

    // Process all uploaded files (if any)
    const uploadedDocuments: any[] = [];
    const extractedDocuments: ExtractedDocument[] = [];
    let pdfExtractionLimited = false;
    let usedExistingFiles = false;

    if (files.length > 0) {
      // Process new uploaded files
      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = file.name;

        // Upload to S3
        const cloudStoragePath = await uploadFile(buffer, fileName, file.type);

        // Extract text from document
        const extractedDoc = await extractTextFromFile(file);
        extractedDocuments.push(extractedDoc);
        
        // Track if PDF extraction was limited
        if (fileName.toLowerCase().endsWith('.pdf') && 
            extractedDoc.content.includes('automatic text extraction is currently unavailable')) {
          pdfExtractionLimited = true;
        }

        uploadedDocuments.push({
          name: fileName,
          url: cloudStoragePath,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        });
      }
    } else {
      // No new files uploaded - use existing files from the bid
      console.log('No new files uploaded, using existing files from the bid...');
      const existingDocs = bidProposal.bidDocuments ? JSON.parse(bidProposal.bidDocuments) : [];
      
      if (existingDocs.length > 0) {
        console.log(`Found ${existingDocs.length} existing file(s) attached to this bid`);
        usedExistingFiles = true;
        
        // Download and extract text from existing files
        for (const doc of existingDocs) {
          try {
            console.log(`Downloading and extracting: ${doc.name}`);
            
            // Download file from S3
            const fileBuffer = await downloadFile(doc.url);
            
            // Create a File object from the buffer for extraction
            const fileName = doc.name || 'document';
            const fileType = doc.type || 'application/octet-stream';
            const file = new File([fileBuffer], fileName, { type: fileType });
            
            // Extract text from document
            const extractedDoc = await extractTextFromFile(file);
            extractedDocuments.push(extractedDoc);
            
            // Track if PDF extraction was limited
            if (fileName.toLowerCase().endsWith('.pdf') && 
                extractedDoc.content.includes('automatic text extraction is currently unavailable')) {
              pdfExtractionLimited = true;
            }
            
            console.log(`✓ Extracted ${extractedDoc.content.length} characters from ${fileName}`);
          } catch (error: any) {
            console.error(`Failed to download/extract ${doc.name}:`, error);
            // Continue with other files even if one fails
          }
        }
      } else {
        console.log('No existing files found in the bid');
      }
    }

    // If no files were processed (neither new nor existing), return error
    if (extractedDocuments.length === 0 && !instructions) {
      return NextResponse.json(
        { error: 'No files available to process. Please upload at least one file.' },
        { status: 400 }
      );
    }

    // Combine existing and new documents (for storage purposes)
    const existingDocs = bidProposal.bidDocuments ? JSON.parse(bidProposal.bidDocuments) : [];
    const allDocuments = [...existingDocs, ...uploadedDocuments];

    // Extract updated information from documents (if any files were uploaded)
    let extractedInfo: any = {
      description: null,
      organizationName: null,
      city: null,
      state: null,
    };
    
    if (extractedDocuments.length > 0) {
      extractedInfo = await extractBidInformationFromDocuments(extractedDocuments);
    }

    // Try to extract pricing from new documents
    let updatedPrice = bidProposal.proposedPrice;
    let updatedPriceSource = bidProposal.priceSource;
    let updatedPricingNotes = bidProposal.pricingNotes;

    for (const doc of extractedDocuments) {
      const pricingInfo = await extractPricingFromEmail(doc.content);
      if (pricingInfo && pricingInfo.price) {
        updatedPrice = pricingInfo.price;
        updatedPriceSource = 'extracted';
        updatedPricingNotes = pricingInfo.notes || updatedPricingNotes;
        break;
      }
    }

    // Process custom instructions if provided
    let instructionsApplied = false;
    if (instructions && instructions.trim()) {
      console.log('Processing custom instructions:', instructions);
      
      // Use AI to interpret and apply instructions to the bid data
      const updatesFromInstructions = await processCustomInstructions(
        bidProposal,
        instructions,
        extractedDocuments.map(doc => doc.content).join('\n\n')
      );
      
      if (updatesFromInstructions) {
        // Apply updates from instructions
        if (updatesFromInstructions.description) extractedInfo.description = updatesFromInstructions.description;
        if (updatesFromInstructions.proposedPrice) {
          updatedPrice = updatesFromInstructions.proposedPrice;
          updatedPriceSource = 'calculated';
          updatedPricingNotes = updatesFromInstructions.pricingNotes || updatedPricingNotes;
        }
        if (updatesFromInstructions.workflowStage) extractedInfo.workflowStage = updatesFromInstructions.workflowStage;
        if (updatesFromInstructions.nextSteps) extractedInfo.nextSteps = updatesFromInstructions.nextSteps;
        
        instructionsApplied = true;
      }
    }

    // Update bid proposal with new information
    const updatedFields: any = {
      bidDocuments: JSON.stringify(allDocuments),
      lastEditedById: session.user.id,
      lastEditedAt: new Date(),
    };

    // Merge extracted information with existing data
    if (extractedInfo.description && extractedInfo.description !== 'Not available') {
      updatedFields.description = extractedInfo.description;
    }
    if (extractedInfo.organizationName && extractedInfo.organizationName !== 'Unknown') {
      updatedFields.issuingOrg = extractedInfo.organizationName;
    }
    if (extractedInfo.city || extractedInfo.state) {
      const location = [extractedInfo.city, extractedInfo.state].filter(Boolean).join(', ');
      if (location) {
        updatedFields.location = location;
      }
    }
    if (updatedPrice !== bidProposal.proposedPrice) {
      updatedFields.proposedPrice = updatedPrice;
      updatedFields.priceSource = updatedPriceSource;
      updatedFields.pricingNotes = updatedPricingNotes;
    }

    // Update the bid proposal
    await prisma.bidProposal.update({
      where: { id: bidProposalId },
      data: updatedFields,
    });

    // Fetch the updated bid proposal
    const refreshedBid = await prisma.bidProposal.findUnique({
      where: { id: bidProposalId },
    });

    // Regenerate intelligence insights with updated information
    // Intelligence functions now have automatic retry logic built in
    console.log('Regenerating intelligence insights with automatic retry...');
    const [competitiveIntelligence, winProbability, riskAssessment] = await Promise.all([
      generateCompetitiveIntelligence(refreshedBid as any),
      calculateWinProbability(refreshedBid as any),
      generateRiskAssessment(refreshedBid as any),
    ]);

    // Update intelligence
    await prisma.bidProposal.update({
      where: { id: bidProposalId },
      data: {
        competitiveIntelligence: JSON.stringify(competitiveIntelligence),
        winProbabilityScore: winProbability.score,
        winProbabilityFactors: JSON.stringify(winProbability),
        riskAssessment: JSON.stringify(riskAssessment),
        intelligenceGeneratedAt: new Date(),
      },
    });

    // Note: Proposal regeneration should be triggered manually by the user
    // after reviewing the updated intelligence insights
    const regenerationStatus = 'Manual regeneration recommended';

    // Build success message
    let successMessage = 'Bid proposal updated successfully';
    if (usedExistingFiles) {
      successMessage += ` using ${extractedDocuments.length} existing file(s)`;
    }
    if (uploadedDocuments.length > 0) {
      successMessage += ` with ${uploadedDocuments.length} new file(s) added`;
    }
    if (pdfExtractionLimited) {
      successMessage += '. Note: PDF text extraction was limited - please review the generated content carefully and use the form fields to add any missing details.';
    }

    return NextResponse.json({
      success: true,
      message: successMessage,
      filesUploaded: uploadedDocuments.length,
      filesProcessed: extractedDocuments.length,
      usedExistingFiles,
      informationExtracted: extractedDocuments.length > 0,
      pricingUpdated: updatedPrice !== bidProposal.proposedPrice,
      intelligenceRegenerated: true,
      proposalsRegenerationStatus: regenerationStatus,
      instructionsApplied,
      pdfExtractionLimited,
    });
  } catch (error: any) {
    console.error('Error processing global update:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process global update' },
      { status: 500 }
    );
  }
}
