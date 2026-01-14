import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X, FileText, RefreshCw, Clock, AlertCircle, RotateCcw, Play, AlertTriangle, Zap, CreditCard, FileX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ImportSession {
  id: string;
  status: string;
  total_files: number;
  parsed_count: number;
  imported_count: number;
  failed_count: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  last_heartbeat: string | null;
  avg_parse_time_ms: number | null;
  error_breakdown: Record<string, number> | null;
  batch_size: number | null;
}

interface ParsedData {
  name?: string;
  job_title?: string;
  sector?: string;
  cv_score?: number;
}

interface ImportFile {
  id: string;
  file_name: string;
  status: string;
  error_message: string | null;
  error_category: string | null;
  processed_at: string | null;
  parsed_data?: ParsedData | null;
  retry_count: number;
}

interface ImportSessionProgressProps {
  sessionId: string;
  onClose?: () => void;
  onComplete?: () => void;
}

// Error category display config
const ERROR_CATEGORIES: Record<string, { label: string; icon: React.ReactNode; color: string; retryable: boolean }> = {
  RATE_LIMIT: { label: 'Rate Limited', icon: <Clock className="w-3 h-3" />, color: 'text-amber-600', retryable: true },
  PAYMENT_REQUIRED: { label: 'Payment Required', icon: <CreditCard className="w-3 h-3" />, color: 'text-red-600', retryable: false },
  FILE_ERROR: { label: 'File Error', icon: <FileX className="w-3 h-3" />, color: 'text-orange-600', retryable: false },
  AI_ERROR: { label: 'AI Error', icon: <Zap className="w-3 h-3" />, color: 'text-purple-600', retryable: true },
  PARSE_ERROR: { label: 'Parse Error', icon: <AlertCircle className="w-3 h-3" />, color: 'text-red-500', retryable: false },
  DB_ERROR: { label: 'Database Error', icon: <AlertTriangle className="w-3 h-3" />, color: 'text-red-600', retryable: true },
  TIMEOUT: { label: 'Timeout', icon: <Clock className="w-3 h-3" />, color: 'text-amber-500', retryable: true },
  NETWORK_ERROR: { label: 'Network Error', icon: <AlertCircle className="w-3 h-3" />, color: 'text-orange-500', retryable: true },
  UNKNOWN: { label: 'Unknown', icon: <AlertCircle className="w-3 h-3" />, color: 'text-muted-foreground', retryable: true }
};

// Stale session threshold (60 seconds with no heartbeat)
const STALE_THRESHOLD_MS = 60000;

