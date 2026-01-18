/**
 * AutomationDashboard Component
 * Main dashboard view for the automation system
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Zap, 
  ListTodo,
  Activity,
  Clock,
  AlertTriangle,
  History,
} from 'lucide-react';
import { useTaskStats, useRuleStats, useMyTasks } from '@/hooks/useAutomation';
import { usePermissions } from '@/hooks/usePermissions';
import TasksList from './TasksList';
import RulesList from './RulesList';
import TaskCard from './TaskCard';
import ExecutionHistory from './ExecutionHistory';
import { AccessDenied } from '@/components/admin/shared';

export default function AutomationDashboard() {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('automation.view');
  const canManage = hasPermission('automation.manage');

  const { data: taskStats, isLoading: taskStatsLoading } = useTaskStats();
  const { data: ruleStats, isLoading: ruleStatsLoading } = useRuleStats();
  const { data: myTasks = [], isLoading: myTasksLoading } = useMyTasks();

  if (!canView) {
    return <AccessDenied message="You don't have permission to view automation." />;
  }

  const isLoading = taskStatsLoading || ruleStatsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-amber-500" />
            Automation
          </h1>
          <p className="text-muted-foreground mt-1">
            Automate repetitive tasks and streamline your recruitment workflow
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{ruleStats?.active ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Active Rules</p>
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
                    <p className="text-2xl font-bold">{taskStats?.pending ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Pending Tasks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{taskStats?.overdue ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Overdue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{ruleStats?.total_triggers ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Total Triggers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* My Tasks Quick View */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="h-5 w-5" />
                My Tasks
              </CardTitle>
              <CardDescription>
                Tasks assigned to you that need attention
              </CardDescription>
            </div>
            {myTasks.length > 3 && (
              <Button variant="outline" size="sm" asChild>
                <a href="/admin?tab=tasks">View All</a>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {myTasksLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : myTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ListTodo className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No pending tasks</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myTasks.slice(0, 5).map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks" className="gap-2">
            <ListTodo className="h-4 w-4" />
            All Tasks
          </TabsTrigger>
          {canManage && (
            <TabsTrigger value="rules" className="gap-2">
              <Zap className="h-4 w-4" />
              Rules
            </TabsTrigger>
          )}
          {canManage && (
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Execution History
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <TasksList />
        </TabsContent>

        {canManage && (
          <TabsContent value="rules" className="mt-4">
            <RulesList />
          </TabsContent>
        )}

        {canManage && (
          <TabsContent value="history" className="mt-4">
            <ExecutionHistory />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
