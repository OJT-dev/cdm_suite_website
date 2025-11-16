
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ClipboardList, 
  Play, 
  Pause, 
  CheckCircle2, 
  XCircle,
  Clock,
  Users,
  ArrowRight
} from 'lucide-react';

interface Workflow {
  id: string;
  serviceName: string;
  serviceTier?: string;
  status: string;
  progress: number;
  createdAt: string;
  startedAt?: string;
  expectedCompletionDate?: string;
  completedAt?: string;
  tasks: any[];
  teamAssignments: any[];
}

export default function WorkflowsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const res = await fetch('/api/workflows');
      if (res.ok) {
        const data = await res.json();
        setWorkflows(data.workflows || []);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'on_hold':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'in_progress':
        return <Play className="h-4 w-4" />;
      case 'on_hold':
        return <Pause className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredWorkflows = workflows.filter(w => {
    if (activeTab === 'all') return true;
    return w.status === activeTab;
  });

  const stats = {
    total: workflows.length,
    pending: workflows.filter(w => w.status === 'pending').length,
    in_progress: workflows.filter(w => w.status === 'in_progress').length,
    completed: workflows.filter(w => w.status === 'completed').length,
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Service Fulfillment Workflows</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Track progress of all service deliveries
          </p>
        </div>
        {/* @ts-ignore */}
        {(session?.user?.role === 'admin' || session?.user?.role === 'employee') && (
          <Link href="/dashboard/workflows/create" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <ClipboardList className="mr-2 h-4 w-4" />
              Create Workflow
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              Total Workflows
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.in_progress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex-wrap h-auto gap-1">
          <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending</TabsTrigger>
          <TabsTrigger value="in_progress" className="text-xs sm:text-sm">In Progress</TabsTrigger>
          <TabsTrigger value="on_hold" className="text-xs sm:text-sm">On Hold</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-3 sm:space-y-4 mt-4">
          {filteredWorkflows.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 px-4">
                <ClipboardList className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                <p className="text-sm sm:text-base text-muted-foreground">
                  No workflows found
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredWorkflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                    <div className="space-y-1 min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-xl break-words">
                        {workflow.serviceName}
                        {workflow.serviceTier && (
                          <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-2">
                            ({workflow.serviceTier})
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Started: {workflow.startedAt 
                          ? new Date(workflow.startedAt).toLocaleDateString()
                          : 'Not started'}
                        {workflow.expectedCompletionDate && (
                          <>
                            <br className="sm:hidden" />
                            <span className="hidden sm:inline"> • </span>Expected: {new Date(workflow.expectedCompletionDate).toLocaleDateString()}
                          </>
                        )}
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(workflow.status)} text-white flex items-center gap-1 w-fit flex-shrink-0 text-xs sm:text-sm`}>
                      {getStatusIcon(workflow.status)}
                      <span className="hidden sm:inline">{workflow.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{workflow.progress}%</span>
                    </div>
                    <Progress value={workflow.progress} className="h-2" />
                  </div>

                  {/* Tasks and Team Info */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">
                        {workflow.tasks.filter((t: any) => t.status === 'completed').length} / {workflow.tasks.length} tasks
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">{workflow.teamAssignments.length} team members</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link href={`/dashboard/workflows/${workflow.id}`} className="block">
                    <Button variant="outline" className="w-full group text-sm">
                      View Details
                      <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
