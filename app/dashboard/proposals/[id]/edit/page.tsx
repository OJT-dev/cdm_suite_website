'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  DollarSign,
  Percent,
  Edit2,
} from 'lucide-react';
import { ProposalItem, calculateProposalTotals, Proposal } from '@/lib/proposal-types';
import { ALL_SERVICE_TIERS, getTierById } from '@/lib/pricing-tiers';
import Link from 'next/link';

interface ServiceOption {
  id: string;
  name: string;
  price: number;
  category: string;
}

export default function EditProposalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const proposalId = params.id as string;

  // Client info
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCompany, setClientCompany] = useState('');

  // Proposal info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [taxPercent, setTaxPercent] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [terms, setTerms] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [validUntil, setValidUntil] = useState('');

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);

  useEffect(() => {
    if (status === 'authenticated' && proposalId) {
      fetchProposal();
      prepareServiceOptions();
    }
  }, [status, proposalId]);

  const fetchProposal = async () => {
    try {
      const res = await fetch(`/api/proposals/${proposalId}`);
      if (res.ok) {
        const data = await res.json();
        const proposal: Proposal = data.proposal;

        // Populate form fields
        setClientName(proposal.clientName);
        setClientEmail(proposal.clientEmail);
        setClientPhone(proposal.clientPhone || '');
        setClientCompany(proposal.clientCompany || '');
        setTitle(proposal.title);
        setDescription(proposal.description || '');
        setItems(proposal.items);
        
        // Calculate tax percentage from tax amount
        const subtotal = proposal.items.reduce((sum, item) => sum + item.total, 0);
        const taxPercent = subtotal > 0 ? (proposal.tax / (subtotal - proposal.discount)) * 100 : 0;
        setTaxPercent(Math.round(taxPercent * 100) / 100);
        
        setDiscount(proposal.discount);
        setTerms(proposal.terms || '');
        setNotes(proposal.notes || '');
        setDueDate(proposal.dueDate ? new Date(proposal.dueDate).toISOString().split('T')[0] : '');
        setValidUntil(proposal.validUntil ? new Date(proposal.validUntil).toISOString().split('T')[0] : '');
      } else {
        toast.error('Proposal not found');
        router.push('/dashboard/proposals');
      }
    } catch (error) {
      console.error('Error fetching proposal:', error);
      toast.error('Failed to load proposal');
    } finally {
      setLoading(false);
    }
  };

  const prepareServiceOptions = () => {
    const options: ServiceOption[] = [];
    
    // Ad Management
    ALL_SERVICE_TIERS.adManagement.forEach((tier) => {
      options.push({
        id: tier.id,
        name: `Ad Management - ${tier.name}`,
        price: tier.price,
        category: 'Ad Management',
      });
    });

    // SEO
    ALL_SERVICE_TIERS.seo.forEach((tier) => {
      options.push({
        id: tier.id,
        name: `SEO - ${tier.name}`,
        price: tier.price,
        category: 'SEO',
      });
    });

    // Social Media
    ALL_SERVICE_TIERS.socialMedia.forEach((tier) => {
      options.push({
        id: tier.id,
        name: `Social Media - ${tier.name}`,
        price: tier.price,
        category: 'Social Media',
      });
    });

    // Web Development
    ALL_SERVICE_TIERS.webDevelopment.forEach((tier) => {
      options.push({
        id: tier.id,
        name: `Web Development - ${tier.name}`,
        price: tier.price,
        category: 'Web Development',
      });
    });

    // App Creation
    ALL_SERVICE_TIERS.appCreation.forEach((tier) => {
      options.push({
        id: tier.id,
        name: `App Creation - ${tier.name}`,
        price: tier.price,
        category: 'App Creation',
      });
    });

    // Website Maintenance
    ALL_SERVICE_TIERS.websiteMaintenance.forEach((tier) => {
      options.push({
        id: tier.id,
        name: `Website Maintenance - ${tier.name}`,
        price: tier.price,
        category: 'Website Maintenance',
      });
    });

    // App Maintenance
    ALL_SERVICE_TIERS.appMaintenance.forEach((tier) => {
      options.push({
        id: tier.id,
        name: `App Maintenance - ${tier.name}`,
        price: tier.price,
        category: 'App Maintenance',
      });
    });

    setServiceOptions(options);
  };

  const addServiceItem = (serviceId: string) => {
    if (!serviceId) return;

    const service = serviceOptions.find((s) => s.id === serviceId);
    const tier = getTierById(serviceId);
    
    if (service && tier) {
      const newItem: ProposalItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'service',
        name: service.name,
        description: tier.features.join('\n• '),
        quantity: 1,
        unitPrice: service.price,
        total: service.price,
        serviceId: serviceId,
      };

      setItems([...items, newItem]);
    }
  };

  const addCustomItem = () => {
    const newItem: ProposalItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'custom',
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };

    setItems([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof ProposalItem, value: any) => {
    const updatedItems = [...items];
    const item = updatedItems[index];
    
    (item as any)[field] = value;

    // Recalculate total
    if (field === 'quantity' || field === 'unitPrice') {
      item.total = item.quantity * item.unitPrice;
    }

    setItems(updatedItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!clientName || !clientEmail) {
      toast.error('Please provide client name and email');
      return;
    }

    if (!title) {
      toast.error('Please provide a proposal title');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one item to the proposal');
      return;
    }

    // Check for incomplete custom items
    const incompleteItem = items.find(
      (item) => item.type === 'custom' && (!item.name || item.unitPrice <= 0)
    );
    if (incompleteItem) {
      toast.error('Please complete all custom items with name and price');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName,
          clientEmail,
          clientPhone,
          clientCompany,
          title,
          description,
          items,
          tax: taxPercent,
          discount,
          terms,
          notes,
          dueDate: dueDate || undefined,
          validUntil: validUntil || undefined,
        }),
      });

      if (res.ok) {
        toast.success('Proposal updated successfully!');
        router.push(`/dashboard/proposals/${proposalId}`);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to update proposal');
      }
    } catch (error) {
      console.error('Error updating proposal:', error);
      toast.error('An error occurred while updating the proposal');
    } finally {
      setSaving(false);
    }
  };

  const totals = calculateProposalTotals(items, taxPercent, discount);

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/proposals/${proposalId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Proposal</h1>
          <p className="text-gray-600 mt-1">Make changes to your proposal</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">
                  Client Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">
                  Client Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">Client Phone</Label>
                <Input
                  id="clientPhone"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="clientCompany">Company</Label>
                <Input
                  id="clientCompany"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  placeholder="Acme Corp"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proposal Details */}
        <Card>
          <CardHeader>
            <CardTitle>Proposal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">
                Proposal Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Website Development & SEO Package"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief overview of what this proposal includes..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>Proposal Items</CardTitle>
            <CardDescription>Add or modify services and custom items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Service */}
            <div className="flex gap-2">
              <Select onValueChange={addServiceItem}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add a service..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder" disabled>
                    Select a service
                  </SelectItem>
                  {serviceOptions.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - ${service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={addCustomItem} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Custom Item
              </Button>
            </div>

            <Separator />

            {/* Items List */}
            <div className="space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No items added yet. Add a service or custom item to get started.
                </div>
              ) : (
                items.map((item, index) => (
                  <Card key={item.id} className="border-dashed">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div>
                              <Label>Item Name</Label>
                              <Input
                                value={item.name}
                                onChange={(e) => updateItem(index, 'name', e.target.value)}
                                placeholder="Service or item name"
                                disabled={item.type === 'service'}
                              />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Textarea
                                value={item.description}
                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                placeholder="Brief description"
                                rows={2}
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="ml-2"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(index, 'quantity', parseInt(e.target.value) || 1)
                              }
                            />
                          </div>
                          <div>
                            <Label className="flex items-center gap-2">
                              Unit Price
                              <span title="Editable">
                                <Edit2 className="h-3 w-3 text-blue-500" />
                              </span>
                            </Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)
                                }
                                className="pl-9"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Total</Label>
                            <div className="flex items-center h-10 px-3 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium">
                              ${item.total.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Totals */}
            {items.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tax (%)</Label>
                      <div className="relative">
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={taxPercent}
                          onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Discount ($)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={discount}
                          onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount:</span>
                        <span className="font-medium">-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    {taxPercent > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Tax ({taxPercent}%):</span>
                        <span className="font-medium">${totals.taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-blue-600">${totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Terms & Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Terms & Additional Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={8}
                className="font-mono text-xs"
              />
            </div>
            <div>
              <Label htmlFor="notes">Internal Notes (Not visible to client)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any internal notes about this proposal..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href={`/dashboard/proposals/${proposalId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
