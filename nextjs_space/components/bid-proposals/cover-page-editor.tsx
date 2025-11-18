
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Check, X, Sparkles, Bold, Italic, List, AlignLeft, AlignCenter } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CoverPageEditorProps {
  bidProposalId: string;
  initialContent?: string | null;
  onUpdate?: (newContent: string) => void;
}

export function CoverPageEditor({ bidProposalId, initialContent, onUpdate }: CoverPageEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent || '');
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.innerHTML = content;
    }
  }, [isEditing, content]);

  const handleSave = async () => {
    const htmlContent = editorRef.current?.innerHTML || '';
    
    if (!htmlContent.trim()) {
      toast.error('Cover page cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/bid-proposals/${bidProposalId}/update-cover`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverPageContent: htmlContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cover page');
      }

      setContent(htmlContent);
      toast.success('Cover page updated successfully');
      setIsEditing(false);
      if (onUpdate) {
        onUpdate(htmlContent);
      }
    } catch (error) {
      console.error('Error updating cover page:', error);
      toast.error('Failed to update cover page');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const response = await fetch(`/api/bid-proposals/${bidProposalId}/regenerate-cover`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate cover page');
      }

      const data = await response.json();
      setContent(data.coverPageContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = data.coverPageContent;
      }
      toast.success('Cover page regenerated successfully');
      if (onUpdate) {
        onUpdate(data.coverPageContent);
      }
    } catch (error) {
      console.error('Error regenerating cover page:', error);
      toast.error('Failed to regenerate cover page');
    } finally {
      setRegenerating(false);
    }
  };

  const handleCancel = () => {
    setContent(initialContent || '');
    setIsEditing(false);
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5" />
            Edit Cover Page
          </CardTitle>
          <CardDescription>
            Customize the cover page content for your proposal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formatting Toolbar */}
          <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-muted/50">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => execCommand('bold')}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => execCommand('italic')}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => execCommand('justifyLeft')}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => execCommand('justifyCenter')}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => execCommand('insertUnorderedList')}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <select
              className="px-2 py-1 text-sm border rounded"
              onChange={(e) => execCommand('fontSize', e.target.value)}
              defaultValue="3"
            >
              <option value="1">Small</option>
              <option value="3">Normal</option>
              <option value="5">Large</option>
              <option value="7">Extra Large</option>
            </select>
          </div>

          {/* Editable Content */}
          <div
            ref={editorRef}
            contentEditable
            className={cn(
              "min-h-[400px] p-6 border rounded-lg bg-white",
              "prose prose-sm max-w-none",
              "focus:outline-none focus:ring-2 focus:ring-primary"
            )}
            style={{ lineHeight: '1.6' }}
          />

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Check className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={handleRegenerate}
              disabled={regenerating || saving}
              className="ml-auto"
            >
              {regenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Regenerate with AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Cover Page</span>
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {content ? (
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <p className="text-muted-foreground">No cover page content available</p>
        )}
      </CardContent>
    </Card>
  );
}
