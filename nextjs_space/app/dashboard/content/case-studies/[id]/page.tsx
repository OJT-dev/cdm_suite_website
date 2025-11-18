'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, Plus, X, Upload } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { FileUpload } from '@/components/file-upload';

interface CaseStudyForm {
  slug: string;
  title: string;
  category: string;
  client: string;
  description: string;
  challenge: string;
  solution: string;
  results: string[];
  testimonialQuote: string;
  testimonialAuthor: string;
  testimonialCompany: string;
  heroImage: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  status: string;
}

export default function CaseStudyEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isNew = params.id === 'new';
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [newResult, setNewResult] = useState('');
  const [newTag, setNewTag] = useState('');
  
  const [formData, setFormData] = useState<CaseStudyForm>({
    slug: '',
    title: '',
    category: 'E-Commerce',
    client: '',
    description: '',
    challenge: '',
    solution: '',
    results: [],
    testimonialQuote: '',
    testimonialAuthor: '',
    testimonialCompany: '',
    heroImage: '',
    tags: [],
    metaTitle: '',
    metaDescription: '',
    status: 'draft',
  });

  useEffect(() => {
    if (!isNew) {
      fetchCaseStudy();
    }
  }, []);

  const fetchCaseStudy = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/content/case-studies/${params.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setFormData({
          ...data.caseStudy,
          results: Array.isArray(data.caseStudy.results) ? data.caseStudy.results : [],
          tags: Array.isArray(data.caseStudy.tags) ? data.caseStudy.tags : [],
        });
      } else {
        toast.error('Failed to fetch case study');
        router.push('/dashboard/content/case-studies');
      }
    } catch (error) {
      console.error('Error fetching case study:', error);
      toast.error('Failed to fetch case study');
      router.push('/dashboard/content/case-studies');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (newStatus?: string) => {
    try {
      setSaving(true);
      
      // Validation
      if (!formData.title || !formData.slug || !formData.client) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      const dataToSave = {
        ...formData,
        status: newStatus || formData.status,
      };
      
      const url = isNew 
        ? '/api/content/case-studies' 
        : `/api/content/case-studies/${params.id}`;
      
      const method = isNew ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });
      
      if (response.ok) {
        toast.success(isNew ? 'Case study created successfully' : 'Case study updated successfully');
        
        if (isNew) {
          const data = await response.json();
          router.push(`/dashboard/content/case-studies/${data.caseStudy.id}`);
        } else {
          fetchCaseStudy();
        }
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to save case study');
      }
    } catch (error) {
      console.error('Error saving case study:', error);
      toast.error('Failed to save case study');
    } finally {
      setSaving(false);
    }
  };

  const handleAddResult = () => {
    if (newResult.trim()) {
      setFormData({
        ...formData,
        results: [...formData.results, newResult.trim()],
      });
      setNewResult('');
    }
  };

  const handleRemoveResult = (index: number) => {
    setFormData({
      ...formData,
      results: formData.results.filter((_, i) => i !== index),
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Loading case study...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/content/case-studies">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isNew ? 'New Case Study' : 'Edit Case Study'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isNew ? 'Create a new case study' : 'Edit case study details'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Link href={`/case-studies/${formData.slug}`} target="_blank">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </Link>
          )}
          <Button 
            onClick={() => handleSave('draft')} 
            disabled={saving}
            variant="outline"
          >
            Save Draft
          </Button>
          <Button 
            onClick={() => handleSave('published')} 
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {formData.status === 'published' ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div>
        <Badge variant={formData.status === 'published' ? 'default' : 'secondary'}>
          {formData.status}
        </Badge>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Essential details about the case study</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter case study title"
            />
          </div>
          
          <div>
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="url-friendly-slug"
            />
            <p className="text-sm text-gray-500 mt-1">
              URL: /case-studies/{formData.slug || 'your-slug'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Client Name *</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="Client name"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="E-Commerce">E-Commerce</SelectItem>
                  <SelectItem value="Digital Advertising">Digital Advertising</SelectItem>
                  <SelectItem value="Logistics">Logistics</SelectItem>
                  <SelectItem value="Travel & Tourism">Travel & Tourism</SelectItem>
                  <SelectItem value="Professional Services">Professional Services</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the case study"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Hero Image */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Image</CardTitle>
          <CardDescription>Upload the main image for the case study</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            value={formData.heroImage}
            onChange={(cloudStoragePath) => setFormData({ ...formData, heroImage: cloudStoragePath })}
            label="Hero Image"
            description="Click to upload or drag and drop (PNG, JPG, WEBP up to 10MB)"
          />
          <p className="text-sm text-gray-500 mt-2">
            Recommended size: 1200x630px for optimal display
          </p>
        </CardContent>
      </Card>

      {/* Challenge & Solution */}
      <Card>
        <CardHeader>
          <CardTitle>Challenge & Solution</CardTitle>
          <CardDescription>Describe the problem and how you solved it</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="challenge">The Challenge</Label>
            <Textarea
              id="challenge"
              value={formData.challenge}
              onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
              placeholder="What challenges did the client face?"
              rows={4}
            />
          </div>
          
          <div>
            <Label htmlFor="solution">Our Solution</Label>
            <Textarea
              id="solution"
              value={formData.solution}
              onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
              placeholder="How did you solve the problem?"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Results Achieved</CardTitle>
          <CardDescription>Key metrics and outcomes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {formData.results.map((result, index) => (
              <Badge key={index} variant="secondary" className="gap-1 pr-1">
                {result}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleRemoveResult(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              value={newResult}
              onChange={(e) => setNewResult(e.target.value)}
              placeholder="Add a result (e.g., '150% increase in sales')"
              onKeyPress={(e) => e.key === 'Enter' && handleAddResult()}
            />
            <Button onClick={handleAddResult}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Testimonial */}
      <Card>
        <CardHeader>
          <CardTitle>Client Testimonial</CardTitle>
          <CardDescription>What the client said about your work</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="testimonialQuote">Quote</Label>
            <Textarea
              id="testimonialQuote"
              value={formData.testimonialQuote}
              onChange={(e) => setFormData({ ...formData, testimonialQuote: e.target.value })}
              placeholder="The client's testimonial"
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="testimonialAuthor">Author</Label>
              <Input
                id="testimonialAuthor"
                value={formData.testimonialAuthor}
                onChange={(e) => setFormData({ ...formData, testimonialAuthor: e.target.value })}
                placeholder="Author name"
              />
            </div>
            
            <div>
              <Label htmlFor="testimonialCompany">Company/Title</Label>
              <Input
                id="testimonialCompany"
                value={formData.testimonialCompany}
                onChange={(e) => setFormData({ ...formData, testimonialCompany: e.target.value })}
                placeholder="Company or title"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
          <CardDescription>Services provided in this project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="default" className="gap-1 pr-1">
                {tag}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleRemoveTag(tag)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag (e.g., 'Web Design')"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <Button onClick={handleAddTag}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
          <CardDescription>Optimize for search engines</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              value={formData.metaTitle}
              onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
              placeholder="SEO title (leave empty to use case study title)"
            />
          </div>
          
          <div>
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              placeholder="SEO description (leave empty to use case study description)"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pb-12">
        <Button 
          onClick={() => handleSave('draft')} 
          disabled={saving}
          variant="outline"
        >
          Save Draft
        </Button>
        <Button 
          onClick={() => handleSave('published')} 
          disabled={saving}
        >
          <Save className="w-4 h-4 mr-2" />
          {formData.status === 'published' ? 'Update Published' : 'Publish Now'}
        </Button>
      </div>
    </div>
  );
}
