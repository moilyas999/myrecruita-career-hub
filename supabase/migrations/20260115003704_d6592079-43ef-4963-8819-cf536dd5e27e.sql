-- Add new matching permissions to the permission_type enum
-- These need to be in a separate transaction
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'matching.view';
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'matching.create';
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'matching.history';