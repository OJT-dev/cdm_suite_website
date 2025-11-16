
'use client';

import { Section, SectionType, sectionTemplates } from '@/lib/page-templates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, ChevronUp, ChevronDown, Plus, Minus } from 'lucide-react';
import { FileUpload } from '@/components/file-upload';

interface SectionEditorProps {
  section: Section;
  onUpdate: (section: Section) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function SectionEditor({
  section,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: SectionEditorProps) {
  const updateData = (key: string, value: any) => {
    onUpdate({
      ...section,
      data: {
        ...section.data,
        [key]: value,
      },
    });
  };

  const updateNestedData = (path: (string | number)[], value: any) => {
    const newData = { ...section.data };
    let current: any = newData;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    
    onUpdate({
      ...section,
      data: newData,
    });
  };

  const addArrayItem = (key: string, defaultItem: any) => {
    const currentArray = section.data[key] || [];
    updateData(key, [...currentArray, JSON.parse(JSON.stringify(defaultItem))]);
  };

  const removeArrayItem = (key: string, index: number) => {
    const currentArray = section.data[key] || [];
    updateData(key, currentArray.filter((_: any, i: number) => i !== index));
  };

  const renderFieldEditor = () => {
    const template = sectionTemplates[section.type];

    switch (section.type) {
      case 'hero':
        return (
          <>
            <div className="space-y-2">
              <Label>Headline</Label>
              <Input
                value={section.data.headline || ''}
                onChange={(e) => updateData('headline', e.target.value)}
                placeholder="Main headline"
              />
            </div>
            <div className="space-y-2">
              <Label>Subheading</Label>
              <Textarea
                value={section.data.subheading || ''}
                onChange={(e) => updateData('subheading', e.target.value)}
                placeholder="Supporting text"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CTA Text</Label>
                <Input
                  value={section.data.ctaText || ''}
                  onChange={(e) => updateData('ctaText', e.target.value)}
                  placeholder="Get Started"
                />
              </div>
              <div className="space-y-2">
                <Label>CTA Link</Label>
                <Input
                  value={section.data.ctaLink || ''}
                  onChange={(e) => updateData('ctaLink', e.target.value)}
                  placeholder="/contact"
                />
              </div>
            </div>
            <div className="space-y-2">
              <FileUpload
                value={section.data.backgroundImage || ''}
                onChange={(value) => updateData('backgroundImage', value)}
                label="Background Image"
                description="Click to upload or drag and drop"
              />
            </div>
            <div className="space-y-2">
              <Label>Text Alignment</Label>
              <Select
                value={section.data.alignment || 'center'}
                onValueChange={(value) => updateData('alignment', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'text':
        return (
          <>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={section.data.content || ''}
                onChange={(e) => updateData('content', e.target.value)}
                placeholder="Enter your text content..."
                rows={8}
              />
              <p className="text-xs text-muted-foreground">
                Supports basic HTML: &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;
              </p>
            </div>
            <div className="space-y-2">
              <Label>Alignment</Label>
              <Select
                value={section.data.alignment || 'left'}
                onValueChange={(value) => updateData('alignment', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'features':
        return (
          <>
            <div className="space-y-2">
              <Label>Section Title</Label>
              <Input
                value={section.data.title || ''}
                onChange={(e) => updateData('title', e.target.value)}
                placeholder="Our Services"
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input
                value={section.data.subtitle || ''}
                onChange={(e) => updateData('subtitle', e.target.value)}
                placeholder="Everything you need..."
              />
            </div>
            <div className="space-y-2">
              <Label>Columns</Label>
              <Select
                value={String(section.data.columns || 3)}
                onValueChange={(value) => updateData('columns', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={"2"}>2 Columns</SelectItem>
                  <SelectItem value={"3"}>3 Columns</SelectItem>
                  <SelectItem value={"4"}>4 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Feature Items</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    addArrayItem('items', {
                      icon: '🚀',
                      title: 'New Feature',
                      description: 'Feature description',
                    })
                  }
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Item
                </Button>
              </div>
              {(section.data.items || []).map((item: any, index: number) => (
                <Card key={index}>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Item {index + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeArrayItem('items', index)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Icon (emoji)"
                      value={item.icon || ''}
                      onChange={(e) =>
                        updateNestedData(['items', index, 'icon'], e.target.value)
                      }
                    />
                    <Input
                      placeholder="Title"
                      value={item.title || ''}
                      onChange={(e) =>
                        updateNestedData(['items', index, 'title'], e.target.value)
                      }
                    />
                    <Textarea
                      placeholder="Description"
                      value={item.description || ''}
                      onChange={(e) =>
                        updateNestedData(['items', index, 'description'], e.target.value)
                      }
                      rows={2}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        );

      case 'cta':
        return (
          <>
            <div className="space-y-2">
              <Label>Headline</Label>
              <Input
                value={section.data.headline || ''}
                onChange={(e) => updateData('headline', e.target.value)}
                placeholder="Ready to Get Started?"
              />
            </div>
            <div className="space-y-2">
              <Label>Subheadline</Label>
              <Input
                value={section.data.subheadline || ''}
                onChange={(e) => updateData('subheadline', e.target.value)}
                placeholder="Join hundreds of satisfied clients"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Button Text</Label>
                <Input
                  value={section.data.buttonText || ''}
                  onChange={(e) => updateData('buttonText', e.target.value)}
                  placeholder="Start Now"
                />
              </div>
              <div className="space-y-2">
                <Label>Button Link</Label>
                <Input
                  value={section.data.buttonLink || ''}
                  onChange={(e) => updateData('buttonLink', e.target.value)}
                  placeholder="/contact"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Background Color</Label>
              <Select
                value={section.data.backgroundColor || 'blue'}
                onValueChange={(value) => updateData('backgroundColor', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="gray">Gray</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'image':
        return (
          <>
            <div className="space-y-2">
              <FileUpload
                value={section.data.src || ''}
                onChange={(value) => updateData('src', value)}
                label="Image"
                description="Click to upload or drag and drop"
              />
            </div>
            <div className="space-y-2">
              <Label>Alt Text</Label>
              <Input
                value={section.data.alt || ''}
                onChange={(e) => updateData('alt', e.target.value)}
                placeholder="Image description"
              />
            </div>
            <div className="space-y-2">
              <Label>Caption (optional)</Label>
              <Input
                value={section.data.caption || ''}
                onChange={(e) => updateData('caption', e.target.value)}
                placeholder="Image caption"
              />
            </div>
            <div className="space-y-2">
              <Label>Width</Label>
              <Select
                value={section.data.width || 'large'}
                onValueChange={(value) => updateData('width', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="full">Full Width</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      default:
        return (
          <div className="text-sm text-muted-foreground">
            Editor for {section.type} - Coming soon
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {sectionTemplates[section.type].name}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={onMoveUp}
              disabled={isFirst}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onMoveDown}
              disabled={isLast}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{renderFieldEditor()}</CardContent>
    </Card>
  );
}
