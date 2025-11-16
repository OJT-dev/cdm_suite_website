
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit,
  Play,
  Pause,
  Archive,
  CheckCircle2,
  XCircle,
  Mail,
  Clock,
  TrendingUp,
  Users,
  Sparkles,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  formatSequenceStatus,
  getSequenceStatusColor,
  formatDelay,
  getStepTypeIcon,
} from '@/lib/sequence-utils';
import { format } from 'date-fns';

export default function SequenceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [sequence, setSequence] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSequence();
  }, [params.id]);

  const fetchSequence = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/crm/sequences/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch sequence');

      const data = await response.json();
      setSequence(data.sequence);
    } catch (error) {
      console.error('Error fetching sequence:', error);
      toast.error('Failed to load sequence');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approved: boolean) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/crm/sequences/${params.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved, feedback }),
      });

      if (!response.ok) throw new Error('Failed to update sequence');

      const data = await response.json();
      toast.success(data.message);
      setApprovalDialogOpen(false);
      fetchSequence();
    } catch (error) {
      console.error('Error updating sequence:', error);
      toast.error('Failed to update sequence');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/crm/sequences/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast.success('Status updated successfully');
      fetchSequence();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading sequence...</p>
        </div>
      </div>
    );
  }

  if (!sequence) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Sequence not found</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{sequence.name}</h1>
              {sequence.aiGenerated && (
                <Badge variant="outline">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI
                </Badge>
              )}
            </div>
            {sequence.description && (
              <p className="text-muted-foreground mt-1">{sequence.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {sequence.status === 'pending' && (
            <Button onClick={() => setApprovalDialogOpen(true)}>
              Review & Approve
            </Button>
          )}
          {sequence.status === 'active' && (
            <Button
              variant="outline"
              onClick={() => handleUpdateStatus('paused')}
              disabled={actionLoading}
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          {sequence.status === 'paused' && (
            <Button
              variant="outline"
              onClick={() => handleUpdateStatus('active')}
              disabled={actionLoading}
            >
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/crm/sequences/${params.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Status & Metrics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getSequenceStatusColor(sequence.status)}>
              {formatSequenceStatus(sequence.status)}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Assigned Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sequence.metrics?.totalAssignments || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sequence.metrics?.openRate?.toFixed(1) || 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sequence.metrics?.clickRate?.toFixed(1) || 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sequence.metrics?.conversionRate?.toFixed(1) || 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="steps" className="space-y-4">
        <TabsList>
          <TabsTrigger value="steps">Steps ({sequence.steps?.length || 0})</TabsTrigger>
          <TabsTrigger value="assignments">
            Assignments ({sequence.assignments?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="steps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sequence Steps</CardTitle>
              <CardDescription>
                The automated flow that leads will go through
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sequence.steps?.map((step: any, index: number) => (
                  <div key={step.id} className="relative">
                    {index > 0 && (
                      <div className="absolute left-4 top-0 h-4 w-0.5 bg-border" />
                    )}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                          {step.order}
                        </div>
                      </div>
                      <div className="flex-1 border rounded-lg p-4 bg-muted/30">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{getStepTypeIcon(step.stepType)}</span>
                              <h4 className="font-semibold">{step.title}</h4>
                              {step.aiSuggested && (
                                <Badge variant="secondary" className="ml-2">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  AI
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatDelay(step.delayAmount, step.delayUnit)} from{' '}
                              {step.delayFrom === 'start' ? 'sequence start' : 'previous step'}
                            </p>
                          </div>
                        </div>

                        {step.subject && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-muted-foreground">Subject:</p>
                            <p className="text-sm">{step.subject}</p>
                          </div>
                        )}

                        {step.content && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-muted-foreground">Content:</p>
                            <p className="text-sm whitespace-pre-wrap">{step.content}</p>
                          </div>
                        )}

                        {step.aiReasoning && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                              <Sparkles className="h-3 w-3 inline mr-1" />
                              AI Reasoning: {step.aiReasoning}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Assignments</CardTitle>
              <CardDescription>Leads currently in this sequence</CardDescription>
            </CardHeader>
            <CardContent>
              {sequence.assignments?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No leads assigned to this sequence yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Current Step</TableHead>
                      <TableHead>Started</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sequence.assignments?.map((assignment: any) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{assignment.lead?.name || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">
                              {assignment.lead?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{assignment.lead?.company || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{assignment.status}</Badge>
                        </TableCell>
                        <TableCell>
                          Step {assignment.currentStep} / {sequence.steps?.length}
                        </TableCell>
                        <TableCell>
                          {assignment.startedAt
                            ? format(new Date(assignment.startedAt), 'MMM d, yyyy')
                            : 'Not started'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Email Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emails Sent</span>
                  <span className="font-semibold">{sequence.metrics?.emailsSent || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Opened</span>
                  <span className="font-semibold">{sequence.metrics?.emailsOpened || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Clicked</span>
                  <span className="font-semibold">{sequence.metrics?.emailsClicked || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Replied</span>
                  <span className="font-semibold">{sequence.metrics?.emailsReplied || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Assignments</span>
                  <span className="font-semibold">
                    {sequence.metrics?.totalAssignments || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active</span>
                  <span className="font-semibold">
                    {sequence.metrics?.activeAssignments || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-semibold">
                    {sequence.metrics?.completedAssignments || 0}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium">Conversion Rate</span>
                  <span className="font-bold text-lg">
                    {sequence.metrics?.conversionRate?.toFixed(1) || 0}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Sequence</DialogTitle>
            <DialogDescription>
              Review this sequence and decide whether to approve or reject it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="feedback">Feedback (optional)</Label>
              <Textarea
                id="feedback"
                placeholder="Add notes or feedback..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleApprove(false)}
              disabled={actionLoading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button onClick={() => handleApprove(true)} disabled={actionLoading}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve & Activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

