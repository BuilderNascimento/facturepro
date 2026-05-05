-- Adds a free-text description field to invoices
-- Run in Supabase SQL Editor (or migrations pipeline) for existing projects.

ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS description TEXT;

