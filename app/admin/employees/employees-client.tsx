
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, UserCircle, Mail, Phone, Briefcase } from 'lucide-react';
import { getRoleDisplayName, getDepartmentDisplayName } from '@/lib/roles';
import { toast } from 'sonner';

interface Employee {
  id: string;
  employeeRole: string;
  department: string | null;
  status: string;
  weeklyCapacity: number;
  skillSet: string[];
  projectsCompleted: number;
  avgProjectRating: number | null;
  hireDate: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    image: string | null;
    createdAt: string;
    lastLoginAt: string | null;
  };
  capabilities: any;
}

export default function EmployeesClient() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/employees');
      
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }

      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/employees/${deleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete employee');
      }

      toast.success('Employee deleted successfully');
      setDeleteId(null);
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-700 hover:bg-green-500/20';
      case 'on_leave':
        return 'bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20';
      case 'inactive':
        return 'bg-gray-500/10 text-gray-700 hover:bg-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 hover:bg-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading employees...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Employee Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your team members, roles, and permissions
          </p>
        </div>
        <Link href="/admin/employees/new">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Add Employee
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {employees.length} {employees.length === 1 ? 'employee' : 'employees'} in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-12">
              <UserCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No employees yet</h3>
              <p className="text-muted-foreground mb-6">
                Get started by adding your first team member
              </p>
              <Link href="/admin/employees/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{employee.user.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Mail className="h-3 w-3" />
                            {employee.user.email}
                          </div>
                          {employee.user.phone && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {employee.user.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          {getRoleDisplayName(employee.employeeRole)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {employee.department ? getDepartmentDisplayName(employee.department) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatusColor(employee.status)}>
                          {employee.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{employee.projectsCompleted} completed</div>
                          {employee.avgProjectRating && (
                            <div className="text-muted-foreground">
                              ⭐ {employee.avgProjectRating.toFixed(1)} rating
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/employees/${employee.id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(employee.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this employee? This action cannot be undone and will
              remove their account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
