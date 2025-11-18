
'use client';

import { useState } from 'react';
import { Lead } from '@/lib/crm-types';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn, formatDetailedTimestamp } from '@/lib/utils';
import {
  Mail,
  Phone,
  Building2,
  Calendar,
  Star,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatLeadSource, getPriorityColor, getStatusColor } from '@/lib/crm-utils';

interface LeadsTableProps {
  leads: Lead[];
  selectedLeads: string[];
  onLeadClick: (lead: Lead) => void;
  onSelectionChange: (leadIds: string[]) => void;
}

export function LeadsTable({
  leads,
  selectedLeads,
  onLeadClick,
  onSelectionChange,
}: LeadsTableProps) {
  const isAllSelected = leads.length > 0 && selectedLeads.length === leads.length;
  const isSomeSelected = selectedLeads.length > 0 && selectedLeads.length < leads.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(leads.map(lead => lead.id));
    }
  };

  const handleSelectLead = (leadId: string) => {
    if (selectedLeads.includes(leadId)) {
      onSelectionChange(selectedLeads.filter(id => id !== leadId));
    } else {
      onSelectionChange([...selectedLeads, leadId]);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {leads.length === 0 ? (
          <div className="rounded-md border p-8 text-center">
            <p className="text-sm text-gray-500">No leads found</p>
          </div>
        ) : (
          leads.map(lead => (
            <div
              key={lead.id}
              className={cn(
                'rounded-lg border bg-white p-4 cursor-pointer hover:bg-gray-50 transition-colors',
                selectedLeads.includes(lead.id) && 'bg-blue-50 border-blue-200 hover:bg-blue-100'
              )}
              onClick={() => onLeadClick(lead)}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <Checkbox
                    checked={selectedLeads.includes(lead.id)}
                    onCheckedChange={() => handleSelectLead(lead.id)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select ${lead.name || lead.email}`}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-gray-900 break-words">
                      {lead.name || 'Unnamed Lead'}
                    </h3>
                    {lead.company && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Building2 className="h-3 w-3 flex-shrink-0" />
                        <span className="break-words">{lead.company}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star className={cn(
                    'h-3.5 w-3.5',
                    lead.score >= 80 ? 'text-green-600' :
                    lead.score >= 50 ? 'text-yellow-600' :
                    'text-gray-400'
                  )} />
                  <span className="text-xs font-medium">{lead.score}</span>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                {lead.email && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 min-w-0">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                    <span className="break-all">{lead.email}</span>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                    <span>{lead.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge className={cn('text-xs', getStatusColor(lead.status))}>
                  {lead.status}
                </Badge>
                <span className={cn('text-xs capitalize font-medium px-2 py-0.5 rounded-full', getPriorityColor(lead.priority))}>
                  {lead.priority}
                </span>
                <span className="text-xs text-gray-500">
                  {formatLeadSource(lead.source)}
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  {formatDetailedTimestamp(lead.createdAt, { showTime: false }).relative}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected ? true : (isSomeSelected ? 'indeterminate' as any : false)}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all leads"
                />
              </TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <p className="text-sm text-gray-500">No leads found</p>
                </TableCell>
              </TableRow>
            ) : (
              leads.map(lead => (
              <TableRow
                key={lead.id}
                className={cn(
                  'cursor-pointer hover:bg-gray-50 transition-colors',
                  selectedLeads.includes(lead.id) && 'bg-blue-50 hover:bg-blue-100'
                )}
                onClick={(e) => {
                  // Don't trigger row click if clicking the checkbox
                  if ((e.target as HTMLElement).closest('[role="checkbox"]')) {
                    return;
                  }
                  onLeadClick(lead);
                }}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedLeads.includes(lead.id)}
                    onCheckedChange={() => handleSelectLead(lead.id)}
                    aria-label={`Select ${lead.name || lead.email}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {lead.name || 'Unnamed Lead'}
                    </span>
                    {lead.company && (
                      <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3" />
                        {lead.company}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {lead.email && (
                      <span className="text-xs flex items-center gap-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        {lead.email}
                      </span>
                    )}
                    {lead.phone && (
                      <span className="text-xs flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {lead.phone}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn('text-xs', getStatusColor(lead.status))}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={cn('text-xs capitalize font-medium', getPriorityColor(lead.priority))}>
                    {lead.priority}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-gray-600">
                    {formatLeadSource(lead.source)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className={cn(
                      'h-3 w-3',
                      lead.score >= 80 ? 'text-green-600' :
                      lead.score >= 50 ? 'text-yellow-600' :
                      'text-gray-400'
                    )} />
                    <span className="text-xs font-medium">{lead.score}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-xs text-gray-500 cursor-help">
                          <Calendar className="h-3 w-3" />
                          {formatDetailedTimestamp(lead.createdAt, { showTime: true }).relative}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{formatDetailedTimestamp(lead.createdAt, { showTime: true }).full}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
