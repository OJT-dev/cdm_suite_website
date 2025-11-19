
'use client';

import { useState, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Copy, 
  Wand2,
  Loader2,
  Eye,
  Edit3,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Type,
} from 'lucide-react';
import { toast } from 'sonner';
import { MERGE_TAGS } from '@/lib/sequence-types';

interface WYSIWYGEmailEditorProps {
  subject: string;
  content: string;
  onSubjectChange: (subject: string) => void;
  onContentChange: (content: string) => void;
  stepIndex?: number;
  leadContext?: {
    name?: string;
    company?: string;
    interest?: string;
    email?: string;
  };
  proposalContext?: {
    title?: string;
    clientName?: string;
    clientCompany?: string;
    total?: number;
    items?: any[];
  };
}

export function WYSIWYGEmailEditor({ 
  subject, 
  content, 
  onSubjectChange, 
  onContentChange,
  stepIndex,
  leadContext,
  proposalContext,
}: WYSIWYGEmailEditorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content || '';
    }
  }, [content]);

  // Handle content changes from the editor
  const handleEditorInput = () => {
    if (editorRef.current) {
      onContentChange(editorRef.current.innerHTML);
    }
  };

  // Format commands for the rich text editor
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const changeFontSize = (size: string) => {
    execCommand('fontSize', size);
  };

  // Generate full HTML email template
  const generateFullHTMLEmail = (): string => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 30px 0; text-align: center; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">CDM Suite</h1>
                <p style="color: #e0e0e0; margin: 8px 0 0 0; font-size: 14px;">Your Digital Marketing Partner</p>
            </td>
        </tr>
    </table>
    
    <table role="presentation" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <tr>
            <td style="padding: 40px 30px;">
                <div style="color: #333333; font-size: 16px; line-height: 1.6;">
                    ${content}
                </div>
            </td>
        </tr>
    </table>
    
    <table role="presentation" style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <tr>
            <td style="text-align: center; color: #666666; font-size: 12px;">
                <p style="margin: 0;"><strong>CDM Suite</strong> | Full Service Digital Marketing Agency</p>
                <p style="margin: 8px 0;">Data-driven strategies that deliver measurable results</p>
                <p style="margin: 10px 0 0 0;">
                    <a href="tel:8622727623" style="color: #2563eb; text-decoration: none; margin: 0 10px;">(862) 272-7623</a> | 
                    <a href="mailto:info@cdmsuite.com" style="color: #2563eb; text-decoration: none; margin: 0 10px;">info@cdmsuite.com</a>
                </p>
                <p style="margin: 15px 0 0 0;">
                    <a href="{{unsubscribeLink}}" style="color: #666666; text-decoration: underline; font-size: 11px;">Unsubscribe</a>
                </p>
                <p style="margin: 10px 0 0 0; font-size: 11px;">© ${new Date().getFullYear()} CDM Suite. All rights reserved.</p>
            </td>
        </tr>
    </table>
