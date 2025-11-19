
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getServiceAccess } from '@/lib/service-access';
export const runtime = 'edge';


export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // @ts-ignore
    const userId = session.user.id;

    // Get or create service access record
    let access = await prisma.serviceAccess.findFirst({
      where: { userId },
    });

    // Get user's current tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true },
    });

    const tier = user?.tier || 'free';

    if (!access) {
      // Create new access record based on tier
      const config = getServiceAccess(tier);
      access = await prisma.serviceAccess.create({
        data: {
          userId,
          tier,
          toolsAccess: JSON.stringify(config.toolsAccess),
          limits: JSON.stringify(config.limits),
          usageThisMonth: JSON.stringify({
            auditsUsed: 0,
            seoChecksUsed: 0,
            projectsUsed: 0,
          }),
          features: JSON.stringify(config.features),
        },
      });
    }

    // Check if usage needs to be reset (monthly)
    const lastReset = new Date(access.lastResetDate);
    const now = new Date();
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      // Reset monthly usage
      access = await prisma.serviceAccess.update({
        where: { id: access.id },
        data: {
          usageThisMonth: JSON.stringify({
            auditsUsed: 0,
            seoChecksUsed: 0,
            projectsUsed: 0,
          }),
          lastResetDate: now,
        },
      });
    }

    const parsedAccess = {
      tier: access.tier,
      toolsAccess: JSON.parse(access.toolsAccess),
      limits: JSON.parse(access.limits),
      usageThisMonth: JSON.parse(access.usageThisMonth),
      features: JSON.parse(access.features),
    };

    return NextResponse.json({ access: parsedAccess });
  } catch (error: any) {
    console.error('Error fetching service access:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // @ts-ignore
    const userId = session.user.id;
    const { toolName, action } = await req.json();

    if (!toolName || action !== 'increment') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Get current access
    const access = await prisma.serviceAccess.findFirst({
      where: { userId },
    });

    if (!access) {
      return NextResponse.json({ error: 'Access record not found' }, { status: 404 });
    }

    const usageData = JSON.parse(access.usageThisMonth);
    const limitsData = JSON.parse(access.limits);

    // Determine usage field based on tool
    let usageField = '';
    let limitField = '';
    
    if (toolName === 'auditor') {
      usageField = 'auditsUsed';
      limitField = 'auditsPerMonth';
    } else if (toolName === 'seo-checker') {
      usageField = 'seoChecksUsed';
      limitField = 'seoChecksPerMonth';
    } else {
      return NextResponse.json({ error: 'Unknown tool' }, { status: 400 });
    }

    // Check if limit exceeded
    if (usageData[usageField] >= limitsData[limitField]) {
      return NextResponse.json(
        {
          error: 'Usage limit exceeded',
          limit: limitsData[limitField],
          used: usageData[usageField],
        },
        { status: 429 }
      );
    }

    // Increment usage
    usageData[usageField] += 1;

    await prisma.serviceAccess.update({
      where: { id: access.id },
      data: {
        usageThisMonth: JSON.stringify(usageData),
      },
    });

    return NextResponse.json({
      success: true,
      remaining: limitsData[limitField] - usageData[usageField],
    });
  } catch (error: any) {
    console.error('Error tracking usage:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
