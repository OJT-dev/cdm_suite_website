
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Plus,
  Filter,
  TrendingUp,
  Mail,
  MessageSquare,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  Edit,
  Eye,
  Play,
  Pause,
  Archive,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Sequence,
  SequenceFilters,
  SEQUENCE_STATUSES,
  SEQUENCE_TYPES,
} from '@/lib/sequence-types';
import {
  formatSequenceStatus,
  getSequenceStatusColor,
  calculateSequencePerformance,
} from '@/lib/sequence-utils';

export default function SequencesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [sequences, setSequences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SequenceFilters>({
    status: undefined,
    type: undefined,
    aiGenerated: undefined,
  });

  useEffect(() => {
    fetchSequences();
  }, [filters]);

  const fetchSequences = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.aiGenerated !== undefined)
        params.append('aiGenerated', String(filters.aiGenerated));
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/crm/sequences?${params}`);
      if (!response.ok) throw new Error('Failed to fetch sequences');

      const data = await response.json();
      setSequences(data.sequences || []);
    } catch (error) {
      console.error('Error fetching sequences:', error);
      toast.error('Failed to load sequences');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchSequences();
  };

  const handleCreateSequence = () => {
    router.push('/dashboard/crm/sequences/new');
  };

  const handleViewSequence = (id: string) => {
    router.push(`/dashboard/crm/sequences/${id}`);
  };

  const handleEditSequence = (id: string) => {
    router.push(`/dashboard/crm/sequences/${id}/edit`);
  };

  const handleDuplicateSequence = async (sequence: any) => {
    try {
      const response = await fetch('/api/crm/sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sequence,
          name: `${sequence.name} (Copy)`,
          status: 'pending',
          aiGenerated: false,
        }),
      });

      if (!response.ok) throw new Error('Failed to duplicate sequence');

      toast.success('Sequence duplicated successfully');
      fetchSequences();
    } catch (error) {
      console.error('Error duplicating sequence:', error);
      toast.error('Failed to duplicate sequence');
    }
  };

  const filteredSequences = sequences.filter((seq) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        seq.name.toLowerCase().includes(search) ||
        seq.description?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  // Calculate overall metrics
  const overallMetrics = {
    totalSequences: sequences.length,
    activeSequences: sequences.filter((s) => s.status === 'active').length,
    pendingApproval: sequences.filter((s) => s.status === 'pending').length,
    avgConversionRate:
      sequences.length > 0
        ? sequences.reduce((sum, s) => sum + (s.metrics?.conversionRate || 0), 0) /
          sequences.length
        : 0,
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Sequence Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Create, manage, and optimize your lead nurture sequences
          </p>
        </div>
        <Button onClick={handleCreateSequence} size="lg" className="w-full sm:w-auto flex-shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Create Sequence
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sequences</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.totalSequences}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sequences</CardTitle>
            <Play className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.activeSequences}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.pendingApproval}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallMetrics.avgConversionRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="space-y-3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sequences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value === 'all' ? undefined : value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {SEQUENCE_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.type || 'all'}
                onValueChange={(value) =>
                  setFilters({ ...filters, type: value === 'all' ? undefined : value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {SEQUENCE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={
                  filters.aiGenerated === undefined
                    ? 'all'
                    : filters.aiGenerated
                    ? 'true'
                    : 'false'
                }
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    aiGenerated:
                      value === 'all' ? undefined : value === 'true',
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Creator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">AI-Generated</SelectItem>
                  <SelectItem value="false">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading sequences...</div>
          ) : filteredSequences.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground px-4">
              No sequences found. Create your first sequence to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Name</TableHead>
                      <TableHead className="min-w-[100px]">Type</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[80px]">Steps</TableHead>
                      <TableHead className="min-w-[100px]">Assigned</TableHead>
                      <TableHead className="min-w-[120px]">Performance</TableHead>
                      <TableHead className="text-right min-w-[140px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSequences.map((sequence) => (
                      <TableRow key={sequence.id}>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <div className="min-w-0">
                              <div className="font-medium break-words">{sequence.name}</div>
                              {sequence.description && (
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {sequence.description}
                                </div>
                              )}
                              {sequence.aiGenerated && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  AI
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {sequence.type === 'email' && <Mail className="h-3 w-3 mr-1" />}
                            {sequence.type === 'sms' && <MessageSquare className="h-3 w-3 mr-1" />}
                            {sequence.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(getSequenceStatusColor(sequence.status), "text-xs whitespace-nowrap")}>
                            {formatSequenceStatus(sequence.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{sequence.steps?.length || 0}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {sequence._count?.assignments || 0} lead{sequence._count?.assignments !== 1 ? 's' : ''}
                        </TableCell>
                        <TableCell>
                          {sequence.metrics && (
                            <div className="text-xs">
                              <div>
                                Open: {sequence.metrics.openRate?.toFixed(1)}%
                              </div>
                              <div className="text-muted-foreground">
                                Conv: {sequence.metrics.conversionRate?.toFixed(1)}%
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewSequence(sequence.id)}
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSequence(sequence.id)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicateSequence(sequence)}
                              title="Duplicate"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

