-- Fix health_scores table for gamification system
-- This migration creates the health_scores table with the correct schema

-- Health Scores Table (for gamification)
CREATE TABLE IF NOT EXISTS health_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_health_scores_user_id ON health_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_health_scores_score ON health_scores(score);

-- Enable RLS (Row Level Security)
ALTER TABLE health_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for health_scores
CREATE POLICY "Users can view their own health scores" ON health_scores
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own health scores" ON health_scores
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all health scores" ON health_scores
    FOR ALL USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_health_scores_updated_at BEFORE UPDATE ON health_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
