-- Fix for "infinite recursion detected in policy" error
-- We use a SECURITY DEFINER function to check admin status without triggering RLS recursively

-- 1. Create a secure function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- This runs with the privileges of the function creator (postgres), bypassing RLS
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update PROFILES policy to use the new function
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  is_admin()
);

-- 3. Update other policies to use the new function for consistency and performance

-- Projects
DROP POLICY IF EXISTS "Admins can manage projects" ON projects;
CREATE POLICY "Admins can manage projects"
ON projects FOR ALL
USING ( is_admin() );

-- Feedback
DROP POLICY IF EXISTS "Admins can view all feedback" ON feedback;
CREATE POLICY "Admins can view all feedback"
ON feedback FOR SELECT
USING ( is_admin() );

-- Newsletter
DROP POLICY IF EXISTS "Admins can view subscribers" ON newsletter_subscribers;
CREATE POLICY "Admins can view subscribers"
ON newsletter_subscribers FOR SELECT
USING ( is_admin() );
