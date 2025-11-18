
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Check, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface TitleEditorProps {
  bidProposalId: string;
  initialTitle?: string | null;
  onUpdate?: (newTitle: string) => void;
}

export function TitleEditor({ bidProposalId, initialTitle, onUpdate }: TitleEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle || '');
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/bid-proposals/${bidProposalId}/update-title`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalTitle: title }),
      });

      if (!response.ok) {
        throw new Error('Failed to update title');
      }

      toast.success('Title updated successfully');
      setIsEditing(false);
      if (onUpdate) {
        onUpdate(title);
      }
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('Failed to update title');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const response = await fetch(`/api/bid-proposals/${bidProposalId}/regenerate-title`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate title');
      }

      const data = await response.json();
      setTitle(data.proposalTitle);
      toast.success('Title regenerated successfully');
      if (onUpdate) {
        onUpdate(data.proposalTitle);
      }
    } catch (error) {
      console.error('Error regenerating title:', error);
      toast.error('Failed to regenerate title');
    } finally {
      setRegenerating(false);
    }
  };

  const handleCancel = () => {
    setTitle(initialTitle || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5" />
            Edit Proposal Title
          </CardTitle>
          <CardDescription>
            Enter a clear, professional title for your proposal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter proposal title..."
              className="text-lg font-medium"
              maxLength={200}
            />
            <p className="text-sm text-muted-foreground">
              {title.length}/200 characters
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving || !title.trim()}>
              {saving ? (
                <>
                  <Check className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save
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
          <span>Proposal Title</span>
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-medium text-foreground">
          {title || 'No title set'}
        </p>
      </CardContent>
    </Card>
  );
}
