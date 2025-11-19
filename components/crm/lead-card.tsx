
'use client';

import { useState } from 'react';
import { Lead } from '@/lib/crm-types';
import { 
  getStatusColor, 
  getPriorityColor, 
  formatLeadSource,
  getLeadTimeframe,
  isLeadOverdue
} from '@/lib/crm-utils';
import { Mail, Phone, Building2, Clock, AlertCircle, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface LeadCardProps {
  lead: Lead;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

export function LeadCard({ lead, onClick, draggable, onDragStart }: LeadCardProps) {
  const priorityColor = getPriorityColor(lead.priority);
  const overdue = isLeadOverdue(lead.nextFollowUpAt);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggable) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - dragStartPos.x, 2) + 
        Math.pow(e.clientY - dragStartPos.y, 2)
      );
      if (distance > 5) {
        setIsDragging(true);
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger click if we haven't dragged
    if (!isDragging && onClick) {
      onClick();
    }
    setIsDragging(false);
  };

  const handleViewDetailsClick = (e: React.MouseEvent) => {
    // Completely bypass drag detection for the button
    e.stopPropagation();
    e.preventDefault();
    if (onClick) {
      onClick();
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    if (onDragStart) {
      onDragStart(e);
    }
  };

  return (
    <div
      draggable={draggable}
      onDragStart={handleDragStart}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      className={cn(
        "bg-white rounded-lg p-4 shadow-sm border border-gray-200",
        "hover:shadow-md transition-all duration-200 cursor-pointer",
        "flex flex-col",
        overdue && "border-red-300 bg-red-50"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
              {lead.name?.[0]?.toUpperCase() || lead.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {lead.name || lead.email}
            </p>
            <p className="text-xs text-gray-500">{getLeadTimeframe(lead.createdAt)}</p>
          </div>
        </div>
        
        {/* Score Badge */}
        <Badge 
          variant="secondary" 
          className={cn(
            "ml-2",
            lead.score >= 80 ? "bg-green-100 text-green-700" :
            lead.score >= 50 ? "bg-yellow-100 text-yellow-700" :
            "bg-gray-100 text-gray-700"
          )}
        >
          <Star className="h-3 w-3 mr-1" />
          {lead.score}
        </Badge>
      </div>

      {/* Contact Info */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Mail className="h-3 w-3" />
          <span className="truncate">{lead.email}</span>
        </div>
        
        {lead.phone && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Phone className="h-3 w-3" />
            <span>{lead.phone}</span>
          </div>
        )}
        
        {lead.company && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Building2 className="h-3 w-3" />
            <span className="truncate">{lead.company}</span>
          </div>
        )}
      </div>

      {/* Interest & Source */}
      {lead.interest && (
        <p className="text-xs text-gray-700 mb-2 line-clamp-2">
          <span className="font-medium">Interested in:</span> {lead.interest}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <Badge variant="outline" className="text-xs">
          {formatLeadSource(lead.source)}
        </Badge>
        
        <div className="flex items-center gap-2">
          {/* Priority Indicator */}
          <div className={cn("flex items-center gap-1 text-xs", priorityColor)}>
            <AlertCircle className="h-3 w-3" />
            <span className="capitalize">{lead.priority}</span>
          </div>
          
          {/* Overdue Indicator */}
          {overdue && (
            <Badge variant="destructive" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Overdue
            </Badge>
          )}
        </div>
      </div>

      {/* Assigned To */}
      {lead.assignedTo && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="bg-gray-200 text-gray-700 text-[10px]">
                {lead.assignedTo.user.name?.[0]?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-600 truncate">
              {lead.assignedTo.user.name || lead.assignedTo.user.email}
            </span>
          </div>
        </div>
      )}

      {/* View Details Button */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={handleViewDetailsClick}
          onMouseDown={(e) => {
            e.stopPropagation(); // Prevent drag start
          }}
          onMouseMove={(e) => {
            e.stopPropagation(); // Prevent drag detection
          }}
          type="button"
          className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
