
'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, CheckCircle2, XCircle, AlertCircle, FileSpreadsheet, X } from 'lucide-react';
import { toast } from 'sonner';

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

export function BulkImportDialog({ open, onOpenChange, onImportComplete }: BulkImportDialogProps) {
  const [bulkData, setBulkData] = useState('');
  const [generateProposals, setGenerateProposals] = useState(true);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast.error('Please upload a CSV or Excel file');
      return;
    }

    setUploadedFile(file);

    try {
      const text = await file.text();
      
      // Parse CSV/Excel data
      let parsedData = '';
      const lines = text.split('\n');
      
      // Skip header row if it exists
      const startIndex = lines[0]?.toLowerCase().includes('name') || 
                         lines[0]?.toLowerCase().includes('email') ? 1 : 0;
      
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          parsedData += line + '\n';
        }
      }

      setBulkData(parsedData);
      toast.success(`File uploaded: ${file.name}`);
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Failed to read file');
      setUploadedFile(null);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setBulkData('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (!bulkData.trim()) {
      toast.error('Please enter some data to import or upload a file');
      return;
    }

    setImporting(true);
    setResults(null);

    try {
      const res = await fetch('/api/crm/leads/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: bulkData,
          generateProposals,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResults(data);
        toast.success(
          `Successfully imported ${data.leadsCreated} lead(s)${
            data.proposalsCreated > 0 ? ` and created ${data.proposalsCreated} proposal(s)` : ''
          }`
        );
        onImportComplete();
      } else {
        toast.error(data.error || 'Failed to import leads');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('An error occurred during import');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setBulkData('');
    setResults(null);
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Leads</DialogTitle>
          <DialogDescription>
            Paste your lead data below. Each line should contain: Name, Company, Phone, Email, Service Needs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Format Example:</h4>
            <div className="text-sm text-blue-700 font-mono space-y-1">
              <div>John Smith - Acme Corp, 555-123-4567, john@acme.com - needs website and SEO</div>
              <div>Jane Doe, 555-987-6543, jane@example.com - interested in social media marketing</div>
            </div>
            <p className="text-sm text-blue-600 mt-3">
              <strong>Tip:</strong> Include keywords like "website", "SEO", "social media", "ads", "marketing", "app" to automatically generate proposals.
            </p>
          </div>

          {/* File Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
            <div className="text-center">
              <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900 mb-2">Upload CSV or Excel File</h4>
              <p className="text-sm text-gray-600 mb-4">
                Upload a file with your lead data (CSV, XLSX, or XLS format)
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              
              {uploadedFile ? (
                <div className="flex items-center justify-center gap-2 bg-white border border-green-200 rounded-lg p-3">
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">{uploadedFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="ml-2 h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ) : (
                <label htmlFor="file-upload">
                  <Button type="button" variant="outline" asChild>
                    <span className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </span>
                  </Button>
                </label>
              )}
            </div>
          </div>

          {/* OR Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR paste data manually</span>
            </div>
          </div>

          {/* Input Area */}
          <div>
            <Label>Lead Data (Manual Entry)</Label>
            <Textarea
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              placeholder="Paste your lead data here... (one lead per line)"
              rows={8}
              className="mt-1 font-mono text-sm"
            />
          </div>

          {/* Options */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="generate-proposals"
              checked={generateProposals}
              onCheckedChange={(checked) => setGenerateProposals(checked as boolean)}
            />
            <Label
              htmlFor="generate-proposals"
              className="text-sm font-normal cursor-pointer"
            >
              Automatically generate draft proposals for leads with service keywords
            </Label>
          </div>

          {/* Results */}
          {results && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-3">Import Results</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">{results.leadsCreated} leads imported</span>
                </div>
                {results.proposalsCreated > 0 && (
                  <div className="flex items-center gap-2 text-blue-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm">{results.proposalsCreated} proposals created</span>
                  </div>
                )}
                {results.errors && results.errors.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 text-orange-700 mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {results.errors.length} issue(s) found
                      </span>
                    </div>
                    <div className="space-y-1 ml-6">
                      {results.errors.map((err: any, idx: number) => (
                        <div key={idx} className="text-sm text-gray-600">
                          {err.lead}: {err.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button onClick={handleImport} disabled={importing || !bulkData.trim()}>
              <Upload className="h-4 w-4 mr-2" />
              {importing ? 'Importing...' : 'Import Leads'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
