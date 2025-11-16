
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Send,
  FileText,
  Trash2,
  Edit,
  DollarSign,
  Calendar,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Download,
  CreditCard,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Proposal } from '@/lib/proposal-types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { WYSIWYGEmailEditor } from '@/components/crm/sequences/wysiwyg-email-editor';

export default function ProposalDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const proposalId = params.id as string;

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [generatingPaymentLink, setGeneratingPaymentLink] = useState(false);
  const [sendingProposal, setSendingProposal] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState<{ subject: string; body: string } | null>(null);
  const [editableSubject, setEditableSubject] = useState('');
  const [editableBody, setEditableBody] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && proposalId) {
      fetchProposal();
    }
  }, [status, proposalId]);

  const fetchProposal = async () => {
    try {
      const res = await fetch(`/api/proposals/${proposalId}`);
      if (res.ok) {
        const data = await res.json();
        setProposal(data.proposal);
      } else {
        toast.error('Proposal not found');
        router.push('/dashboard/proposals');
      }
    } catch (error) {
      console.error('Error fetching proposal:', error);
      toast.error('Failed to load proposal');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Proposal deleted successfully');
        router.push('/dashboard/proposals');
      } else {
        toast.error('Failed to delete proposal');
      }
    } catch (error) {
      console.error('Error deleting proposal:', error);
      toast.error('An error occurred while deleting the proposal');
    } finally {
      setDeleting(false);
    }
  };

  const handleGeneratePaymentLink = async () => {
    setGeneratingPaymentLink(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/payment-link`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        
        // Update proposal with payment link
        if (proposal) {
          setProposal({
            ...proposal,
            stripePaymentUrl: data.paymentUrl,
            stripePaymentLinkId: data.paymentLinkId,
          });
        }
        
        toast.success('Payment link created successfully!');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to create payment link');
      }
    } catch (error) {
      console.error('Error creating payment link:', error);
      toast.error('An error occurred while creating payment link');
    } finally {
      setGeneratingPaymentLink(false);
    }
  };

  const handleCopyPaymentLink = async () => {
    if (!proposal?.stripePaymentUrl) return;
    
    const urlToCopy = proposal.stripePaymentUrl;
    let copySuccessful = false;
    
    // Method 1: Try modern Clipboard API
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(urlToCopy);
        copySuccessful = true;
        toast.success('✓ Payment link copied to clipboard!');
        return;
      }
    } catch (clipboardError) {
      console.warn('Clipboard API failed:', clipboardError);
    }
    
    // Method 2: Try textarea with execCommand (works on most mobile devices)
    if (!copySuccessful) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = urlToCopy;
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
          textarea.setSelectionRange(0, urlToCopy.length);
        } else {
          textarea.select();
        }
        
        copySuccessful = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (copySuccessful) {
          toast.success('✓ Payment link copied to clipboard!');
          return;
        }
      } catch (execError) {
        console.warn('execCommand failed:', execError);
      }
    }
    
    // If all methods failed
    if (!copySuccessful) {
      toast.error('❌ Could not copy automatically. Please copy the link manually from above.');
    }
  };

  const handleDownloadPDF = () => {
    window.open(`/api/proposals/${proposalId}/pdf`, '_blank');
    toast.success('PDF download started');
  };

  const handleSendProposal = async () => {
    setSendingProposal(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/send`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setEmailTemplate(data.emailTemplate);
        setEditableSubject(data.emailTemplate.subject);
        setEditableBody(data.emailTemplate.body);
        setShowEmailPreview(true);
      } else {
        toast.error('Failed to prepare proposal email');
      }
    } catch (error) {
      console.error('Error preparing proposal:', error);
      toast.error('An error occurred while preparing proposal');
    } finally {
      setSendingProposal(false);
    }
  };

  const handleConfirmSend = async () => {
    try {
      // Here you would actually send the email with the edited subject and body
      // For now, we'll just update the proposal status and show success
      await fetch(`/api/proposals/${proposalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'sent', sentAt: new Date() }),
      });
      
      toast.success('Proposal marked as sent! Email content is ready to copy.');
      setShowEmailPreview(false);
      fetchProposal();
    } catch (error) {
      console.error('Error confirming send:', error);
      toast.error('An error occurred');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      viewed: 'bg-purple-100 text-purple-700',
      accepted: 'bg-green-100 text-green-700',
      declined: 'bg-red-100 text-red-700',
      expired: 'bg-orange-100 text-orange-700',
    };

    const icons = {
      draft: FileText,
      sent: Send,
      viewed: Eye,
      accepted: CheckCircle2,
      declined: XCircle,
      expired: Clock,
    };

    const Icon = icons[status as keyof typeof icons] || FileText;

    return (
      <Badge className={cn('flex items-center gap-1', styles[status as keyof typeof styles] || '')}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <FileText className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Proposal not found</h2>
        <p className="text-gray-600 mb-4">The proposal you're looking for doesn't exist.</p>
        <Link href="/dashboard/proposals">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Proposals
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl pb-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/dashboard/proposals">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 truncate">{proposal.title}</h1>
              {getStatusBadge(proposal.status)}
            </div>
            <p className="text-sm sm:text-base text-gray-600 mt-1">{proposal.proposalNumber}</p>
          </div>
        </div>

        {/* Action Buttons - Mobile Optimized */}
        <div className="flex flex-wrap gap-2">
          {/* Edit */}
          {proposal.status === 'draft' && (
            <Link href={`/dashboard/proposals/${proposal.id}/edit`} className="flex-1 sm:flex-none">
              <Button variant="outline" size="sm" className="w-full">
                <Edit className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            </Link>
          )}

          {/* Download PDF */}
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="flex-1 sm:flex-none">
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="sm:hidden">PDF</span>
            <span className="hidden sm:inline">Download PDF</span>
          </Button>

          {/* Send to Client */}
          {proposal.status === 'draft' && (
            <Button onClick={handleSendProposal} disabled={sendingProposal} size="sm" className="flex-1 sm:flex-none">
              {sendingProposal ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white sm:mr-2" />
                  <span className="hidden sm:inline">Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 sm:mr-2" />
                  <span className="sm:hidden">Send</span>
                  <span className="hidden sm:inline">Send to Client</span>
                </>
              )}
            </Button>
          )}

          {/* Delete - Only for master user */}
          {session?.user?.email === 'fray@cdmsuite.com' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 flex-1 sm:flex-none">
                  <Trash2 className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Proposal</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this proposal? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                    {deleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Payment Link Card - Prominent Display */}
      <Card className="border-2 border-blue-500 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Payment Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {proposal.stripePaymentUrl ? (
            <>
              <p className="text-sm text-gray-700">
                Share this payment link with your client for secure online payment:
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 p-3 bg-white border border-gray-200 rounded-md">
                  <p className="text-xs sm:text-sm text-gray-600 truncate font-mono">
                    {proposal.stripePaymentUrl}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => window.open(proposal.stripePaymentUrl, '_blank')}
                    className="flex-1 sm:flex-none"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Link
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCopyPaymentLink} className="flex-1 sm:flex-none">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-700">
                Generate a secure Stripe payment link to accept online payments for this proposal.
              </p>
              <Button
                onClick={handleGeneratePaymentLink}
                disabled={generatingPaymentLink}
                size="sm"
                className="w-full sm:w-auto"
              >
                {generatingPaymentLink ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating Payment Link...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Generate Payment Link
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Email Preview & Edit Dialog with Professional Editor */}
      {emailTemplate && (
        <Dialog open={showEmailPreview} onOpenChange={setShowEmailPreview}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Review & Edit Proposal Email</DialogTitle>
              <DialogDescription className="text-sm">
                Review and edit the email before copying or sending to {proposal.clientEmail}. 
                Use the formatting toolbar and preview tab to create a professional HTML email.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <WYSIWYGEmailEditor
                subject={editableSubject}
                content={editableBody}
                onSubjectChange={setEditableSubject}
                onContentChange={setEditableBody}
                proposalContext={proposal ? {
                  title: proposal.title,
                  clientName: proposal.clientName,
                  clientCompany: proposal.clientCompany,
                  total: proposal.total,
                  items: proposal.items,
                } : undefined}
              />
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowEmailPreview(false)} 
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmSend} className="w-full sm:w-auto">
                <Send className="h-4 w-4 mr-2" />
                Mark as Sent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Client Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Client Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="font-medium truncate">{proposal.clientName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                <a href={`mailto:${proposal.clientEmail}`} className="hover:text-blue-600 truncate">
                  {proposal.clientEmail}
                </a>
              </div>
              {proposal.clientPhone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                  <a href={`tel:${proposal.clientPhone}`} className="hover:text-blue-600">
                    {proposal.clientPhone}
                  </a>
                </div>
              )}
              {proposal.clientCompany && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="truncate">{proposal.clientCompany}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-gray-600">
                  Created: {new Date(proposal.createdAt).toLocaleDateString()}
                </span>
              </div>
              {proposal.dueDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-gray-600">
                    Due: {new Date(proposal.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {proposal.validUntil && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-gray-600">
                    Valid Until: {new Date(proposal.validUntil).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          {proposal.description && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                <p className="text-sm text-gray-600 break-words">{proposal.description}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Proposal Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {proposal.items.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base break-words">{item.name}</h3>
                    {item.description && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 whitespace-pre-line break-words">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="text-left sm:text-right shrink-0 sm:ml-4">
                    <p className="font-semibold text-gray-900 text-base sm:text-lg">${item.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} × ${item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4 sm:my-6" />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">${proposal.subtotal.toFixed(2)}</span>
            </div>
            {proposal.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount:</span>
                <span className="font-medium">-${proposal.discount.toFixed(2)}</span>
              </div>
            )}
            {proposal.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">${proposal.tax.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-base sm:text-lg font-bold">
              <span>Total:</span>
              <span className="text-blue-600">${proposal.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms & Notes */}
      {(proposal.terms || proposal.notes) && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {proposal.terms && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-line">{proposal.terms}</p>
                </div>
              </div>
            )}
            {proposal.notes && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Internal Notes</h3>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-line">{proposal.notes}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
