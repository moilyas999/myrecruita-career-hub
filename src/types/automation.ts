// Phase 4: Automation System Type Definitions

// ============================================
// Trigger Types
// ============================================

/**
 * Types of events that can trigger an automation rule
 */
export type AutomationTriggerType =
  | 'cv_submitted'           // New CV received
  | 'cv_score_above'         // CV score exceeds threshold
  | 'stage_changed'          // Pipeline stage transition
  | 'job_created'            // New job posted
  | 'job_ageing'             // Job open for X days
  | 'interview_scheduled'    // Interview booked
  | 'placement_made'         // Candidate placed
  | 'client_interaction'     // Client interaction logged
  | 'time_based'             // Scheduled (daily, weekly)
  | 'inactivity';            // No activity for X days

/**
 * Human-readable labels for trigger types
 */
export const TRIGGER_TYPE_LABELS: Record<AutomationTriggerType, string> = {
  cv_submitted: 'CV Submitted',
  cv_score_above: 'CV Score Above Threshold',
  stage_changed: 'Pipeline Stage Changed',
  job_created: 'Job Created',
  job_ageing: 'Job Ageing',
  interview_scheduled: 'Interview Scheduled',
  placement_made: 'Placement Made',
  client_interaction: 'Client Interaction',
  time_based: 'Scheduled Time',
  inactivity: 'Inactivity Period',
};

/**
 * Configuration schemas for each trigger type
 */
export interface TriggerConfigs {
  cv_submitted: {
    sector?: string[];
    min_score?: number;
  };
  cv_score_above: {
    threshold: number;
    sector?: string[];
  };
  stage_changed: {
    from_stage?: string;
    to_stage: string;
    job_id?: string;
  };
  job_created: {
    sector?: string[];
    priority?: string[];
  };
  job_ageing: {
    days_threshold: number;
    priority?: string[];
  };
  interview_scheduled: {
    interview_type?: string[];
  };
  placement_made: {
    job_type?: string[];
  };
  client_interaction: {
    interaction_type?: string[];
    client_id?: string;
  };
  time_based: {
    schedule: 'daily' | 'weekly' | 'monthly';
    day_of_week?: number; // 0-6 for weekly
    day_of_month?: number; // 1-31 for monthly
    hour: number; // 0-23
  };
  inactivity: {
    entity_type: 'cv' | 'job' | 'pipeline';
    days_threshold: number;
  };
}

// ============================================
// Action Types
// ============================================

/**
 * Types of actions that can be performed by an automation rule
 */
export type AutomationActionType =
  | 'create_task'            // Create a task for someone
  | 'send_notification'      // Push/email notification
  | 'move_stage'             // Auto-move pipeline stage
  | 'assign_user'            // Auto-assign to recruiter
  | 'update_status'          // Change job/CV status
  | 'add_tag';               // Add tag to entity

/**
 * Human-readable labels for action types
 */
export const ACTION_TYPE_LABELS: Record<AutomationActionType, string> = {
  create_task: 'Create Task',
  send_notification: 'Send Notification',
  move_stage: 'Move Pipeline Stage',
  assign_user: 'Assign User',
  update_status: 'Update Status',
  add_tag: 'Add Tag',
};

/**
 * Configuration schemas for each action type
 */
export interface ActionConfigs {
  create_task: {
    title: string;
    description?: string;
    task_type: TaskType;
    priority: TaskPriority;
    due_days?: number; // Days from trigger to due date
    assigned_to?: string; // User ID or 'trigger_owner' | 'job_owner'
  };
  send_notification: {
    title: string;
    message: string;
    recipients: string[]; // User IDs or 'trigger_owner' | 'job_owner' | 'all_recruiters'
    channels: ('push' | 'email' | 'in_app')[];
  };
  move_stage: {
    target_stage: string;
  };
  assign_user: {
    user_id: string;
  };
  update_status: {
    entity_type: 'job' | 'cv';
    new_status: string;
  };
  add_tag: {
    tags: string[];
  };
}

// ============================================
// Task Types
// ============================================

/**
 * Types of tasks that can be created
 */
