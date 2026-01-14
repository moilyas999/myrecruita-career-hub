-- Migration 1: Add new permission types for pipeline management
ALTER TYPE public.permission_type ADD VALUE IF NOT EXISTS 'pipeline.view';
ALTER TYPE public.permission_type ADD VALUE IF NOT EXISTS 'pipeline.create';
ALTER TYPE public.permission_type ADD VALUE IF NOT EXISTS 'pipeline.update';
ALTER TYPE public.permission_type ADD VALUE IF NOT EXISTS 'pipeline.delete';