'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lead, LeadStatus, LeadFilters } from '@/lib/crm-types';
import { KanbanBoard } from '@/components/crm/kanban-board';
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivityTimeline } from '@/components/crm/activity-timeline';
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
  X
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

  // Fetch leads
  useEffect(() => {
    if (status === 'authenticated') {
      fetchLeads();
    }
  }, [status]);

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
        
        setNewActivity({ type: 'note', title: '', description: '' });
        setShowNewActivityDialog(false);
        toast.success('Activity added');
      } else {
        toast.error('Failed to add activity');
      }
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('An error occurred');
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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lead CRM</h1>
            <p className="text-sm text-gray-600">Manage and nurture your leads</p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Lead
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mt-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search leads..."
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          <Select
            value={filters.priority || 'all'}
            onValueChange={value =>
              setFilters({ ...filters, priority: value === 'all' ? undefined : value as any })
            }
          >
            <SelectTrigger className="w-40">
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
            <SelectTrigger className="w-48">
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

          {(filters.priority || filters.source || filters.search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({ search: '', status: undefined, priority: undefined, source: undefined })}
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden px-6 pt-4">
        <KanbanBoard
          leads={filteredLeads}
          onLeadClick={handleLeadClick}
          onStatusChange={handleStatusChange}
        />
      </div>

      {/* Lead Detail Dialog */}
      <Dialog open={showLeadDialog} onOpenChange={setShowLeadDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedLead && (
            <>
              <DialogHeader>
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
                <DialogDescription>
                  Lead from {formatLeadSource(selectedLead.source)}
                </DialogDescription>
              </DialogHeader>

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
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Sequence management coming soon</p>
                  </div>
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
              <Button variant="outline" onClick={() => setShowNewActivityDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddActivity}>
                <Save className="h-4 w-4 mr-2" />
                Save Activity
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
