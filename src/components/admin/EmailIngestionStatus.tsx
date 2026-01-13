import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Mail, 
  Check, 
  Copy, 
  ChevronDown, 
  Zap,
  AlertTriangle,
  TrendingUp,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EmailIngestionStatusProps {
  ingestEmail?: string;
  showManualFallback?: boolean;
  onManualEntry?: () => void;
}

interface IngestionStats {
  received: number;
  processed: number;
  failed: number;
  filtered: number;
}

async function fetchIngestionStats(): Promise<IngestionStats> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const { data, error } = await supabase
    .from('email_ingestion_log')
    .select('status')
    .gte('created_at', yesterday.toISOString());

  if (error) {
    console.error('Error fetching ingestion stats:', error);
    return { received: 0, processed: 0, failed: 0, filtered: 0 };
  }

  const stats = {
    received: data?.length || 0,
    processed: data?.filter(d => d.status === 'processed').length || 0,
    failed: data?.filter(d => d.status === 'failed').length || 0,
    filtered: data?.filter(d => d.status === 'filtered').length || 0,
  };

  return stats;
}

export default function EmailIngestionStatus({ 
  ingestEmail = 'jobs@myrecruita.com',
  showManualFallback = true,
  onManualEntry
}: EmailIngestionStatusProps) {
  const [copied, setCopied] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);

  const { data: stats = { received: 0, processed: 0, failed: 0, filtered: 0 } } = useQuery({
    queryKey: ['email-ingestion-stats'],
    queryFn: fetchIngestionStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(ingestEmail);
      setCopied(true);
      toast.success('Email address copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const successRate = stats.received > 0 
    ? Math.round((stats.processed / stats.received) * 100) 
    : 100;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Automated Email Ingestion</CardTitle>
              <CardDescription>AI-powered job status tracking</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/30">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email Address */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Forward job status emails to:
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="font-mono text-sm truncate">{ingestEmail}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyEmail}
              className={cn(
                "shrink-0 transition-colors",
                copied && "bg-green-500/10 border-green-500/30"
              )}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold">{stats.received}</p>
            <p className="text-xs text-muted-foreground">Emails (24h)</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.processed}</p>
            <p className="text-xs text-muted-foreground">Processed</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <p className="text-2xl font-bold text-muted-foreground">{stats.filtered}</p>
            </div>
            <p className="text-xs text-muted-foreground">Filtered</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <p className="text-2xl font-bold">{successRate}%</p>
            </div>
            <p className="text-xs text-muted-foreground">Success</p>
          </div>
        </div>

        {/* Failed warning */}
        {stats.failed > 0 && (
          <div className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <p className="text-sm text-yellow-700">
              {stats.failed} email{stats.failed !== 1 ? 's' : ''} failed to process
            </p>
          </div>
        )}

        {/* Manual Fallback */}
        {showManualFallback && onManualEntry && (
          <Collapsible open={isManualOpen} onOpenChange={setIsManualOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full">
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                isManualOpen && "rotate-180"
              )} />
              <span>Manual entry fallback</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onManualEntry}
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Manually Process Email
              </Button>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
