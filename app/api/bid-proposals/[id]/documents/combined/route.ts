
/**
 * Combined Document Download API
 * Downloads all completed documents as a single PDF
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PDFDocument } from 'pdf-lib';
import { generateProposalPDF } from '@/lib/pdf-generator';

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

    // Get all completed documents
    const documents = await prisma.bidDocument.findMany({
      where: {
        bidProposalId: params.id,
        status: 'completed',
      },
      orderBy: { createdAt: 'asc' },
    });

    if (documents.length === 0) {
      return NextResponse.json(
        { error: 'No completed documents found' },
        { status: 404 }
      );
    }

    // Create combined PDF
    const combinedPdf = await PDFDocument.create();

    for (const doc of documents) {
      if (!doc.content) continue;

      // Generate individual PDF
      const pdfBytes = await generateProposalPDF({
        title: doc.title,
        solicitationNumber: bidProposal.solicitationNumber || 'N/A',
        companyName: 'CDM Suite',
        date: new Date().toLocaleDateString(),
        sections: [
          {
            title: doc.title,
            content: doc.content,
          },
        ],
      });

      // Load and merge
      const docPdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await combinedPdf.copyPages(docPdf, docPdf.getPageIndices());
      copiedPages.forEach((page) => combinedPdf.addPage(page));
    }

    // Save combined PDF
    const combinedPdfBytes = await combinedPdf.save();

    // Return combined PDF
    const filename = `bid_proposal_${bidProposal.solicitationNumber || params.id}_complete.pdf`;
    return new NextResponse(combinedPdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error creating combined PDF:', error);
    return NextResponse.json(
      { error: 'Failed to create combined PDF' },
      { status: 500 }
    );
  }
}
