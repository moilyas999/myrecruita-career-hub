import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Mail, 
  Loader2, 
  Check, 
  X, 
  Edit, 
  ChevronDown, 
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Webhook,
  User,
  Filter,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { queryKeys } from '@/lib/queryKeys';
import { cn } from '@/lib/utils';
import EmailIngestionStatus from './EmailIngestionStatus';

interface JobStatusUpdate {
  id: string;
  email_from: string | null;
  email_subject: string | null;
  email_body: string;
  job_id: string | null;
  job_reference: string | null;
  job_title: string | null;
  suggested_status: string;
  confidence_score: number;
  ai_reasoning: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  source?: string;
  email_message_id?: string | null;
}

interface FilteredEmail {
  id: string;
  message_id: string;
  from_email: string;
  from_name: string | null;
  subject: string | null;
  email_type: string | null;
  filter_reason: string | null;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: 'expired', label: 'Expired', description: 'No longer hiring' },
  { value: 'filled', label: 'Filled', description: 'Position filled' },
  { value: 'paused', label: 'Paused', description: 'Temporarily on hold' },
];

const STATUS_BADGE_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
};

const CONFIDENCE_COLORS = {
  high: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
  low: 'text-red-600 bg-red-100 dark:bg-red-900/30',
};

function getConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}

