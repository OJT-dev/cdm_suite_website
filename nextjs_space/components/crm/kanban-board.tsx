
'use client';

import { useState } from 'react';
import { Lead, LeadStatus } from '@/lib/crm-types';
import { LEAD_STATUSES, getStatusColor } from '@/lib/crm-utils';
import { LeadCard } from './lead-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface KanbanBoardProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
}

export function KanbanBoard({ leads, onLeadClick, onStatusChange }: KanbanBoardProps) {
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

  const handleDragStart = (lead: Lead) => {
    setDraggedLead(lead);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: LeadStatus) => {
    if (draggedLead && draggedLead.status !== status) {
      onStatusChange(draggedLead.id, status);
    }
    setDraggedLead(null);
  };

  const getLeadsByStatus = (status: LeadStatus) => {
    return leads.filter(lead => lead.status === status);
  };

  return (
    <div className="relative">
      {/* Scroll hint for mobile */}
      <div className="lg:hidden mb-2 text-xs text-gray-500 text-center">
        ← Swipe to view all stages →
      </div>
      
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory lg:snap-none scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {LEAD_STATUSES.map(statusConfig => {
          const statusLeads = getLeadsByStatus(statusConfig.value);
          const statusColor = getStatusColor(statusConfig.value);

          return (
            <div
              key={statusConfig.value}
              className="flex-shrink-0 w-[85vw] sm:w-80 lg:w-80 snap-center lg:snap-align-none"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(statusConfig.value)}
            >
              {/* Column Header */}
              <div className="mb-3 sm:mb-4 sticky top-0 bg-gray-50 py-2 z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0", statusColor)} />
                  <h3 className="font-semibold text-xs sm:text-sm truncate">{statusConfig.label}</h3>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full flex-shrink-0 ml-auto">
                    {statusLeads.length}
                  </span>
                </div>
              </div>

              {/* Cards Container */}
              <div className="space-y-2 sm:space-y-3">
                {statusLeads.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6 text-center border-2 border-dashed border-gray-200">
                    <p className="text-xs sm:text-sm text-gray-500">No leads</p>
                  </div>
                ) : (
                  statusLeads.map(lead => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onClick={() => onLeadClick(lead)}
                      draggable
                      onDragStart={() => handleDragStart(lead)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
