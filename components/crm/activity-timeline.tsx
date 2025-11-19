
'use client';

import { LeadActivity } from '@/lib/crm-types';
import { formatDistanceToNow } from 'date-fns';
import { 
  Mail, 
  Phone, 
  FileText, 
  Users, 
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  Target
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn, formatDetailedTimestamp } from '@/lib/utils';

interface ActivityTimelineProps {
  activities: LeadActivity[];
}

const activityIcons = {
  note: FileText,
  email: Mail,
  call: Phone,
  meeting: Users,
  status_change: AlertCircle,
  assignment: Users,
};

const activityColors = {
  note: 'bg-blue-100 text-blue-700',
  email: 'bg-green-100 text-green-700',
  call: 'bg-purple-100 text-purple-700',
  meeting: 'bg-yellow-100 text-yellow-700',
  status_change: 'bg-orange-100 text-orange-700',
  assignment: 'bg-pink-100 text-pink-700',
};

// Parse metadata if available
function parseMetadata(metadataStr: string | null | undefined): any {
  if (!metadataStr) return null;
  try {
    return JSON.parse(metadataStr);
  } catch {
    return null;
  }
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No activities yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Activities will appear here when you interact with this lead
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = activityIcons[activity.type as keyof typeof activityIcons] || FileText;
        const colorClass = activityColors[activity.type as keyof typeof activityColors] || 'bg-gray-100 text-gray-700';
        const metadata = parseMetadata(activity.metadata);

        return (
          <div key={activity.id} className="relative">
            {/* Connecting Line */}
            {index < activities.length - 1 && (
              <div className="absolute left-5 top-10 bottom-0 w-px bg-gray-200" />
            )}

            {/* Activity Item */}
            <div className="flex gap-3">
              {/* Icon */}
              <div className={cn("flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center", colorClass)}>
                <Icon className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{activity.title}</p>
                      {metadata?.score && (
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs",
                            metadata.score >= 80 ? "bg-red-100 text-red-700" : 
                            metadata.score >= 60 ? "bg-orange-100 text-orange-700" : 
                            "bg-blue-100 text-blue-700"
                          )}
                        >
                          Score: {metadata.score}/100
                        </Badge>
                      )}
                      {metadata?.emailSent && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          <Mail className="h-3 w-3 mr-1" />
                          Email Sent
                        </Badge>
                      )}
                    </div>
                    
                    {/* Description - Preserve line breaks */}
                    {activity.description && (
                      <div className="text-sm text-gray-600 mt-2 whitespace-pre-line">
                        {activity.description}
                      </div>
                    )}

                    {/* Follow-up Actions */}
                    {metadata?.followUpActions && metadata.followUpActions.length > 0 && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-amber-700" />
                          <p className="font-medium text-sm text-amber-900">Recommended Follow-Up Actions</p>
                        </div>
                        <ul className="space-y-1 text-xs text-amber-800">
                          {metadata.followUpActions.map((action: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-amber-600 mt-0.5">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Email Details */}
                    {metadata?.emailSent && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="h-4 w-4 text-green-700" />
                          <p className="font-medium text-sm text-green-900">Automated Emails Sent</p>
                        </div>
                        <div className="text-xs text-green-800 space-y-1">
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Thank you email sent to lead</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Internal notification sent to team</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>Follow-up sequence auto-generated (pending approval)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Need Level Badge */}
                    {metadata?.needLevel && (
                      <div className="mt-2">
                        <Badge 
                          className={cn(
                            "text-xs",
                            metadata.needLevel === 'critical' ? "bg-red-100 text-red-700" :
                            metadata.needLevel === 'high' ? "bg-orange-100 text-orange-700" :
                            metadata.needLevel === 'moderate' ? "bg-yellow-100 text-yellow-700" :
                            "bg-blue-100 text-blue-700"
                          )}
                        >
                          Need Level: {metadata.needLevel.toUpperCase()}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs text-gray-500 whitespace-nowrap cursor-help">
                          {formatDetailedTimestamp(activity.createdAt, { showTime: true }).relative}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{formatDetailedTimestamp(activity.createdAt, { showTime: true }).full}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Created By */}
                {activity.createdBy && (
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="bg-gray-200 text-gray-700 text-[10px]">
                        {activity.createdBy.user.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-500">
                      {activity.createdBy.user.name || activity.createdBy.user.email}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