</body>
</html>`;
  };

  const handleCopyHTML = async () => {
    const fullHTML = generateFullHTMLEmail();
    let copySuccessful = false;
    
    // Method 1: Try modern Clipboard API
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(fullHTML);
        copySuccessful = true;
        toast.success('✓ Full HTML email copied! Ready to send to your client.');
        return;
      }
    } catch (clipboardError) {
      console.warn('Clipboard API failed:', clipboardError);
    }
    
    // Method 2: Try textarea with execCommand (works on most mobile devices)
    if (!copySuccessful) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = fullHTML;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        textarea.style.fontSize = '12pt'; // Prevent zooming on iOS
        
        document.body.appendChild(textarea);
        
        // iOS specific handling
        if (navigator.userAgent.match(/ipad|iphone/i)) {
          const range = document.createRange();
          range.selectNodeContents(textarea);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
          textarea.setSelectionRange(0, fullHTML.length);
        } else {
          textarea.select();
        }
        
        copySuccessful = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (copySuccessful) {
          toast.success('✓ Full HTML email copied! Ready to send to your client.');
          return;
        }
      } catch (execError) {
        console.warn('execCommand failed:', execError);
      }
    }
    
    // Method 3: Download as file (last resort)
    if (!copySuccessful) {
      try {
        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `email-template-${Date.now()}.html`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
        
        toast.success('📥 Email HTML downloaded as file (clipboard not available)');
      } catch (downloadError) {
        console.error('All copy methods failed:', downloadError);
        toast.error('❌ Could not copy or download. Please try again.');
      }
    }
  };

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-compelling-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          leadContext,
          proposalContext,
          stepIndex,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate email');
      }

      const data = await response.json();
      onSubjectChange(data.subject);
      onContentChange(data.content);
      toast.success('AI generated a compelling email! Review and edit as needed.');
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate email. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const insertMergeTag = (tag: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      // Insert at cursor position
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const tagNode = document.createTextNode(' ' + tag + ' ');
        range.insertNode(tagNode);
        range.setStartAfter(tagNode);
        range.setEndAfter(tagNode);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // Fallback: append at the end
        editorRef.current.innerHTML += ' ' + tag + ' ';
      }
      handleEditorInput();
      toast.success('Merge tag inserted!');
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Generation Button */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Wand2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-sm">AI-Powered Email Generator</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Let AI create a compelling, sales-focused email that promotes your products effectively
              </p>
            </div>
            <Button
              type="button"
              onClick={handleGenerateWithAI}
              disabled={isGenerating}
              className="shrink-0"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Email
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subject Line */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <Label>Email Subject*</Label>
          <div className="text-xs text-muted-foreground">
            {subject.length} characters (aim for 40-60 for best open rates)
          </div>
        </div>
        <input
          type="text"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="e.g., Your Exclusive Proposal from CDM Suite - Limited Time Offer!"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
        />
      </div>

      {/* Email Content Editor */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <Label>Email Content*</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="text-xs"
            >
              {previewMode ? (
                <>
                  <Edit3 className="h-3 w-3 sm:mr-1" />
                  <span className="hidden sm:inline">Edit</span>
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 sm:mr-1" />
                  <span className="hidden sm:inline">Preview</span>
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyHTML}
              className="text-xs"
            >
              <Copy className="h-3 w-3 sm:mr-1" />
              <span className="hidden sm:inline">Copy Full Email</span>
            </Button>
          </div>
        </div>

        {!previewMode ? (
          <>
            <div className="border rounded-md overflow-hidden bg-white dark:bg-gray-900">
              {/* Formatting Toolbar */}
              <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50 dark:bg-gray-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('bold')}
                  className="h-8 w-8 p-0"
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('italic')}
                  className="h-8 w-8 p-0"
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('underline')}
                  className="h-8 w-8 p-0"
                  title="Underline"
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('insertUnorderedList')}
                  className="h-8 w-8 p-0"
                  title="Bullet List"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('insertOrderedList')}
                  className="h-8 w-8 p-0"
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={insertLink}
                  className="h-8 w-8 p-0"
                  title="Insert Link"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <select
                  onChange={(e) => changeFontSize(e.target.value)}
                  className="h-8 px-2 text-xs border rounded bg-background"
                  title="Font Size"
                >
                  <option value="">Size</option>
                  <option value="1">Small</option>
                  <option value="3">Normal</option>
                  <option value="5">Large</option>
                  <option value="7">X-Large</option>
                </select>
                <input
                  type="color"
                  onChange={(e) => execCommand('foreColor', e.target.value)}
                  className="h-8 w-8 border rounded cursor-pointer"
                  title="Text Color"
                />
              </div>

              {/* Content Editable Area */}
              <div
                ref={editorRef}
                contentEditable
                onInput={handleEditorInput}
                className="min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none"
                style={{
                  fontSize: '15px',
                  lineHeight: '1.6',
                }}
                suppressContentEditableWarning
              />
            </div>

            {/* Merge Tags */}
            <div className="space-y-2 mt-3">
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
              <p className="text-xs text-muted-foreground">
                💡 Merge tags like <strong>{'{{firstName}}'}</strong> will be automatically replaced with real data when sent
              </p>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="pt-6 px-2 sm:px-6">
              {/* Email Preview */}
              <div className="border rounded-lg overflow-hidden">
                {/* Email Header */}
                <div 
                  className="text-white text-center py-4 sm:py-5 px-4 sm:px-6"
                  style={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
                  }}
                >
                  <h2 className="text-xl sm:text-2xl font-bold">CDM Suite</h2>
                  <p className="text-sm text-gray-200 mt-1">Your Digital Marketing Partner</p>
                </div>

                {/* Email Body */}
                <div className="bg-white p-6 sm:p-10">
                  {/* Subject as Header */}
                  {subject && (
                    <div className="mb-6 pb-4 border-b">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Subject:</p>
                      <p className="font-semibold text-base sm:text-lg break-words">{subject}</p>
                    </div>
                  )}

                  {/* Content */}
                  <div 
                    className="prose prose-sm max-w-none"
                    style={{
                      color: '#333333',
                      fontSize: '16px',
                      lineHeight: '1.6',
                    }}
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                </div>

                {/* Email Footer */}
                <div className="bg-gray-50 text-center py-4 px-4 sm:px-6 text-xs text-gray-600">
                  <p className="font-semibold">CDM Suite | Full Service Digital Marketing Agency</p>
                  <p className="mt-1">Data-driven strategies that deliver measurable results</p>
                  <p className="mt-2">
                    <a href="tel:8622727623" className="text-blue-600 mx-2">(862) 272-7623</a> | 
                    <a href="mailto:info@cdmsuite.com" className="text-blue-600 mx-2">info@cdmsuite.com</a>
                  </p>
                  <p className="mt-3 text-[11px]">
                    <a href="#" className="text-gray-600 underline">Unsubscribe</a>
                  </p>
                  <p className="mt-2 text-[11px]">© {new Date().getFullYear()} CDM Suite. All rights reserved.</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-100">
                  👁️ This is exactly how your email will look to clients. 
                  Click "Edit" to make changes.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Editor Tips */}
      <Card>
        <CardContent className="pt-4 px-4 sm:px-6">
          <div className="text-xs space-y-2">
            <p className="font-semibold mb-2">📝 Email Best Practices:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Keep subject lines under 60 characters for mobile</li>
              <li>Start with the client's biggest pain point or desire</li>
              <li>Highlight specific benefits and results they'll get</li>
              <li>Include a clear call-to-action (schedule call, review proposal, pay now)</li>
              <li>Mention "no refunds" policy clearly for transparency</li>
              <li>Use formatting (bold, colors) to emphasize key points</li>
            </ul>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
