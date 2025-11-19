

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  Users,
  Globe,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  RefreshCw,
  MousePointerClick,
  Eye,
  Clock,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsData {
  visits: number;
  uniqueVisitors: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
  conversions: number;
  conversionRate: number;
  topPages: Array<{ path: string; views: number }>;
  deviceBreakdown: { desktop: number; mobile: number; tablet: number };
  trafficSources: Array<{ source: string; visits: number }>;
  recentActivity: Array<{ event: string; timestamp: string; page: string }>;
}

export function AnalyticsDashboardClient() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    visits: 0,
    uniqueVisitors: 0,
    pageViews: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    conversions: 0,
    conversionRate: 0,
    topPages: [],
    deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
    trafficSources: [],
    recentActivity: [],
  });
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics/dashboard?range=${dateRange}`);
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      } else {
        toast.error('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Track CDM Suite performance and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="flex gap-1 border rounded-lg p-1">
            <Button
              variant={dateRange === '7d' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setDateRange('7d')}
              className="text-xs"
            >
              7D
            </Button>
            <Button
              variant={dateRange === '30d' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setDateRange('30d')}
              className="text-xs"
            >
              30D
            </Button>
            <Button
              variant={dateRange === '90d' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setDateRange('90d')}
              className="text-xs"
            >
              90D
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Links to Analytics Platforms */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Analytics Platforms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://analytics.google.com/analytics/web/#/p466166639/reports/intelligenthome"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Google Analytics
                <ExternalLink className="h-3 w-3 ml-2" />
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://us.posthog.com/project/90964"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                PostHog
                <ExternalLink className="h-3 w-3 ml-2" />
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://clarity.microsoft.com/projects/view/tp19j9wv7x/dashboard"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Eye className="h-4 w-4 mr-2" />
                Microsoft Clarity
                <ExternalLink className="h-3 w-3 ml-2" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Total Visits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(analyticsData.visits)}</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <ArrowUp className="w-4 h-4" />
              <span>vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Unique Visitors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(analyticsData.uniqueVisitors)}</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <ArrowUp className="w-4 h-4" />
              <span>vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <MousePointerClick className="h-4 w-4" />
              Conversions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(analyticsData.conversions)}</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <ArrowUp className="w-4 h-4" />
              <span>{analyticsData.conversionRate.toFixed(1)}% rate</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg. Session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatDuration(analyticsData.avgSessionDuration)}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <span>{analyticsData.bounceRate.toFixed(1)}% bounce rate</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CDM Suite Performance Summary</CardTitle>
              <CardDescription>
                Real-time analytics for cdmsuite.com tracked across Google Analytics, PostHog, and Microsoft Clarity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Page Views</h4>
                  <div className="text-2xl font-bold">{formatNumber(analyticsData.pageViews)}</div>
                  <p className="text-xs text-muted-foreground">
                    Total pages viewed in the selected period
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Engagement Rate</h4>
                  <div className="text-2xl font-bold">
                    {(100 - analyticsData.bounceRate).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Users engaging with multiple pages
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-3">Recent Activity</h4>
                <div className="space-y-2">
                  {analyticsData.recentActivity.length > 0 ? (
                    analyticsData.recentActivity.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-start justify-between text-sm p-2 rounded-lg hover:bg-muted">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{activity.event}</p>
                          <p className="text-xs text-muted-foreground truncate">{activity.page}</p>
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent activity data available</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Pages</CardTitle>
              <CardDescription>Most visited pages on cdmsuite.com</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.topPages.length > 0 ? (
                  analyticsData.topPages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{page.path}</p>
                      </div>
                      <Badge variant="secondary">{formatNumber(page.views)} views</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No page data available yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Where your visitors are coming from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.trafficSources.length > 0 ? (
                  analyticsData.trafficSources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Globe className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{source.source}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{formatNumber(source.visits)} visits</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No traffic source data available yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
              <CardDescription>Visitor device types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">💻</div>
                    <span className="font-medium">Desktop</span>
                  </div>
                  <Badge variant="secondary">{analyticsData.deviceBreakdown.desktop}%</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📱</div>
                    <span className="font-medium">Mobile</span>
                  </div>
                  <Badge variant="secondary">{analyticsData.deviceBreakdown.mobile}%</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📱</div>
                    <span className="font-medium">Tablet</span>
                  </div>
                  <Badge variant="secondary">{analyticsData.deviceBreakdown.tablet}%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <BarChart3 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">Live Analytics Integration</h4>
              <p className="text-sm text-blue-700 mt-1">
                This dashboard aggregates data from Google Analytics, PostHog, and Microsoft Clarity. 
                Click the platform buttons above to access detailed analytics and advanced features.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

