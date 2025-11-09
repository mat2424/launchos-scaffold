-- Add inventory column to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS inventory integer DEFAULT 0;