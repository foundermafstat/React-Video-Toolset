/*
  # Create Test Administrator Account

  1. Test Data
    - Create a test admin user profile
    - Set role to ADMIN for demonstration purposes

  2. Security Note
    - This is for demonstration only
    - Remove before production deployment
*/

-- Insert test admin profile (this will be created when the user signs up)
-- The actual auth user will be created through the signup process
-- This migration just ensures we have the admin role ready

-- Note: The actual user creation happens through Supabase Auth
-- This file serves as documentation for the test account
-- Email: admin@test.com
-- Password: admin123
-- Role: ADMIN (will be set after signup)