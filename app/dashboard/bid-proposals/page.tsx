
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, FileText, Calendar, ExternalLink, Clock, AlertCircle, Trash2, Loader2, Download, Edit } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { cn, formatDetailedTimestamp } from '@/lib/utils';
import { BidProposalData, getSubmissionStatusBadge, getEnvelopeStatusBadge } from '@/lib/bid-proposal-types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function BidProposalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bidProposals, setBidProposals] = useState<BidProposalData[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<BidProposalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBids, setSelectedBids] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBidProposals();
    }
  }, [status]);

  useEffect(() => {
    let filtered = [...bidProposals];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (bp) =>
          bp.title.toLowerCase().includes(query) ||
          bp.solicitationNumber.toLowerCase().includes(query) ||
          (bp.issuingOrg && bp.issuingOrg.toLowerCase().includes(query))
      );
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter((bp) => bp.submissionStatus === statusFilter);
    }

    // Sort by closing date (soonest first)
    filtered.sort((a, b) => {
      if (a.closingDate && b.closingDate) {
        return new Date(a.closingDate).getTime() - new Date(b.closingDate).getTime();
      }
      if (a.closingDate) return -1;
      if (b.closingDate) return 1;
      return 0;
    });

    setFilteredProposals(filtered);
  }, [searchQuery, statusFilter, bidProposals]);

  const fetchBidProposals = async () => {
    try {
      const res = await fetch('/api/bid-proposals');
      if (res.ok) {
        const data = await res.json();
        setBidProposals(data.bidProposals);
        setFilteredProposals(data.bidProposals);
      }
    } catch (error) {
      console.error('Error fetching bid proposals:', error);
      toast.error('Failed to load bid proposals');
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilClosing = (closingDate: string | Date | undefined | null) => {
    if (!closingDate) return null;
    const now = new Date();
    const closing = new Date(closingDate);
    const diff = closing.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const toggleSelectBid = (bidId: string) => {
    const newSelected = new Set(selectedBids);
    if (newSelected.has(bidId)) {
      newSelected.delete(bidId);
    } else {
      newSelected.add(bidId);
    }
    setSelectedBids(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedBids.size === filteredProposals.length) {
      setSelectedBids(new Set());
    } else {
      setSelectedBids(new Set(filteredProposals.map(bp => bp.id)));
    }
  };

  const handleBulkAction = async (action: string, additionalData?: any) => {
    if (selectedBids.size === 0) return;

    // Confirm destructive actions
    if (action === 'delete') {
      const confirmed = window.confirm(
        `Are you sure you want to delete ${selectedBids.size} bid proposal(s)? This action cannot be undone.`
      );
      if (!confirmed) return;
    }

    setBulkActionLoading(true);
    try {
      const res = await fetch('/api/bid-proposals/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action, 
          bidIds: Array.from(selectedBids),
          ...additionalData
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to perform bulk action');
      }

      const data = await res.json();

      // Handle export action differently
      if (action === 'export') {
        // Download as JSON file
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bid-proposals-export-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(data.message);
      } else {
        toast.success(data.message);
        setSelectedBids(new Set());
        await fetchBidProposals();
      }
    } catch (error: any) {
      console.error('Error performing bulk action:', error);
      toast.error(error.message || 'Failed to perform bulk action');
    } finally {
      setBulkActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Bid Proposals</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">
            Manage RFP responses with AI-powered proposal generation
          </p>
        </div>
        <Link href="/dashboard/bid-proposals/new" className="flex-shrink-0">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Bid
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search bids..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not_submitted">Not Submitted</SelectItem>
              <SelectItem value="envelope1_submitted">Tech Submitted</SelectItem>
              <SelectItem value="envelope2_submitted">Cost Submitted</SelectItem>
              <SelectItem value="fully_submitted">Fully Submitted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedBids.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedBids.size === filteredProposals.length}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm font-medium text-blue-900">
                {selectedBids.size} bid{selectedBids.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Export Action */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('export')}
                disabled={bulkActionLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              {/* Update Status Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={bulkActionLoading}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Update Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkAction('update_status', { status: 'not_submitted' })}>
                    Mark as Not Submitted
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('update_status', { status: 'envelope1_submitted' })}>
                    Mark as Tech Submitted
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('update_status', { status: 'envelope2_submitted' })}>
                    Mark as Cost Submitted
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('update_status', { status: 'fully_submitted' })}>
                    Mark as Fully Submitted
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Delete Action */}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                disabled={bulkActionLoading}
              >
                {bulkActionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bid Proposals List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {filteredProposals.length === 0 ? (
          <div className="text-center py-12 px-4">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No bid proposals found</h3>
            <p className="text-sm text-gray-600 mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first bid proposal to get started'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link href="/dashboard/bid-proposals/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Bid Proposal
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredProposals.map((bidProposal) => {
              const daysUntilClosing = getDaysUntilClosing(bidProposal.closingDate);
              const isUrgent = daysUntilClosing !== null && daysUntilClosing <= 7 && daysUntilClosing > 0;
              const isPastDue = daysUntilClosing !== null && daysUntilClosing < 0;
              const isSelected = selectedBids.has(bidProposal.id);

              return (
                <div
                  key={bidProposal.id}
                  className={cn(
                    "p-4 hover:bg-gray-50 transition-colors",
                    isSelected && "bg-blue-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div className="pt-1">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectBid(bidProposal.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Clickable Content */}
                    <Link
                      href={`/dashboard/bid-proposals/${bidProposal.id}`}
                      className="flex-1 min-w-0"
                    >
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                              {bidProposal.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {bidProposal.solicitationNumber}
                            </p>
                        {bidProposal.issuingOrg && (
                          <p className="text-xs text-gray-600 mt-1">{bidProposal.issuingOrg}</p>
                        )}
                      </div>
                      <Badge
                        className={cn(
                          'flex-shrink-0',
                          getSubmissionStatusBadge(bidProposal.submissionStatus).className
                        )}
                      >
                        {getSubmissionStatusBadge(bidProposal.submissionStatus).label}
                      </Badge>
                    </div>

                    {/* Envelope Status */}
                    <div className="flex gap-2 text-xs">
                      <Badge
                        variant="outline"
                        className={cn(
                          'font-normal',
                          getEnvelopeStatusBadge(bidProposal.envelope1Status).className
                        )}
                      >
                        Tech: {getEnvelopeStatusBadge(bidProposal.envelope1Status).label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          'font-normal',
                          getEnvelopeStatusBadge(bidProposal.envelope2Status).className
                        )}
                      >
                        Cost: {getEnvelopeStatusBadge(bidProposal.envelope2Status).label}
                      </Badge>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        {bidProposal.closingDate && (
                          <div className={cn(
                            'flex items-center gap-1',
                            isPastDue && 'text-red-600',
                            isUrgent && 'text-orange-600 font-medium'
                          )}>
                            {isPastDue ? (
                              <AlertCircle className="h-3 w-3" />
                            ) : (
                              <Calendar className="h-3 w-3" />
                            )}
                            {isPastDue ? (
                              <span>Past Due</span>
                            ) : daysUntilClosing !== null ? (
                              <span>
                                {daysUntilClosing === 0
                                  ? 'Closes Today'
                                  : daysUntilClosing === 1
                                  ? 'Closes Tomorrow'
                                  : `${daysUntilClosing} days left`}
                              </span>
                            ) : (
                              <span>{new Date(bidProposal.closingDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDetailedTimestamp(bidProposal.createdAt, { showTime: false }).relative}
                        </div>
                      </div>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
