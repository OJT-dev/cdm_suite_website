
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Calendar,
  Edit2,
} from 'lucide-react';
import { ProposalItem, DEFAULT_TERMS, calculateProposalTotals } from '@/lib/proposal-types';
import { ALL_SERVICE_TIERS, getTierById } from '@/lib/pricing-tiers';
import { ClientSelector } from '@/components/proposals/client-selector';
import Link from 'next/link';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

interface ServiceOption {
  id: string;
  name: string;
  price: number;
  category: string;
}

export default function NewProposalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Lead selection
  const [selectedClient, setSelectedClient] = useState<Lead | null>(null);

  // Client info (populated from selected client)
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCompany, setClientCompany] = useState('');

  // Proposal info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [terms, setTerms] = useState(DEFAULT_TERMS);
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [validUntil, setValidUntil] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);

  // Load service options
  useEffect(() => {
    if (status === 'authenticated') {
      prepareServiceOptions();
    }
  }, [status]);

  // Populate from URL params (from Lead CRM)
  useEffect(() => {
    if (searchParams) {
      const leadId = searchParams.get('leadId');
      const name = searchParams.get('clientName');
      const email = searchParams.get('clientEmail');
      const phone = searchParams.get('clientPhone');
      const company = searchParams.get('clientCompany');
      const interest = searchParams.get('interest');

      if (name) setClientName(name);
      if (email) setClientEmail(email);
      if (phone) setClientPhone(phone);
      if (company) setClientCompany(company);
      if (interest) {
        setTitle(`Proposal for ${name || 'Client'}`);
        setDescription(`Services requested: ${interest}`);
      }

      // If leadId is provided, set it as selected client
      if (leadId && name && email) {
        setSelectedClient({
          id: leadId,
          name: name,
          email: email,
          phone: phone || undefined,
          company: company || undefined,
        });
      }
    }
  }, [searchParams]);

  // Populate client info when client is selected
  useEffect(() => {
    if (selectedClient) {
      setClientName(selectedClient.name || '');
      setClientEmail(selectedClient.email || '');
      setClientPhone(selectedClient.phone || '');
      setClientCompany(selectedClient.company || '');
    }
  }, [selectedClient]);

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
    
    // Validation - require at least name
    if (!clientName) {
      toast.error('Please provide client name');
      return;
    }

    // At least one contact method should be provided
    if (!clientEmail && !clientPhone) {
      toast.error('Please provide at least an email or phone number');
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

    setLoading(true);

    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: selectedClient?.id || undefined,
          clientName,
          clientEmail,
          clientPhone,
          clientCompany,
          title,
          description,
          items,
          tax,
          discount,
          terms,
          notes,
          dueDate: dueDate || undefined,
          validUntil: validUntil || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Proposal created successfully!');
        router.push(`/dashboard/proposals/${data.proposal.id}`);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to create proposal');
      }
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast.error('An error occurred while creating the proposal');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateProposalTotals(items, tax, discount);

  if (status === 'loading') {
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
        <Link href="/dashboard/proposals">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Proposal</h1>
          <p className="text-gray-600 mt-1">Build a proposal for your client</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Select an existing customer or create a new one</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="clientSelector">
                Customer <span className="text-red-500">*</span>
              </Label>
              <ClientSelector
                selectedClient={selectedClient}
                onClientSelect={setSelectedClient}
              />
            </div>

            <Separator />

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
                  Client Email
                </Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="john@example.com (optional)"
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
            <CardDescription>Add services or custom items to the proposal</CardDescription>
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
                                disabled={item.type === 'service'}
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
                              {item.type === 'service' && (
                                <span title="Editable">
                                  <Edit2 className="h-3 w-3 text-blue-500" />
                                </span>
                              )}
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
                          value={tax}
                          onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
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
                    {tax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Tax ({tax}%):</span>
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
          <Link href="/dashboard/proposals">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Proposal
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
