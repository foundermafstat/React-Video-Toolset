/*
  # Fix user signup database error

  1. Functions
    - Create or replace the handle_new_user function to automatically create profiles
    - Ensure proper error handling and security

  2. Triggers  
    - Create trigger on auth.users to automatically create profile records
    
  3. Security
    - Update RLS policies to allow profile creation during signup
    - Ensure proper permissions for the trigger function
*/

-- Create or replace the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'VIEWER');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update RLS policy to allow profile creation during signup
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;
CREATE POLICY "Allow profile creation during signup"
  ON profiles
  FOR INSERT
  WITH CHECK (true);

-- Ensure the service role can insert profiles (needed for the trigger)
GRANT USAGE ON SCHEMA public TO service_role;
GRANT INSERT ON public.profiles TO service_role;