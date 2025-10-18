-- Free Questions System Migration
-- This migration creates the user_free_questions table to track free question usage

-- Create user_free_questions table
CREATE TABLE IF NOT EXISTS user_free_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    questions_used INTEGER NOT NULL DEFAULT 0,
    questions_limit INTEGER NOT NULL DEFAULT 5,
    last_reset_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_free_questions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own free question usage" ON user_free_questions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own free question usage" ON user_free_questions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert free question records" ON user_free_questions
    FOR INSERT WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_free_questions_user_id ON user_free_questions(user_id);

-- Create function to automatically create free question record for new users
CREATE OR REPLACE FUNCTION create_free_questions_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_free_questions (user_id, questions_used, questions_limit, last_reset_date)
    VALUES (NEW.id, 0, 5, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create free question record for new users
DROP TRIGGER IF EXISTS trigger_create_free_questions_for_new_user ON users;
CREATE TRIGGER trigger_create_free_questions_for_new_user
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_free_questions_for_new_user();

-- Create function to reset free questions monthly
CREATE OR REPLACE FUNCTION reset_monthly_free_questions()
RETURNS void AS $$
BEGIN
    UPDATE user_free_questions 
    SET 
        questions_used = 0,
        last_reset_date = NOW(),
        updated_at = NOW()
    WHERE 
        EXTRACT(MONTH FROM last_reset_date) != EXTRACT(MONTH FROM NOW()) 
        OR EXTRACT(YEAR FROM last_reset_date) != EXTRACT(YEAR FROM NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample data for existing users (if any)
INSERT INTO user_free_questions (user_id, questions_used, questions_limit, last_reset_date)
SELECT 
    id, 
    0, 
    5, 
    NOW()
FROM users 
WHERE id NOT IN (SELECT user_id FROM user_free_questions)
ON CONFLICT (user_id) DO NOTHING;
