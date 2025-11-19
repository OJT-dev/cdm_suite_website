
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  User, 
  Calendar,
  Users,
  ArrowLeft,
  Play,
  Pause
} from 'lucide-react';

export default function WorkflowDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const workflowId = params?.id as string;

  const [workflow, setWorkflow] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (workflowId) {
      fetchWorkflow();
    }
  }, [workflowId]);

  const fetchWorkflow = async () => {
    try {
      const res = await fetch(`/api/workflows/${workflowId}`);
      if (res.ok) {
        const data = await res.json();
        setWorkflow(data.workflow);
      }
    } catch (error) {
      console.error('Error fetching workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignTeam = async () => {
    if (!confirm('Automatically assign team members to this workflow?')) return;

    try {
      const res = await fetch(`/api/workflows/${workflowId}/assign-team`, {
        method: 'POST',
      });

      if (res.ok) {
        alert('Team assigned successfully!');
        fetchWorkflow();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to assign team');
      }
    } catch (error) {
      console.error('Error assigning team:', error);
      alert('Failed to assign team');
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/workflows/${workflowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchWorkflow();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'assigned':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'blocked':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Workflow not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAdmin = session?.user && 
    // @ts-ignore
    (session.user.role === 'admin' || session.user.role === 'employee');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Workflow Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-2xl">
                {workflow.serviceName}
                {workflow.serviceTier && (
                  <span className="text-lg font-normal text-muted-foreground ml-2">
                    ({workflow.serviceTier})
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Created: {new Date(workflow.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-base">
                {workflow.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{workflow.progress}%</span>
            </div>
            <Progress value={workflow.progress} className="h-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">Expected Completion</div>
                <div className="font-medium">
                  {workflow.expectedCompletionDate 
                    ? new Date(workflow.expectedCompletionDate).toLocaleDateString()
                    : 'TBD'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">Team Members</div>
                <div className="font-medium">{workflow.teamAssignments.length}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">Tasks</div>
                <div className="font-medium">
                  {workflow.tasks.filter((t: any) => t.status === 'completed').length} / {workflow.tasks.length}
                </div>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="flex gap-2 pt-4">
              {workflow.status === 'pending' && !workflow.teamAssigned && (
                <Button onClick={assignTeam}>
                  <Users className="mr-2 h-4 w-4" />
                  Auto-Assign Team
                </Button>
              )}
              {workflow.status === 'pending' && workflow.teamAssigned && (
                <Button onClick={() => updateStatus('in_progress')}>
                  <Play className="mr-2 h-4 w-4" />
                  Start Workflow
                </Button>
              )}
              {workflow.status === 'in_progress' && (
                <Button variant="outline" onClick={() => updateStatus('on_hold')}>
                  <Pause className="mr-2 h-4 w-4" />
                  Put On Hold
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Assignments */}
      {workflow.teamAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Assigned team for this project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workflow.teamAssignments.map((assignment: any) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {assignment.employee.user.name || assignment.employee.user.email}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {assignment.role}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-muted-foreground">Hours</div>
                    <div className="font-medium">
                      {assignment.actualHours} / {assignment.allocatedHours}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>Project milestones and deliverables</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflow.tasks.map((task: any, index: number) => (
              <div key={task.id}>
                <div className={`p-4 border rounded-lg ${getTaskStatusColor(task.status)}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{task.title}</div>
                          {task.description && (
                            <div className="text-sm mt-1 opacity-80">
                              {task.description}
                            </div>
                          )}
                        </div>
                        <Badge variant="outline" className="ml-4">
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm mt-3">
                        {task.assignedTo && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.assignedTo.user.name || task.assignedTo.user.email}
                          </div>
                        )}
                        {task.estimatedHours && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.estimatedHours}h estimated
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {index < workflow.tasks.length - 1 && (
                  <div className="h-4 w-0.5 bg-gray-200 ml-6"></div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Client Notes */}
      {workflow.clientNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Client Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{workflow.clientNotes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
