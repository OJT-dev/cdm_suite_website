
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Fetch all media assets
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'employee')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');
    
    const where: any = {};
    if (folder) {
      where.folder = folder;
    }
    
    const media = await prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ media });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

// POST - Upload new media
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'employee')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await request.json();
    
    const media = await prisma.mediaAsset.create({
      data: {
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        url: data.url,
        alt: data.alt,
        title: data.title,
        caption: data.caption,
        folder: data.folder,
        tags: data.tags || [],
        uploadedBy: session.user.id,
        uploadedByName: session.user.name || session.user.email
      }
    });
    
    return NextResponse.json({ media });
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}
