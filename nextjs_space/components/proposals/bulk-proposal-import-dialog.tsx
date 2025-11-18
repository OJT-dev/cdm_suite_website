
'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { parseBulkLeadData, mapServicesToProposalItems } from '@/lib/bulk-import-parser';
import { generateProposalNumber, DEFAULT_TERMS } from '@/lib/proposal-types';

interface BulkProposalImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

export function BulkProposalImportDialog({
  open,
  onOpenChange,
  onImportComplete,
}: BulkProposalImportDialogProps) {
  const [bulkData, setBulkData] = useState('');
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [defaultTitle, setDefaultTitle] = useState('Service Proposal');

  const handleImport = async () => {
    if (!bulkData.trim()) {
      toast.error('Please enter some data to import');
      return;
    }

    setImporting(true);
    setResults(null);

    try {
      // Parse the bulk data
      const parsedLeads = parseBulkLeadData(bulkData);

      if (parsedLeads.length === 0) {
        toast.error('No valid data found in the input');
        setImporting(false);
        return;
      }

      const createdProposals = [];
      const errors = [];

      // Create proposals for each parsed entry
      for (const parsedLead of parsedLeads) {
        try {
          const items = mapServicesToProposalItems(parsedLead.serviceKeywords);

          // Calculate totals
          const subtotal = items.reduce((sum, item) => sum + item.total, 0);
          const tax = 0;
          const discount = 0;
          const total = subtotal;

          const proposalData = {
            clientName: parsedLead.name,
            clientEmail: parsedLead.email || `noemail-${Date.now()}@placeholder.com`,
            clientPhone: parsedLead.phone,
            clientCompany: parsedLead.company,
            title: `${defaultTitle} - ${parsedLead.name}`,
            description: `Proposal for ${parsedLead.interest}`,
            items,
            tax,
            discount,
            terms: DEFAULT_TERMS,
            notes: `Auto-generated from bulk import. Raw data: ${parsedLead.rawText}`,
          };

          const res = await fetch('/api/proposals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(proposalData),
          });

          if (res.ok) {
            const data = await res.json();
            createdProposals.push(data.proposal);
          } else {
            const errorData = await res.json();
            errors.push({
              client: parsedLead.name,
              error: errorData.error || 'Failed to create proposal',
            });
          }
        } catch (proposalError: any) {
          console.error('Error creating proposal:', proposalError);
          errors.push({
            client: parsedLead.name,
            error: proposalError.message || 'Failed to create proposal',
          });
        }
      }

      setResults({
        proposalsCreated: createdProposals.length,
        errors: errors.length > 0 ? errors : undefined,
      });

      toast.success(`Successfully created ${createdProposals.length} proposal(s)`);
      onImportComplete();
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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Proposals</DialogTitle>
          <DialogDescription>
            Quickly create multiple proposals from client data. Each line should contain: Name, Company, Phone,
            Email, Service Needs
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
              <strong>Keywords:</strong> Include "website", "SEO", "social media", "ads", "marketing", "app"
              to automatically add services to proposals.
            </p>
          </div>

          {/* Default Title */}
          <div>
            <Label>Default Proposal Title Prefix</Label>
            <Input
              value={defaultTitle}
              onChange={(e) => setDefaultTitle(e.target.value)}
              placeholder="Service Proposal"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Client name will be appended (e.g., "Service Proposal - John Smith")
            </p>
          </div>

          {/* Input Area */}
          <div>
            <Label>Client & Service Data</Label>
            <Textarea
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              placeholder="Paste your client data here... (one per line)"
              rows={10}
              className="mt-1 font-mono text-sm"
            />
          </div>

          {/* Results */}
          {results && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-3">Import Results</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">{results.proposalsCreated} proposals created</span>
                </div>
                {results.errors && results.errors.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 text-orange-700 mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">{results.errors.length} issue(s) found</span>
                    </div>
                    <div className="space-y-1 ml-6">
                      {results.errors.map((err: any, idx: number) => (
                        <div key={idx} className="text-sm text-gray-600">
                          {err.client}: {err.error}
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
              {importing ? 'Creating...' : 'Create Proposals'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
