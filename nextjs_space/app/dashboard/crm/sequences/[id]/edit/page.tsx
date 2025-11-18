
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  GripVertical,
} from 'lucide-react';
import {
  SEQUENCE_TYPES,
  TARGET_AUDIENCES,
  STEP_TYPES,
  DELAY_UNITS,
  SequenceStep,
} from '@/lib/sequence-types';
import { validateSequenceSteps, estimateSequenceDuration } from '@/lib/sequence-utils';
import { WYSIWYGEmailEditor } from '@/components/crm/sequences/wysiwyg-email-editor';

export default function EditSequencePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sequence, setSequence] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'email',
    targetAudience: 'new_lead',
  });
  
  const [steps, setSteps] = useState<SequenceStep[]>([]);

  useEffect(() => {
    fetchSequence();
  }, [params.id]);

  const fetchSequence = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/crm/sequences/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch sequence');

      const data = await response.json();
      setSequence(data.sequence);
      
      setFormData({
        name: data.sequence.name,
        description: data.sequence.description || '',
        type: data.sequence.type,
        targetAudience: data.sequence.targetAudience,
      });
      
      setSteps(data.sequence.steps || []);
    } catch (error) {
      console.error('Error fetching sequence:', error);
      toast.error('Failed to load sequence');
      router.push('/dashboard/crm/sequences');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = () => {
    const newStep: SequenceStep = {
      order: steps.length + 1,
      stepType: 'email',
      title: '',
      content: '',
      subject: '',
      delayAmount: 0,
      delayUnit: 'hours',
      delayFrom: 'previous',
    };
    setSteps([...steps, newStep]);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // Reorder steps
    newSteps.forEach((step, i) => {
      step.order = i + 1;
    });
    setSteps(newSteps);
  };

  const handleStepChange = (index: number, field: string, value: any) => {
    const newSteps = [...steps];
    (newSteps[index] as any)[field] = value;
    setSteps(newSteps);
  };

  const handleSave = async () => {
    try {
      // Validate
      if (!formData.name.trim()) {
        toast.error('Sequence name is required');
        return;
      }

      const validation = validateSequenceSteps(steps);
      if (!validation.valid) {
        toast.error(validation.errors[0]);
        return;
      }

      setSaving(true);

      const response = await fetch(`/api/crm/sequences/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          steps,
        }),
      });

      if (!response.ok) throw new Error('Failed to update sequence');

      toast.success('Sequence updated successfully!');
      router.push(`/dashboard/crm/sequences/${params.id}`);
    } catch (error) {
      console.error('Error saving sequence:', error);
      toast.error('Failed to save sequence');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading sequence...</p>
        </div>
      </div>
    );
  }

  const duration = estimateSequenceDuration(steps);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Sequence</h1>
            <p className="text-muted-foreground mt-1">
              Update your automated lead nurture sequence
            </p>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Sequence Details</CardTitle>
          <CardDescription>
            Basic information about your sequence
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Sequence Name*</Label>
              <Input
                id="name"
                placeholder="e.g., New Lead Welcome Sequence"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Sequence Type*</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEQUENCE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience*</Label>
            <Select
              value={formData.targetAudience}
              onValueChange={(value) =>
                setFormData({ ...formData, targetAudience: value })
              }
            >
              <SelectTrigger id="targetAudience">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TARGET_AUDIENCES.map((audience) => (
                  <SelectItem key={audience.value} value={audience.value}>
                    {audience.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose and strategy of this sequence..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sequence Steps */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sequence Steps</CardTitle>
              <CardDescription>
                Build your sequence flow • Estimated duration: {duration.formatted}
              </CardDescription>
            </div>
            <Button onClick={handleAddStep} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="border rounded-lg p-6 space-y-4 bg-muted/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <Badge variant="outline">Step {step.order}</Badge>
                </div>
                {steps.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveStep(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Step Type*</Label>
                  <Select
                    value={step.stepType}
                    onValueChange={(value) =>
                      handleStepChange(index, 'stepType', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STEP_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Title*</Label>
                  <Input
                    placeholder="e.g., Welcome Email"
                    value={step.title}
                    onChange={(e) =>
                      handleStepChange(index, 'title', e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Delay Configuration */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Delay Amount</Label>
                  <Input
                    type="number"
                    min="0"
                    value={step.delayAmount}
                    onChange={(e) =>
                      handleStepChange(index, 'delayAmount', parseInt(e.target.value) || 0)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Delay Unit</Label>
                  <Select
                    value={step.delayUnit}
                    onValueChange={(value) =>
                      handleStepChange(index, 'delayUnit', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DELAY_UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Delay From</Label>
                  <Select
                    value={step.delayFrom}
                    onValueChange={(value) =>
                      handleStepChange(index, 'delayFrom', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="start">Sequence Start</SelectItem>
                      <SelectItem value="previous">Previous Step</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Email-specific fields with WYSIWYG editor */}
              {step.stepType === 'email' && (
                <WYSIWYGEmailEditor
                  subject={step.subject || ''}
                  content={step.content || ''}
                  onSubjectChange={(value) => handleStepChange(index, 'subject', value)}
                  onContentChange={(value) => handleStepChange(index, 'content', value)}
                  stepIndex={index}
                />
              )}

              {/* SMS-specific fields */}
              {step.stepType === 'sms' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>SMS Message*</Label>
                    <Badge variant="outline" className="text-xs">
                      {(step.content || '').length}/160 chars
                    </Badge>
                  </div>
                  <Textarea
                    placeholder="Hi {{firstName}}! Thanks for reaching out. Ready to chat about growing your business? Reply YES to get started! - CDM Suite"
                    value={step.content || ''}
                    onChange={(e) =>
                      handleStepChange(index, 'content', e.target.value)
                    }
                    rows={3}
                    maxLength={320}
                  />
                  <p className="text-xs text-muted-foreground">
                    Keep it concise and conversational. Messages over 160 characters will be sent as multiple SMS.
                  </p>
                </div>
              )}

              {/* Task/Note content */}
              {(step.stepType === 'task' || step.stepType === 'note' || step.stepType === 'reminder') && (
                <div className="space-y-2">
                  <Label>Content*</Label>
                  <Textarea
                    placeholder={`Enter ${step.stepType} details...`}
                    value={step.content || ''}
                    onChange={(e) =>
                      handleStepChange(index, 'content', e.target.value)
                    }
                    rows={4}
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
