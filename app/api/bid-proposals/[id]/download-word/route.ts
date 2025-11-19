
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateWordDocument } from '@/lib/docx-generator';


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

    // Fetch bid proposal
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

    console.log(`[Word Export] Generating Word document for bid ${params.id}, envelope ${envelope}`);
    console.log(`[Word Export] Content length: ${content.length} characters`);

    // Generate Word document
    const docxBuffer = await generateWordDocument(
      content,
      bid.title || 'Bid Proposal',
      bid.solicitationNumber || 'N/A',
      envelope === '1' ? 1 : 2
    );

    console.log(`[Word Export] Generated Word document, size: ${docxBuffer.length} bytes`);

    // Generate filename with timestamp
    const envelopeLabel = envelope === '1' ? 'technical' : 'cost';
    const filename = `${bid.solicitationNumber || 'bid'}_${envelopeLabel}_${Date.now()}.docx`;

    // Return Word document
    return new NextResponse(docxBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error generating Word document:', error);
    return NextResponse.json(
      { error: 'Failed to generate Word document' },
      { status: 500 }
    );
  }
}
