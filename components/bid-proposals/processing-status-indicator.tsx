
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, FileText, Brain, Sparkles, FolderCheck } from 'lucide-react';
import { ProcessingStatus, ProcessingStage } from '@/lib/bid-proposal-types';

interface ProcessingStatusIndicatorProps {
  bidId: string;
  initialStatus?: ProcessingStatus;
  initialStage?: ProcessingStage | null;
  initialProgress?: number;
  initialMessage?: string | null;
  initialError?: string | null;
  onStatusChange?: (status: ProcessingStatus) => void;
}

const STAGE_ICONS: Record<ProcessingStage, any> = {
  uploading_files: FolderCheck,
  extracting_pdf: FileText,
  extracting_email: FileText,
  analyzing_content: Brain,
  detecting_client_type: Brain,
  researching_budget: Brain,
  generating_proposal: Sparkles,
  generating_intelligence: Brain,
  finalizing: CheckCircle2,
};

const STAGE_LABELS: Record<ProcessingStage, string> = {
  uploading_files: 'Uploading Files',
  extracting_pdf: 'Extracting PDF Content',
  extracting_email: 'Extracting Email Content',
  analyzing_content: 'Analyzing Documents',
  detecting_client_type: 'Detecting Client Type',
  researching_budget: 'Researching Budget Data',
  generating_proposal: 'Generating Proposal',
  generating_intelligence: 'Generating Intelligence',
  finalizing: 'Finalizing',
};

export function ProcessingStatusIndicator({
  bidId,
  initialStatus = 'idle',
  initialStage = null,
  initialProgress = 0,
  initialMessage = null,
  initialError = null,
  onStatusChange,
}: ProcessingStatusIndicatorProps) {
  const [status, setStatus] = useState<ProcessingStatus>(initialStatus);
  const [stage, setStage] = useState<ProcessingStage | null>(initialStage);
  const [progress, setProgress] = useState(initialProgress);
  const [message, setMessage] = useState(initialMessage);
  const [error, setError] = useState(initialError);
  const [isVisible, setIsVisible] = useState(initialStatus !== 'idle' && initialStatus !== 'completed');

  // Poll for status updates
  useEffect(() => {
    if (status === 'idle' || status === 'completed' || status === 'error') {
      // Stop polling if we're in a terminal state
      if (status === 'completed' || status === 'error') {
        // Auto-hide after 5 seconds
        const hideTimer = setTimeout(() => {
          setIsVisible(false);
        }, 5000);
        return () => clearTimeout(hideTimer);
      }
      return;
    }

    // Poll every 2 seconds while processing
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/bid-proposals/${bidId}`);
        if (response.ok) {
          const data = await response.json();
          const newStatus = data.processingStatus || 'idle';
          
          setStatus(newStatus);
          setStage(data.processingStage || null);
          setProgress(data.processingProgress || 0);
          setMessage(data.processingMessage || null);
          setError(data.processingError || null);

          if (onStatusChange) {
            onStatusChange(newStatus);
          }

          // Show indicator if processing
          if (newStatus !== 'idle') {
            setIsVisible(true);
          }
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [bidId, status, onStatusChange]);

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  const StatusIcon = stage ? STAGE_ICONS[stage] : Loader2;

  return (
    <Card className="border-l-4 border-l-blue-500 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {status === 'extracting' && (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                <span>Extracting Documents...</span>
              </>
            )}
            {status === 'generating' && (
              <>
                <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />
                <span>Generating Proposal...</span>
              </>
            )}
            {status === 'completed' && (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Processing Complete</span>
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <span>Processing Error</span>
              </>
            )}
          </CardTitle>
          <Badge 
            variant={
              status === 'completed' ? 'default' :
              status === 'error' ? 'destructive' :
              'secondary'
            }
            className={
              status === 'extracting' ? 'bg-blue-100 text-blue-700 border-blue-200' :
              status === 'generating' ? 'bg-purple-100 text-purple-700 border-purple-200' :
              ''
            }
          >
            {progress}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={progress} 
            className={`h-2 ${
              status === 'completed' ? '[&>div]:bg-green-500' :
              status === 'error' ? '[&>div]:bg-red-500' :
              status === 'generating' ? '[&>div]:bg-purple-500' :
              '[&>div]:bg-blue-500'
            }`}
          />
          
          {/* Current Stage */}
          {stage && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <StatusIcon className="h-4 w-4" />
              <span>{STAGE_LABELS[stage]}</span>
            </div>
          )}
        </div>

        {/* Status Message */}
        {message && (
          <Alert className={
            status === 'completed' ? 'border-green-200 bg-green-50' :
            status === 'error' ? 'border-red-200 bg-red-50' :
            'border-blue-200 bg-blue-50'
          }>
            <AlertDescription className="text-sm">
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && status === 'error' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Processing Stages Timeline */}
        {(status === 'extracting' || status === 'generating') && (
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <div className="font-medium mb-2">Processing Steps:</div>
            <div className={progress >= 10 ? 'text-green-600 flex items-center gap-1' : 'flex items-center gap-1'}>
              {progress >= 10 ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border-2 border-gray-300" />}
              <span>Upload files</span>
            </div>
            <div className={progress >= 20 ? 'text-green-600 flex items-center gap-1' : 'flex items-center gap-1'}>
              {progress >= 20 ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border-2 border-gray-300" />}
              <span>Extract document text</span>
            </div>
            <div className={progress >= 40 ? 'text-green-600 flex items-center gap-1' : 'flex items-center gap-1'}>
              {progress >= 40 ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border-2 border-gray-300" />}
              <span>Analyze bid information</span>
            </div>
            <div className={progress >= 50 ? 'text-green-600 flex items-center gap-1' : 'flex items-center gap-1'}>
              {progress >= 50 ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border-2 border-gray-300" />}
              <span>Generate proposals</span>
            </div>
            <div className={progress >= 100 ? 'text-green-600 flex items-center gap-1' : 'flex items-center gap-1'}>
              {progress >= 100 ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border-2 border-gray-300" />}
              <span>Finalize and save</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
