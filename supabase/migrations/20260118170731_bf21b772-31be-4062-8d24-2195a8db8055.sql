-- =============================================================
-- Phase 1A: Add new permission enum values (must be separate transaction)
-- =============================================================

-- Add new permission types for CRM, Reports, Automation, Calendar
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'clients.view';
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'clients.create';
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'clients.update';
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'clients.delete';
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'reports.view';
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'reports.export';
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'automation.view';
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'automation.manage';
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'calendar.view';
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'calendar.sync';