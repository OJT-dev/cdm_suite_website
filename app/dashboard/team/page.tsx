
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface EmployeeWorkload {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  capacity: {
    weekly: number;
    current: number;
    available: number;
    utilizationRate: number;
  };
  projects: {
    current: number;
    max: number;
  };
  tasks: number;
  assignments: number;
  status: string;
}

export default function TeamWorkloadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeWorkload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    // @ts-ignore
    if (session?.user?.role === 'admin' || session?.user?.role === 'employee') {
      fetchTeamWorkload();
    }
  }, [session]);

  const fetchTeamWorkload = async () => {
    try {
      const res = await fetch('/api/team/workload');
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error('Error fetching team workload:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUtilizationBadge = (rate: number) => {
    if (rate >= 90) return { variant: 'destructive' as const, label: 'Overloaded' };
    if (rate >= 75) return { variant: 'outline' as const, label: 'High' };
    if (rate >= 50) return { variant: 'secondary' as const, label: 'Optimal' };
    return { variant: 'outline' as const, label: 'Available' };
  };

  const teamStats = {
    total: employees.length,
    available: employees.filter(e => e.status === 'available' && e.capacity.utilizationRate < 75).length,
    busy: employees.filter(e => e.capacity.utilizationRate >= 75).length,
    avgUtilization: employees.length > 0
      ? Math.round(employees.reduce((sum, e) => sum + e.capacity.utilizationRate, 0) / employees.length)
      : 0,
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Team Workload Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Monitor team capacity and project assignments
        </p>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">Total Team</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{teamStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">Available</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{teamStats.available}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">High Load</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{teamStats.busy}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">Avg Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className={`text-xl sm:text-2xl font-bold ${getUtilizationColor(teamStats.avgUtilization)}`}>
              {teamStats.avgUtilization}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold">Team Members</h2>
        
        {employees.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 px-4">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
              <p className="text-sm sm:text-base text-muted-foreground">No team members found</p>
            </CardContent>
          </Card>
        ) : (
          employees.map((employee) => {
            const utilizationBadge = getUtilizationBadge(employee.capacity.utilizationRate);
            
            return (
              <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg truncate">{employee.name || employee.email}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm truncate">
                        {employee.role}
                        {employee.department && ` • ${employee.department}`}
                      </CardDescription>
                    </div>
                    <Badge variant={utilizationBadge.variant} className="w-fit">
                      {utilizationBadge.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                  {/* Capacity */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm mb-2 gap-1">
                      <span className="text-muted-foreground">Weekly Capacity</span>
                      <span className={`font-medium ${getUtilizationColor(employee.capacity.utilizationRate)}`}>
                        {employee.capacity.current}h / {employee.capacity.weekly}h ({employee.capacity.utilizationRate}%)
                      </span>
                    </div>
                    <Progress value={employee.capacity.utilizationRate} className="h-2" />
                    <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {employee.capacity.available}h available this week
                    </div>
                  </div>

                  {/* Projects and Tasks */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 border-t">
                    <div>
                      <div className="text-xs sm:text-sm text-muted-foreground truncate">Projects</div>
                      <div className="text-base sm:text-lg font-semibold">
                        {employee.projects.current} / {employee.projects.max}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-muted-foreground truncate">Tasks</div>
                      <div className="text-base sm:text-lg font-semibold">{employee.tasks}</div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-muted-foreground truncate">Assigns</div>
                      <div className="text-base sm:text-lg font-semibold">{employee.assignments}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
