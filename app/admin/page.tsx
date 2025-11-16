
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'react-hot-toast';
import { 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Briefcase, 
  Settings,
  BarChart3,
  ArrowRight 
} from 'lucide-react';

interface Service {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  popular: boolean;
  active: boolean;
  sortOrder: number;
}

export default function AdminPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [featuresText, setFeaturesText] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      setServices(data);
    } catch (error) {
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFeaturesText(service.features.join('\n'));
  };

  const handleSave = async () => {
    if (!editingService) return;

    try {
      const features = featuresText.split('\n').filter(f => f.trim());
      
      const res = await fetch(`/api/services/${editingService.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingService,
          features,
        }),
      });

      if (!res.ok) throw new Error('Failed to update service');

      toast.success('Service updated successfully!');
      setEditingService(null);
      fetchServices();
    } catch (error) {
      toast.error('Failed to update service');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Admin Dashboard Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your team, services, and platform configuration
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link href="/admin/employees">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Users className="h-8 w-8 text-primary" />
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4">Employees</CardTitle>
                <CardDescription>
                  Manage team members, roles & permissions
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Card className="opacity-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="mt-4">Projects</CardTitle>
              <CardDescription>
                Coming soon: Project management
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="opacity-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="mt-4">Analytics</CardTitle>
              <CardDescription>
                Coming soon: Team & project analytics
              </CardDescription>
            </CardHeader>
          </Card>

          <Link href="/admin/settings">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Settings className="h-8 w-8 text-primary" />
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4">Settings</CardTitle>
                <CardDescription>
                  Manage default contact info & global settings
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Services Management Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Service Management</h1>
        </div>

        {editingService ? (
          <Card>
            <CardHeader>
              <CardTitle>Edit Service: {editingService.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  value={editingService.name}
                  onChange={(e) =>
                    setEditingService({ ...editingService, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editingService.description}
                  onChange={(e) =>
                    setEditingService({ ...editingService, description: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  value={editingService.price}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      price: parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea
                  id="features"
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  rows={10}
                  placeholder="Enter each feature on a new line"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="popular"
                  checked={editingService.popular}
                  onCheckedChange={(checked) =>
                    setEditingService({ ...editingService, popular: checked })
                  }
                />
                <Label htmlFor="popular">Mark as Popular</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={editingService.active}
                  onCheckedChange={(checked) =>
                    setEditingService({ ...editingService, active: checked })
                  }
                />
                <Label htmlFor="active">Active</Label>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSave}>Save Changes</Button>
                <Button variant="outline" onClick={() => setEditingService(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{service.name}</span>
                    {service.popular && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                        Popular
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {service.description}
                  </p>
                  <div className="text-3xl font-bold text-blue-600">
                    ${service.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {service.features.length} features
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(service)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
