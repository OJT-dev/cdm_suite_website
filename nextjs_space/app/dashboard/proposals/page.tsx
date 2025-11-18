
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Plus,
  Search,
  FileText,
  DollarSign,
  Calendar,
  ExternalLink,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Upload,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatDetailedTimestamp } from '@/lib/utils';
import { Proposal } from '@/lib/proposal-types';
import { BulkProposalImportDialog } from '@/components/proposals/bulk-proposal-import-dialog';
import Link from 'next/link';

export default function ProposalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showBulkImportDialog, setShowBulkImportDialog] = useState(false);
  const [proposalToDelete, setProposalToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Check if user is master user
  const isMasterUser = session?.user?.email === 'fray@cdmsuite.com';

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProposals();
    }
  }, [status]);

  useEffect(() => {
    let filtered = [...proposals];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.clientName.toLowerCase().includes(query) ||
          p.clientEmail.toLowerCase().includes(query) ||
          p.proposalNumber.toLowerCase().includes(query) ||
          p.title.toLowerCase().includes(query)
      );
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    setFilteredProposals(filtered);
  }, [searchQuery, statusFilter, proposals]);

  const fetchProposals = async () => {
    try {
      const res = await fetch('/api/proposals');
      if (res.ok) {
        const data = await res.json();
        setProposals(data.proposals);
        setFilteredProposals(data.proposals);
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProposal = async () => {
    if (!proposalToDelete) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/proposals/${proposalToDelete}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete proposal');
      }

      toast.success('Proposal deleted successfully');
      fetchProposals();
    } catch (error: any) {
      console.error('Error deleting proposal:', error);
      toast.error(error.message || 'Failed to delete proposal');
    } finally {
      setDeleting(false);
      setProposalToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      viewed: 'bg-purple-100 text-purple-700',
      accepted: 'bg-green-100 text-green-700',
      declined: 'bg-red-100 text-red-700',
      expired: 'bg-orange-100 text-orange-700',
    };

    const icons = {
      draft: FileText,
      sent: Send,
      viewed: Eye,
      accepted: CheckCircle2,
      declined: XCircle,
      expired: Clock,
    };

    const Icon = icons[status as keyof typeof icons] || FileText;

    return (
      <Badge className={cn('flex items-center gap-1', styles[status as keyof typeof styles] || '')}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Proposals</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">Create and manage client proposals</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowBulkImportDialog(true)} className="flex-1 sm:flex-none">
            <Upload className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Bulk Import</span>
          </Button>
          <Link href="/dashboard/proposals/new" className="flex-1 sm:flex-none">
            <Button size="sm" className="w-full">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">New Proposal</span>
              <span className="sm:hidden">New</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search proposals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm sm:text-base"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="viewed">Viewed</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Proposals List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {filteredProposals.length === 0 ? (
          <div className="text-center py-12 px-4">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No proposals found</h3>
            <p className="text-sm text-gray-600 mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first proposal to get started'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link href="/dashboard/proposals/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Proposal
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-[28%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proposal
                    </th>
                    <th className="w-[28%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="w-[12%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="w-[14%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="w-[18%] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProposals.map((proposal) => (
                    <tr key={proposal.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate" title={proposal.title}>
                            {proposal.title}
                          </div>
                          <div className="text-xs text-gray-500 truncate">{proposal.proposalNumber}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate" title={proposal.clientName}>
                            {proposal.clientName}
                          </div>
                          <div className="text-xs text-gray-500 truncate" title={proposal.clientEmail}>
                            {proposal.clientEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-bold text-gray-900 truncate">
                          ${proposal.total.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(proposal.status)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-xs text-gray-500 cursor-help">
                                  {formatDetailedTimestamp(proposal.createdAt, { showTime: true }).relative}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{formatDetailedTimestamp(proposal.createdAt, { showTime: true }).full}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <Link href={`/dashboard/proposals/${proposal.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                          {isMasterUser && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setProposalToDelete(proposal.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-200">
              {filteredProposals.map((proposal) => (
                <Link
                  key={proposal.id}
                  href={`/dashboard/proposals/${proposal.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                          {proposal.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">{proposal.proposalNumber}</p>
                      </div>
                      {getStatusBadge(proposal.status)}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{proposal.clientName}</p>
                        <p className="text-xs text-gray-500 truncate">{proposal.clientEmail}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-lg font-bold text-blue-600">
                          ${proposal.total.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center cursor-help">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDetailedTimestamp(proposal.createdAt, { showTime: true }).relative}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{formatDetailedTimestamp(proposal.createdAt, { showTime: true }).full}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {isMasterUser && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setProposalToDelete(proposal.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bulk Import Dialog */}
      <BulkProposalImportDialog
        open={showBulkImportDialog}
        onOpenChange={setShowBulkImportDialog}
        onImportComplete={fetchProposals}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!proposalToDelete} onOpenChange={(open) => !open && setProposalToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Proposal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this proposal? This action cannot be undone and will permanently delete the proposal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProposal}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
