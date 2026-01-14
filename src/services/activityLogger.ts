/**
 * Activity Logger Service
 * 
 * Centralized service to log all significant admin actions for accountability tracking.
 * All actions are stored in admin_audit_log table with full context.
 */

import { supabase } from '@/integrations/supabase/client';

export type ActivityAction = 
  // CV Actions
  | 'cv_created' 
  | 'cv_updated' 
  | 'cv_deleted' 
  | 'cv_exported'
  | 'cv_bulk_imported'
  | 'cv_matched'
  | 'cv_scored'
  // Job Actions
  | 'job_created' 
  | 'job_updated' 
  | 'job_deleted' 
  | 'job_status_changed'
  | 'job_assigned'
  // Talent Actions
  | 'talent_created' 
  | 'talent_updated' 
  | 'talent_deleted'
  | 'talent_visibility_changed'
  // Blog Actions
  | 'blog_created' 
  | 'blog_updated'
  | 'blog_published' 
  | 'blog_unpublished'
  | 'blog_deleted'
  // Staff Actions
  | 'staff_created' 
  | 'staff_updated'
  | 'staff_deleted'
  | 'permissions_changed'
  // Pipeline Actions
  | 'pipeline_candidate_added'
  | 'pipeline_stage_changed'
  | 'pipeline_note_added'
  | 'pipeline_candidate_removed'
  // Submission Actions
  | 'submission_deleted'
  | 'submission_exported'
  // Auth Actions
  | 'login'
  | 'logout';

export type ResourceType = 
  | 'cv' 
  | 'job' 
  | 'talent' 
  | 'blog' 
  | 'staff' 
  | 'pipeline' 
  | 'submission'
  | 'settings'
  | 'auth';

export interface LogActivityParams {
  action: ActivityAction;
  resourceType: ResourceType;
  resourceId?: string;
  details?: Record<string, unknown>;
}

export interface ActivityLogEntry {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: unknown;
  ip_address: string | null;
  created_at: string;
}

/**
 * Log an activity to the audit log
 * This is a fire-and-forget operation that doesn't block the UI
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('Activity logger: No user authenticated, skipping log');
      return;
    }

    const logEntry = {
      user_id: user.id,
      user_email: user.email || 'unknown',
      action: params.action as string,
      resource_type: params.resourceType as string,
      resource_id: params.resourceId || null,
      details: (params.details || null) as unknown,
    };

    const { error } = await supabase.from('admin_audit_log').insert([logEntry as any]);

    if (error) {
      console.error('Activity logger error:', error);
    }
  } catch (error) {
    // Don't throw - logging should never break the app
    console.error('Activity logger exception:', error);
  }
}

/**
 * Get recent activity for a specific user
 */
export async function getUserActivity(
  userId: string, 
  limit: number = 50
): Promise<ActivityLogEntry[]> {
  const { data, error } = await supabase
    .from('admin_audit_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching user activity:', error);
    return [];
  }

  return (data || []) as ActivityLogEntry[];
}

/**
 * Get all team activity (admin only)
 */
export async function getTeamActivity(
  options: {
    limit?: number;
    userId?: string;
    resourceType?: ResourceType;
    action?: ActivityAction;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<ActivityLogEntry[]> {
  let query = supabase
    .from('admin_audit_log')
    .select('*')
    .order('created_at', { ascending: false });

  if (options.userId) {
    query = query.eq('user_id', options.userId);
  }
  
  if (options.resourceType) {
    query = query.eq('resource_type', options.resourceType);
  }

  if (options.action) {
    query = query.eq('action', options.action);
  }

  if (options.startDate) {
    query = query.gte('created_at', options.startDate);
  }

  if (options.endDate) {
    query = query.lte('created_at', options.endDate);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  } else {
    query = query.limit(100);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching team activity:', error);
    return [];
  }

  return (data || []) as ActivityLogEntry[];
}

/**
 * Get activity statistics for a user within a date range
 */
export async function getUserActivityStats(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('admin_audit_log')
    .select('action')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (error) {
    console.error('Error fetching activity stats:', error);
    return {};
  }

  const stats: Record<string, number> = {};
  
  for (const entry of data || []) {
    stats[entry.action] = (stats[entry.action] || 0) + 1;
  }

  return stats;
}

/**
 * Human-readable action descriptions
 */
export const ACTION_LABELS: Record<ActivityAction, string> = {
  cv_created: 'Added CV',
  cv_updated: 'Updated CV',
  cv_deleted: 'Deleted CV',
  cv_exported: 'Exported CVs',
  cv_bulk_imported: 'Bulk imported CVs',
  cv_matched: 'Matched CV to job',
  cv_scored: 'Scored CV',
  job_created: 'Created job',
  job_updated: 'Updated job',
  job_deleted: 'Deleted job',
  job_status_changed: 'Changed job status',
  job_assigned: 'Assigned job',
  talent_created: 'Added talent profile',
  talent_updated: 'Updated talent profile',
  talent_deleted: 'Deleted talent profile',
  talent_visibility_changed: 'Changed talent visibility',
  blog_created: 'Created blog post',
  blog_updated: 'Updated blog post',
  blog_published: 'Published blog post',
  blog_unpublished: 'Unpublished blog post',
  blog_deleted: 'Deleted blog post',
  staff_created: 'Added staff member',
  staff_updated: 'Updated staff member',
  staff_deleted: 'Removed staff member',
  permissions_changed: 'Changed permissions',
  pipeline_candidate_added: 'Added candidate to pipeline',
  pipeline_stage_changed: 'Moved candidate stage',
  pipeline_note_added: 'Added pipeline note',
  pipeline_candidate_removed: 'Removed from pipeline',
  submission_deleted: 'Deleted submission',
  submission_exported: 'Exported submissions',
  login: 'Logged in',
  logout: 'Logged out',
};

/**
 * Get icon name for action type
 */
export function getActionIcon(action: ActivityAction): string {
  const iconMap: Record<string, string> = {
    cv_created: 'file-plus',
    cv_updated: 'file-edit',
    cv_deleted: 'file-x',
    cv_exported: 'download',
    cv_bulk_imported: 'upload',
    cv_matched: 'git-merge',
    cv_scored: 'star',
    job_created: 'briefcase',
    job_updated: 'edit',
    job_deleted: 'trash-2',
    job_status_changed: 'toggle-left',
    job_assigned: 'user-check',
    talent_created: 'user-plus',
    talent_updated: 'user-cog',
    talent_deleted: 'user-minus',
    talent_visibility_changed: 'eye',
    blog_created: 'file-text',
    blog_updated: 'edit-3',
    blog_published: 'globe',
    blog_unpublished: 'globe-off',
    blog_deleted: 'trash',
    staff_created: 'user-plus',
    staff_updated: 'user-cog',
    staff_deleted: 'user-x',
    permissions_changed: 'shield',
    pipeline_candidate_added: 'git-branch',
    pipeline_stage_changed: 'arrow-right',
    pipeline_note_added: 'message-square',
    pipeline_candidate_removed: 'x-circle',
    submission_deleted: 'trash-2',
    submission_exported: 'download',
    login: 'log-in',
    logout: 'log-out',
  };

  return iconMap[action] || 'activity';
}
