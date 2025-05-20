/*
  # Fix for Doctor Connect Program Registration

  1. Add missing RLS (Row Level Security) policy for doctor table insertions
  2. This will allow newly registered users to create their doctor profile
*/

-- Add policy to allow users to insert their own doctor profile
CREATE POLICY "Users can create their own doctor profile"
  ON doctors
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
