
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, File, X, Loader2, CheckCircle, FileText, Mail, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function NewBidProposalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rfpFiles, setRfpFiles] = useState<File[]>([]);
  const [emailFiles, setEmailFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState<'idle' | 'uploading' | 'extracting' | 'generating' | 'complete'>('idle');


  const handleRfpFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setRfpFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleEmailFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setEmailFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeRfpFile = (index: number) => {
    setRfpFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeEmailFile = (index: number) => {
    setEmailFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith('.eml') || lowerName.endsWith('.msg') || lowerName.includes('email')) {
      return <Mail className="h-5 w-5 flex-shrink-0 text-blue-600" />;
    } else if (lowerName.endsWith('.pdf')) {
      return <FileText className="h-5 w-5 flex-shrink-0 text-red-600" />;
    } else if (lowerName.endsWith('.doc') || lowerName.endsWith('.docx')) {
      return <FileSpreadsheet className="h-5 w-5 flex-shrink-0 text-blue-500" />;
    }
    return <File className="h-5 w-5 flex-shrink-0 text-primary" />;
  };

  const getFileTypeLabel = (fileName: string): string => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith('.eml') || lowerName.endsWith('.msg') || lowerName.includes('email')) {
      return 'Email';
    } else if (lowerName.endsWith('.pdf')) {
      return 'PDF Document';
    } else if (lowerName.endsWith('.doc') || lowerName.endsWith('.docx')) {
      return 'Word Document';
    }
    return 'Document';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalFiles = rfpFiles.length + emailFiles.length;
    if (totalFiles === 0) {
      toast.error('Please upload at least one document (RFP or email)');
      return;
    }

    if (rfpFiles.length === 0) {
      toast.error('Please upload at least one RFP document');
      return;
    }

    setLoading(true);
    setProcessing(true);
    setExtractionStatus('uploading');
    
    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add RFP files with 'rfpFiles' key
      rfpFiles.forEach((file) => {
        formDataToSend.append('rfpFiles', file);
      });
      
      // Add email files with 'emailFiles' key
      emailFiles.forEach((file) => {
        formDataToSend.append('emailFiles', file);
      });

      setExtractionStatus('extracting');
      toast.info('AI is analyzing your documents... This may take a few minutes for large files.');

      // Create an abort controller with a 5-minute timeout
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, 300000); // 5 minutes

      try {
        const res = await fetch('/api/bid-proposals/extract', {
          method: 'POST',
          body: formDataToSend,
          signal: abortController.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Failed to create bid proposal');
        }

        const data = await res.json();
        
        setExtractionStatus('complete');
        toast.success('Bid proposal created successfully! Generating proposals...');
        
        // Redirect to the bid proposal detail page
        router.push(`/dashboard/bid-proposals/${data.id}`);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.error('Error creating bid proposal:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          toast.error('Request timed out. Please try uploading smaller files or fewer files at once.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Failed to create bid proposal');
      }
      
      setExtractionStatus('idle');
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/bid-proposals">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bid Proposals
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create New Bid Proposal</h1>
          <p className="text-muted-foreground mt-2">
            Upload your RFP documents, emails, and related files. Our AI will automatically extract all information and generate your proposals.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* RFP Documents Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                1. Upload RFP Documents
              </CardTitle>
              <CardDescription>
                Upload the main RFP documents, specifications, and requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Area */}
              <div className="relative border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Drag and drop RFP files here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, Word docs, images
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  onChange={handleRfpFilesChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {/* Uploaded RFP Files */}
              {rfpFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">RFP Documents ({rfpFiles.length})</h4>
                  <div className="space-y-2">
                    {rfpFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border bg-muted"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getFileIcon(file.name)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {getFileTypeLabel(file.name)} • {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRfpFile(index)}
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Correspondence Upload - Prominent and Separate */}
          <Card className="border-2 border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <Mail className="h-5 w-5" />
                2. Upload Email Correspondence (Optional but Recommended)
              </CardTitle>
              <CardDescription>
                Upload any preliminary emails, questions, or correspondence related to this bid. This helps the AI understand the context and match the tone of your proposal to previous communications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-100 space-y-1">
                  <p className="font-semibold">Why upload emails?</p>
                  <ul className="text-xs space-y-1 ml-4 list-disc">
                    <li>AI learns the tone and style of previous communications</li>
                    <li>Better understanding of client expectations and concerns</li>
                    <li>More personalized and contextual proposals</li>
                  </ul>
                </div>
              </div>

              {/* Email Upload Area */}
              <div className="relative border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors bg-white dark:bg-gray-950">
                <Mail className="h-12 w-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Drop email files here, or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Email files (.eml, .msg), PDFs of emails, or text files
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".eml,.msg,.pdf,.txt"
                  onChange={handleEmailFilesChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {/* Uploaded Email Files */}
              {emailFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Email Files ({emailFiles.length})</h4>
                  <div className="space-y-2">
                    {emailFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Mail className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate text-blue-900 dark:text-blue-100">{file.name}</p>
                              <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                Email
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {getFileTypeLabel(file.name)} • {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEmailFile(index)}
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Processing Status */}
          {processing && (
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  {extractionStatus === 'complete' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {extractionStatus === 'uploading' && 'Uploading files...'}
                      {extractionStatus === 'extracting' && 'AI is analyzing documents and extracting bid information...'}
                      {extractionStatus === 'generating' && 'Generating technical and cost proposals...'}
                      {extractionStatus === 'complete' && 'Complete! Redirecting...'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This may take 30-60 seconds depending on document size
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-sm text-muted-foreground">
              {rfpFiles.length > 0 || emailFiles.length > 0 ? (
                <span>
                  <strong>{rfpFiles.length}</strong> RFP document{rfpFiles.length !== 1 ? 's' : ''}
                  {emailFiles.length > 0 && <> • <strong>{emailFiles.length}</strong> email{emailFiles.length !== 1 ? 's' : ''}</>}
                </span>
              ) : (
                <span>No files uploaded yet</span>
              )}
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/bid-proposals">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading || rfpFiles.length === 0}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Create Bid Proposal
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Help Section */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">How it works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="font-semibold text-primary">1.</span>
                <div>
                  <p className="font-medium">Upload RFP Documents</p>
                  <p className="text-xs text-muted-foreground">Add all RFP files, specifications, and requirements</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-primary">2.</span>
                <div>
                  <p className="font-medium">Upload Email Correspondence (Optional)</p>
                  <p className="text-xs text-muted-foreground">Include preliminary emails for better context and tone matching</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-primary">3.</span>
                <div>
                  <p className="font-medium">AI Analysis</p>
                  <p className="text-xs text-muted-foreground">Our AI extracts deadlines, requirements, contacts, and understands email context</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-primary">4.</span>
                <div>
                  <p className="font-medium">Proposals Generated</p>
                  <p className="text-xs text-muted-foreground">Technical and cost proposals are automatically created with professional PDFs and slides</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-primary">5.</span>
                <div>
                  <p className="font-medium">Review & Submit</p>
                  <p className="text-xs text-muted-foreground">Edit, refine, and download your proposals for submission</p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}