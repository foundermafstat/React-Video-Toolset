/*
  # Update test admin user

  1. Updates
    - Set the admin@test.com user to ADMIN role if it exists
    - This ensures the test account has proper admin privileges

  2. Security Note
    - This is for demonstration only
    - Remove before production deployment
*/

-- Update the admin user role if the profile exists
UPDATE profiles 
SET role = 'ADMIN' 
WHERE email = 'admin@test.com';

-- If the profile doesn't exist, we'll let the trigger handle it on signup
-- The user will initially be created as VIEWER, then this can be run manually
-- or the role can be updated through the admin panel