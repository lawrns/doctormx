-- Q&A Board System Migration
-- Creates tables for anonymous Q&A with moderation

-- Create public_questions table
CREATE TABLE IF NOT EXISTS public_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    author_name TEXT,
    author_email TEXT,
    is_anonymous BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
    moderation_notes TEXT,
    moderated_by UUID REFERENCES users(id),
    moderated_at TIMESTAMP WITH TIME ZONE,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create public_answers table
CREATE TABLE IF NOT EXISTS public_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public_questions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_name TEXT,
    author_email TEXT,
    is_anonymous BOOLEAN DEFAULT true,
    is_verified_doctor BOOLEAN DEFAULT false,
    doctor_id UUID REFERENCES doctors(user_id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
    moderation_notes TEXT,
    moderated_by UUID REFERENCES users(id),
    moderated_at TIMESTAMP WITH TIME ZONE,
    likes_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create question_likes table
CREATE TABLE IF NOT EXISTS question_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public_questions(id) ON DELETE CASCADE,
    user_ip INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(question_id, user_ip)
);

-- Create answer_likes table
CREATE TABLE IF NOT EXISTS answer_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    answer_id UUID NOT NULL REFERENCES public_answers(id) ON DELETE CASCADE,
    user_ip INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(answer_id, user_ip)
);

-- Create answer_helpful table
CREATE TABLE IF NOT EXISTS answer_helpful (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    answer_id UUID NOT NULL REFERENCES public_answers(id) ON DELETE CASCADE,
    user_ip INET,
    user_agent TEXT,
    helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(answer_id, user_ip)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_public_questions_status ON public_questions(status);
CREATE INDEX IF NOT EXISTS idx_public_questions_category ON public_questions(category);
CREATE INDEX IF NOT EXISTS idx_public_questions_created_at ON public_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_questions_views ON public_questions(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_public_questions_likes ON public_questions(likes_count DESC);

CREATE INDEX IF NOT EXISTS idx_public_answers_question_id ON public_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_public_answers_status ON public_answers(status);
CREATE INDEX IF NOT EXISTS idx_public_answers_doctor_id ON public_answers(doctor_id);
CREATE INDEX IF NOT EXISTS idx_public_answers_created_at ON public_answers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_answers_helpful ON public_answers(helpful_count DESC);

CREATE INDEX IF NOT EXISTS idx_question_likes_question_id ON question_likes(question_id);
CREATE INDEX IF NOT EXISTS idx_answer_likes_answer_id ON answer_likes(answer_id);
CREATE INDEX IF NOT EXISTS idx_answer_helpful_answer_id ON answer_helpful(answer_id);

-- Enable RLS
ALTER TABLE public_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_helpful ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public_questions
CREATE POLICY "Anyone can view approved questions" ON public_questions
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Anyone can create questions" ON public_questions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Moderators can manage questions" ON public_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'provider')
        )
    );

-- RLS Policies for public_answers
CREATE POLICY "Anyone can view approved answers" ON public_answers
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Anyone can create answers" ON public_answers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Moderators can manage answers" ON public_answers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'provider')
        )
    );

-- RLS Policies for question_likes
CREATE POLICY "Anyone can like questions" ON question_likes
    FOR ALL USING (true);

-- RLS Policies for answer_likes
CREATE POLICY "Anyone can like answers" ON answer_likes
    FOR ALL USING (true);

-- RLS Policies for answer_helpful
CREATE POLICY "Anyone can rate answers" ON answer_helpful
    FOR ALL USING (true);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_public_questions_updated_at 
    BEFORE UPDATE ON public_questions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_public_answers_updated_at 
    BEFORE UPDATE ON public_answers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update likes count
CREATE OR REPLACE FUNCTION update_question_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public_questions 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.question_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public_questions 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.question_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_question_likes_count_trigger
    AFTER INSERT OR DELETE ON question_likes
    FOR EACH ROW EXECUTE FUNCTION update_question_likes_count();

-- Create function to update answer likes count
CREATE OR REPLACE FUNCTION update_answer_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public_answers 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.answer_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public_answers 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.answer_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_answer_likes_count_trigger
    AFTER INSERT OR DELETE ON answer_likes
    FOR EACH ROW EXECUTE FUNCTION update_answer_likes_count();

