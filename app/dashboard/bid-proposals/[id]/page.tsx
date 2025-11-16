'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building2,
  Download,
  RefreshCw,
  Send,
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  Loader2,
  Upload,
  Edit,
  Save,
  X,
  ChevronDown,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { ProcessingStatusIndicator } from '@/components/bid-proposals/processing-status-indicator';

interface BidAttachment {
  id: string;
  name: string;
  cloudStoragePath: string;
  category?: string | null;
  fileSize: number;
  uploadedAt: string;
}

interface BidProposal {
  id: string;
  proposalTitle?: string | null;
  issuingOrg?: string | null;
  closingDate?: string | null;
  location?: string | null;
  envelope1Status: string;
  envelope2Status: string;
  envelope1Content?: string | null;
  envelope2Content?: string | null;
  proposedPrice?: number | null;
  bidAttachments?: BidAttachment[];
}

export default function BidProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bidProposalId = params.id as string;

  const [bidProposal, setBidProposal] = useState<BidProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [regenerateFiles, setRegenerateFiles] = useState<File[]>([]);
  const [regenerateNotes, setRegenerateNotes] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [downloading, setDownloading] = useState<{pdf?: boolean; slides?: boolean}>({});
  
  // Editing states
  const [editingTitle, setEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [savingTitle, setSavingTitle] = useState(false);
  
  const [editingTechnical, setEditingTechnical] = useState(false);
  const [editedTechnical, setEditedTechnical] = useState('');
  const [savingTechnical, setSavingTechnical] = useState(false);
  
  const [editingCost, setEditingCost] = useState(false);
  const [editedCost, setEditedCost] = useState('');
  const [savingCost, setSavingCost] = useState(false);

  useEffect(() => {
    fetchBidProposal();
    
    // Poll for updates if proposals are being generated
    const interval = setInterval(() => {
      if (bidProposal && (bidProposal.envelope1Status === 'in_progress' || bidProposal.envelope2Status === 'in_progress')) {
        fetchBidProposal();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [bidProposalId, bidProposal?.envelope1Status, bidProposal?.envelope2Status]);

  const fetchBidProposal = async () => {
    try {
      const response = await fetch(`/api/bid-proposals/${bidProposalId}`);
      if (!response.ok) throw new Error('Failed to fetch bid proposal');
      const data = await response.json();
      setBidProposal(data.bidProposal);
    } catch (error) {
      console.error('Error fetching bid proposal:', error);
      toast.error('Failed to load bid proposal');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (regenerateFiles.length === 0 && (!bidProposal?.bidAttachments || bidProposal.bidAttachments.length === 0)) {
      toast.error('Please upload at least one document');
      return;
    }

    setRegenerating(true);
    try {
      const formData = new FormData();
      regenerateFiles.forEach((file) => {
        formData.append('files', file);
      });
      
      // Add notes/instructions if provided
      if (regenerateNotes.trim()) {
        formData.append('notes', regenerateNotes.trim());
      }

      const response = await fetch(`/api/bid-proposals/${bidProposalId}/regenerate`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to regenerate proposal');
      }

      toast.success('Regeneration started! This may take a few minutes...');
      setRegenerateDialogOpen(false);
      setRegenerateFiles([]);
      setRegenerateNotes('');
      
      // Poll for updates
      setTimeout(fetchBidProposal, 2000);
    } catch (error: any) {
      console.error('Error regenerating proposal:', error);
      toast.error(error.message || 'Failed to regenerate proposal');
    } finally {
      setRegenerating(false);
    }
  };

  const handleDownloadPDF = async (envelope: 1 | 2 | 'combined') => {
    const downloadType = envelope === 'combined' ? 'combined' : `envelope${envelope}`;
    setDownloading({ ...downloading, pdf: true });
    try {
      const url = envelope === 'combined' 
        ? `/api/bid-proposals/${bidProposalId}/download-combined-pdf`
        : `/api/bid-proposals/${bidProposalId}/download-pdf?envelope=${envelope}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to download PDF');
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      
      const envelopeName = envelope === 'combined' 
        ? 'Combined' 
        : envelope === 1 ? 'Technical' : 'Cost';
      a.download = `${bidProposal?.proposalTitle || 'Proposal'}_${envelopeName}.pdf`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      
      toast.success(`${envelopeName} PDF downloaded successfully`);
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast.error(error.message || 'Failed to download PDF');
    } finally {
      setDownloading({ ...downloading, pdf: false });
    }
  };

  const handleDownloadSlides = async (envelope: 1 | 2) => {
    setDownloading({ ...downloading, slides: true });
    try {
      const response = await fetch(
        `/api/bid-proposals/${bidProposalId}/download-slides?envelope=${envelope}`
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to download slides');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const envelopeName = envelope === 1 ? 'Technical' : 'Cost';
      a.download = `${bidProposal?.proposalTitle || 'Proposal'}_${envelopeName}_Slides.pptx`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`${envelopeName} Slides downloaded successfully`);
    } catch (error: any) {
      console.error('Error downloading slides:', error);
      toast.error(error.message || 'Failed to download slides');
    } finally {
      setDownloading({ ...downloading, slides: false });
    }
  };

  // Editing handlers
  const handleEditTitle = () => {
    setEditedTitle(bidProposal?.proposalTitle || '');
    setEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    setSavingTitle(true);
    try {
      const response = await fetch(`/api/bid-proposals/${bidProposalId}/update-title`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editedTitle }),
      });
      
      if (!response.ok) throw new Error('Failed to save title');
      
      setBidProposal(prev => prev ? { ...prev, proposalTitle: editedTitle } : null);
      setEditingTitle(false);
      toast.success('Title updated successfully');
    } catch (error) {
      console.error('Error saving title:', error);
      toast.error('Failed to save title');
    } finally {
      setSavingTitle(false);
    }
  };

  const handleEditTechnical = () => {
    setEditedTechnical(bidProposal?.envelope1Content || '');
    setEditingTechnical(true);
  };

  const handleSaveTechnical = async () => {
    setSavingTechnical(true);
    try {
      const response = await fetch(`/api/bid-proposals/${bidProposalId}/update-content`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ envelope: 1, content: editedTechnical }),
      });
      
      if (!response.ok) throw new Error('Failed to save technical proposal');
      
      setBidProposal(prev => prev ? { ...prev, envelope1Content: editedTechnical } : null);
      setEditingTechnical(false);
      toast.success('Technical proposal updated successfully');
    } catch (error) {
      console.error('Error saving technical proposal:', error);
      toast.error('Failed to save technical proposal');
    } finally {
      setSavingTechnical(false);
    }
  };

  const handleEditCost = () => {
    setEditedCost(bidProposal?.envelope2Content || '');
    setEditingCost(true);
  };

  const handleSaveCost = async () => {
    setSavingCost(true);
    try {
      const response = await fetch(`/api/bid-proposals/${bidProposalId}/update-content`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ envelope: 2, content: editedCost }),
      });
      
      if (!response.ok) throw new Error('Failed to save cost proposal');
      
      setBidProposal(prev => prev ? { ...prev, envelope2Content: editedCost } : null);
      setEditingCost(false);
      toast.success('Cost proposal updated successfully');
    } catch (error) {
      console.error('Error saving cost proposal:', error);
      toast.error('Failed to save cost proposal');
    } finally {
      setSavingCost(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!bidProposal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <p className="text-lg text-muted-foreground mb-4">Bid proposal not found</p>
        <Link href="/dashboard/bid-proposals">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bids
          </Button>
        </Link>
      </div>
    );
  }

  const isProcessing = bidProposal.envelope1Status === 'in_progress' || 
                       bidProposal.envelope2Status === 'in_progress';
  const isComplete = bidProposal.envelope1Status === 'completed';

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard/bid-proposals">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            {editingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-2xl font-bold h-auto py-2"
                  placeholder="Enter proposal title"
                />
                <Button
                  size="sm"
                  onClick={handleSaveTitle}
                  disabled={savingTitle}
                >
                  {savingTitle ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingTitle(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{bidProposal.proposalTitle || 'Untitled Proposal'}</h1>
                <Button variant="ghost" size="icon" onClick={handleEditTitle}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            )}
            <p className="text-sm text-muted-foreground">{bidProposal.issuingOrg}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {isComplete && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    disabled={downloading.pdf}
                    variant="outline"
                    size="sm"
                  >
                    {downloading.pdf ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Download PDF
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDownloadPDF(1)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Technical Proposal
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadPDF(2)}>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Cost Proposal
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDownloadPDF('combined')}>
                    <Package className="w-4 h-4 mr-2" />
                    Combined (Both Envelopes)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    disabled={downloading.slides}
                    variant="outline"
                    size="sm"
                  >
                    {downloading.slides ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Download Slides
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDownloadSlides(1)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Technical Proposal
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadSlides(2)}>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Cost Proposal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          
          <Dialog open={regenerateDialogOpen} onOpenChange={setRegenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Regenerate Proposal</DialogTitle>
                <DialogDescription>
                  Provide specific instructions and optionally upload new files to regenerate the proposal.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                {/* Notes/Instructions Field */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Regeneration Notes & Instructions
                  </label>
                  <Textarea
                    value={regenerateNotes}
                    onChange={(e) => setRegenerateNotes(e.target.value)}
                    placeholder="Provide specific instructions for the AI to regenerate the proposal (e.g., 'Focus more on technical specifications', 'Add more details about timeline', 'Emphasize cost-effectiveness')..."
                    className="min-h-[120px] w-full resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    These instructions will guide the AI in regenerating your proposal based on past files, new files, and your specific requirements.
                  </p>
                </div>

                {/* File Upload Field */}
                <div>
                  <label className="block text-sm font-medium mb-2">Upload New Files (Optional)</label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setRegenerateFiles(Array.from(e.target.files || []))}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary file:text-primary-foreground
                      hover:file:bg-primary/90"
                  />
                  {regenerateFiles.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {regenerateFiles.length} new file(s) selected
                    </p>
                  )}
                  {bidProposal.bidAttachments && bidProposal.bidAttachments.length > 0 && regenerateFiles.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Will use {bidProposal.bidAttachments.length} existing document(s)
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRegenerateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRegenerate} disabled={regenerating}>
                  {regenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    'Regenerate'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="mb-6">
          <ProcessingStatusIndicator bidId={bidProposalId} />
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {bidProposal.closingDate && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="w-4 h-4" />
                <p className="text-xs font-medium">Closing Date</p>
              </div>
              <p className="text-sm font-semibold">{new Date(bidProposal.closingDate).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        )}
        
        {bidProposal.location && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MapPin className="w-4 h-4" />
                <p className="text-xs font-medium">Location</p>
              </div>
              <p className="text-sm font-semibold">{bidProposal.location}</p>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <p className="text-xs font-medium">Status</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {isProcessing && <Badge variant="secondary">Processing</Badge>}
              {isComplete && <Badge variant="default">Complete</Badge>}
              {!isProcessing && !isComplete && <Badge variant="outline">Pending</Badge>}
            </div>
          </CardContent>
        </Card>
        
        {bidProposal.proposedPrice && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="w-4 h-4" />
                <p className="text-xs font-medium">Budget</p>
              </div>
              <p className="text-sm font-semibold">${bidProposal.proposedPrice.toLocaleString()}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="technical" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="technical" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Technical
            {bidProposal.envelope1Status === 'completed' && (
              <CheckCircle2 className="w-3 h-3 text-green-600 ml-1" />
            )}
          </TabsTrigger>
          <TabsTrigger value="cost" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Cost
            {bidProposal.envelope2Status === 'completed' && (
              <CheckCircle2 className="w-3 h-3 text-green-600 ml-1" />
            )}
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Documents
            {bidProposal.bidAttachments && bidProposal.bidAttachments.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {bidProposal.bidAttachments.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="technical" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Technical Proposal</CardTitle>
                {!editingTechnical && bidProposal.envelope1Content && (
                  <Button variant="outline" size="sm" onClick={handleEditTechnical}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingTechnical ? (
                <div className="space-y-4">
                  <Textarea
                    value={editedTechnical}
                    onChange={(e) => setEditedTechnical(e.target.value)}
                    className="min-h-[500px] font-mono text-sm"
                    placeholder="Enter technical proposal content (Markdown supported)"
                  />
                  <div className="flex items-center gap-2">
                    <Button onClick={handleSaveTechnical} disabled={savingTechnical}>
                      {savingTechnical ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setEditingTechnical(false)}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : bidProposal.envelope1Content ? (
                <div className="prose prose-sm max-w-none dark:prose-invert
                  prose-headings:font-bold prose-headings:text-foreground
                  prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                  prose-p:text-foreground prose-p:leading-relaxed
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-ul:list-disc prose-ul:pl-6
                  prose-ol:list-decimal prose-ol:pl-6
                  prose-li:text-foreground prose-li:my-1
                  prose-table:border-collapse prose-table:w-full
                  prose-thead:bg-muted
                  prose-th:border prose-th:border-border prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold
                  prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2
                  prose-hr:border-border prose-hr:my-6
                  prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {bidProposal.envelope1Content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No technical proposal generated yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Cost Proposal</CardTitle>
                {!editingCost && bidProposal.envelope2Content && (
                  <Button variant="outline" size="sm" onClick={handleEditCost}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingCost ? (
                <div className="space-y-4">
                  <Textarea
                    value={editedCost}
                    onChange={(e) => setEditedCost(e.target.value)}
                    className="min-h-[500px] font-mono text-sm"
                    placeholder="Enter cost proposal content (Markdown supported)"
                  />
                  <div className="flex items-center gap-2">
                    <Button onClick={handleSaveCost} disabled={savingCost}>
                      {savingCost ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setEditingCost(false)}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : bidProposal.envelope2Content ? (
                <div className="prose prose-sm max-w-none dark:prose-invert
                  prose-headings:font-bold prose-headings:text-foreground
                  prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                  prose-p:text-foreground prose-p:leading-relaxed
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-ul:list-disc prose-ul:pl-6
                  prose-ol:list-decimal prose-ol:pl-6
                  prose-li:text-foreground prose-li:my-1
                  prose-table:border-collapse prose-table:w-full
                  prose-thead:bg-muted
                  prose-th:border prose-th:border-border prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold
                  prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2
                  prose-hr:border-border prose-hr:my-6
                  prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {bidProposal.envelope2Content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No cost proposal generated yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {bidProposal.bidAttachments && bidProposal.bidAttachments.length > 0 ? (
                <div className="space-y-2">
                  {bidProposal.bidAttachments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {doc.category && (
                              <Badge variant="outline" className="text-xs capitalize">
                                {doc.category}
                              </Badge>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/api/file/download?path=${doc.cloudStoragePath}`} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No documents uploaded yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
