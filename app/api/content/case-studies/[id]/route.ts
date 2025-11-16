
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Fetch single case study
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const caseStudy = await prisma.caseStudy.findUnique({
      where: { id: params.id }
    });
    
    if (!caseStudy) {
      return NextResponse.json(
        { error: 'Case study not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ caseStudy });
  } catch (error) {
    console.error('Error fetching case study:', error);
    return NextResponse.json(
      { error: 'Failed to fetch case study' },
      { status: 500 }
    );
  }
}

// PUT - Update case study
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'employee')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await request.json();
    
    const caseStudy = await prisma.caseStudy.update({
      where: { id: params.id },
      data: {
        slug: data.slug,
        title: data.title,
        category: data.category,
        client: data.client,
        description: data.description,
        challenge: data.challenge,
        solution: data.solution,
        results: data.results,
        testimonialQuote: data.testimonialQuote,
        testimonialAuthor: data.testimonialAuthor,
        testimonialCompany: data.testimonialCompany,
        heroImage: data.heroImage,
        additionalImages: data.additionalImages,
        tags: data.tags,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        status: data.status,
        publishedAt: data.status === 'published' && !data.publishedAt ? new Date() : data.publishedAt,
        order: data.order
      }
    });
    
    return NextResponse.json({ caseStudy });
  } catch (error) {
    console.error('Error updating case study:', error);
    return NextResponse.json(
      { error: 'Failed to update case study' },
      { status: 500 }
    );
  }
}

// DELETE - Delete case study
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only the master user (fray@cdmsuite.com) can delete case studies
    if (session.user.email !== 'fray@cdmsuite.com') {
      return NextResponse.json({ error: 'Only the master user can delete case studies' }, { status: 403 });
    }
    
    await prisma.caseStudy.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting case study:', error);
    return NextResponse.json(
      { error: 'Failed to delete case study' },
      { status: 500 }
    );
  }
}
