
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FileText,
  DollarSign,
  Users,
  Award,
  CheckCircle,
  Shield,
  Calendar,
  Phone,
  Download,
  Loader2,
  AlertCircle,
  Check,
  FileStack,
} from 'lucide-react';
import { getAllDocuments, getDocumentType, type DocumentTypeDefinition } from '@/lib/bid-document-types';
import { toast } from 'react-hot-toast';

interface DocumentStatus {
  id: string;
  documentType: string;
  title: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  generatedAt?: string;
  errorMessage?: string;
}

interface DocumentManagerProps {
  bidProposalId: string;
  refreshTrigger?: number;
}

const iconMap: Record<string, any> = {
  FileText,
  DollarSign,
  Users,
  Award,
  CheckCircle,
  Shield,
  Calendar,
  Phone,
};

export function DocumentManager({ bidProposalId, refreshTrigger }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<DocumentStatus[]>([]);
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>(['technical', 'cost']);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const allDocTypes = getAllDocuments();

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/bid-proposals/${bidProposalId}/documents`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // Poll for updates while generating
    const interval = setInterval(() => {
      if (documents.some(doc => doc.status === 'generating')) {
        fetchDocuments();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [bidProposalId, refreshTrigger]);

  // Generate documents
  const handleGenerate = async () => {
    if (selectedDocTypes.length === 0) {
      toast.error('Please select at least one document type');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch(`/api/bid-proposals/${bidProposalId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentTypes: selectedDocTypes }),
      });

      if (!response.ok) {
        throw new Error('Failed to start document generation');
      }

      toast.success('Document generation started');
      fetchDocuments();
    } catch (error) {
      console.error('Error generating documents:', error);
      toast.error('Failed to generate documents');
    } finally {
      setGenerating(false);
    }
  };

  // Download individual document
  const handleDownloadDocument = async (docId: string, title: string) => {
    setDownloading(docId);
    try {
      const response = await fetch(
        `/api/bid-proposals/${bidProposalId}/documents/${docId}/download`
      );

      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Document downloaded');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    } finally {
      setDownloading(null);
    }
  };

  // Download combined PDF
  const handleDownloadCombined = async () => {
    const completedDocs = documents.filter(doc => doc.status === 'completed');
    if (completedDocs.length === 0) {
      toast.error('No completed documents to download');
      return;
    }

    setDownloading('combined');
    try {
      const response = await fetch(
        `/api/bid-proposals/${bidProposalId}/documents/combined`
      );

      if (!response.ok) {
        throw new Error('Failed to download combined PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bid_proposal_complete.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Combined PDF downloaded');
    } catch (error) {
      console.error('Error downloading combined PDF:', error);
      toast.error('Failed to download combined PDF');
    } finally {
      setDownloading(null);
    }
  };

  // Get document status
  const getDocumentStatus = (docType: string): DocumentStatus | undefined => {
    return documents.find(doc => doc.documentType === docType);
  };

  // Toggle document selection
  const toggleDocType = (docType: string) => {
    setSelectedDocTypes(prev =>
      prev.includes(docType)
        ? prev.filter(t => t !== docType)
        : [...prev, docType]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const completedCount = documents.filter(doc => doc.status === 'completed').length;
  const generatingCount = documents.filter(doc => doc.status === 'generating').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Proposal Documents</h3>
          <p className="text-sm text-muted-foreground">
            Select and generate the documents you need for this bid
          </p>
        </div>
        <div className="flex gap-2">
          {completedCount > 0 && (
            <Button
              onClick={handleDownloadCombined}
              disabled={downloading === 'combined'}
              variant="outline"
            >
              {downloading === 'combined' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileStack className="h-4 w-4 mr-2" />
              )}
              Download All ({completedCount})
            </Button>
          )}
          <Button
            onClick={handleGenerate}
            disabled={generating || selectedDocTypes.length === 0}
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Selected
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allDocTypes.map((docType) => {
          const status = getDocumentStatus(docType.type);
          const Icon = iconMap[docType.icon] || FileText;
          const isSelected = selectedDocTypes.includes(docType.type);

          return (
            <Card
              key={docType.type}
              className={`relative transition-all ${
                isSelected ? 'border-primary ring-1 ring-primary' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleDocType(docType.type)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4 text-primary shrink-0" />
                        <h4 className="font-semibold text-sm truncate">
                          {docType.title}
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {docType.description}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {status ? (
                  <div className="space-y-2">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {status.status === 'completed' && (
                        <Badge variant="default" className="bg-green-500">
                          <Check className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                      {status.status === 'generating' && (
                        <Badge variant="secondary">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Generating...
                        </Badge>
                      )}
                      {status.status === 'error' && (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Error
                        </Badge>
                      )}
                      {status.status === 'pending' && (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </div>

                    {/* Download Button */}
                    {status.status === 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleDownloadDocument(status.id, docType.title)}
                        disabled={downloading === status.id}
                      >
                        {downloading === status.id ? (
                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-3 w-3 mr-2" />
                        )}
                        Download PDF
                      </Button>
                    )}

                    {/* Error Message */}
                    {status.status === 'error' && status.errorMessage && (
                      <p className="text-xs text-destructive">{status.errorMessage}</p>
                    )}

                    {/* Generated Date */}
                    {status.generatedAt && (
                      <p className="text-xs text-muted-foreground">
                        Generated {new Date(status.generatedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <Badge variant="outline">Not Generated</Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Status Summary */}
      {(completedCount > 0 || generatingCount > 0) && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {completedCount > 0 && (
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" />
              {completedCount} completed
            </div>
          )}
          {generatingCount > 0 && (
            <div className="flex items-center gap-1">
              <Loader2 className="h-4 w-4 animate-spin" />
              {generatingCount} generating
            </div>
          )}
        </div>
      )}
    </div>
  );
}
