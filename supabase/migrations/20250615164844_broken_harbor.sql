/*
  # RBAC System Setup

  1. New Tables
    - `profiles` - User profiles with roles
    - `projects` - Project management
    - `presentations` - Presentations within projects
    - `slides` - Individual slides within presentations

  2. Security
    - Enable RLS on all tables
    - Create role-based policies for each table
    - Implement proper access control for ADMIN, EDITOR, VIEWER roles

  3. Functions
    - Helper functions for role checking
    - Automatic profile creation on user signup
*/

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role user_role DEFAULT 'VIEWER',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create presentations table
CREATE TABLE IF NOT EXISTS presentations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create slides table
CREATE TABLE IF NOT EXISTS slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  presentation_id uuid REFERENCES presentations(id) ON DELETE CASCADE,
  content jsonb DEFAULT '{}',
  slide_order integer DEFAULT 0,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS user_role AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = user_id) = 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user can edit
CREATE OR REPLACE FUNCTION can_edit(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = user_id) IN ('ADMIN', 'EDITOR');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id AND NOT (role = 'ADMIN' AND get_user_role(auth.uid()) != 'ADMIN'));

-- Projects policies
CREATE POLICY "Authenticated users can read projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Presentations policies
CREATE POLICY "Authenticated users can read presentations"
  ON presentations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Editors and admins can insert presentations"
  ON presentations
  FOR INSERT
  TO authenticated
  WITH CHECK (can_edit(auth.uid()));

CREATE POLICY "Editors and admins can update presentations"
  ON presentations
  FOR UPDATE
  TO authenticated
  USING (can_edit(auth.uid()));

CREATE POLICY "Admins can delete presentations"
  ON presentations
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Slides policies
CREATE POLICY "Authenticated users can read slides"
  ON slides
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Editors and admins can insert slides"
  ON slides
  FOR INSERT
  TO authenticated
  WITH CHECK (can_edit(auth.uid()));

CREATE POLICY "Editors and admins can update slides"
  ON slides
  FOR UPDATE
  TO authenticated
  USING (can_edit(auth.uid()));

CREATE POLICY "Admins can delete slides"
  ON slides
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'VIEWER');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presentations_updated_at
  BEFORE UPDATE ON presentations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slides_updated_at
  BEFORE UPDATE ON slides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();