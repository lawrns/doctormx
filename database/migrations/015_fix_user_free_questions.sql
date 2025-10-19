-- Fix user_free_questions table foreign key constraints
-- First, let's check if the table exists and what constraints it has
DO $$
BEGIN
    -- Drop existing foreign key constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_free_questions_user_id_fkey'
        AND table_name = 'user_free_questions'
    ) THEN
        ALTER TABLE user_free_questions DROP CONSTRAINT user_free_questions_user_id_fkey;
    END IF;
    
    -- Add the foreign key constraint with proper cascade options
    ALTER TABLE user_free_questions 
    ADD CONSTRAINT user_free_questions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    
EXCEPTION
    WHEN OTHERS THEN
        -- If table doesn't exist, create it
        CREATE TABLE IF NOT EXISTS user_free_questions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            questions_used INTEGER DEFAULT 0,
            questions_remaining INTEGER DEFAULT 5,
            reset_date DATE DEFAULT CURRENT_DATE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        
        -- Add indexes
        CREATE INDEX IF NOT EXISTS user_free_questions_user_id_idx ON user_free_questions(user_id);
        CREATE INDEX IF NOT EXISTS user_free_questions_reset_date_idx ON user_free_questions(reset_date);
        
        -- Enable RLS
        ALTER TABLE user_free_questions ENABLE ROW LEVEL SECURITY;
        
        -- Add RLS policies
        CREATE POLICY "Users can view their own free questions" ON user_free_questions
            FOR SELECT USING (auth.uid() = user_id);
            
        CREATE POLICY "Users can update their own free questions" ON user_free_questions
            FOR UPDATE USING (auth.uid() = user_id);
            
        CREATE POLICY "Service role can manage all free questions" ON user_free_questions
            FOR ALL USING (auth.role() = 'service_role');
END $$;

