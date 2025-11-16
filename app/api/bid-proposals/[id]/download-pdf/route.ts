
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateProposalPDF, parseSectionsFromMarkdown } from '@/lib/pdf-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const envelope = searchParams.get('envelope'); // '1' or '2'

    if (!envelope || (envelope !== '1' && envelope !== '2')) {
      return NextResponse.json(
        { error: 'Invalid envelope parameter. Must be 1 or 2' },
        { status: 400 }
      );
    }

    // Fetch bid proposal - force fresh data, no caching
    const bid = await prisma.bidProposal.findUnique({
      where: { id: params.id }
    });

    if (!bid) {
      return NextResponse.json({ error: 'Bid proposal not found' }, { status: 404 });
    }

    // Get the appropriate envelope content
    const content = envelope === '1' ? bid.envelope1Content : bid.envelope2Content;
    const envelopeTitle = envelope === '1' ? 'Technical Proposal' : 'Cost Proposal';

    if (!content) {
      return NextResponse.json(
        { error: `${envelopeTitle} has not been generated yet` },
        { status: 400 }
      );
    }

    console.log(`[PDF Download] Generating PDF for bid ${params.id}, envelope ${envelope}`);
    console.log(`[PDF Download] Content length: ${content.length} characters`);

    // Parse sections from markdown
    const sections = parseSectionsFromMarkdown(content);
    console.log(`[PDF Download] Parsed ${sections.length} sections`);

    // Generate PDF
    const pdfBuffer = await generateProposalPDF({
      title: envelopeTitle,
      solicitationNumber: bid.solicitationNumber || 'N/A',
      companyName: 'CDM Suite LLC',
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      sections
    });

    console.log(`[PDF Download] Generated PDF, size: ${pdfBuffer.length} bytes`);

    // Generate filename with timestamp to prevent caching
    const filename = `${bid.solicitationNumber || 'bid'}_envelope${envelope}_${Date.now()}.pdf`;

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
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
