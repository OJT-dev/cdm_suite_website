
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  TrendingUp,
  Calendar,
  BarChart3,
  Eye,
  RefreshCw,
  Download,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Smartphone,
  Shield,
  Zap,
  ArrowRight,
  Plus,
  Filter,
  Clock,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface Audit {
  id: string;
  websiteUrl: string;
  seoScore: number;
  performanceScore: number;
  mobileScore: number;
  securityScore: number;
  overallScore: number;
  issues: string;
  recommendations: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  name: string | null;
}

export function AuditsClient({ user }: { user: User }) {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filterUrl, setFilterUrl] = useState<string>('all');

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      const response = await fetch('/api/auditor/history');
      if (!response.ok) throw new Error('Failed to fetch audits');
      const data = await response.json();
      setAudits(data.audits || []);
    } catch (error) {
      console.error('Error fetching audits:', error);
      toast.error('Failed to load audit history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRerun = async (websiteUrl: string) => {
    window.location.href = `/dashboard/audits/new?url=${encodeURIComponent(websiteUrl)}`;
  };

  const handleViewDetails = (audit: Audit) => {
    setSelectedAudit(audit);
    setDetailsOpen(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-300';
    if (score >= 60) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Improvement';
    return 'Critical';
  };

  // Get unique website URLs for filtering
  const uniqueUrls = ['all', ...new Set(audits.map(a => a.websiteUrl))];

  // Filter audits by URL
  const filteredAudits = filterUrl === 'all' 
    ? audits 
    : audits.filter(a => a.websiteUrl === filterUrl);

  // Prepare chart data for score tracking over time
  const chartData = filteredAudits.map(audit => ({
    date: format(new Date(audit.createdAt), 'MMM d'),
    overall: audit.overallScore,
    seo: audit.seoScore,
    performance: audit.performanceScore,
    mobile: audit.mobileScore,
    security: audit.securityScore,
  })).reverse(); // Reverse to show oldest to newest

  // Calculate average scores
  const avgScores = {
    overall: Math.round(audits.reduce((sum, a) => sum + a.overallScore, 0) / (audits.length || 1)),
    seo: Math.round(audits.reduce((sum, a) => sum + a.seoScore, 0) / (audits.length || 1)),
    performance: Math.round(audits.reduce((sum, a) => sum + a.performanceScore, 0) / (audits.length || 1)),
    mobile: Math.round(audits.reduce((sum, a) => sum + a.mobileScore, 0) / (audits.length || 1)),
    security: Math.round(audits.reduce((sum, a) => sum + a.securityScore, 0) / (audits.length || 1)),
  };

  // Get latest audit for comparison
  const latestAudit = filteredAudits[0];
  const previousAudit = filteredAudits[1];

  // Calculate improvement
  const improvement = latestAudit && previousAudit 
    ? latestAudit.overallScore - previousAudit.overallScore 
    : 0;

  // Prepare radar chart data for latest audit
  const radarData = latestAudit ? [
    {
      category: 'SEO',
      score: latestAudit.seoScore,
      fullMark: 100,
    },
    {
      category: 'Performance',
      score: latestAudit.performanceScore,
      fullMark: 100,
    },
    {
      category: 'Mobile',
      score: latestAudit.mobileScore,
      fullMark: 100,
    },
    {
      category: 'Security',
      score: latestAudit.securityScore,
      fullMark: 100,
    },
  ] : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-600">Loading your audit history...</p>
        </div>
      </div>
    );
  }

  if (audits.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3">No Audits Yet</h2>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              You haven't run any website audits yet. Start by analyzing your website to get actionable insights and recommendations.
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-blue-700">
              <Link href="/dashboard/audits/new">
                <Plus className="w-5 h-5 mr-2" />
                Run Your First Audit
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 truncate">Website Audits</h1>
          <p className="text-sm sm:text-base text-slate-600">
            Track your website performance and improvements over time
          </p>
        </div>
        <Button size="sm" asChild className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700">
          <Link href="/dashboard/audits/new">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            New Audit
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Total Audits</span>
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold">{audits.length}</p>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Average Score</span>
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <p className={`text-3xl font-bold ${getScoreColor(avgScores.overall)}`}>
              {avgScores.overall}
            </p>
            <p className="text-xs text-slate-500 mt-1">Across all audits</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Latest Score</span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className={`text-3xl font-bold ${getScoreColor(latestAudit?.overallScore || 0)}`}>
              {latestAudit?.overallScore || 0}
            </p>
            {improvement !== 0 && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {improvement > 0 ? '↑' : '↓'} {Math.abs(improvement)} from previous
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Websites Tracked</span>
              <ExternalLink className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold">{uniqueUrls.length - 1}</p>
            <p className="text-xs text-slate-500 mt-1">Unique domains</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      {uniqueUrls.length > 2 && (
        <Card className="shadow-lg">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-slate-600" />
              <span className="font-medium text-sm">Filter by website:</span>
              <div className="flex flex-wrap gap-2">
                {uniqueUrls.map(url => (
                  <button
                    key={url}
                    onClick={() => setFilterUrl(url)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      filterUrl === url
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {url === 'all' ? 'All Websites' : url.replace('https://', '').replace('http://', '').split('/')[0]}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="timeline">Score Timeline</TabsTrigger>
          <TabsTrigger value="comparison">Category Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Score Progress Over Time</CardTitle>
              <CardDescription>
                Track how your website scores have improved across all categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="overall" stroke="#2563eb" strokeWidth={3} name="Overall" />
                    <Line type="monotone" dataKey="seo" stroke="#10b981" strokeWidth={2} name="SEO" />
                    <Line type="monotone" dataKey="performance" stroke="#f59e0b" strokeWidth={2} name="Performance" />
                    <Line type="monotone" dataKey="mobile" stroke="#8b5cf6" strokeWidth={2} name="Mobile" />
                    <Line type="monotone" dataKey="security" stroke="#ef4444" strokeWidth={2} name="Security" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Latest Audit Breakdown</CardTitle>
                <CardDescription>
                  Scores across all categories from your most recent audit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar name="Score" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Average Scores by Category</CardTitle>
                <CardDescription>
                  Your average performance across all audits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { category: 'SEO', score: avgScores.seo },
                        { category: 'Performance', score: avgScores.performance },
                        { category: 'Mobile', score: avgScores.mobile },
                        { category: 'Security', score: avgScores.security },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Audit History List */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Audit History</CardTitle>
          <CardDescription>
            All your website audits sorted by most recent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAudits.map((audit, index) => (
              <motion.div
                key={audit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 rounded-lg border-2 border-slate-200 hover:border-blue-300 transition-all hover:shadow-md"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${getScoreBgColor(audit.overallScore)}`}>
                        <span className={`text-2xl font-bold ${getScoreColor(audit.overallScore)}`}>
                          {audit.overallScore}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1 truncate">{audit.websiteUrl}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span>{format(new Date(audit.createdAt), 'MMM d, yyyy • h:mm a')}</span>
                        </div>
                        <Badge variant="outline" className="mt-2">
                          {getScoreLabel(audit.overallScore)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Search className="w-4 h-4 text-slate-500" />
                          <span className="text-xs text-slate-600">SEO</span>
                        </div>
                        <p className={`text-xl font-bold ${getScoreColor(audit.seoScore)}`}>
                          {audit.seoScore}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Zap className="w-4 h-4 text-slate-500" />
                          <span className="text-xs text-slate-600">Performance</span>
                        </div>
                        <p className={`text-xl font-bold ${getScoreColor(audit.performanceScore)}`}>
                          {audit.performanceScore}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Smartphone className="w-4 h-4 text-slate-500" />
                          <span className="text-xs text-slate-600">Mobile</span>
                        </div>
                        <p className={`text-xl font-bold ${getScoreColor(audit.mobileScore)}`}>
                          {audit.mobileScore}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Shield className="w-4 h-4 text-slate-500" />
                          <span className="text-xs text-slate-600">Security</span>
                        </div>
                        <p className={`text-xl font-bold ${getScoreColor(audit.securityScore)}`}>
                          {audit.securityScore}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(audit)}
                      className="flex-1 lg:flex-none"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleRerun(audit.websiteUrl)}
                      className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-700"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Re-run
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Audit Details</DialogTitle>
            <DialogDescription>
              {selectedAudit?.websiteUrl} • {selectedAudit && format(new Date(selectedAudit.createdAt), 'MMM d, yyyy • h:mm a')}
            </DialogDescription>
          </DialogHeader>

          {selectedAudit && (
            <div className="space-y-6 mt-4">
              {/* Overall Score */}
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                <h3 className="text-sm font-medium text-slate-600 mb-2">Overall Score</h3>
                <p className={`text-5xl font-bold ${getScoreColor(selectedAudit.overallScore)}`}>
                  {selectedAudit.overallScore}
                </p>
                <Badge variant="outline" className="mt-2">
                  {getScoreLabel(selectedAudit.overallScore)}
                </Badge>
              </div>

              {/* Category Scores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'SEO', score: selectedAudit.seoScore, icon: Search },
                  { label: 'Performance', score: selectedAudit.performanceScore, icon: Zap },
                  { label: 'Mobile', score: selectedAudit.mobileScore, icon: Smartphone },
                  { label: 'Security', score: selectedAudit.securityScore, icon: Shield },
                ].map((category) => (
                  <div key={category.label} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <category.icon className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-600">{category.label}</span>
                    </div>
                    <p className={`text-3xl font-bold ${getScoreColor(category.score)}`}>
                      {category.score}
                    </p>
                    <Progress value={category.score} className="h-2 mt-2" />
                  </div>
                ))}
              </div>

              {/* Issues & Recommendations */}
              <Tabs defaultValue="issues" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="issues">Issues Found</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>

                <TabsContent value="issues" className="space-y-3 mt-4">
                  {(() => {
                    try {
                      const issues = JSON.parse(selectedAudit.issues);
                      const allIssues = [
                        ...(issues.critical || []).map((i: string) => ({ type: 'critical', text: i })),
                        ...(issues.warnings || []).map((i: string) => ({ type: 'warning', text: i })),
                      ];

                      if (allIssues.length === 0) {
                        return (
                          <div className="text-center py-8 text-slate-600">
                            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-600" />
                            <p>No critical issues found!</p>
                          </div>
                        );
                      }

                      return allIssues.map((issue, index) => (
                        <div
                          key={index}
                          className={`flex gap-3 p-4 rounded-lg border ${
                            issue.type === 'critical'
                              ? 'bg-red-50 border-red-200'
                              : 'bg-yellow-50 border-yellow-200'
                          }`}
                        >
                          {issue.type === 'critical' ? (
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          )}
                          <p className="text-sm text-slate-700">{issue.text}</p>
                        </div>
                      ));
                    } catch (e) {
                      return <p className="text-sm text-slate-600">No issues data available</p>;
                    }
                  })()}
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-3 mt-4">
                  {(() => {
                    try {
                      const recommendations = JSON.parse(selectedAudit.recommendations);
                      
                      if (!recommendations || recommendations.length === 0) {
                        return (
                          <div className="text-center py-8 text-slate-600">
                            <p>No recommendations available</p>
                          </div>
                        );
                      }

                      return recommendations.map((rec: any, index: number) => (
                        <div key={index} className="p-4 rounded-lg border-2 border-slate-200">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant={
                              rec.priority === 'high' ? 'destructive' :
                              rec.priority === 'medium' ? 'default' :
                              'secondary'
                            }>
                              {rec.priority} priority
                            </Badge>
                            <span className="text-xs text-slate-600">{rec.category}</span>
                          </div>
                          <h4 className="font-semibold mb-1">{rec.issue}</h4>
                          <p className="text-sm text-slate-600">{rec.solution}</p>
                        </div>
                      ));
                    } catch (e) {
                      return <p className="text-sm text-slate-600">No recommendations data available</p>;
                    }
                  })()}
                </TabsContent>
              </Tabs>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setDetailsOpen(false);
                    handleRerun(selectedAudit.websiteUrl);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Run New Audit
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(selectedAudit.websiteUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Website
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
