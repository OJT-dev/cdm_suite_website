
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
export const runtime = 'edge';


// GET - Fetch all case studies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'employee';
    
    const where: any = {};
    
    // Non-admin users can only see published case studies
    if (!isAdmin) {
      where.status = 'published';
    } else if (status) {
      where.status = status;
    }
    
    if (category) {
      where.category = category;
    }
    
    const caseStudies = await prisma.caseStudy.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    
    return NextResponse.json({ caseStudies });
  } catch (error) {
    console.error('Error fetching case studies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch case studies' },
      { status: 500 }
    );
  }
}

// POST - Create new case study
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'employee')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await request.json();
    
    const caseStudy = await prisma.caseStudy.create({
      data: {
        slug: data.slug,
        title: data.title,
        category: data.category,
        client: data.client,
        description: data.description,
        challenge: data.challenge,
        solution: data.solution,
        results: data.results || [],
        testimonialQuote: data.testimonialQuote,
        testimonialAuthor: data.testimonialAuthor,
        testimonialCompany: data.testimonialCompany,
        heroImage: data.heroImage,
        additionalImages: data.additionalImages || [],
        tags: data.tags || [],
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        status: data.status || 'draft',
        publishedAt: data.status === 'published' ? new Date() : null,
        order: data.order || 0
      }
    });
    
    return NextResponse.json({ caseStudy });
  } catch (error) {
    console.error('Error creating case study:', error);
    return NextResponse.json(
      { error: 'Failed to create case study' },
      { status: 500 }
    );
  }
}
