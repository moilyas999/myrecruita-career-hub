-- Add new calendar permissions to the permission_type enum
-- Note: ALTER TYPE ... ADD VALUE is not transactional, so we do it outside transaction

ALTER TYPE public.permission_type ADD VALUE IF NOT EXISTS 'calendar.create';
ALTER TYPE public.permission_type ADD VALUE IF NOT EXISTS 'calendar.update';
ALTER TYPE public.permission_type ADD VALUE IF NOT EXISTS 'calendar.delete';