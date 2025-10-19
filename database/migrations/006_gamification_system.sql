-- Gamification System Tables
-- This migration creates tables for health points, achievements, goals, and leaderboards

-- Health Points Table
CREATE TABLE IF NOT EXISTS health_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    total_points_earned INTEGER NOT NULL DEFAULT 0,
    streak_days INTEGER NOT NULL DEFAULT 0,
    last_activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Achievements Table (already exists, just ensure it has the right structure)
-- Note: achievements table already exists with different schema

-- User Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, achievement_id)
);

-- Health Goals Table
CREATE TABLE IF NOT EXISTS health_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_value DECIMAL(10,2),
    current_value DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(50),
    category VARCHAR(100),
    target_date DATE,
    points_reward INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Points Transactions Table
CREATE TABLE IF NOT EXISTS points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    transaction_type VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_health_points_user_id ON health_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_health_goals_user_id ON health_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_type ON points_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at);

-- Insert default achievements (using existing schema)
INSERT INTO achievements (id, name, description, icon, points, category, requirement_type, requirement_value, requirement_description, rarity, achievement_type, difficulty) VALUES
('first_consultation', 'Primera Consulta', 'Completa tu primera consulta con el doctor IA', '🩺', 50, 'health', 'consultations', 1, 'Completa 1 consulta', 'common', 'general', 'easy'),
('frequent_patient', 'Paciente Frecuente', 'Realiza 10 consultas', '👥', 200, 'health', 'consultations', 10, 'Completa 10 consultas', 'uncommon', 'general', 'medium'),
('health_expert', 'Experto en Salud', 'Realiza 50 consultas', '🏆', 500, 'health', 'consultations', 50, 'Completa 50 consultas', 'rare', 'general', 'hard'),
('streak_7_days', 'Racha de 7 Días', 'Usa el servicio 7 días consecutivos', '🔥', 100, 'engagement', 'streak_days', 7, 'Usa el servicio 7 días seguidos', 'common', 'streak', 'medium'),
('streak_30_days', 'Racha de 30 Días', 'Usa el servicio 30 días consecutivos', '🔥', 500, 'engagement', 'streak_days', 30, 'Usa el servicio 30 días seguidos', 'rare', 'streak', 'hard'),
('first_goal', 'Metas de Salud', 'Completa tu primera meta de salud', '🎯', 75, 'goals', 'goals_completed', 1, 'Completa 1 meta de salud', 'common', 'goals', 'easy'),
('committed', 'Comprometido', 'Completa 5 metas de salud', '💪', 300, 'goals', 'goals_completed', 5, 'Completa 5 metas de salud', 'uncommon', 'goals', 'medium'),
('collaborator', 'Colaborador', 'Responde 5 preguntas en el tablero Q&A', '💬', 150, 'community', 'answers', 5, 'Responde 5 preguntas', 'common', 'community', 'medium'),
('community_expert', 'Experto Comunitario', 'Responde 25 preguntas en el tablero Q&A', '🌟', 400, 'community', 'answers', 25, 'Responde 25 preguntas', 'rare', 'community', 'hard'),
('referrer', 'Referidor', 'Refiere a tu primer médico', '🤝', 100, 'referral', 'referrals', 1, 'Refiere a 1 médico', 'common', 'referral', 'easy')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS (Row Level Security)
ALTER TABLE health_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for health_points
CREATE POLICY "Users can view their own health points" ON health_points
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own health points" ON health_points
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all health points" ON health_points
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all user achievements" ON user_achievements
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for health_goals
CREATE POLICY "Users can view their own health goals" ON health_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health goals" ON health_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health goals" ON health_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all health goals" ON health_goals
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for points_transactions
CREATE POLICY "Users can view their own points transactions" ON points_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all points transactions" ON points_transactions
    FOR ALL USING (auth.role() = 'service_role');

-- Public read access for achievements
CREATE POLICY "Anyone can view achievements" ON achievements
    FOR SELECT USING (true);

-- Admin policies for achievements
CREATE POLICY "Admins can manage achievements" ON achievements
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM users WHERE role IN ('admin', 'provider')
    ));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_health_points_updated_at BEFORE UPDATE ON health_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_goals_updated_at BEFORE UPDATE ON health_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
