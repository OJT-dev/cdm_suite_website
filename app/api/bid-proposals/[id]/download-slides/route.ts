
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateSlideDeck, parseSlidesFromMarkdown } from '@/lib/slide-generator';
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

    // Get envelope parameter from query string (1 or 2)
    const { searchParams } = new URL(request.url);
    const envelopeParam = searchParams.get('envelope');
    const envelopeType = envelopeParam === '2' ? 2 : 1; // Default to envelope 1

    // Fetch bid proposal
    const bid = await prisma.bidProposal.findUnique({
      where: { id: params.id }
    });

    if (!bid) {
      return NextResponse.json({ error: 'Bid proposal not found' }, { status: 404 });
    }

    // Get content based on envelope type
    const content = envelopeType === 1 ? bid.envelope1Content : bid.envelope2Content;
    const envelopeTitle = envelopeType === 1 ? 'Technical' : 'Cost';

    if (!content) {
      return NextResponse.json(
        { error: `${envelopeTitle} Proposal must be generated before creating slides` },
        { status: 400 }
      );
    }

    // Parse slides from markdown
    const slides = parseSlidesFromMarkdown(content);

    if (slides.length === 0) {
      return NextResponse.json(
        { error: 'No suitable content found for slides' },
        { status: 400 }
      );
    }

    // Generate slide deck with envelope-specific title
    const pptxBuffer = await generateSlideDeck({
      title: `${bid.title || 'Bid Proposal'} - ${envelopeTitle} Proposal`,
      solicitationNumber: bid.solicitationNumber || 'N/A',
      companyName: 'CDM Suite LLC',
      slides
    });

    // Generate filename with envelope type
    const filename = `${bid.solicitationNumber || 'bid'}_${envelopeTitle.toLowerCase()}_slides_${Date.now()}.pptx`;

    // Return PowerPoint
    return new NextResponse(pptxBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Error generating slide deck:', error);
    return NextResponse.json(
      { error: 'Failed to generate slide deck' },
      { status: 500 }
    );
  }
}
