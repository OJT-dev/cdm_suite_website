

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  ClipboardList, 
  CheckCircle2, 
  Clock,
  Sparkles,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { getWorkflowTemplate, WORKFLOW_TEMPLATES } from '@/lib/workflow-templates';

interface ServiceInfo {
  id: string;
  name: string;
  type: string;
  tier?: string;
  amount?: number;
}

export default function CreateWorkflowPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  
  // Form state
  const [selectedService, setSelectedService] = useState<string>('');
  const [customServiceName, setCustomServiceName] = useState('');
  const [serviceType, setServiceType] = useState<string>('');
  const [serviceTier, setServiceTier] = useState<string>('');
  const [serviceAmount, setServiceAmount] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');
  const [clientNotes, setClientNotes] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  
  // Template preview state
  const [templatePreview, setTemplatePreview] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    // @ts-ignore
    if (session?.user?.role === 'admin' || session?.user?.role === 'employee') {
      fetchServices();
      fetchClients();
    }
  }, [session]);

  useEffect(() => {
    // Update template preview when service type or tier changes
    if (serviceType) {
      const template = getWorkflowTemplate(serviceType, serviceTier || 'growth');
      setTemplatePreview(template);
    } else {
      setTemplatePreview(null);
    }
  }, [serviceType, serviceTier]);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        // Transform services data
        const formattedServices = data.services?.map((s: any) => ({
          id: s.id,
          name: s.name,
          type: s.type || 'web-development',
          tier: s.tier,
          amount: s.amount,
        })) || [];
        setServices(formattedServices);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/user?role=client');
      if (res.ok) {
        const data = await res.json();
        setClients(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    if (serviceId === 'custom') {
      setServiceType('');
      setServiceTier('');
      setServiceAmount('');
      setCustomServiceName('');
    } else {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        setCustomServiceName(service.name);
        setServiceType(service.type);
        setServiceTier(service.tier || 'growth');
        setServiceAmount(service.amount?.toString() || '');
      }
    }
  };

  const handleCreateWorkflow = async () => {
    // Validation
    if (!clientId) {
      toast.error('Please select a client');
      return;
    }
    if (!customServiceName.trim()) {
      toast.error('Please enter a service name');
      return;
    }
    if (!serviceType) {
      toast.error('Please select a service type');
      return;
    }
    if (!serviceAmount || parseFloat(serviceAmount) <= 0) {
      toast.error('Please enter a valid service amount');
      return;
    }

    setLoading(true);

    try {
      // First, create or find workflow template
      const templateRes = await fetch('/api/workflows/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType,
          serviceTier: serviceTier || 'growth',
        }),
      });

      if (!templateRes.ok) {
        throw new Error('Failed to create workflow template');
      }

      const templateData = await templateRes.json();

      // Create workflow instance
      const workflowRes = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: templateData.template.id,
          userId: clientId,
          serviceName: customServiceName,
          serviceTier: serviceTier || undefined,
          serviceAmount: parseFloat(serviceAmount),
          clientNotes,
        }),
      });

      if (!workflowRes.ok) {
        const error = await workflowRes.json();
        throw new Error(error.error || 'Failed to create workflow');
      }

      const workflowData = await workflowRes.json();

      toast.success('Workflow created successfully!');
      router.push(`/dashboard/workflows/${workflowData.workflow.id}`);
    } catch (error: any) {
      console.error('Error creating workflow:', error);
      toast.error(error.message || 'Failed to create workflow');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/workflows">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workflows
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Create New Workflow</h1>
        <p className="text-muted-foreground mt-1">
          Set up a service fulfillment workflow for your client
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Details</CardTitle>
              <CardDescription>
                Configure the basic information for this workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Client Selection */}
              <div className="space-y-2">
                <Label htmlFor="client">Client *</Label>
                <Select value={clientId} onValueChange={setClientId} disabled={loadingClients}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingClients ? "Loading clients..." : "Select a client"} />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name || client.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Selection */}
              <div className="space-y-2">
                <Label htmlFor="service">Service</Label>
                <Select value={selectedService} onValueChange={handleServiceSelect} disabled={loadingServices}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingServices ? "Loading services..." : "Select from active services or create custom"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Create Custom Service</SelectItem>
                    <Separator className="my-2" />
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Name */}
              <div className="space-y-2">
                <Label htmlFor="serviceName">Service Name *</Label>
                <Input
                  id="serviceName"
                  value={customServiceName}
                  onChange={(e) => setCustomServiceName(e.target.value)}
                  placeholder="e.g., Website Redesign, SEO Optimization"
                />
              </div>

              {/* Service Type */}
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type *</Label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(WORKFLOW_TEMPLATES).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Tier */}
              <div className="space-y-2">
                <Label htmlFor="serviceTier">Service Tier</Label>
                <Select value={serviceTier} onValueChange={setServiceTier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Service Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Service Amount ($) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={serviceAmount}
                  onChange={(e) => setServiceAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Client Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Client Notes</Label>
                <Textarea
                  id="notes"
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="Any special requirements or notes for this workflow..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleCreateWorkflow} 
            disabled={loading || !clientId || !customServiceName || !serviceType || !serviceAmount}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>Creating Workflow...</>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Create Workflow
              </>
            )}
          </Button>
        </div>

        {/* Template Preview Section */}
        <div className="space-y-6">
          {templatePreview ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Workflow Template Preview</CardTitle>
                    <CardDescription>
                      {templatePreview.name}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI-Powered
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Estimated Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Duration
                    </div>
                    <div className="text-2xl font-bold">
                      {templatePreview.estimatedDuration} days
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ClipboardList className="h-4 w-4" />
                      Tasks
                    </div>
                    <div className="text-2xl font-bold">
                      {templatePreview.tasks.length}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Tasks List */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Workflow Tasks</h4>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {templatePreview.tasks.map((task: any, index: number) => (
                      <div 
                        key={index} 
                        className="p-3 border rounded-lg space-y-1 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-muted-foreground">
                                #{task.order}
                              </span>
                              <h5 className="font-medium text-sm truncate">
                                {task.title}
                              </h5>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {task.estimatedHours}h
                          </Badge>
                        </div>
                        {task.visibleToClient && (
                          <Badge variant="secondary" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            Client Visible
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Milestones */}
                {templatePreview.milestones && templatePreview.milestones.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Key Milestones</h4>
                      <div className="space-y-2">
                        {templatePreview.milestones.map((milestone: any, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{milestone.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Select a service type to preview the workflow template
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

