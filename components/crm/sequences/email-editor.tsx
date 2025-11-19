
'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Copy, 
  Eye, 
  Code, 
  Bold, 
  Italic, 
  Link as LinkIcon, 
  List,
  Heading2,
  AlignLeft,
  AlignCenter
} from 'lucide-react';
import { toast } from 'sonner';
import { MERGE_TAGS } from '@/lib/sequence-types';

interface EmailEditorProps {
  subject: string;
  content: string;
  onSubjectChange: (subject: string) => void;
  onContentChange: (content: string) => void;
  stepIndex?: number;
}

export function EmailEditor({ 
  subject, 
  content, 
  onSubjectChange, 
  onContentChange,
  stepIndex 
}: EmailEditorProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);

  // Convert plain text to HTML format
  const formatContentAsHTML = (text: string): string => {
    if (!text) return '';
    
    // Basic formatting
    let html = text
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br />');
    
    // Wrap in paragraphs
    html = `<p>${html}</p>`;
    
    // Replace merge tags with styled versions
    html = html.replace(/\{\{(\w+)\}\}/g, '<strong style="color: #2563eb;">{{$1}}</strong>');
    
    return html;
  };

  // Generate full HTML email template
  const generateFullHTMLEmail = (): string => {
    const bodyContent = formatContentAsHTML(content);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 20px 0; text-align: center; background-color: #1a1a1a;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">CDM Suite</h1>
            </td>
        </tr>
    </table>
    
    <table role="presentation" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <tr>
            <td style="padding: 40px 30px;">
                <div style="color: #333333; font-size: 16px; line-height: 1.6;">
                    ${bodyContent}
                </div>
            </td>
        </tr>
    </table>
    
    <table role="presentation" style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <tr>
            <td style="text-align: center; color: #666666; font-size: 12px;">
                <p style="margin: 0;">© ${new Date().getFullYear()} CDM Suite. All rights reserved.</p>
                <p style="margin: 10px 0 0 0;">
                    <a href="{{unsubscribeLink}}" style="color: #666666; text-decoration: underline;">Unsubscribe</a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>`;
  };

  const handleCopyHTML = () => {
    const fullHTML = generateFullHTMLEmail();
    navigator.clipboard.writeText(fullHTML);
    toast.success('Full HTML email copied to clipboard!');
  };

  const handleCopyFormattedBody = () => {
    const formattedBody = formatContentAsHTML(content);
    navigator.clipboard.writeText(formattedBody);
    toast.success('Formatted email body copied to clipboard!');
  };

  const insertAtCursor = (text: string) => {
    if (!textareaRef) return;
    
    const start = textareaRef.selectionStart;
    const end = textareaRef.selectionEnd;
    const newContent = content.substring(0, start) + text + content.substring(end);
    
    onContentChange(newContent);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      if (textareaRef) {
        textareaRef.focus();
        textareaRef.setSelectionRange(start + text.length, start + text.length);
      }
    }, 0);
  };

  const insertMergeTag = (tag: string) => {
    insertAtCursor(tag);
  };

  const insertFormatting = (format: string) => {
    if (!textareaRef) return;
    
    const start = textareaRef.selectionStart;
    const end = textareaRef.selectionEnd;
    const selectedText = content.substring(start, end);
    
    if (!selectedText) {
      toast.error('Please select text first');
      return;
    }
    
    let wrappedText = '';
    switch (format) {
      case 'bold':
        wrappedText = `**${selectedText}**`;
        break;
      case 'italic':
        wrappedText = `*${selectedText}*`;
        break;
      case 'heading':
        wrappedText = `\n## ${selectedText}\n`;
        break;
      case 'link':
        wrappedText = `[${selectedText}](https://example.com)`;
        break;
      default:
        wrappedText = selectedText;
    }
    
    const newContent = content.substring(0, start) + wrappedText + content.substring(end);
    onContentChange(newContent);
  };

  // Process markdown-style formatting for preview
  const processMarkdownForPreview = (text: string): string => {
    let processed = text;
    
    // Bold
    processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Headings
    processed = processed.replace(/^## (.+)$/gm, '<h2 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px 0; color: #1a1a1a;">$1</h2>');
    // Links
    processed = processed.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color: #2563eb; text-decoration: underline;">$1</a>');
    
    return processed;
  };

  const getPreviewHTML = (): string => {
    let processed = processMarkdownForPreview(content);
    processed = formatContentAsHTML(processed);
    return processed;
  };

  return (
    <div className="space-y-4">
      {/* Subject Line */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <Label>Email Subject*</Label>
          <div className="text-xs text-muted-foreground">
            {subject.length} characters
          </div>
        </div>
        <input
          type="text"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="e.g., Welcome to CDM Suite, {{firstName}}!"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
        />
      </div>

      {/* Email Content with Tabs */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <Label>Email Content*</Label>
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyFormattedBody}
              className="text-xs"
            >
              <Copy className="h-3 w-3 sm:mr-1" />
              <span className="hidden sm:inline">Copy Body</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyHTML}
              className="text-xs"
            >
              <Copy className="h-3 w-3 sm:mr-1" />
              <span className="hidden sm:inline">Copy Full HTML</span>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'editor' | 'preview')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor">
              <Code className="h-4 w-4 mr-2" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-3 mt-3">
            {/* Formatting Toolbar */}
            <div className="flex flex-wrap gap-1 sm:gap-2 p-2 sm:p-3 border rounded-md bg-muted/30">
              <div className="flex gap-1 flex-wrap">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('bold')}
                  title="Bold - **text**"
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <Bold className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('italic')}
                  title="Italic - *text*"
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <Italic className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('heading')}
                  title="Heading - ## text"
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <Heading2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('link')}
                  title="Link - [text](url)"
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>

            {/* Editor Textarea */}
            <Textarea
              ref={setTextareaRef}
              placeholder={`Hi {{firstName}},

Welcome to CDM Suite! We're excited to help you grow your business.

## Here's what you can expect:

**Professional service** - We deliver results
**Expert support** - Always here to help
**Proven strategies** - That actually work

Ready to get started? [Click here](https://cdmsuite.com) to schedule a call.

Best regards,
{{assignedTo}}
CDM Suite Team`}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />

            {/* Merge Tags */}
            <div className="space-y-2">
              <div className="text-xs sm:text-sm font-medium">Quick Insert Merge Tags:</div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {MERGE_TAGS.map((tag) => (
                  <Badge
                    key={tag.value}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs touch-manipulation"
                    onClick={() => insertMergeTag(tag.value)}
                  >
                    {tag.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Formatting Help */}
            <Card>
              <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6">
                <div className="text-xs space-y-1">
                  <p className="font-semibold mb-2">Formatting Guide:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 sm:gap-y-1 text-muted-foreground">
                    <div className="text-xs"><code className="text-[10px] sm:text-xs">**bold text**</code> → <strong>bold text</strong></div>
                    <div className="text-xs"><code className="text-[10px] sm:text-xs">*italic text*</code> → <em>italic text</em></div>
                    <div className="text-xs"><code className="text-[10px] sm:text-xs">## Heading</code> → <strong>Heading</strong></div>
                    <div className="text-xs"><code className="text-[10px] sm:text-xs">[link](url)</code> → <span className="text-blue-600 underline">link</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="mt-3">
            <Card>
              <CardContent className="pt-4 sm:pt-6 px-2 sm:px-6">
                {/* Email Preview */}
                <div className="border rounded-lg overflow-hidden">
                  {/* Email Header */}
                  <div className="bg-[#1a1a1a] text-white text-center py-3 sm:py-4 px-4 sm:px-6">
                    <h2 className="text-lg sm:text-xl font-bold">CDM Suite</h2>
                  </div>

                  {/* Email Body */}
                  <div className="bg-white p-4 sm:p-8">
                    {/* Subject as Header */}
                    {subject && (
                      <div className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1">Subject:</p>
                        <p className="font-semibold text-base sm:text-lg break-words">{subject}</p>
                      </div>
                    )}

                    {/* Content */}
                    <div 
                      className="prose prose-sm max-w-none"
                      style={{
                        color: '#333333',
                        fontSize: '14px',
                        lineHeight: '1.6',
                      }}
                      dangerouslySetInnerHTML={{ __html: getPreviewHTML() }}
                    />
                  </div>

                  {/* Email Footer */}
                  <div className="bg-gray-50 text-center py-3 sm:py-4 px-4 sm:px-6 text-xs text-gray-600">
                    <p>© {new Date().getFullYear()} CDM Suite. All rights reserved.</p>
                    <p className="mt-2">
                      <a href="#" className="text-gray-600 underline">Unsubscribe</a>
                    </p>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                  <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-100">
                    💡 This preview shows how your email will appear to recipients. 
                    Merge tags like <strong>{'{{firstName}}'}</strong> will be replaced with actual data when sent.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