export type TaskType =
  | 'follow_up'
  | 'review_cv'
  | 'schedule_interview'
  | 'send_feedback'
  | 'client_check_in'
  | 'job_review'
  | 'custom';

/**
 * Human-readable labels for task types
 */
export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  follow_up: 'Follow Up',
  review_cv: 'Review CV',
  schedule_interview: 'Schedule Interview',
  send_feedback: 'Send Feedback',
  client_check_in: 'Client Check-in',
  job_review: 'Job Review',
  custom: 'Custom Task',
};

/**
 * Task priority levels
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Human-readable labels for priorities
 */
export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

/**
 * Priority color variants for UI
 */
export const TASK_PRIORITY_VARIANTS: Record<TaskPriority, 'secondary' | 'default' | 'destructive' | 'outline'> = {
  low: 'secondary',
  medium: 'default',
  high: 'destructive',
  urgent: 'destructive',
};

/**
 * Task status values
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Human-readable labels for task statuses
 */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// ============================================
// Core Interfaces
// ============================================

/**
 * Automation Rule - defines when and what to automate
 */
export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  trigger_type: AutomationTriggerType;
  trigger_config: Record<string, unknown>;
  action_type: AutomationActionType;
  action_config: Record<string, unknown>;
  is_active: boolean;
  priority: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  last_triggered_at?: string;
  trigger_count: number;
}

/**
 * Automation Task - a task created manually or by automation
 */
export interface AutomationTask {
  id: string;
  rule_id?: string;
  title: string;
  description?: string;
  task_type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string;
  assigned_to?: string;
  related_cv_id?: string;
  related_job_id?: string;
  related_pipeline_id?: string;
  related_client_id?: string;
  metadata: Record<string, unknown>;
  completed_at?: string;
  completed_by?: string;
  created_at: string;
  updated_at: string;
  // Joined data for display
  assignee?: {
    id: string;
    display_name: string;
    email: string;
  };
  rule?: {
    id: string;
    name: string;
  };
  cv?: {
    id: string;
    name: string;
    email: string;
  };
  job?: {
    id: string;
    title: string;
    reference_id: string;
  };
  client?: {
    id: string;
    company_name: string;
  };
  pipeline?: {
    id: string;
    stage: string;
  };
}

// ============================================
// Form Input Types
// ============================================

/**
 * Input for creating an automation rule
 */
export interface CreateAutomationRuleInput {
  name: string;
  description?: string;
  trigger_type: AutomationTriggerType;
  trigger_config: Record<string, unknown>;
  action_type: AutomationActionType;
  action_config: Record<string, unknown>;
  is_active?: boolean;
  priority?: number;
}

/**
 * Input for updating an automation rule
 */
export interface UpdateAutomationRuleInput extends Partial<CreateAutomationRuleInput> {
  id: string;
}

/**
 * Input for creating a task
 */
export interface CreateTaskInput {
  title: string;
  description?: string;
  task_type: TaskType;
  priority?: TaskPriority;
  due_date?: string;
  assigned_to?: string;
  related_cv_id?: string;
  related_job_id?: string;
  related_pipeline_id?: string;
  related_client_id?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Input for updating a task
 */
export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string;
  status?: TaskStatus;
}

// ============================================
// Filter Types
// ============================================

/**
 * Filters for querying tasks
 */
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigned_to?: string;
  due_before?: string;
  due_after?: string;
  task_type?: TaskType[];
  related_job_id?: string;
  related_cv_id?: string;
  related_client_id?: string;
}

/**
 * Filters for querying automation rules
 */
export interface RuleFilters {
  trigger_type?: AutomationTriggerType[];
  action_type?: AutomationActionType[];
  is_active?: boolean;
  search?: string;
}

// ============================================
// Statistics Types
// ============================================

/**
 * Task statistics for dashboard display
 */
export interface TaskStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  overdue: number;
  due_today: number;
  due_this_week: number;
}

/**
 * Automation rule statistics
 */
export interface RuleStats {
  total: number;
  active: number;
  inactive: number;
  total_triggers: number;
  last_24h_triggers: number;
}
