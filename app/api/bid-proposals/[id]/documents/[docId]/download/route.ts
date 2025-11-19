
/**
 * Individual Document Download API
 * Downloads a single document as PDF
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateProposalPDF } from '@/lib/pdf-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; docId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const document = await prisma.bidDocument.findUnique({
      where: { id: params.docId },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (document.bidProposalId !== params.id) {
      return NextResponse.json({ error: 'Document mismatch' }, { status: 400 });
    }

    if (!document.content) {
      return NextResponse.json(
        { error: 'Document content not available' },
        { status: 404 }
      );
    }

    // Get bid proposal details
    const bidProposal = await prisma.bidProposal.findUnique({
      where: { id: params.id },
    });

    // Generate PDF
    const pdfBytes = await generateProposalPDF({
      title: document.title,
      solicitationNumber: bidProposal?.solicitationNumber || 'N/A',
      companyName: 'CDM Suite',
      date: new Date().toLocaleDateString(),
      sections: [
        {
          title: document.title,
          content: document.content,
        },
      ],
    });

    // Return PDF
    const filename = `${document.documentType}_${params.id}.pdf`;
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    );
  }
}
