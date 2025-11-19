'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Shield } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  EMPLOYEE_ROLES,
  DEPARTMENTS,
  DEFAULT_CAPABILITIES,
  getRoleDisplayName,
  getDepartmentDisplayName,
  type EmployeeCapabilities,
  type EmployeeRole,
} from '@/lib/roles';

interface EmployeeFormData {
  name: string;
  email: string;
  phone: string;
  password?: string;
  employeeRole: string;
  department: string;
  weeklyCapacity: number;
  skillSet: string[];
  capabilities: EmployeeCapabilities;
  status: string;
}

interface EmployeeFormProps {
  mode: 'create' | 'edit';
  employeeId?: string;
}

export default function EmployeeForm({ mode, employeeId }: EmployeeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    employeeRole: EMPLOYEE_ROLES.DEVELOPER,
    department: DEPARTMENTS.DEVELOPMENT,
    weeklyCapacity: 40,
    skillSet: [],
    capabilities: DEFAULT_CAPABILITIES[EMPLOYEE_ROLES.DEVELOPER],
    status: 'active',
  });

  useEffect(() => {
    if (mode === 'edit' && employeeId) {
      fetchEmployee();
    }
  }, [mode, employeeId]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/employees/${employeeId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch employee');
      }

      const data = await response.json();
      setFormData({
        name: data.user.name || '',
        email: data.user.email,
        phone: data.user.phone || '',
        employeeRole: data.employeeRole,
        department: data.department || DEPARTMENTS.DEVELOPMENT,
        weeklyCapacity: data.weeklyCapacity,
        skillSet: data.skillSet,
        capabilities: data.capabilities,
        status: data.status,
      });
    } catch (error) {
      console.error('Error fetching employee:', error);
      toast.error('Failed to load employee data');
      router.push('/admin/employees');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole: string) => {
    setFormData({
      ...formData,
      employeeRole: newRole,
      capabilities: DEFAULT_CAPABILITIES[newRole as EmployeeRole],
    });
  };

  const handleCapabilityToggle = (capability: keyof EmployeeCapabilities) => {
    setFormData({
      ...formData,
      capabilities: {
        ...formData.capabilities,
        [capability]: !formData.capabilities[capability],
      },
    });
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skillSet.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skillSet: [...formData.skillSet, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skillSet: formData.skillSet.filter((s) => s !== skill),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.employeeRole) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (mode === 'create' && !formData.password) {
      toast.error('Password is required for new employees');
      return;
    }

    try {
      setSubmitting(true);

      const url = mode === 'create' 
        ? '/api/admin/employees'
        : `/api/admin/employees/${employeeId}`;

      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save employee');
      }

      toast.success(
        mode === 'create'
          ? 'Employee created successfully'
          : 'Employee updated successfully'
      );

      router.push('/admin/employees');
      router.refresh();
    } catch (error: any) {
      console.error('Error saving employee:', error);
      toast.error(error.message || 'Failed to save employee');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading employee data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-6">
        <Link href="/admin/employees">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Employees
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">
          {mode === 'create' ? 'Add New Employee' : 'Edit Employee'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {mode === 'create'
            ? 'Create a new employee account with role and permissions'
            : 'Update employee information and permissions'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Employee personal and contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={mode === 'edit'}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password {mode === 'create' ? '*' : '(leave blank to keep current)'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={mode === 'create'}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role & Department */}
        <Card>
          <CardHeader>
            <CardTitle>Role & Department</CardTitle>
            <CardDescription>
              Define the employee's role and department assignment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeRole">Employee Role *</Label>
                <Select
                  value={formData.employeeRole}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger id="employeeRole">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(EMPLOYEE_ROLES).map((role) => (
                      <SelectItem key={role} value={role}>
                        {getRoleDisplayName(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger id="department">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(DEPARTMENTS).map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {getDepartmentDisplayName(dept)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Details */}
        <Card>
          <CardHeader>
            <CardTitle>Work Details</CardTitle>
            <CardDescription>
              Weekly capacity and skill set
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weeklyCapacity">Weekly Capacity (hours)</Label>
              <Input
                id="weeklyCapacity"
                type="number"
                min="0"
                max="168"
                value={formData.weeklyCapacity}
                onChange={(e) =>
                  setFormData({ ...formData, weeklyCapacity: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skillSet">Skills</Label>
              <div className="flex gap-2">
                <Input
                  id="skillSet"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="e.g., Web Development, SEO, Design"
                />
                <Button type="button" onClick={addSkill}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skillSet.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Capabilities Matrix */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Capabilities Matrix</CardTitle>
            </div>
            <CardDescription>
              Define specific permissions and access rights for this employee
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* AI & Automation */}
              <div>
                <h4 className="font-semibold mb-3">AI & Automation</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="canApproveSequences" className="cursor-pointer">
                      Approve Sequences
                    </Label>
                    <Switch
                      id="canApproveSequences"
                      checked={formData.capabilities.canApproveSequences}
                      onCheckedChange={() => handleCapabilityToggle('canApproveSequences')}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="canCreateSequences" className="cursor-pointer">
                      Create Sequences
                    </Label>
                    <Switch
                      id="canCreateSequences"
                      checked={formData.capabilities.canCreateSequences}
                      onCheckedChange={() => handleCapabilityToggle('canCreateSequences')}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="canViewAIRecommendations" className="cursor-pointer">
                      View AI Recommendations
                    </Label>
                    <Switch
                      id="canViewAIRecommendations"
                      checked={formData.capabilities.canViewAIRecommendations}
                      onCheckedChange={() => handleCapabilityToggle('canViewAIRecommendations')}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="canApproveAIRecommendations" className="cursor-pointer">
                      Approve AI Recommendations
                    </Label>
                    <Switch
                      id="canApproveAIRecommendations"
                      checked={formData.capabilities.canApproveAIRecommendations}
                      onCheckedChange={() => handleCapabilityToggle('canApproveAIRecommendations')}
                    />
                  </div>
                </div>
              </div>

              {/* Project Management */}
              <div>
                <h4 className="font-semibold mb-3">Project Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="canViewAllProjects" className="cursor-pointer">
                      View All Projects
                    </Label>
                    <Switch
                      id="canViewAllProjects"
                      checked={formData.capabilities.canViewAllProjects}
                      onCheckedChange={() => handleCapabilityToggle('canViewAllProjects')}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="canViewAssignedProjects" className="cursor-pointer">
                      View Assigned Projects
                    </Label>
                    <Switch
                      id="canViewAssignedProjects"
                      checked={formData.capabilities.canViewAssignedProjects}
                      onCheckedChange={() => handleCapabilityToggle('canViewAssignedProjects')}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="canEditProjects" className="cursor-pointer">
                      Edit Projects
                    </Label>
                    <Switch
                      id="canEditProjects"
                      checked={formData.capabilities.canEditProjects}
                      onCheckedChange={() => handleCapabilityToggle('canEditProjects')}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="canAssignProjects" className="cursor-pointer">
                      Assign Projects
                    </Label>
                    <Switch
                      id="canAssignProjects"
                      checked={formData.capabilities.canAssignProjects}
                      onCheckedChange={() => handleCapabilityToggle('canAssignProjects')}
                    />
                  </div>
                </div>
              </div>

              {/* Client Communication */}
              <div>
                <h4 className="font-semibold mb-3">Client Communication</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="canMessageClients" className="cursor-pointer">
                      Message Clients
                    </Label>
                    <Switch
                      id="canMessageClients"
                      checked={formData.capabilities.canMessageClients}
                      onCheckedChange={() => handleCapabilityToggle('canMessageClients')}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="canViewClientMessages" className="cursor-pointer">
                      View Client Messages
                    </Label>
                    <Switch
                      id="canViewClientMessages"
                      checked={formData.capabilities.canViewClientMessages}
                      onCheckedChange={() => handleCapabilityToggle('canViewClientMessages')}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="canSendClientEmails" className="cursor-pointer">
                      Send Client Emails
                    </Label>
                    <Switch
                      id="canSendClientEmails"
                      checked={formData.capabilities.canSendClientEmails}
                      onCheckedChange={() => handleCapabilityToggle('canSendClientEmails')}
                    />
                  </div>
                </div>
              </div>

              {/* File Management */}
              <div>
                <h4 className="font-semibold mb-3">File Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="canUploadFiles" className="cursor-pointer">
                      Upload Files
                    </Label>
                    <Switch
                      id="canUploadFiles"
                      checked={formData.capabilities.canUploadFiles}
                      onCheckedChange={() => handleCapabilityToggle('canUploadFiles')}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="canViewClientFiles" className="cursor-pointer">
                      View Client Files
                    </Label>
                    <Switch
                      id="canViewClientFiles"
                      checked={formData.capabilities.canViewClientFiles}
                      onCheckedChange={() => handleCapabilityToggle('canViewClientFiles')}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="canEditClientFiles" className="cursor-pointer">
                      Edit Client Files
                    </Label>
                    <Switch
                      id="canEditClientFiles"
                      checked={formData.capabilities.canEditClientFiles}
                      onCheckedChange={() => handleCapabilityToggle('canEditClientFiles')}
                    />
                  </div>
                </div>
              </div>

              {/* Analytics & Reports */}
              <div>
                <h4 className="font-semibold mb-3">Analytics & Reports</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="canViewAnalytics" className="cursor-pointer">
                      View Analytics
                    </Label>
                    <Switch
                      id="canViewAnalytics"
                      checked={formData.capabilities.canViewAnalytics}
                      onCheckedChange={() => handleCapabilityToggle('canViewAnalytics')}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="canViewFinancials" className="cursor-pointer">
                      View Financials
                    </Label>
                    <Switch
                      id="canViewFinancials"
                      checked={formData.capabilities.canViewFinancials}
                      onCheckedChange={() => handleCapabilityToggle('canViewFinancials')}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="canExportReports" className="cursor-pointer">
                      Export Reports
                    </Label>
                    <Switch
                      id="canExportReports"
                      checked={formData.capabilities.canExportReports}
                      onCheckedChange={() => handleCapabilityToggle('canExportReports')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/employees">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={submitting} className="gap-2">
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {mode === 'create' ? 'Create Employee' : 'Save Changes'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
