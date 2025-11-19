
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/settings
 * Fetch all system settings (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch all settings
    const settings = await prisma.systemSettings.findMany({
      orderBy: { settingKey: 'asc' },
    });

    // Convert to key-value object for easier consumption
    const settingsMap = settings.reduce((acc: Record<string, any>, setting: any) => {
      acc[setting.settingKey] = {
        value: setting.settingValue,
        description: setting.description,
        updatedAt: setting.updatedAt,
      };
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error('[Admin Settings GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/settings
 * Update system settings (admin only)
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { settingKey, settingValue, description } = body;

    if (!settingKey || !settingValue) {
      return NextResponse.json(
        { error: 'settingKey and settingValue are required' },
        { status: 400 }
      );
    }

    // Upsert the setting
    const updatedSetting = await prisma.systemSettings.upsert({
      where: { settingKey },
      update: {
        settingValue,
        description,
        updatedById: user.id,
      },
      create: {
        settingKey,
        settingValue,
        description,
        updatedById: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      setting: updatedSetting,
    });
  } catch (error) {
    console.error('[Admin Settings PATCH] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update setting' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/settings/bulk
 * Bulk update multiple settings at once (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { settings } = body;

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json(
        { error: 'settings array is required' },
        { status: 400 }
      );
    }

    // Update each setting
    const updatePromises = settings.map((setting: any) =>
      prisma.systemSettings.upsert({
        where: { settingKey: setting.settingKey },
        update: {
          settingValue: setting.settingValue,
          description: setting.description,
          updatedById: user.id,
        },
        create: {
          settingKey: setting.settingKey,
          settingValue: setting.settingValue,
          description: setting.description,
          updatedById: user.id,
        },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: `Updated ${settings.length} settings`,
    });
  } catch (error) {
    console.error('[Admin Settings Bulk POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to bulk update settings' },
      { status: 500 }
    );
  }
}
