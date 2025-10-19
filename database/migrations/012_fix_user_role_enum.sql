-- Fix user_role enum to include all required values
-- Drop and recreate the enum with all values

DROP TYPE IF EXISTS user_role CASCADE;

CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin', 'pharmacy');

-- Update the users table to use the new enum
ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::text::user_role;