-- Create function to update answer helpful count
CREATE OR REPLACE FUNCTION update_answer_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public_answers 
        SET helpful_count = helpful_count + CASE WHEN NEW.helpful THEN 1 ELSE -1 END
        WHERE id = NEW.answer_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE public_answers 
        SET helpful_count = helpful_count + CASE WHEN NEW.helpful THEN 1 ELSE -1 END
                                   - CASE WHEN OLD.helpful THEN 1 ELSE -1 END
        WHERE id = NEW.answer_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public_answers 
        SET helpful_count = helpful_count - CASE WHEN OLD.helpful THEN 1 ELSE -1 END
        WHERE id = OLD.answer_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_answer_helpful_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON answer_helpful
    FOR EACH ROW EXECUTE FUNCTION update_answer_helpful_count();

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_question_views(question_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public_questions 
    SET views_count = views_count + 1 
    WHERE id = question_uuid AND status = 'approved';
END;
$$ language 'plpgsql';

-- Insert sample categories
INSERT INTO public_questions (title, content, category, tags, author_name, status) VALUES
('¿Qué hacer si tengo fiebre alta?', 'He tenido fiebre de 39°C por 2 días. ¿Debería preocuparme?', 'emergency', ARRAY['fiebre', 'urgencia'], 'Usuario Anónimo', 'approved'),
('¿Cuándo debo ir al médico por dolor de cabeza?', 'Tengo dolores de cabeza frecuentes. ¿En qué casos debo consultar?', 'general', ARRAY['dolor de cabeza', 'consulta'], 'María G.', 'approved'),
('¿Es normal el dolor después de una cirugía?', 'Me operaron hace una semana y aún tengo dolor. ¿Es normal?', 'post-surgery', ARRAY['cirugía', 'dolor postoperatorio'], 'Usuario Anónimo', 'approved')
ON CONFLICT DO NOTHING;

-- Insert sample answers
INSERT INTO public_answers (question_id, content, author_name, is_verified_doctor, status) 
SELECT 
    pq.id,
    'La fiebre alta requiere atención médica inmediata. Si persiste por más de 24-48 horas o supera los 38.5°C, consulta a un médico.',
    'Dr. Ana López',
    true,
    'approved'
FROM public_questions pq 
WHERE pq.title = '¿Qué hacer si tengo fiebre alta?'
ON CONFLICT DO NOTHING;

INSERT INTO public_answers (question_id, content, author_name, is_verified_doctor, status) 
SELECT 
    pq.id,
    'Los dolores de cabeza frecuentes pueden tener varias causas. Consulta si son intensos, acompañados de otros síntomas o interfieren con tu vida diaria.',
    'Dr. Carlos Méndez',
    true,
    'approved'
FROM public_questions pq 
WHERE pq.title = '¿Cuándo debo ir al médico por dolor de cabeza?'
ON CONFLICT DO NOTHING;

-- Create view for public Q&A with answers
CREATE OR REPLACE VIEW public_qa_with_answers AS
SELECT 
    q.id as question_id,
    q.title,
    q.content as question_content,
    q.category,
    q.tags,
    q.author_name as question_author,
    q.is_anonymous as question_anonymous,
    q.views_count,
    q.likes_count as question_likes,
    q.created_at as question_created_at,
    a.id as answer_id,
    a.content as answer_content,
    a.author_name as answer_author,
    a.is_anonymous as answer_anonymous,
    a.is_verified_doctor,
    a.doctor_id,
    a.likes_count as answer_likes,
    a.helpful_count,
    a.created_at as answer_created_at
FROM public_questions q
LEFT JOIN public_answers a ON q.id = a.question_id AND a.status = 'approved'
WHERE q.status = 'approved'
ORDER BY q.created_at DESC, a.helpful_count DESC, a.created_at ASC;

-- Grant permissions
GRANT SELECT ON public_qa_with_answers TO anon, authenticated;
GRANT ALL ON public_questions TO anon, authenticated;
GRANT ALL ON public_answers TO anon, authenticated;
GRANT ALL ON question_likes TO anon, authenticated;
GRANT ALL ON answer_likes TO anon, authenticated;
GRANT ALL ON answer_helpful TO anon, authenticated;
