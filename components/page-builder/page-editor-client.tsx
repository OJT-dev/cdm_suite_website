
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SectionEditor } from './section-editor';
import { SectionPreview } from './section-preview';
import { Section, SectionType, sectionTemplates, createSection } from '@/lib/page-templates';
import { Save, Eye, Plus, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PageEditorClientProps {
  page: {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    content: string;
    metaTitle?: string | null;
    metaDescription?: string | null;
    status: string;
  };
}

export function PageEditorClient({ page }: PageEditorClientProps) {
  const router = useRouter();
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [description, setDescription] = useState(page.description || '');
  const [metaTitle, setMetaTitle] = useState(page.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(page.metaDescription || '');
  const [status, setStatus] = useState(page.status);
  const [sections, setSections] = useState<Section[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    try {
      const parsedContent = JSON.parse(page.content);
      setSections(parsedContent.sections || []);
    } catch (error) {
      console.error('Error parsing page content:', error);
      setSections([]);
    }
  }, [page.content]);

  const addSection = (type: SectionType) => {
    const newSection = createSection(type);
    newSection.order = sections.length;
    setSections([...sections, newSection]);
  };

  const updateSection = (index: number, updatedSection: Section) => {
    const newSections = [...sections];
    newSections[index] = updatedSection;
    setSections(newSections);
  };

  const deleteSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    // Update order
    newSections.forEach((section, i) => {
      section.order = i;
    });
    setSections(newSections);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) {
      return;
    }

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [
      newSections[targetIndex],
      newSections[index],
    ];

    // Update order
    newSections.forEach((section, i) => {
      section.order = i;
    });

    setSections(newSections);
  };

  const handleSave = async (newStatus?: string) => {
    setIsSaving(true);
    try {
      const content = JSON.stringify({
        sections,
        version: '1.0',
      });

      const response = await fetch(`/api/page-builder/pages/${page.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          description,
          content,
          metaTitle: metaTitle || title,
          metaDescription: metaDescription || description,
          status: newStatus || status,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save page');
      }

      toast.success('Page saved successfully!');
      
      if (newStatus === 'published') {
        toast.success('Page is now live!');
      }
      
      router.refresh();
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Failed to save page');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Page Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Page Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="About Us"
              />
            </div>
            <div className="space-y-2">
              <Label>URL Slug</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="about-us"
              />
              <p className="text-xs text-muted-foreground">
                Page will be accessible at: /{slug}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the page"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Meta Title (SEO)</Label>
              <Input
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Leave blank to use page title"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Meta Description (SEO)</Label>
            <Textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Leave blank to use page description"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="edit" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave('draft')}
              disabled={isSaving}
            >
              Save Draft
            </Button>
            <Button onClick={() => handleSave('published')} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save & Publish'}
            </Button>
          </div>
        </div>

        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add Section</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(Object.keys(sectionTemplates) as SectionType[]).map((type) => (
                  <Button
                    key={type}
                    variant="outline"
                    onClick={() => addSection(type)}
                    className="h-auto flex-col py-3"
                  >
                    <Plus className="w-4 h-4 mb-1" />
                    <span className="text-xs">{sectionTemplates[type].name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {sections.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No sections yet. Add your first section to get started.
                </p>
                <Button onClick={() => addSection('hero')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Hero Section
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sections.map((section, index) => (
                <SectionEditor
                  key={section.id}
                  section={section}
                  onUpdate={(updated) => updateSection(index, updated)}
                  onDelete={() => deleteSection(index)}
                  onMoveUp={() => moveSection(index, 'up')}
                  onMoveDown={() => moveSection(index, 'down')}
                  isFirst={index === 0}
                  isLast={index === sections.length - 1}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="bg-background">
                {sections.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No content to preview. Add sections in the Edit tab.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {sections.map((section) => (
                      <SectionPreview key={section.id} section={section} />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