async function fetchStatusUpdates() {
  const { data, error } = await supabase
    .from('job_status_updates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as JobStatusUpdate[];
}

async function fetchFilteredEmails() {
  const { data, error } = await supabase
    .from('email_ingestion_log')
    .select('id, message_id, from_email, from_name, subject, email_type, filter_reason, created_at')
    .eq('status', 'filtered')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data as FilteredEmail[];
}

export default function JobStatusTracker() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [emailForm, setEmailForm] = useState({ from: '', subject: '', body: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; update: JobStatusUpdate | null; newStatus: string }>({
    open: false,
    update: null,
    newStatus: ''
  });

  // Real-time subscription for updates
  useRealtimeSubscription({
    table: 'job_status_updates',
    queryKeys: [queryKeys.jobStatusUpdates],
    showToasts: true,
    toastMessages: {
      insert: () => 'New job status update added to queue',
      update: () => 'Job status update modified',
    },
  });

  const { data: updates = [], isLoading, refetch } = useQuery({
    queryKey: queryKeys.jobStatusUpdates,
    queryFn: fetchStatusUpdates,
  });

  const { data: filteredEmails = [], isLoading: isLoadingFiltered, refetch: refetchFiltered } = useQuery({
    queryKey: [...queryKeys.emailIngestionLog, 'filtered'],
    queryFn: fetchFilteredEmails,
  });

  const processEmailMutation = useMutation({
    mutationFn: async (emailData: typeof emailForm) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('process-job-email', {
        body: { ...emailData, source: 'manual' }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobStatusUpdates });
      
      const confidence = data.analysis?.confidence || 0;
      const matchedJob = data.analysis?.matched_job;
      
      if (matchedJob) {
        toast.success(
          `Matched to: ${matchedJob.title} (${matchedJob.reference_id})`,
          { description: `Confidence: ${confidence}% - Added to review queue` }
        );
      } else {
        toast.info(
          'Email processed - No job match found',
          { description: 'Added to review queue for manual matching' }
        );
      }
      
      setEmailForm({ from: '', subject: '', body: '' });
      setShowManualEntry(false);
    },
    onError: (error: Error) => {
      console.error('Process email error:', error);
      toast.error('Failed to process email', { description: error.message });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ updateId, jobId, newStatus }: { updateId: string; jobId: string | null; newStatus: string }) => {
      // Update the status update record
      const { error: updateError } = await supabase
        .from('job_status_updates')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', updateId);

      if (updateError) throw updateError;

      // Update the job if we have a job_id
      if (jobId) {
        const { error: jobError } = await supabase
          .from('jobs')
          .update({ status: newStatus })
          .eq('id', jobId);

        if (jobError) throw jobError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobStatusUpdates });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
      toast.success('Job status updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to approve update', { description: error.message });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ updateId, notes }: { updateId: string; notes?: string }) => {
      const { error } = await supabase
        .from('job_status_updates')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          review_notes: notes || 'Rejected by admin',
        })
        .eq('id', updateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobStatusUpdates });
      toast.success('Update rejected');
    },
    onError: (error: Error) => {
      toast.error('Failed to reject update', { description: error.message });
    },
  });

  const handleProcessEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.body.trim()) {
      toast.error('Please enter email content');
      return;
    }
    setIsProcessing(true);
    try {
      await processEmailMutation.mutateAsync(emailForm);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = (update: JobStatusUpdate, overrideStatus?: string) => {
    const status = overrideStatus || update.suggested_status;
    approveMutation.mutate({
      updateId: update.id,
      jobId: update.job_id,
      newStatus: status
    });
    setEditDialog({ open: false, update: null, newStatus: '' });
  };

  const handleReject = (update: JobStatusUpdate) => {
    if (!confirm('Are you sure you want to reject this update?')) return;
    rejectMutation.mutate({ updateId: update.id });
  };

  const handleEditAndApprove = (update: JobStatusUpdate) => {
    setEditDialog({ open: true, update, newStatus: update.suggested_status });
  };

  const filteredUpdates = updates.filter(u => {
    if (activeTab === 'all') return true;
    return u.status === activeTab;
  });

  const pendingCount = updates.filter(u => u.status === 'pending').length;
  const webhookCount = updates.filter(u => u.source === 'webhook').length;

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Job Status Updates</h2>
          <p className="text-muted-foreground">Automated email processing with AI-powered job matching</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { refetch(); refetchFiltered(); }}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Ingestion Status Panel */}
        <div className="space-y-4">
          <EmailIngestionStatus 
            ingestEmail="jobs@myrecruita.com"
            showManualFallback={true}
            onManualEntry={() => setShowManualEntry(true)}
          />

          {/* Manual Entry Dialog */}
          <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Manual Email Processing
                </DialogTitle>
                <DialogDescription>
                  Paste email content to process manually (fallback if webhook fails)
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleProcessEmail} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-from">From (optional)</Label>
                    <Input
                      id="email-from"
                      placeholder="client@company.com"
                      value={emailForm.from}
                      onChange={(e) => setEmailForm({ ...emailForm, from: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-subject">Subject (optional)</Label>
                    <Input
                      id="email-subject"
                      placeholder="RE: Finance Manager Position"
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-body">Email Content *</Label>
                  <Textarea
                    id="email-body"
                    placeholder="Paste the email body here..."
                    value={emailForm.body}
                    onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
                    rows={8}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowManualEntry(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Process Email
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Processing Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Webhook className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-lg font-bold">{webhookCount}</p>
                    <p className="text-xs text-muted-foreground">Via Webhook</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-lg font-bold">{updates.length - webhookCount}</p>
                    <p className="text-xs text-muted-foreground">Manual</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Review Queue Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Review Queue</span>
              {pendingCount > 0 && (
                <Badge variant="destructive">{pendingCount} pending</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Review AI-detected job status changes before applying
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 mb-4">
                <TabsTrigger value="pending" className="relative">
                  Pending
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                      {pendingCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="filtered" className="relative">
                  <Filter className="w-3 h-3 mr-1" />
                  Filtered
                  {filteredEmails.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-muted text-muted-foreground text-xs rounded-full flex items-center justify-center">
                      {filteredEmails.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>

              {/* Filtered emails tab content */}
              {activeTab === 'filtered' ? (
                <div className="mt-0">
                  {isLoadingFiltered ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
                      Loading filtered emails...
                    </div>
                  ) : filteredEmails.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No filtered emails</p>
                      <p className="text-xs mt-1">Irrelevant emails will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {filteredEmails.map((email) => (
                        <div key={email.id} className="border rounded-lg p-4 space-y-2 bg-muted/30">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted">
                                  <Filter className="w-2.5 h-2.5 mr-1" />
                                  {email.email_type?.toUpperCase() || 'FILTERED'}
                                </Badge>
                                {email.subject ? (
                                  <span className="font-medium text-sm truncate">{email.subject}</span>
                                ) : (
                                  <span className="text-muted-foreground text-sm italic">(no subject)</span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                From: {email.from_name ? `${email.from_name} <${email.from_email}>` : email.from_email}
                              </p>
                              {email.filter_reason && (
                                <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2 mt-2">
                                  <span className="font-medium">Reason:</span> {email.filter_reason}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className="text-[10px] text-muted-foreground">
                                {formatTimeAgo(email.created_at)}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7"
                                onClick={async () => {
                                  try {
                                    // Fetch the full email content from ingestion log
                                    const { data: emailData, error: fetchError } = await supabase
                                      .from('email_ingestion_log')
                                      .select('from_email, subject, message_id')
                                      .eq('id', email.id)
                                      .single();
                                    
                                    if (fetchError) throw fetchError;
                                    
                                    // Reprocess via the existing edge function
                                    const response = await supabase.functions.invoke('process-job-email', {
                                      body: {
                                        from: emailData.from_email,
                                        subject: emailData.subject || '',
                                        body: `[Reprocessed from filtered email]\nSubject: ${emailData.subject || 'N/A'}\nFilter reason: ${email.filter_reason || 'Unknown'}`,
                                        source: 'manual',
                                      }
                                    });
                                    
                                    if (response.error) throw response.error;
                                    
                                    toast.success('Email reprocessed', {
                                      description: 'Check the review queue for results'
                                    });
                                    
                                    // Refresh the data
                                    refetch();
                                    refetchFiltered();
                                  } catch (error) {
                                    console.error('Reprocess error:', error);
                                    toast.error('Failed to reprocess email', {
                                      description: error instanceof Error ? error.message : 'Unknown error'
                                    });
                                  }
                                }}
                              >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Reprocess
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
              <TabsContent value={activeTab} className="mt-0">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
                    Loading updates...
                  </div>
                ) : filteredUpdates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No {activeTab === 'all' ? '' : activeTab} updates</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {filteredUpdates.map((update) => {
                      const confidenceLevel = getConfidenceLevel(update.confidence_score);
                      const isWebhook = update.source === 'webhook';
                      
                      return (
                        <Collapsible key={update.id}>
                          <div className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {/* Source badge */}
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "text-[10px] px-1.5 py-0",
                                      isWebhook 
                                        ? "bg-primary/10 text-primary border-primary/30" 
                                        : "bg-muted text-muted-foreground"
                                    )}
                                  >
                                    {isWebhook ? (
                                      <><Webhook className="w-2.5 h-2.5 mr-1" />WEBHOOK</>
                                    ) : (
                                      <><User className="w-2.5 h-2.5 mr-1" />MANUAL</>
                                    )}
                                  </Badge>
                                  {update.job_title ? (
                                    <span className="font-medium truncate">{update.job_title}</span>
                                  ) : (
                                    <span className="text-muted-foreground italic">No job matched</span>
                                  )}
                                  {update.job_reference && (
                                    <Badge variant="outline" className="text-xs">
                                      {update.job_reference}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Badge 
                                    variant="secondary" 
                                    className={cn("text-xs", CONFIDENCE_COLORS[confidenceLevel])}
                                  >
                                    {update.confidence_score}% confidence
                                  </Badge>
                                  <span className="text-muted-foreground">→</span>
                                  <Badge variant="outline" className="capitalize">
                                    {update.suggested_status}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {update.status === 'pending' ? (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                      onClick={() => handleApprove(update)}
                                      disabled={approveMutation.isPending || !update.job_id}
                                      title={!update.job_id ? 'No job matched' : 'Approve'}
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleEditAndApprove(update)}
                                      title="Edit status and approve"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleReject(update)}
                                      disabled={rejectMutation.isPending}
                                      title="Reject"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <Badge variant={STATUS_BADGE_VARIANTS[update.status] || 'secondary'}>
                                    {update.status === 'approved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                    {update.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                                    {update.status}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                              <ChevronDown className="w-3 h-3" />
                              <span>Show details</span>
                              <span className="ml-2">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {formatTimeAgo(update.created_at)}
                              </span>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="space-y-2 pt-2">
                              {update.ai_reasoning && (
                                <div className="text-sm bg-muted/50 rounded p-2">
                                  <span className="font-medium">AI Reasoning: </span>
                                  {update.ai_reasoning}
                                </div>
                              )}
                              {update.email_from && (
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-medium">From:</span> {update.email_from}
                                </p>
                              )}
                              {update.email_subject && (
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-medium">Subject:</span> {update.email_subject}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground line-clamp-3">
                                <span className="font-medium">Body:</span> {update.email_body}
                              </p>
                              {update.review_notes && (
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-medium">Review notes:</span> {update.review_notes}
                                </p>
                              )}
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Edit Status Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Status Before Approving</DialogTitle>
            <DialogDescription>
              Change the suggested status before applying to the job
            </DialogDescription>
          </DialogHeader>
          
          {editDialog.update && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{editDialog.update.job_title || 'Unknown Job'}</p>
                <p className="text-sm text-muted-foreground">{editDialog.update.job_reference}</p>
              </div>
              
              <div className="space-y-2">
                <Label>New Status</Label>
                <Select 
                  value={editDialog.newStatus} 
                  onValueChange={(v) => setEditDialog({ ...editDialog, newStatus: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div>
                          <span className="font-medium">{opt.label}</span>
                          <span className="text-muted-foreground ml-2">- {opt.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditDialog({ open: false, update: null, newStatus: '' })}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleApprove(editDialog.update!, editDialog.newStatus)}
                  disabled={!editDialog.update.job_id}
                >
                  Approve with New Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
