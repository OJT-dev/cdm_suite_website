
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Save, Loader2, FileText, Copy, Check, Download, Presentation, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { BidProposalData, getEnvelopeStatusBadge } from '@/lib/bid-proposal-types';
import { cn } from '@/lib/utils';

interface EnvelopeEditorProps {
  bidProposal: BidProposalData;
  envelopeType: 1 | 2;
  onUpdate: () => void;
}

export function EnvelopeEditor({ bidProposal, envelopeType, onUpdate }: EnvelopeEditorProps) {
  const isEnvelope1 = envelopeType === 1;
  const content = isEnvelope1 ? bidProposal.envelope1Content : bidProposal.envelope2Content;
  const status = isEnvelope1 ? bidProposal.envelope1Status : bidProposal.envelope2Status;
  const notes = isEnvelope1 ? bidProposal.envelope1Notes : bidProposal.envelope2Notes;
  
  const [editedContent, setEditedContent] = useState(content || '');
  const [editedNotes, setEditedNotes] = useState(notes || '');
  const [customInstructions, setCustomInstructions] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>(bidProposal.selectedServices || []);
  const [baseEmailProposal, setBaseEmailProposal] = useState(bidProposal.baseEmailProposal || '');
  const [bidDocumentsContent, setBidDocumentsContent] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData: any = {};
      
      if (isEnvelope1) {
        updateData.envelope1Content = editedContent;
        updateData.envelope1Notes = editedNotes;
        if (!status || status === 'draft') {
          updateData.envelope1Status = editedContent ? 'in_progress' : 'draft';
        }
      } else {
        updateData.envelope2Content = editedContent;
        updateData.envelope2Notes = editedNotes;
        if (!status || status === 'draft') {
          updateData.envelope2Status = editedContent ? 'in_progress' : 'draft';
        }
      }

      const res = await fetch(`/api/bid-proposals/${bidProposal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save');
      }

      toast.success('Saved successfully');
      onUpdate();
    } catch (error: any) {
      console.error('Error saving:', error);
      toast.error(error.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/bid-proposals/${bidProposal.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          envelopeType,
          customInstructions,
          bidDocumentsContent,
          selectedServices: selectedServices.length > 0 ? selectedServices : undefined,
          baseEmailProposal: baseEmailProposal.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to generate proposal');
      }

      const data = await res.json();
      setEditedContent(data.content);
      setShowAIDialog(false);
      toast.success(`${isEnvelope1 ? 'Technical' : 'Cost'} proposal generated successfully`);
      onUpdate();
    } catch (error: any) {
      console.error('Error generating proposal:', error);
      toast.error(error.message || 'Failed to generate proposal');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedContent);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await fetch(`/api/bid-proposals/${bidProposal.id}/download-pdf?envelope=${envelopeType}&t=${timestamp}`, {
        cache: 'no-store'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${bidProposal.solicitationNumber || 'bid'}_envelope${envelopeType}_${timestamp}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast.error(error.message || 'Failed to download PDF');
    }
  };

  const handleDownloadSlides = async () => {
    try {
      const response = await fetch(`/api/bid-proposals/${bidProposal.id}/download-slides?envelope=${envelopeType}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download presentation');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const envelopeLabel = isEnvelope1 ? 'technical' : 'cost';
      a.download = `${bidProposal.solicitationNumber || 'bid'}_${envelopeLabel}_slides_${Date.now()}.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Presentation downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading presentation:', error);
      toast.error(error.message || 'Failed to download presentation');
    }
  };

  const handleDownloadWord = async () => {
    try {
      const timestamp = Date.now();
      const response = await fetch(`/api/bid-proposals/${bidProposal.id}/download-word?envelope=${envelopeType}&t=${timestamp}`, {
        cache: 'no-store'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download Word document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const envelopeLabel = isEnvelope1 ? 'technical' : 'cost';
      a.download = `${bidProposal.solicitationNumber || 'bid'}_${envelopeLabel}_${timestamp}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Word document downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading Word document:', error);
      toast.error(error.message || 'Failed to download Word document');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="break-words">Envelope {envelopeType} - {isEnvelope1 ? 'Technical' : 'Cost'}</span>
              </CardTitle>
              <CardDescription className="mt-1 text-xs sm:text-sm">
                {isEnvelope1
                  ? 'Technical approach, methodology, timeline, and team qualifications'
                  : 'Pricing breakdown, payment terms, and cost justification'}
              </CardDescription>
            </div>
            <Badge className={cn('flex-shrink-0 whitespace-nowrap', getEnvelopeStatusBadge(status).className)}>
              {getEnvelopeStatusBadge(status).label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with AI
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
                <DialogHeader>
                  <DialogTitle className="text-base sm:text-lg">Generate {isEnvelope1 ? 'Technical' : 'Cost'} Proposal</DialogTitle>
                  <DialogDescription className="text-sm">
                    Use AI to generate a professional proposal based on bid requirements and CDM Suite services
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 sm:space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="customInstructions">Custom Instructions (Optional)</Label>
                    <Textarea
                      id="customInstructions"
                      placeholder="Add any specific requirements or focus areas..."
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bidDocuments">Bid Documents Content (Optional)</Label>
                    <Textarea
                      id="bidDocuments"
                      placeholder="Paste relevant content from bid documents..."
                      value={bidDocumentsContent}
                      onChange={(e) => setBidDocumentsContent(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="services">Services to Emphasize (Optional)</Label>
                    <Textarea
                      id="services"
                      placeholder="e.g., Web Design, SEO, AI Solutions, App Development"
                      value={selectedServices.join(', ')}
                      onChange={(e) => setSelectedServices(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      rows={2}
                    />
                  </div>

                  {!isEnvelope1 && (
                    <div className="space-y-2">
                      <Label htmlFor="baseProposal">Reference Proposal (Optional)</Label>
                      <Textarea
                        id="baseProposal"
                        placeholder="Paste a previous email proposal or pricing structure as reference..."
                        value={baseEmailProposal}
                        onChange={(e) => setBaseEmailProposal(e.target.value)}
                        rows={4}
                      />
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAIDialog(false)}
                      disabled={generating}
                      className="w-full sm:w-auto order-2 sm:order-1"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleGenerate} disabled={generating} className="w-full sm:w-auto order-1 sm:order-2">
                      {generating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Proposal
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={!editedContent}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleDownloadWord}
                disabled={!editedContent}
                className="w-full"
              >
                <FileDown className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Word</span>
                <span className="sm:hidden">DOCX</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleDownloadSlides}
                disabled={!editedContent}
                className="w-full"
              >
                <Presentation className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Slides</span>
                <span className="sm:hidden">PPTX</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleCopy}
                disabled={!editedContent}
                className="w-full"
              >
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                <span>Copy</span>
              </Button>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Saving...</span>
                    <span className="sm:hidden">Save...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    <span>Save</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Proposal Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder={`Enter or generate your ${isEnvelope1 ? 'technical' : 'cost'} proposal content here...`}
            rows={20}
            className="font-mono text-sm"
          />
        </CardContent>
      </Card>

      {/* Internal Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Internal Notes</CardTitle>
          <CardDescription>
            Private notes for internal use (not included in proposal)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={editedNotes}
            onChange={(e) => setEditedNotes(e.target.value)}
            placeholder="Add internal notes, reminders, or strategy notes..."
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
}
