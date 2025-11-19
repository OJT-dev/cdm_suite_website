
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateProposalPDF, parseSectionsFromMarkdown } from '@/lib/pdf-generator';
export const runtime = 'edge';


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch bid proposal - force fresh data, no caching
    const bid = await prisma.bidProposal.findUnique({
      where: { id: params.id }
    });

    if (!bid) {
      return NextResponse.json({ error: 'Bid proposal not found' }, { status: 404 });
    }

    // Check that both envelopes have content
    if (!bid.envelope1Content || !bid.envelope2Content) {
      return NextResponse.json(
        { error: 'Both Technical and Cost proposals must be generated before creating a combined PDF' },
        { status: 400 }
      );
    }

    console.log(`[Combined PDF Download] Generating combined PDF for bid ${params.id}`);
    console.log(`[Combined PDF Download] Envelope 1 length: ${bid.envelope1Content.length}`);
    console.log(`[Combined PDF Download] Envelope 2 length: ${bid.envelope2Content.length}`);

    // Parse sections from both envelopes
    const technicalSections = parseSectionsFromMarkdown(bid.envelope1Content);
    const costSections = parseSectionsFromMarkdown(bid.envelope2Content);

    // Combine sections with clear envelope indicators
    const combinedSections = [
      {
        title: 'TECHNICAL PROPOSAL - ENVELOPE 1',
        content: 'The following sections comprise the Technical Proposal for this solicitation.'
      },
      ...technicalSections,
      {
        title: 'COST PROPOSAL - ENVELOPE 2',
        content: 'The following sections comprise the Cost Proposal for this solicitation.'
      },
      ...costSections
    ];

    console.log(`[Combined PDF Download] Total sections: ${combinedSections.length} (${technicalSections.length} technical + ${costSections.length} cost)`);

    // Generate combined PDF
    const pdfBuffer = await generateProposalPDF({
      title: bid.title || 'Bid Proposal - Combined Submission',
      solicitationNumber: bid.solicitationNumber || 'N/A',
      companyName: 'CDM Suite LLC',
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      sections: combinedSections
    });

    console.log(`[Combined PDF Download] Generated combined PDF, size: ${pdfBuffer.length} bytes`);

    // Generate filename with timestamp to prevent caching
    const filename = `${bid.solicitationNumber || 'bid'}_combined_${Date.now()}.pdf`;

    // Return PDF with cache-busting headers
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error generating combined PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate combined PDF' },
      { status: 500 }
    );
  }
}
