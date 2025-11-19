
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
export const runtime = 'edge';


// GET page by slug (for public viewing)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);
    
    const page = await prisma.customPage.findUnique({
      where: { slug },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Only return published pages unless user is admin
    if (page.status !== 'published' && (!session?.user || session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // If page requires auth and user is not logged in
    if (page.requiresAuth && !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If page has role restrictions
    if (page.allowedRoles.length > 0 && session?.user) {
      if (!page.allowedRoles.includes(session.user.role || 'client')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Increment view count
    if (page.status === 'published') {
      await prisma.customPage.update({
        where: { id: page.id },
        data: { views: page.views + 1 },
      });
    }

    // Parse JSON fields
    const pageWithParsedContent = {
      ...page,
      content: JSON.parse(page.content),
      settings: page.settings ? JSON.parse(page.settings) : {},
    };

    return NextResponse.json({ page: pageWithParsedContent });
  } catch (error) {
    console.error('Error fetching page by slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}
