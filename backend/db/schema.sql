-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create specific types
CREATE TYPE user_role AS ENUM ('admin', 'member');
CREATE TYPE project_status AS ENUM ('idea', 'in-progress', 'beta', 'released');
CREATE TYPE feedback_category AS ENUM ('bug', 'ux', 'feature', 'general');

-- PROFILES (Simulates Auth Roles logic linked to Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role user_role DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECTS
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status project_status DEFAULT 'idea',
    github_link TEXT,
    demo_link TEXT,
    tags TEXT[],
    version TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FEEDBACK
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    category feedback_category NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NEWSLETTER
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    email TEXT NOT NULL,
    subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS ENABLE
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- PROFILES
-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Trigger to create profile on signup (Optional auto-admin for first user logic can be done manually)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'member');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- This trigger must be created in the Supabase dashboard or via specific migration runner with sufficient privileges
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- PROJECTS
-- Everyone (authenticated) can view projects
CREATE POLICY "Members can view projects"
ON projects FOR SELECT
USING (auth.role() = 'authenticated');

-- Only Admins can insert/update/delete projects
CREATE POLICY "Admins can manage projects"
ON projects FOR ALL
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);


-- FEEDBACK
-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
ON feedback FOR SELECT
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback"
ON feedback FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert feedback
CREATE POLICY "Users can insert feedback"
ON feedback FOR INSERT
WITH CHECK (auth.uid() = user_id);


-- NEWSLETTER
-- Admins can view all subscribers
CREATE POLICY "Admins can view subscribers"
ON newsletter_subscribers FOR SELECT
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- Users can subscribe themselves
CREATE POLICY "Users can subscribe"
ON newsletter_subscribers FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can unsubscribe themselves
CREATE POLICY "Users can unsubscribe"
ON newsletter_subscribers FOR DELETE
USING (auth.uid() = user_id);
