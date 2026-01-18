/**
 * RulesList Component
 * Displays and manages automation rules
 */

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  RefreshCw,
  Zap,
  ZapOff,
  Activity,
} from 'lucide-react';
import { useAutomationRules, useRuleStats, useDeleteRule } from '@/hooks/useAutomation';
import { usePermissions } from '@/hooks/usePermissions';
import RuleCard from './RuleCard';
import RuleFormDialog from './RuleFormDialog';
import { AccessDenied } from '@/components/admin/shared';
import type { AutomationRule, RuleFilters, AutomationTriggerType, AutomationActionType } from '@/types/automation';
import { TRIGGER_TYPE_LABELS, ACTION_TYPE_LABELS } from '@/types/automation';

export default function RulesList() {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('automation.view');
  const canManage = hasPermission('automation.manage');

  // Filter state
  const [filters, setFilters] = useState<RuleFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<AutomationRule | null>(null);

  // Data fetching
  const { data: rules = [], isLoading, refetch } = useAutomationRules(filters);
  const { data: stats, isLoading: statsLoading } = useRuleStats();
  const deleteRule = useDeleteRule();

  // Filter rules by search query
  const filteredRules = useMemo(() => {
    if (!searchQuery) return rules;
    const query = searchQuery.toLowerCase();
    return rules.filter(
      rule => 
        rule.name.toLowerCase().includes(query) ||
        rule.description?.toLowerCase().includes(query)
    );
  }, [rules, searchQuery]);

  // Handlers
  const handleEdit = (rule: AutomationRule) => {
    setEditingRule(rule);
    setFormOpen(true);
  };

  const handleDelete = (rule: AutomationRule) => {
    setRuleToDelete(rule);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (ruleToDelete) {
      await deleteRule.mutateAsync(ruleToDelete.id);
      setDeleteDialogOpen(false);
      setRuleToDelete(null);
    }
  };

  const handleActiveFilter = (value: string) => {
    if (value === 'all') {
      setFilters(prev => ({ ...prev, is_active: undefined }));
    } else {
      setFilters(prev => ({ ...prev, is_active: value === 'active' }));
    }
  };

  const handleTriggerFilter = (value: string) => {
    if (value === 'all') {
      setFilters(prev => ({ ...prev, trigger_type: undefined }));
    } else {
      setFilters(prev => ({ ...prev, trigger_type: [value as AutomationTriggerType] }));
    }
  };

  const handleActionFilter = (value: string) => {
    if (value === 'all') {
      setFilters(prev => ({ ...prev, action_type: undefined }));
    } else {
      setFilters(prev => ({ ...prev, action_type: [value as AutomationActionType] }));
    }
  };

  if (!canView) {
    return <AccessDenied message="You don't have permission to view automation rules." />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Rules</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <ZapOff className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inactive}</p>
                <p className="text-xs text-muted-foreground">Inactive</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20">
                <Activity className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total_triggers}</p>
                <p className="text-xs text-muted-foreground">Total Triggers</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Automation Rules</h2>
          <p className="text-muted-foreground">
            Define rules to automate repetitive tasks in your workflow
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
            <Button onClick={() => { setEditingRule(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={filters.is_active === undefined ? 'all' : filters.is_active ? 'active' : 'inactive'}
          onValueChange={handleActiveFilter}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.trigger_type?.[0] || 'all'}
          onValueChange={handleTriggerFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trigger" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Triggers</SelectItem>
            {(Object.entries(TRIGGER_TYPE_LABELS) as [AutomationTriggerType, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.action_type?.[0] || 'all'}
          onValueChange={handleActionFilter}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {(Object.entries(ACTION_TYPE_LABELS) as [AutomationActionType, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active filters */}
      {(filters.is_active !== undefined || filters.trigger_type || filters.action_type) && (
        <div className="flex flex-wrap gap-2">
          {filters.is_active !== undefined && (
            <Badge variant="secondary" className="gap-1">
              {filters.is_active ? 'Active' : 'Inactive'}
              <button 
                onClick={() => setFilters(prev => ({ ...prev, is_active: undefined }))}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          {filters.trigger_type?.map(trigger => (
            <Badge key={trigger} variant="secondary" className="gap-1">
              Trigger: {TRIGGER_TYPE_LABELS[trigger]}
              <button 
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  trigger_type: prev.trigger_type?.filter(t => t !== trigger) 
                }))}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
          {filters.action_type?.map(action => (
            <Badge key={action} variant="secondary" className="gap-1">
              Action: {ACTION_TYPE_LABELS[action]}
              <button 
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  action_type: prev.action_type?.filter(a => a !== action) 
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

      {/* Rules list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No automation rules found</p>
          {canManage && (
            <Button 
              variant="link" 
              onClick={() => { setEditingRule(null); setFormOpen(true); }}
            >
              Create your first rule
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRules.map(rule => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <RuleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        rule={editingRule}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Automation Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{ruleToDelete?.name}"? This action cannot be undone.
              Any tasks created by this rule will remain.
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
