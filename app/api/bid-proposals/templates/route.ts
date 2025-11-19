
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
export const runtime = 'edge';


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Get user's templates and public templates
    const templates = await prisma.proposalTemplate.findMany({
      where: {
        OR: [
          { createdById: session.user.id },
          { isPublic: true }
        ],
        ...(category && category !== 'all' ? { category } : {})
      },
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, category, technicalContent, costContent, isPublic } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      );
    }

    const template = await prisma.proposalTemplate.create({
      data: {
        name,
        description,
        category,
        technicalContent,
        costContent,
        isPublic: isPublic || false,
        createdById: session.user.id
      }
    });

    return NextResponse.json({ 
      success: true,
      template,
      message: 'Template created successfully'
    });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
