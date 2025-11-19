

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
export const runtime = 'edge';


export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '30d';

    // In a production environment, you would fetch real data from PostHog API
    // For now, we'll return simulated data that matches the CDM Suite analytics structure
    
    // Simulated analytics data based on typical website metrics
    // In production, this would call PostHog, Google Analytics, and Clarity APIs
    const analyticsData = {
      visits: 12847,
      uniqueVisitors: 8234,
      pageViews: 34521,
      avgSessionDuration: 245, // seconds
      bounceRate: 42.3,
      conversions: 287,
      conversionRate: 3.49,
      topPages: [
        { path: '/', views: 8945 },
        { path: '/services/web-design', views: 4532 },
        { path: '/services/seo', views: 3421 },
        { path: '/pricing', views: 2987 },
        { path: '/blog', views: 2654 },
        { path: '/services/ad-management', views: 2341 },
        { path: '/contact', views: 1987 },
        { path: '/about', views: 1543 },
      ],
      deviceBreakdown: {
        desktop: 58.7,
        mobile: 35.2,
        tablet: 6.1,
      },
      trafficSources: [
        { source: 'direct', visits: 4532 },
        { source: 'google', visits: 3421 },
        { source: 'social', visits: 2234 },
        { source: 'referral', visits: 1876 },
        { source: 'email', visits: 784 },
      ],
      recentActivity: [
        {
          event: 'Page View',
          timestamp: new Date().toISOString(),
          page: '/services/web-design',
        },
        {
          event: 'Form Submission',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          page: '/contact',
        },
        {
          event: 'Page View',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          page: '/pricing',
        },
        {
          event: 'Tool Usage',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          page: '/tools/seo-checker',
        },
        {
          event: 'Blog Read',
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          page: '/blog/digital-marketing-trends',
        },
      ],
    };

    // Adjust data based on date range
    let multiplier = 1;
    if (range === '7d') multiplier = 0.25;
    else if (range === '90d') multiplier = 3;

    const adjustedData = {
      ...analyticsData,
      visits: Math.round(analyticsData.visits * multiplier),
      uniqueVisitors: Math.round(analyticsData.uniqueVisitors * multiplier),
      pageViews: Math.round(analyticsData.pageViews * multiplier),
      conversions: Math.round(analyticsData.conversions * multiplier),
      topPages: analyticsData.topPages.map(page => ({
        ...page,
        views: Math.round(page.views * multiplier),
      })),
      trafficSources: analyticsData.trafficSources.map(source => ({
        ...source,
        visits: Math.round(source.visits * multiplier),
      })),
    };

    return NextResponse.json(adjustedData);
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

