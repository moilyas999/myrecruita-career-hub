import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X, FileText, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
}

interface ImportFile {
  id: string;
  file_name: string;
  status: string;
  error_message: string | null;
  processed_at: string | null;
}

interface ImportSessionProgressProps {
  sessionId: string;
  onClose?: () => void;
  onComplete?: () => void;
}

export default function ImportSessionProgress({ sessionId, onClose, onComplete }: ImportSessionProgressProps) {
  const [session, setSession] = useState<ImportSession | null>(null);
  const [files, setFiles] = useState<ImportFile[]>([]);
  const [loading, setLoading] = useState(true);

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
            setSession(payload.new as ImportSession);
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
            setFiles(prev => {
              const updated = prev.map(f => 
                f.id === (payload.new as ImportFile).id ? (payload.new as ImportFile) : f
              );
              if (!prev.find(f => f.id === (payload.new as ImportFile).id)) {
                updated.push(payload.new as ImportFile);
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
  }, [sessionId, onComplete]);

  const fetchSessionData = async () => {
    setLoading(true);
    
    const [sessionResult, filesResult] = await Promise.all([
      supabase
        .from('bulk_import_sessions')
        .select('*')
        .eq('id', sessionId)
        .single(),
      supabase
        .from('bulk_import_files')
        .select('id, file_name, status, error_message, processed_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
    ]);

    if (sessionResult.data) {
      setSession(sessionResult.data);
    }
    if (filesResult.data) {
      setFiles(filesResult.data);
    }
    
    setLoading(false);
  };

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

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Import Progress
          </CardTitle>
          <div className="flex items-center gap-2">
            {getStatusBadge(session.status)}
            <Button variant="ghost" size="sm" onClick={fetchSessionData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            {onClose && (session.status === 'completed' || session.status === 'failed') && (
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {session.imported_count + session.failed_count} of {session.total_files} files processed
            </span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
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

        {/* Error message */}
        {session.error_message && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{session.error_message}</span>
          </div>
        )}

        {/* Time info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Started: {session.started_at ? formatDistanceToNow(new Date(session.started_at), { addSuffix: true }) : 'Not started'}</div>
          {session.completed_at && (
            <div>Completed: {formatDistanceToNow(new Date(session.completed_at), { addSuffix: true })}</div>
          )}
        </div>

        {/* File list */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          <div className="text-sm font-medium">Files</div>
          {files.map(file => (
            <div 
              key={file.id} 
              className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                {getFileStatusIcon(file.status)}
                <span className="truncate">{file.file_name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {file.error_message && (
                  <span className="text-xs text-destructive truncate max-w-32" title={file.error_message}>
                    {file.error_message}
                  </span>
                )}
                <Badge variant="outline" className="text-xs capitalize">
                  {file.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
