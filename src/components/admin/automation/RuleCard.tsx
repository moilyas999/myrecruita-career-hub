/**
 * RuleCard Component
 * Displays a single automation rule with actions
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Zap,
  Clock,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToggleRule } from '@/hooks/useAutomation';
import { usePermissions } from '@/hooks/usePermissions';
import type { AutomationRule } from '@/types/automation';
import { TRIGGER_TYPE_LABELS, ACTION_TYPE_LABELS } from '@/types/automation';

interface RuleCardProps {
  rule: AutomationRule;
  onEdit?: (rule: AutomationRule) => void;
  onDelete?: (rule: AutomationRule) => void;
}

export default function RuleCard({ rule, onEdit, onDelete }: RuleCardProps) {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('automation.manage');
  const toggleRule = useToggleRule();

  const handleToggle = (checked: boolean) => {
    toggleRule.mutate({ id: rule.id, is_active: checked });
  };

  return (
    <Card className={cn(
      'transition-all duration-200',
      !rule.is_active && 'opacity-60 bg-muted/50'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Zap className={cn(
                'h-4 w-4',
                rule.is_active ? 'text-amber-500' : 'text-muted-foreground'
              )} />
              <h3 className="font-semibold truncate">{rule.name}</h3>
            </div>
            {rule.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {rule.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canManage && (
              <Switch
                checked={rule.is_active}
                onCheckedChange={handleToggle}
                disabled={toggleRule.isPending}
                aria-label={rule.is_active ? 'Deactivate rule' : 'Activate rule'}
              />
            )}
            
            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(rule)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(rule)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Trigger and Action */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="gap-1">
            <span className="text-muted-foreground">When:</span>
            {TRIGGER_TYPE_LABELS[rule.trigger_type]}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <span className="text-muted-foreground">Then:</span>
            {ACTION_TYPE_LABELS[rule.action_type]}
          </Badge>
          {rule.priority > 0 && (
            <Badge variant="default">
              Priority: {rule.priority}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {rule.trigger_count} triggers
          </span>
          {rule.last_triggered_at && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last: {format(new Date(rule.last_triggered_at), 'MMM d, h:mm a')}
            </span>
          )}
          <span className="flex items-center gap-1">
            Created: {format(new Date(rule.created_at), 'MMM d, yyyy')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
