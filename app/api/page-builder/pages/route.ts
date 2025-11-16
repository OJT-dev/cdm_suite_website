
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';

// GET all pages
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pages = await prisma.customPage.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

// POST create new page
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, description, content, status, metaTitle, metaDescription } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingPage = await prisma.customPage.findUnique({
      where: { slug },
    });

    if (existingPage) {
      return NextResponse.json(
        { error: 'A page with this slug already exists' },
        { status: 400 }
      );
    }

    const page = await prisma.customPage.create({
      data: {
        title,
        slug,
        description,
        content: content || JSON.stringify({ sections: [], version: '1.0' }),
        status: status || 'draft',
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || description || '',
        createdById: user.id,
      },
    });

    return NextResponse.json({ page });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}
