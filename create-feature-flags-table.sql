-- Create feature_flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON public.feature_flags(name);

-- Enable Row Level Security (RLS)
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read feature flags
CREATE POLICY "Allow public read access" ON public.feature_flags
    FOR SELECT
    USING (true);

-- Insert default feature flags
INSERT INTO public.feature_flags (name, is_active, description) VALUES
    ('ai_doctor_enabled', true, 'Enable AI Doctor functionality'),
    ('telemedicine_enabled', true, 'Enable telemedicine features'),
    ('whatsapp_integration', true, 'Enable WhatsApp integration'),
    ('image_analysis', true, 'Enable medical image analysis'),
    ('premium_features', false, 'Enable premium subscription features')
ON CONFLICT (name) DO NOTHING;

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE
    ON public.feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();