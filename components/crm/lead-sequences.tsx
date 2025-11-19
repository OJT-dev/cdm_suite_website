
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
  CheckSquare,
  GitBranch,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { SequenceAssignment, Sequence } from '@/lib/sequence-types';
import Link from 'next/link';

interface LeadSequencesProps {
  leadId: string;
}

export function LeadSequences({ leadId }: LeadSequencesProps) {
  const [assignments, setAssignments] = useState<SequenceAssignment[]>([]);
  const [availableSequences, setAvailableSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [autoStart, setAutoStart] = useState(false);

  useEffect(() => {
    fetchAssignments();
    fetchAvailableSequences();
  }, [leadId]);

  const fetchAssignments = async () => {
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/sequences`);
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSequences = async () => {
    try {
      const res = await fetch('/api/crm/sequences?status=active');
      if (res.ok) {
        const data = await res.json();
        setAvailableSequences(data.sequences);
      }
    } catch (error) {
      console.error('Error fetching sequences:', error);
    }
  };

  const handleAssignSequence = async () => {
    if (!selectedSequence) {
      toast.error('Please select a sequence');
      return;
    }

    try {
      const res = await fetch(`/api/crm/leads/${leadId}/sequences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sequenceId: selectedSequence,
          notes,
          autoStart,
        }),
      });

      if (res.ok) {
        toast.success('Sequence assigned successfully');
        setShowAssignDialog(false);
        setSelectedSequence('');
        setNotes('');
        setAutoStart(false);
        fetchAssignments();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to assign sequence');
      }
    } catch (error) {
      console.error('Error assigning sequence:', error);
      toast.error('An error occurred');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'paused':
        return 'bg-orange-100 text-orange-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {assignments.length === 0
            ? 'No sequences assigned to this lead'
            : `${assignments.length} sequence${assignments.length === 1 ? '' : 's'} assigned`}
        </p>
        <Button size="sm" onClick={() => setShowAssignDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Assign Sequence
        </Button>
      </div>

      {assignments.length > 0 ? (
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">
                      {assignment.sequence?.name || 'Unknown Sequence'}
                    </h4>
                    <Badge className={cn('text-xs', getStatusColor(assignment.status))}>
                      {assignment.status}
                    </Badge>
                  </div>
                  {assignment.sequence?.description && (
                    <p className="text-sm text-gray-600">
                      {assignment.sequence.description}
                    </p>
                  )}
                </div>
                <Link href={`/dashboard/crm/sequences/${assignment.sequenceId}`}>
                  <Button variant="ghost" size="sm">
                    <GitBranch className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-gray-900">
                    {assignment.currentStep} / {assignment.sequence?.steps?.length || 0} steps
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        assignment.sequence?.steps?.length
                          ? (assignment.currentStep / assignment.sequence.steps.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600 text-xs mb-1">
                    <Mail className="h-3 w-3" />
                    Sent
                  </div>
                  <div className="font-semibold text-gray-900">{assignment.emailsSent}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600 text-xs mb-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Opened
                  </div>
                  <div className="font-semibold text-gray-900">
                    {assignment.emailsOpened}
                    {assignment.emailsSent > 0 && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({Math.round((assignment.emailsOpened / assignment.emailsSent) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600 text-xs mb-1">
                    <MessageSquare className="h-3 w-3" />
                    Replied
                  </div>
                  <div className="font-semibold text-gray-900">{assignment.emailsReplied}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600 text-xs mb-1">
                    <CheckSquare className="h-3 w-3" />
                    Tasks
                  </div>
                  <div className="font-semibold text-gray-900">
                    {assignment.tasksCompleted}/{assignment.tasksCreated}
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              {(assignment.startedAt || assignment.completedAt) && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                  {assignment.startedAt && (
                    <div>Started: {new Date(assignment.startedAt).toLocaleDateString()}</div>
                  )}
                  {assignment.completedAt && (
                    <div>Completed: {new Date(assignment.completedAt).toLocaleDateString()}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">No sequences assigned</h3>
          <p className="text-sm text-gray-600 mb-4">
            Assign a sequence to automate communication with this lead
          </p>
          <Button onClick={() => setShowAssignDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Assign First Sequence
          </Button>
        </div>
      )}

      {/* Assign Sequence Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Sequence</DialogTitle>
            <DialogDescription>
              Choose a sequence to automate communication with this lead
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label>Sequence</Label>
              <Select value={selectedSequence} onValueChange={setSelectedSequence}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a sequence" />
                </SelectTrigger>
                <SelectContent>
                  {availableSequences.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No active sequences available.{' '}
                      <Link href="/dashboard/crm/sequences" className="text-blue-600 hover:underline">
                        Create one
                      </Link>
                    </div>
                  ) : (
                    availableSequences.map((seq) => (
                      <SelectItem key={seq.id} value={seq.id}>
                        {seq.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this assignment..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoStart"
                checked={autoStart}
                onChange={(e) => setAutoStart(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="autoStart" className="cursor-pointer">
                Start sequence immediately
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignSequence}>Assign Sequence</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
