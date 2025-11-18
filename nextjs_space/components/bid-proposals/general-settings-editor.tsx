
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Info,
  FileCheck,
  Shield,
  Building2,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { BidProposalData, BusinessListing, BusinessVerificationResult } from '@/lib/bid-proposal-types';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GeneralSettingsEditorProps {
  bidProposal: BidProposalData;
  onUpdate: () => void;
}

export function GeneralSettingsEditor({ bidProposal, onUpdate }: GeneralSettingsEditorProps) {
  // General Comment state
  const [generalComment, setGeneralComment] = useState(bidProposal.generalProposalComment || '');
  
  // HUB Plan state
  const [hubPlanRequired, setHubPlanRequired] = useState(bidProposal.hubPlanRequired || false);
  const [hubFeeThreshold, setHubFeeThreshold] = useState(
    bidProposal.hubFeeThreshold?.toString() || ''
  );
  
  // Business Listings state
  const [businessListings, setBusinessListings] = useState<BusinessListing[]>(() => {
    try {
      if (bidProposal.businessListings && typeof bidProposal.businessListings === 'string') {
        return JSON.parse(bidProposal.businessListings);
      }
      return bidProposal.businessListings || [];
    } catch {
      return [];
    }
  });
  
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const addBusinessListing = () => {
    const newListing: BusinessListing = {
      id: `temp_${Date.now()}`,
      businessName: '',
      role: 'subcontractor',
      certifications: [],
    };
    setBusinessListings([...businessListings, newListing]);
  };

  const removeBusinessListing = (id: string) => {
    setBusinessListings(businessListings.filter(b => b.id !== id));
  };

  const updateBusinessListing = (id: string, field: keyof BusinessListing, value: any) => {
    setBusinessListings(businessListings.map(b => 
      b.id === id ? { ...b, [field]: value } : b
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData: any = {
        generalProposalComment: generalComment || null,
        hubPlanRequired,
        hubFeeThreshold: hubFeeThreshold ? parseFloat(hubFeeThreshold) : null,
        businessListings: JSON.stringify(businessListings),
      };

      const res = await fetch(`/api/bid-proposals/${bidProposal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save');
      }

      toast.success('Settings saved successfully');
      onUpdate();
    } catch (error: any) {
      console.error('Error saving:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyBusinesses = async () => {
    if (businessListings.length === 0) {
      toast.error('Please add at least one business to verify');
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch(`/api/bid-proposals/${bidProposal.id}/verify-businesses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businesses: businessListings }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to verify businesses');
      }

      const data = await res.json();
      toast.success('Business verification complete!');
      onUpdate();
    } catch (error: any) {
      console.error('Error verifying businesses:', error);
      toast.error(error.message || 'Failed to verify businesses');
    } finally {
      setVerifying(false);
    }
  };

  const proposedPrice = bidProposal.proposedPrice || 0;
  const feeThresholdValue = hubFeeThreshold ? parseFloat(hubFeeThreshold) : 0;
  const meetsThreshold = proposedPrice >= feeThresholdValue && feeThresholdValue > 0;

  // Parse verification results
  const verificationResults: BusinessVerificationResult[] = (() => {
    try {
      if (bidProposal.businessVerificationResults && typeof bidProposal.businessVerificationResults === 'string') {
        return JSON.parse(bidProposal.businessVerificationResults);
      }
      return bidProposal.businessVerificationResults || [];
    } catch {
      return [];
    }
  })();

  return (
    <div className="space-y-6">
      {/* General Proposal Comment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-blue-600" />
            General Proposal Comment
          </CardTitle>
          <CardDescription>
            This comment will be automatically included in all proposal documents (Technical, Cost, HUB plans, etc.) to ensure consistent messaging.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="generalComment">Comment</Label>
            <Textarea
              id="generalComment"
              placeholder="E.g., This proposal demonstrates our commitment to excellence and our proven track record of delivering $9.3B+ in infrastructure projects..."
              value={generalComment}
              onChange={(e) => setGeneralComment(e.target.value)}
              className="min-h-[150px] mt-2"
            />
            <p className="text-xs text-gray-500 mt-2">
              This comment will appear prominently in all generated documents to maintain brand consistency and key messaging.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* HUB/Subcontracting Plan Logic Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            HUB/Subcontracting Plan Settings
          </CardTitle>
          <CardDescription>
            Configure requirements for Historically Underutilized Business (HUB) and subcontracting plans based on governmental thresholds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fee Threshold */}
          <div>
            <Label htmlFor="hubFeeThreshold">Governmental Fee Threshold</Label>
            <Input
              id="hubFeeThreshold"
              type="number"
              placeholder="Enter threshold amount (e.g., 100000)"
              value={hubFeeThreshold}
              onChange={(e) => setHubFeeThreshold(e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-2">
              County/State/Federal threshold for requiring full HUB plan
            </p>
          </div>

          {/* Current Status Display */}
          {proposedPrice > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Proposed Price:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ${proposedPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Fee Threshold:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ${feeThresholdValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-blue-300">
                  <span className="text-sm font-medium text-gray-700">Full HUB Plan Required:</span>
                  <Badge className={meetsThreshold ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                    {meetsThreshold ? 'Yes - Above Threshold' : 'No - Below Threshold'}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Intent/Waiver Information */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex gap-2">
              <Info className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-purple-900">
                <p className="font-medium mb-2">HUB Plan Logic:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li><strong>Below Threshold:</strong> Generate simplified intent/waiver document aligned with County/State/Federal requirements</li>
                  <li><strong>Above Threshold:</strong> Include full, detailed HUB subcontracting plan</li>
                  <li><strong>Partnership Status:</strong> Final contractual confirmation occurs only after client accepts bid</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Listing Verification Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-600" />
                Business Listing & Verification
              </CardTitle>
              <CardDescription>
                Manage businesses for contracting families/helpers and verify their legitimacy before bid submission.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addBusinessListing}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Business
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Verification Status */}
          {bidProposal.businessVerificationStatus && bidProposal.businessVerificationStatus !== 'not_verified' && (
            <div className={cn(
              'rounded-lg p-4 border',
              bidProposal.businessVerificationStatus === 'verified' && 'bg-green-50 border-green-200',
              bidProposal.businessVerificationStatus === 'verifying' && 'bg-blue-50 border-blue-200',
              bidProposal.businessVerificationStatus === 'failed' && 'bg-red-50 border-red-200',
            )}>
              <div className="flex items-center gap-2">
                {bidProposal.businessVerificationStatus === 'verified' && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                {bidProposal.businessVerificationStatus === 'verifying' && (
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                )}
                {bidProposal.businessVerificationStatus === 'failed' && (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium text-sm">
                  Status: {bidProposal.businessVerificationStatus === 'verified' ? 'Verified' : 
                           bidProposal.businessVerificationStatus === 'verifying' ? 'Verifying...' : 'Verification Failed'}
                </span>
              </div>
              {bidProposal.businessVerificationNote && (
                <p className="text-xs mt-2 text-gray-700">{bidProposal.businessVerificationNote}</p>
              )}
            </div>
          )}

          {/* Business Listings */}
          {businessListings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No businesses added yet</p>
              <p className="text-xs mt-1">Click "Add Business" to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {businessListings.map((business, index) => {
                const verificationResult = verificationResults.find(r => r.businessId === business.id);
                
                return (
                  <Card key={business.id} className="border-gray-200">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="text-sm font-medium text-gray-900">Business #{index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBusinessListing(business.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`businessName_${business.id}`}>Business Name *</Label>
                          <Input
                            id={`businessName_${business.id}`}
                            value={business.businessName}
                            onChange={(e) => updateBusinessListing(business.id, 'businessName', e.target.value)}
                            placeholder="Enter business name"
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`role_${business.id}`}>Role *</Label>
                          <Select
                            value={business.role || 'subcontractor'}
                            onValueChange={(value) => updateBusinessListing(business.id, 'role', value)}
                          >
                            <SelectTrigger id={`role_${business.id}`} className="mt-1">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="subcontractor">Subcontractor</SelectItem>
                              <SelectItem value="helper">Helper</SelectItem>
                              <SelectItem value="partner">Partner</SelectItem>
                              <SelectItem value="consultant">Consultant</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor={`contactPerson_${business.id}`}>Contact Person</Label>
                          <Input
                            id={`contactPerson_${business.id}`}
                            value={business.contactPerson || ''}
                            onChange={(e) => updateBusinessListing(business.id, 'contactPerson', e.target.value)}
                            placeholder="Contact name"
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`email_${business.id}`}>Email</Label>
                          <Input
                            id={`email_${business.id}`}
                            type="email"
                            value={business.email || ''}
                            onChange={(e) => updateBusinessListing(business.id, 'email', e.target.value)}
                            placeholder="email@example.com"
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`phone_${business.id}`}>Phone</Label>
                          <Input
                            id={`phone_${business.id}`}
                            value={business.phone || ''}
                            onChange={(e) => updateBusinessListing(business.id, 'phone', e.target.value)}
                            placeholder="(123) 456-7890"
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`estimatedValue_${business.id}`}>Estimated Value ($)</Label>
                          <Input
                            id={`estimatedValue_${business.id}`}
                            type="number"
                            value={business.estimatedValue || ''}
                            onChange={(e) => updateBusinessListing(business.id, 'estimatedValue', parseFloat(e.target.value) || 0)}
                            placeholder="50000"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <Label htmlFor={`proposedScope_${business.id}`}>Proposed Scope</Label>
                        <Textarea
                          id={`proposedScope_${business.id}`}
                          value={business.proposedScope || ''}
                          onChange={(e) => updateBusinessListing(business.id, 'proposedScope', e.target.value)}
                          placeholder="Brief description of work scope..."
                          className="mt-1"
                          rows={2}
                        />
                      </div>

                      {/* Verification Result Display */}
                      {verificationResult && (
                        <div className={cn(
                          'mt-4 p-3 rounded-lg border',
                          verificationResult.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        )}>
                          <div className="flex items-center gap-2">
                            {verificationResult.exists ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-sm font-medium">
                              {verificationResult.exists ? 'Verified' : 'Not Found'}
                              {verificationResult.status && ` - ${verificationResult.status}`}
                            </span>
                          </div>
                          {verificationResult.notes && (
                            <p className="text-xs mt-2 text-gray-700">{verificationResult.notes}</p>
                          )}
                          {verificationResult.requiresPartnershipConfirmation && (
                            <p className="text-xs mt-2 text-orange-700 font-medium">
                              ⚠️ Partnership confirmation required after client accepts bid
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Verification Action */}
          {businessListings.length > 0 && (
            <div className="space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-900">
                    <p className="font-medium mb-1">Business Verification Note:</p>
                    <p className="text-xs">
                      This verification checks for basic business existence and status only. 
                      Final contractual partnership confirmation cannot occur until the client accepts the bid.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleVerifyBusinesses}
                disabled={verifying}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying Businesses...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Verify All Businesses
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
