/**
 * ExecutionHistory Component
 * Displays automation rule execution history with filtering
 */

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronRight,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { useAutomationExecutions, useExecutionStats, type AutomationExecution } from '@/hooks/useAutomationExecutions';
import { TRIGGER_TYPE_LABELS } from '@/types/automation';

const STATUS_CONFIG = {
  completed: { label: 'Completed', variant: 'default' as const, icon: CheckCircle2, color: 'text-green-600' },
  failed: { label: 'Failed', variant: 'destructive' as const, icon: XCircle, color: 'text-destructive' },
  partial: { label: 'Partial', variant: 'secondary' as const, icon: AlertTriangle, color: 'text-amber-600' },
  pending: { label: 'Pending', variant: 'outline' as const, icon: Clock, color: 'text-muted-foreground' },
};

interface ExecutionCardProps {
  execution: AutomationExecution;
}

function ExecutionCard({ execution }: ExecutionCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const statusConfig = STATUS_CONFIG[execution.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
        <CollapsibleTrigger asChild>
          <button className="w-full text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className={`mt-0.5 ${statusConfig.color}`}>
                  <StatusIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{execution.rule_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {TRIGGER_TYPE_LABELS[execution.trigger_event as keyof typeof TRIGGER_TYPE_LABELS] || execution.trigger_event}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span>{formatDistanceToNow(new Date(execution.created_at), { addSuffix: true })}</span>
                    {execution.execution_time_ms && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {execution.execution_time_ms}ms
                      </span>
                    )}
                    <span>{execution.actions_executed.length} action(s)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="mt-4 pt-4 border-t space-y-4">
            {/* Actions Executed */}
            {execution.actions_executed.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Actions Executed</h4>
                <div className="space-y-2">
                  {execution.actions_executed.map((action, index) => (
                    <div
                      key={index}
                      className={`text-sm p-2 rounded-md ${
                        action.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {action.success ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                        <span className="font-medium">{action.action_type}</span>
                      </div>
                      {action.details && (
                        <pre className="mt-1 text-xs text-muted-foreground overflow-x-auto">
                          {JSON.stringify(action.details, null, 2)}
                        </pre>
                      )}
                      {action.error && (
                        <p className="mt-1 text-xs text-destructive">{action.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trigger Context */}
            {Object.keys(execution.trigger_context).length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Trigger Context</h4>
                <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
                  {JSON.stringify(execution.trigger_context, null, 2)}
                </pre>
              </div>
            )}

            {/* Error Message */}
            {execution.error_message && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-destructive">Error</h4>
                <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                  {execution.error_message}
                </p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export default function ExecutionHistory() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [triggerFilter, setTriggerFilter] = useState<string>('all');

  const filters = {
    status: statusFilter !== 'all' ? [statusFilter] : undefined,
    trigger_event: triggerFilter !== 'all' ? [triggerFilter] : undefined,
    limit: 50,
  };

  const { data: executions = [], isLoading, refetch } = useAutomationExecutions(filters);
  const { data: stats } = useExecutionStats();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.total ?? 0}</p>
                <p className="text-xs text-muted-foreground">Total Executions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.completed ?? 0}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.failed ?? 0}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.last_24h ?? 0}</p>
                <p className="text-xs text-muted-foreground">Last 24h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Execution List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Execution History
              </CardTitle>
              <CardDescription>
                Recent automation rule executions and their results
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>

            <Select value={triggerFilter} onValueChange={setTriggerFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trigger Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Triggers</SelectItem>
                {Object.entries(TRIGGER_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Executions List */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : executions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No executions found</p>
              <p className="text-sm">Automation rules will appear here when triggered</p>
            </div>
          ) : (
            <div className="space-y-3">
              {executions.map(execution => (
                <ExecutionCard key={execution.id} execution={execution} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
