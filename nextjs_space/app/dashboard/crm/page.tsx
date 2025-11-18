'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lead, LeadStatus, LeadFilters } from '@/lib/crm-types';
import { KanbanBoard } from '@/components/crm/kanban-board';
import { LeadsTable } from '@/components/crm/leads-table';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivityTimeline } from '@/components/crm/activity-timeline';
import { LeadSequences } from '@/components/crm/lead-sequences';
import { BulkImportDialog } from '@/components/crm/bulk-import-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Search,
  Plus,
  Filter,
  Users,
  TrendingUp,
  Star,
  Calendar,
  Phone,
  Mail,
  Building2,
  DollarSign,
  Clock,
  Save,
  X,
  Upload,
  FileText,
  Loader2,
  Trash2,
  Download,
  LayoutGrid,
  Table as TableIcon,
  CheckSquare
} from 'lucide-react';
import { LEAD_PRIORITIES, LEAD_SOURCES, formatLeadSource, getPriorityColor } from '@/lib/crm-utils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function CRMPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [showNewActivityDialog, setShowNewActivityDialog] = useState(false);
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);
  const [showBulkImportDialog, setShowBulkImportDialog] = useState(false);
  const [creatingLead, setCreatingLead] = useState(false);
  const [addingActivity, setAddingActivity] = useState(false);
  const [deletingLead, setDeletingLead] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // View mode and bulk operations
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState<LeadFilters>({
    search: '',
    status: undefined,
    priority: undefined,
    source: undefined
  });

  // New Activity Form
  const [newActivity, setNewActivity] = useState({
    type: 'note',
    title: '',
    description: ''
  });

  // New Lead Form
  const [newLeadForm, setNewLeadForm] = useState({
    email: '',
    name: '',
    phone: '',
    company: '',
    source: 'manual',
    interest: '',
    status: 'new',
    priority: 'medium',
    budget: '',
    timeline: '',
    notes: '',
  });

  // Fetch leads
  useEffect(() => {
    if (status === 'authenticated') {
      fetchLeads();
    }
  }, [status]);

  // Handle leadId query parameter for direct navigation from dashboard
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const leadId = params.get('leadId');
    
    if (leadId && leads.length > 0) {
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
        handleLeadClick(lead);
        // Clear the URL parameter
        window.history.replaceState({}, '', '/dashboard/crm');
      }
    }
  }, [leads]);

  // Apply filters
  useEffect(() => {
    let filtered = [...leads];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        lead =>
          lead.email.toLowerCase().includes(search) ||
          lead.name?.toLowerCase().includes(search) ||
          lead.company?.toLowerCase().includes(search)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(lead => lead.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(lead => lead.priority === filters.priority);
    }

    if (filters.source) {
      filtered = filtered.filter(lead => lead.source === filters.source);
    }

    setFilteredLeads(filtered);
  }, [leads, filters]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/crm/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads);
      } else {
        toast.error('Failed to fetch leads');
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async () => {
    try {
      // Validate required fields
      if (!newLeadForm.name && !newLeadForm.email && !newLeadForm.phone) {
        toast.error('Please provide at least a name, email, or phone number');
        return;
      }

      // Ensure source is set
      if (!newLeadForm.source) {
        toast.error('Please select a source');
        return;
      }

      setCreatingLead(true);
      
      const res = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeadForm),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle error response
        toast.error(data.error || 'Failed to create lead');
        return;
      }

      // Success - update state and close dialog
      setLeads([data.lead, ...leads]);
      toast.success('Lead created successfully! 🎉');
      
      // Reset form
      setNewLeadForm({
        email: '',
        name: '',
        phone: '',
        company: '',
        source: 'manual',
        interest: '',
        status: 'new',
        priority: 'medium',
        budget: '',
        timeline: '',
        notes: '',
      });
      
      // Close dialog
      setShowNewLeadDialog(false);
    } catch (error: any) {
      console.error('Error creating lead:', error);
      toast.error(error?.message || 'An unexpected error occurred');
    } finally {
      // Always reset loading state
      setCreatingLead(false);
    }
  };

  const handleLeadClick = async (lead: Lead) => {
    try {
      // Fetch full lead details
      const res = await fetch(`/api/crm/leads/${lead.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedLead(data.lead);
        setShowLeadDialog(true);
      }
    } catch (error) {
      console.error('Error fetching lead details:', error);
      toast.error('Failed to load lead details');
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const res = await fetch(`/api/crm/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const data = await res.json();
        setLeads(leads.map(l => (l.id === leadId ? data.lead : l)));
        toast.success('Lead status updated');
      } else {
        toast.error('Failed to update lead status');
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('An error occurred');
    }
  };

  const handleAddActivity = async () => {
    if (!selectedLead || !newActivity.title) {
      toast.error('Please fill in all required fields');
      return;
    }

    setAddingActivity(true);
    try {
      const res = await fetch(`/api/crm/leads/${selectedLead.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newActivity)
      });

      if (res.ok) {
        const data = await res.json();
        // Refresh lead details
        const leadRes = await fetch(`/api/crm/leads/${selectedLead.id}`);
        if (leadRes.ok) {
          const leadData = await leadRes.json();
          setSelectedLead(leadData.lead);
        }
        
        toast.success('Activity added successfully! 📝');
        setNewActivity({ type: 'note', title: '', description: '' });
        setShowNewActivityDialog(false);
      } else {
        toast.error('Failed to add activity');
      }
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('An error occurred while adding activity');
    } finally {
      setAddingActivity(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!selectedLead) return;

    setDeletingLead(true);
    try {
      const res = await fetch(`/api/crm/leads/${selectedLead.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        // Remove lead from list
        setLeads(leads.filter(l => l.id !== selectedLead.id));
        toast.success('Lead deleted successfully');
        setShowDeleteDialog(false);
        setShowLeadDialog(false);
        setSelectedLead(null);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to delete lead');
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('An error occurred while deleting the lead');
    } finally {
      setDeletingLead(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) return;

    setBulkDeleting(true);
    try {
      const res = await fetch('/api/crm/leads/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: selectedLeads })
      });

      if (res.ok) {
        const data = await res.json();
        // Remove deleted leads from list
        setLeads(leads.filter(l => !selectedLeads.includes(l.id)));
        setSelectedLeads([]);
        toast.success(data.message || `Successfully deleted ${data.deleted} lead(s)`);
        setShowBulkDeleteDialog(false);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to delete leads');
      }
    } catch (error) {
      console.error('Error bulk deleting leads:', error);
      toast.error('An error occurred while deleting leads');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleExport = async (type: 'selected' | 'all') => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      
      if (type === 'selected' && selectedLeads.length > 0) {
        params.set('leadIds', selectedLeads.join(','));
      } else if (type === 'all') {
        // Export with current filters
        if (filters.status) params.set('status', filters.status);
        if (filters.priority) params.set('priority', filters.priority);
        if (filters.source) params.set('source', filters.source);
      }

      const res = await fetch(`/api/crm/leads/export?${params.toString()}`);
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.success(`Successfully exported ${type === 'selected' ? selectedLeads.length : filteredLeads.length} lead(s)`);
      } else {
        toast.error('Failed to export leads');
      }
    } catch (error) {
      console.error('Error exporting leads:', error);
      toast.error('An error occurred while exporting leads');
    } finally {
      setExporting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Lead CRM</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Manage and nurture your leads</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex items-center justify-between gap-3">
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setViewMode('kanban');
                  setSelectedLeads([]);
                }}
                className="h-8"
              >
                <LayoutGrid className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Kanban</span>
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="h-8"
              >
                <TableIcon className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Table</span>
              </Button>
            </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowBulkImportDialog(true)} className="flex-shrink-0">
              <Upload className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Import</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleExport('all')}
              disabled={exporting}
              className="flex-shrink-0"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 sm:mr-2" />
              )}
              <span className="hidden sm:inline">Export All</span>
            </Button>
            <Button size="sm" onClick={() => setShowNewLeadDialog(true)} className="flex-shrink-0">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden lg:inline">New Lead</span>
              <span className="lg:hidden">New</span>
            </Button>
          </div>
        </div>

          {/* Bulk Actions Toolbar */}
          {selectedLeads.length > 0 && (
            <div className="px-3 sm:px-6 py-3 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExport('selected')}
                    disabled={exporting}
                  >
                    {exporting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export Selected
                  </Button>
                  {session?.user?.email === 'fray@cdmsuite.com' && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => setShowBulkDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLeads([])}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 px-3 sm:px-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search leads..."
                  value={filters.search}
                  onChange={e => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select
                value={filters.priority || 'all'}
                onValueChange={value =>
                  setFilters({ ...filters, priority: value === 'all' ? undefined : value as any })
                }
              >
                <SelectTrigger className="flex-1 sm:w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {LEAD_PRIORITIES.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.source || 'all'}
                onValueChange={value =>
                  setFilters({ ...filters, source: value === 'all' ? undefined : value })
                }
              >
                <SelectTrigger className="flex-1 sm:w-48">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {LEAD_SOURCES.map(s => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(filters.priority || filters.source || filters.search) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ search: '', status: undefined, priority: undefined, source: undefined })}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            )}
          </div>
        </div>

        {/* View Content */}
        <div className="p-3 sm:p-6">
          {viewMode === 'kanban' ? (
            <KanbanBoard
              leads={filteredLeads}
              onLeadClick={handleLeadClick}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <LeadsTable
              leads={filteredLeads}
              selectedLeads={selectedLeads}
              onLeadClick={handleLeadClick}
              onSelectionChange={setSelectedLeads}
            />
          )}
        </div>
      </div>

      {/* Lead Detail Dialog */}
      <Dialog open={showLeadDialog} onOpenChange={setShowLeadDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedLead && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center gap-3">
                    <span>{selectedLead.name || selectedLead.email}</span>
                    <Badge className={cn(
                      selectedLead.score >= 80 ? "bg-green-100 text-green-700" :
                      selectedLead.score >= 50 ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-700"
                    )}>
                      <Star className="h-3 w-3 mr-1" />
                      Score: {selectedLead.score}
                    </Badge>
                  </DialogTitle>
                  {session?.user?.email === 'fray@cdmsuite.com' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <DialogDescription>
                  Lead from {formatLeadSource(selectedLead.source)}
                </DialogDescription>
              </DialogHeader>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    const params = new URLSearchParams({
                      leadId: selectedLead.id,
                      clientName: selectedLead.name || '',
                      clientEmail: selectedLead.email || '',
                      clientPhone: selectedLead.phone || '',
                      clientCompany: selectedLead.company || '',
                      interest: selectedLead.interest || '',
                    });
                    router.push(`/dashboard/proposals/new?${params.toString()}`);
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Create Proposal
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/proposals?leadId=${selectedLead.id}`)}
                >
                  View Proposals
                </Button>
              </div>

              <Tabs defaultValue="details" className="mt-4">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="activity">
                    Activity
                    {selectedLead.activities && selectedLead.activities.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {selectedLead.activities.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="sequences">Sequences</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  {/* Contact Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Email</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedLead.email}</span>
                      </div>
                    </div>

                    {selectedLead.phone && (
                      <div>
                        <Label className="text-xs text-gray-500">Phone</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{selectedLead.phone}</span>
                        </div>
                      </div>
                    )}

                    {selectedLead.company && (
                      <div>
                        <Label className="text-xs text-gray-500">Company</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{selectedLead.company}</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label className="text-xs text-gray-500">Priority</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn("text-sm capitalize", getPriorityColor(selectedLead.priority))}>
                          {selectedLead.priority}
                        </span>
                      </div>
                    </div>

                    {selectedLead.budget && (
                      <div>
                        <Label className="text-xs text-gray-500">Budget</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{selectedLead.budget}</span>
                        </div>
                      </div>
                    )}

                    {selectedLead.timeline && (
                      <div>
                        <Label className="text-xs text-gray-500">Timeline</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{selectedLead.timeline}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Interest */}
                  {selectedLead.interest && (
                    <div>
                      <Label className="text-xs text-gray-500">Interest</Label>
                      <p className="text-sm mt-1">{selectedLead.interest}</p>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedLead.notes && (
                    <div>
                      <Label className="text-xs text-gray-500">Notes</Label>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{selectedLead.notes}</p>
                    </div>
                  )}

                  {/* Tags */}
                  {selectedLead.tags && selectedLead.tags.length > 0 && (
                    <div>
                      <Label className="text-xs text-gray-500">Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedLead.tags.map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Activity Timeline</h3>
                    <Button size="sm" onClick={() => setShowNewActivityDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Activity
                    </Button>
                  </div>
                  
                  <ActivityTimeline activities={selectedLead.activities || []} />
                </TabsContent>

                <TabsContent value="sequences">
                  <LeadSequences leadId={selectedLead.id} />
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Activity Dialog */}
      <Dialog open={showNewActivityDialog} onOpenChange={setShowNewActivityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Activity</DialogTitle>
            <DialogDescription>Record an interaction with this lead</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label>Type</Label>
              <Select
                value={newActivity.type}
                onValueChange={value => setNewActivity({ ...newActivity, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Title</Label>
              <Input
                value={newActivity.title}
                onChange={e => setNewActivity({ ...newActivity, title: e.target.value })}
                placeholder="Brief summary"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={newActivity.description}
                onChange={e => setNewActivity({ ...newActivity, description: e.target.value })}
                placeholder="Additional details..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowNewActivityDialog(false)}
                disabled={addingActivity}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddActivity}
                disabled={addingActivity}
              >
                {addingActivity ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Activity
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Lead Dialog */}
      <Dialog open={showNewLeadDialog} onOpenChange={setShowNewLeadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Lead</DialogTitle>
            <DialogDescription>Add a new lead to your CRM</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={newLeadForm.name}
                  onChange={e => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newLeadForm.email}
                  onChange={e => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                  placeholder="john@example.com (optional)"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={newLeadForm.phone}
                  onChange={e => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  value={newLeadForm.company}
                  onChange={e => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
                  placeholder="Acme Inc."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select
                  value={newLeadForm.priority}
                  onValueChange={value => setNewLeadForm({ ...newLeadForm, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_PRIORITIES.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Source</Label>
                <Select
                  value={newLeadForm.source}
                  onValueChange={value => setNewLeadForm({ ...newLeadForm, source: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCES.map(s => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Interest / Services Needed</Label>
              <Input
                value={newLeadForm.interest}
                onChange={e => setNewLeadForm({ ...newLeadForm, interest: e.target.value })}
                placeholder="e.g., Website development, SEO services"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Budget Range</Label>
                <Input
                  value={newLeadForm.budget}
                  onChange={e => setNewLeadForm({ ...newLeadForm, budget: e.target.value })}
                  placeholder="e.g., $5,000 - $10,000"
                />
              </div>
              <div>
                <Label>Timeline</Label>
                <Input
                  value={newLeadForm.timeline}
                  onChange={e => setNewLeadForm({ ...newLeadForm, timeline: e.target.value })}
                  placeholder="e.g., 2-3 months"
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={newLeadForm.notes}
                onChange={e => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                placeholder="Additional notes about this lead..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowNewLeadDialog(false)}
                disabled={creatingLead}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateLead}
                disabled={creatingLead}
              >
                {creatingLead ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Lead
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <BulkImportDialog
        open={showBulkImportDialog}
        onOpenChange={setShowBulkImportDialog}
        onImportComplete={fetchLeads}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lead? This action cannot be undone.
              {selectedLead && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{selectedLead.name || 'No name'}</p>
                  <p className="text-sm text-gray-600">{selectedLead.email}</p>
                  {selectedLead.company && (
                    <p className="text-sm text-gray-600">{selectedLead.company}</p>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingLead}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLead}
              disabled={deletingLead}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingLead ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Lead
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Leads?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {bulkDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {selectedLeads.length} Lead{selectedLeads.length !== 1 ? 's' : ''}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
