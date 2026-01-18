/**
 * TaskCard Component
 * Displays a single task with quick actions
 */

import { useState } from 'react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  MoreHorizontal, 
  Calendar, 
  User, 
  Briefcase,
  FileText,
  Building2,
  Edit,
  Trash2,
  CheckCircle2,
  PlayCircle,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCompleteTask, useUpdateTaskStatus } from '@/hooks/useAutomation';
import { usePermissions } from '@/hooks/usePermissions';
import type { AutomationTask, TaskStatus } from '@/types/automation';
import { TASK_TYPE_LABELS, TASK_PRIORITY_LABELS, TASK_PRIORITY_VARIANTS } from '@/types/automation';

interface TaskCardProps {
  task: AutomationTask;
  onEdit?: (task: AutomationTask) => void;
  onDelete?: (task: AutomationTask) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (taskId: string, selected: boolean) => void;
}

export default function TaskCard({ 
  task, 
  onEdit, 
  onDelete,
  selectable = false,
  selected = false,
  onSelect,
}: TaskCardProps) {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('automation.manage');
  const completeTask = useCompleteTask();
  const updateStatus = useUpdateTaskStatus();
  const [isHovered, setIsHovered] = useState(false);

  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'completed';
  const isDueToday = task.due_date && isToday(new Date(task.due_date));
  const isDueTomorrow = task.due_date && isTomorrow(new Date(task.due_date));

  const getDueDateLabel = () => {
    if (!task.due_date) return null;
    if (isOverdue) return 'Overdue';
    if (isDueToday) return 'Due Today';
    if (isDueTomorrow) return 'Due Tomorrow';
    return format(new Date(task.due_date), 'MMM d');
  };

  const handleStatusChange = (status: TaskStatus) => {
    updateStatus.mutate({ id: task.id, status });
  };

  const handleComplete = () => {
    completeTask.mutate(task.id);
  };

  return (
    <Card 
      className={cn(
        'transition-all duration-200',
        isHovered && 'shadow-md',
        selected && 'ring-2 ring-primary',
        task.status === 'completed' && 'opacity-60'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox for selection or quick complete */}
          {selectable ? (
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) => onSelect?.(task.id, checked === true)}
              className="mt-1"
            />
          ) : (
            <Checkbox
              checked={task.status === 'completed'}
              onCheckedChange={() => task.status !== 'completed' && handleComplete()}
              disabled={task.status === 'completed' || completeTask.isPending}
              className="mt-1"
            />
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Title and badges */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  'font-medium truncate',
                  task.status === 'completed' && 'line-through text-muted-foreground'
                )}>
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Actions dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {task.status !== 'completed' && (
                    <>
                      <DropdownMenuItem onClick={handleComplete}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Complete
                      </DropdownMenuItem>
                      {task.status === 'pending' && (
                        <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Start Working
                        </DropdownMenuItem>
                      )}
                      {task.status === 'in_progress' && (
                        <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Pause
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {canManage && onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(task)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {canManage && onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(task)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* Task type badge */}
              <Badge variant="outline" className="text-xs">
                {TASK_TYPE_LABELS[task.task_type]}
              </Badge>

              {/* Priority badge */}
              <Badge 
                variant={TASK_PRIORITY_VARIANTS[task.priority]}
                className="text-xs"
              >
                {TASK_PRIORITY_LABELS[task.priority]}
              </Badge>

              {/* Due date */}
              {task.due_date && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant={isOverdue ? 'destructive' : isDueToday ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        {getDueDateLabel()}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      {format(new Date(task.due_date), 'PPP p')}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Related entities */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
              {task.assignee && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {task.assignee.display_name || task.assignee.email}
                </span>
              )}
              {task.job && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {task.job.reference_id}
                </span>
              )}
              {task.cv && (
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {task.cv.name}
                </span>
              )}
              {task.client && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {task.client.company_name}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