export default function ImportSessionProgress({ sessionId, onClose, onComplete }: ImportSessionProgressProps) {
  const [session, setSession] = useState<ImportSession | null>(null);
  const [files, setFiles] = useState<ImportFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isStale, setIsStale] = useState(false);

  // Count files by status for accurate button visibility
  const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'parsing' || f.status === 'importing' || f.status === 'parsed');
  const errorFiles = files.filter(f => f.status === 'error');
  const importedFiles = files.filter(f => f.status === 'imported');
  const hasPendingWork = pendingFiles.length > 0;
  const hasFailedFiles = errorFiles.length > 0;
  const hasRetryableErrors = errorFiles.some(f => {
    const category = f.error_category || 'UNKNOWN';
    return ERROR_CATEGORIES[category]?.retryable !== false;
  });

  // Check for stale session
  useEffect(() => {
    const checkStale = () => {
      if (session?.status === 'processing' && session.last_heartbeat) {
        const lastHeartbeat = new Date(session.last_heartbeat).getTime();
        const isSessionStale = Date.now() - lastHeartbeat > STALE_THRESHOLD_MS;
        setIsStale(isSessionStale);
      } else {
        setIsStale(false);
      }
    };

    checkStale();
    const interval = setInterval(checkStale, 10000);
    return () => clearInterval(interval);
  }, [session?.status, session?.last_heartbeat]);

  const retryAllFailed = async () => {
    if (!session || errorFiles.length === 0) return;
    
    setIsRetrying(true);
    try {
      // Reset all failed file statuses to pending
      const { error: resetError } = await supabase
        .from('bulk_import_files')
        .update({ status: 'pending', error_message: null, error_category: null })
        .eq('session_id', sessionId)
        .eq('status', 'error');

      if (resetError) throw resetError;

      // Update session status
      await supabase
        .from('bulk_import_sessions')
        .update({ status: 'processing', completed_at: null })
        .eq('id', sessionId);

      // Trigger reprocessing
      const { error: invokeError } = await supabase.functions.invoke('process-bulk-import', {
        body: { session_id: sessionId }
      });

      if (invokeError) throw invokeError;

      toast.success('Retrying failed files...');
      setIsStale(false);
    } catch (error: unknown) {
      console.error('Retry failed:', error);
      toast.error('Failed to retry: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsRetrying(false);
    }
  };

  const resumePending = async () => {
    if (!session || !hasPendingWork) return;
    
    setIsRetrying(true);
    try {
      // Update session to processing state
      await supabase
        .from('bulk_import_sessions')
        .update({ status: 'processing', completed_at: null })
        .eq('id', sessionId);

      // Trigger processing for pending files
      const { error: invokeError } = await supabase.functions.invoke('process-bulk-import', {
        body: { session_id: sessionId }
      });

      if (invokeError) throw invokeError;

      toast.success('Resuming pending files...');
      setIsStale(false);
    } catch (error: unknown) {
      console.error('Resume failed:', error);
      toast.error('Failed to resume: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsRetrying(false);
    }
  };

  const retrySingleFile = async (fileId: string) => {
    setIsRetrying(true);
    try {
      // Reset single file status to pending
      const { error: resetError } = await supabase
        .from('bulk_import_files')
        .update({ status: 'pending', error_message: null, error_category: null })
        .eq('id', fileId);

      if (resetError) throw resetError;

      // Trigger reprocessing for this specific file
      const { error: invokeError } = await supabase.functions.invoke('process-bulk-import', {
        body: { session_id: sessionId, file_ids: [fileId] }
      });

      if (invokeError) throw invokeError;

      toast.success('Retrying file...');
    } catch (error: unknown) {
      console.error('Retry failed:', error);
      toast.error('Failed to retry: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsRetrying(false);
    }
  };

  const fetchSessionData = useCallback(async () => {
    setLoading(true);
    
    const [sessionResult, filesResult] = await Promise.all([
      supabase
        .from('bulk_import_sessions')
        .select('*')
        .eq('id', sessionId)
        .single(),
      supabase
        .from('bulk_import_files')
        .select('id, file_name, status, error_message, error_category, processed_at, parsed_data, retry_count')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
    ]);

    if (sessionResult.data) {
      setSession(sessionResult.data as unknown as ImportSession);
    }
    if (filesResult.data) {
      setFiles(filesResult.data.map(f => ({
        ...f,
        parsed_data: f.parsed_data as ParsedData | null,
        retry_count: f.retry_count || 0,
        error_category: f.error_category || null
      })));
    }
    
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    // Initial fetch
    fetchSessionData();

    // Set up realtime subscription for session updates
    const sessionChannel = supabase
      .channel(`import-session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bulk_import_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          if (payload.new) {
            setSession(payload.new as unknown as ImportSession);
            if ((payload.new as ImportSession).status === 'completed' || 
                (payload.new as ImportSession).status === 'failed') {
              onComplete?.();
            }
          }
        }
      )
      .subscribe();

    // Set up realtime subscription for file updates
    const filesChannel = supabase
      .channel(`import-files-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bulk_import_files',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          if (payload.new) {
            const newFile = payload.new as ImportFile;
            setFiles(prev => {
              const updated = prev.map(f => 
                f.id === newFile.id ? { ...newFile, parsed_data: newFile.parsed_data as ParsedData | null } : f
              );
              if (!prev.find(f => f.id === newFile.id)) {
                updated.push({ ...newFile, parsed_data: newFile.parsed_data as ParsedData | null });
              }
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(filesChannel);
    };
  }, [sessionId, onComplete, fetchSessionData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'processing':
        return <Badge variant="default" className="bg-blue-500"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><Check className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getFileStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'parsing':
      case 'importing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'parsed':
        return <FileText className="w-4 h-4 text-amber-500" />;
      case 'imported':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-destructive" />;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getErrorCategoryBadge = (category: string | null) => {
    const config = ERROR_CATEGORIES[category || 'UNKNOWN'] || ERROR_CATEGORIES.UNKNOWN;
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`text-xs ${config.color} gap-1`}>
              {config.icon}
              {config.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            {config.retryable ? 'This error can be retried' : 'This error may require manual intervention'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Session not found
        </CardContent>
      </Card>
    );
  }

  const progress = session.total_files > 0 
    ? Math.round(((session.imported_count + session.failed_count) / session.total_files) * 100)
    : 0;

  // Calculate progress segments for visualization
  const importedPercent = session.total_files > 0 ? (importedFiles.length / session.total_files) * 100 : 0;
  const failedPercent = session.total_files > 0 ? (errorFiles.length / session.total_files) * 100 : 0;
  const processingPercent = session.total_files > 0 ? (pendingFiles.length / session.total_files) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Import Progress
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusBadge(session.status)}
            
            {/* Stale indicator */}
            {isStale && (
              <Badge variant="outline" className="text-amber-600 border-amber-600">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Stale
              </Badge>
            )}

            {/* Resume Pending button */}
            {(hasPendingWork && (session.status === 'completed' || session.status === 'failed' || isStale)) && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={resumePending}
                disabled={isRetrying}
                className="gap-1 bg-blue-600 hover:bg-blue-700"
              >
                {isRetrying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Resume ({pendingFiles.length})
              </Button>
            )}

            {/* Retry Failed button */}
            {hasFailedFiles && hasRetryableErrors && (session.status === 'completed' || session.status === 'failed') && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={retryAllFailed}
                disabled={isRetrying}
                className="gap-1"
              >
                {isRetrying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                Retry Failed ({errorFiles.filter(f => ERROR_CATEGORIES[f.error_category || 'UNKNOWN']?.retryable !== false).length})
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={fetchSessionData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Segmented progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {session.imported_count + session.failed_count} of {session.total_files} files processed
            </span>
            <span>{progress}%</span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-green-500 transition-all duration-300" 
              style={{ width: `${importedPercent}%` }} 
            />
            <div 
              className="absolute inset-y-0 bg-blue-500 transition-all duration-300" 
              style={{ left: `${importedPercent}%`, width: `${processingPercent}%` }} 
            />
            <div 
              className="absolute inset-y-0 bg-red-500 transition-all duration-300" 
              style={{ left: `${importedPercent + processingPercent}%`, width: `${failedPercent}%` }} 
            />
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Imported
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              Processing
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              Failed
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="p-2 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{session.total_files}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">{session.parsed_count}</div>
            <div className="text-xs text-muted-foreground">Parsed</div>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{session.imported_count}</div>
            <div className="text-xs text-muted-foreground">Imported</div>
          </div>
          <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{session.failed_count}</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>
        </div>

        {/* Error breakdown */}
        {session.error_breakdown && Object.keys(session.error_breakdown).length > 0 && (
          <div className="p-3 bg-muted/30 rounded-lg space-y-2">
            <div className="text-sm font-medium">Error Breakdown</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(session.error_breakdown).map(([category, count]) => {
                const config = ERROR_CATEGORIES[category] || ERROR_CATEGORIES.UNKNOWN;
                return (
                  <Badge key={category} variant="outline" className={`${config.color} gap-1`}>
                    {config.icon}
                    {config.label}: {count}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Session error message */}
        {session.error_message && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{session.error_message}</span>
          </div>
        )}

        {/* Performance metrics */}
        {session.avg_parse_time_ms && (
          <div className="text-xs text-muted-foreground">
            Avg. parse time: {(session.avg_parse_time_ms / 1000).toFixed(1)}s per file
          </div>
        )}

        {/* Time info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Started: {session.started_at ? formatDistanceToNow(new Date(session.started_at), { addSuffix: true }) : 'Not started'}</div>
          {session.completed_at && (
            <div>Completed: {formatDistanceToNow(new Date(session.completed_at), { addSuffix: true })}</div>
          )}
          {session.last_heartbeat && session.status === 'processing' && (
            <div>Last activity: {formatDistanceToNow(new Date(session.last_heartbeat), { addSuffix: true })}</div>
          )}
        </div>

        {/* File list */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          <div className="text-sm font-medium">Files</div>
          {files.map(file => {
            const parsedData = file.parsed_data;
            const canRetry = file.status === 'error' && ERROR_CATEGORIES[file.error_category || 'UNKNOWN']?.retryable !== false;
            
            return (
              <div 
                key={file.id} 
                className="flex flex-col p-2 bg-muted/30 rounded text-sm gap-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    {getFileStatusIcon(file.status)}
                    <span className="truncate font-medium">{file.file_name}</span>
                    {file.retry_count > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Retry #{file.retry_count}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {file.status === 'error' && file.error_category && (
                      getErrorCategoryBadge(file.error_category)
                    )}
                    {canRetry && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => retrySingleFile(file.id)}
                        disabled={isRetrying}
                        className="h-6 w-6 p-0"
                        title="Retry this file"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    )}
                    <Badge variant="outline" className="text-xs capitalize">
                      {file.status}
                    </Badge>
                  </div>
                </div>
                
                {/* Error message */}
                {file.error_message && (
                  <div className="ml-6 text-xs text-destructive truncate" title={file.error_message}>
                    {file.error_message}
                  </div>
                )}

                {/* Show parsed data preview for imported files */}
                {file.status === 'imported' && parsedData && (
                  <div className="flex items-center gap-2 ml-6 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{parsedData.name}</span>
                    {parsedData.job_title && (
                      <>
                        <span>•</span>
                        <span>{parsedData.job_title}</span>
                      </>
                    )}
                    {parsedData.sector && (
                      <>
                        <span>•</span>
                        <span>{parsedData.sector}</span>
                      </>
                    )}
                    {parsedData.cv_score !== undefined && parsedData.cv_score !== null && (
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          parsedData.cv_score >= 70 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          parsedData.cv_score >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        Score: {parsedData.cv_score}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
