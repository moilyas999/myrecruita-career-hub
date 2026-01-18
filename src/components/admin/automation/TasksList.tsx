/**
 * TasksList Component
 * Displays a filterable list of automation tasks
 */

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Trash2,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useTasks, useTaskStats, useDeleteTask, useBulkUpdateTasks } from '@/hooks/useAutomation';
import { usePermissions } from '@/hooks/usePermissions';
import TaskCard from './TaskCard';
import TaskStats from './TaskStats';
import TaskFormDialog from './TaskFormDialog';
import { AccessDenied } from '@/components/admin/shared';
import type { AutomationTask, TaskStatus, TaskPriority, TaskFilters } from '@/types/automation';
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '@/types/automation';

export default function TasksList() {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('automation.view');
  const canManage = hasPermission('automation.manage');

  // Filter state
  const [filters, setFilters] = useState<TaskFilters>({
    status: ['pending', 'in_progress'],
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<AutomationTask | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<AutomationTask | null>(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Data fetching
  const { data: tasks = [], isLoading, refetch } = useTasks(filters);
  const { data: stats, isLoading: statsLoading } = useTaskStats();
  const deleteTask = useDeleteTask();
  const bulkUpdate = useBulkUpdateTasks();

  // Filter tasks by search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks;
    const query = searchQuery.toLowerCase();
    return tasks.filter(
      task => 
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.job?.title?.toLowerCase().includes(query) ||
        task.cv?.name?.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery]);

  // Handlers
  const handleEdit = (task: AutomationTask) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleDelete = (task: AutomationTask) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (taskToDelete) {
      await deleteTask.mutateAsync(taskToDelete.id);
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleSelect = (taskId: string, selected: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (selected) {
        next.add(taskId);
      } else {
        next.delete(taskId);
      }
      return next;
    });
  };

  const handleBulkComplete = () => {
    bulkUpdate.mutate({ 
      ids: Array.from(selectedIds), 
      updates: { status: 'completed' } 
    });
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await deleteTask.mutateAsync(id);
    }
    setSelectedIds(new Set());
  };

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      setFilters(prev => ({ ...prev, status: undefined }));
    } else {
      setFilters(prev => ({ ...prev, status: [status as TaskStatus] }));
    }
  };

  const handlePriorityFilter = (priority: string) => {
    if (priority === 'all') {
      setFilters(prev => ({ ...prev, priority: undefined }));
    } else {
      setFilters(prev => ({ ...prev, priority: [priority as TaskPriority] }));
    }
  };

  if (!canView) {
    return <AccessDenied message="You don't have permission to view tasks." />;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <TaskStats stats={stats} isLoading={statsLoading} />

      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Tasks</h2>
          <p className="text-muted-foreground">
            Manage and track work items across your recruitment workflow
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          {canManage && (
            <Button onClick={() => { setEditingTask(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={filters.status?.[0] || 'all'}
          onValueChange={handleStatusFilter}
        >
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(Object.entries(TASK_STATUS_LABELS) as [TaskStatus, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.priority?.[0] || 'all'}
          onValueChange={handlePriorityFilter}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {(Object.entries(TASK_PRIORITY_LABELS) as [TaskPriority, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Bulk actions */}
        {selectedIds.size > 0 && canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                {selectedIds.size} selected
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleBulkComplete}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark Complete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleBulkDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Active filters display */}
      {(filters.status || filters.priority) && (
        <div className="flex flex-wrap gap-2">
          {filters.status?.map(status => (
            <Badge key={status} variant="secondary" className="gap-1">
              Status: {TASK_STATUS_LABELS[status]}
              <button 
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  status: prev.status?.filter(s => s !== status) 
                }))}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
          {filters.priority?.map(priority => (
            <Badge key={priority} variant="secondary" className="gap-1">
              Priority: {TASK_PRIORITY_LABELS[priority]}
              <button 
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  priority: prev.priority?.filter(p => p !== priority) 
                }))}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setFilters({})}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Task list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground">No tasks found</p>
          {canManage && (
            <Button 
              variant="link" 
              onClick={() => { setEditingTask(null); setFormOpen(true); }}
            >
              Create your first task
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
              selectable={canManage}
              selected={selectedIds.has(task.id)}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editingTask}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
