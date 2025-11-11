-- ============================================
-- COMPREHENSIVE SECURITY FIX MIGRATION
-- Fixes all RLS policies and adds role system
-- ============================================

-- Step 1: Create role system
-- ============================================

-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Step 2: Fix ORDERS table (CRITICAL - contains payment data)
-- ============================================

-- Make user_id NOT NULL (with safe migration)
UPDATE public.orders SET user_id = auth.uid() WHERE user_id IS NULL;
ALTER TABLE public.orders ALTER COLUMN user_id SET NOT NULL;

-- Drop insecure policy
DROP POLICY IF EXISTS "Allow all operations on orders" ON public.orders;

-- Users can only view their own orders
CREATE POLICY "Users can view own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id);

-- Users can only create orders for themselves
CREATE POLICY "Users can create own orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own orders
CREATE POLICY "Users can update own orders"
ON public.orders FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all orders
CREATE POLICY "Admins can update all orders"
ON public.orders FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Step 3: Fix PRODUCTS table
-- ============================================

-- Drop insecure policy
DROP POLICY IF EXISTS "Allow all operations on products" ON public.products;

-- Anyone can view products (public catalog)
CREATE POLICY "Anyone can view products"
ON public.products FOR SELECT
USING (true);

-- Authenticated users can create products
CREATE POLICY "Authenticated users can create products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update products
CREATE POLICY "Authenticated users can update products"
ON public.products FOR UPDATE
TO authenticated
USING (true);

-- Authenticated users can delete products
CREATE POLICY "Authenticated users can delete products"
ON public.products FOR DELETE
TO authenticated
USING (true);

-- Step 4: Fix ANALYTICS table (admin only)
-- ============================================

-- Drop insecure policy
DROP POLICY IF EXISTS "Allow all operations on analytics" ON public.analytics;

-- Only admins can access analytics
CREATE POLICY "Admins can manage analytics"
ON public.analytics FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Step 5: Fix PROJECTS table (admin only)
-- ============================================

-- Drop insecure policy
DROP POLICY IF EXISTS "Allow all operations on projects" ON public.projects;

-- Only admins can access projects
CREATE POLICY "Admins can manage projects"
ON public.projects FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Step 6: Fix DEPLOYMENTS table (admin only)
-- ============================================

-- Drop insecure policy
DROP POLICY IF EXISTS "Allow all operations on deployments" ON public.deployments;

-- Only admins can access deployments
CREATE POLICY "Admins can manage deployments"
ON public.deployments FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Step 7: Fix DOMAINS table (admin only)
-- ============================================

-- Drop insecure policy
DROP POLICY IF EXISTS "Allow all operations on domains" ON public.domains;

-- Only admins can access domains
CREATE POLICY "Admins can manage domains"
ON public.domains FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Step 8: Fix AI_SESSIONS table (user-scoped)
-- ============================================

-- Add user_id column if not exists
ALTER TABLE public.ai_sessions ADD COLUMN IF NOT EXISTS user_id UUID;

-- Update existing sessions to have user_id (if any exist)
UPDATE public.ai_sessions SET user_id = auth.uid() WHERE user_id IS NULL;

-- Drop insecure policy
DROP POLICY IF EXISTS "Allow all operations on ai_sessions" ON public.ai_sessions;

-- Users can only access their own sessions
CREATE POLICY "Users can manage own ai_sessions"
ON public.ai_sessions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 9: Fix EDITS table (user-scoped)
-- ============================================

-- Add user_id column if not exists
ALTER TABLE public.edits ADD COLUMN IF NOT EXISTS user_id UUID;

-- Update existing edits to have user_id (if any exist)
UPDATE public.edits SET user_id = auth.uid() WHERE user_id IS NULL;

-- Drop insecure policy
DROP POLICY IF EXISTS "Allow all operations on edits" ON public.edits;

-- Users can only access their own edits
CREATE POLICY "Users can manage own edits"
ON public.edits FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 10: Create helper function to assign admin role
-- ============================================

CREATE OR REPLACE FUNCTION public.assign_admin_role(_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Grant execute permission to authenticated users (for setup only)
GRANT EXECUTE ON FUNCTION public.assign_admin_role TO authenticated;

COMMENT ON FUNCTION public.assign_admin_role IS 'Assigns admin role to a user. Use with caution - should only be called during initial setup or by existing admins.';