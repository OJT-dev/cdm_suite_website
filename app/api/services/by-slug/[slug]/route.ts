
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const service = await prisma.service.findUnique({
      where: { slug: params.slug },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error: any) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}
