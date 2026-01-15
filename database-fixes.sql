-- Fix for RLS INSERT policies causing profile creation errors
-- Run these commands in Supabase SQL editor

-- 1. Add INSERT policy for profiles table
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Add INSERT policy for doctors table  
CREATE POLICY "Users can insert their own doctor profile" ON doctors
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Grant INSERT permissions
GRANT INSERT ON doctors TO authenticated;
-- (profiles already had INSERT permission)

-- 4. Verify policies
SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename IN ('profiles', 'doctors');
