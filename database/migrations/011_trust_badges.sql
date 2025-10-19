-- Trust Badges System Migration
-- Create comprehensive trust badge system for doctors

-- Doctor badges table
CREATE TABLE IF NOT EXISTS doctor_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(user_id) ON DELETE CASCADE,
  badge_type VARCHAR(100) NOT NULL,
  badge_level VARCHAR(50) DEFAULT 'standard',
  badge_title VARCHAR(255) NOT NULL,
  badge_description TEXT,
  badge_icon VARCHAR(100),
  badge_color VARCHAR(50) DEFAULT 'blue',
  criteria_met JSONB,
  earned_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Badge categories for organization
CREATE TABLE IF NOT EXISTS badge_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_name VARCHAR(100) NOT NULL,
  category_description TEXT,
  category_color VARCHAR(50) DEFAULT 'gray',
  category_icon VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Badge criteria definitions
CREATE TABLE IF NOT EXISTS badge_criteria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge_type VARCHAR(100) NOT NULL,
  criteria_name VARCHAR(100) NOT NULL,
  criteria_description TEXT,
  criteria_type VARCHAR(50) NOT NULL, -- 'threshold', 'boolean', 'date_range'
  criteria_value JSONB,
  is_required BOOLEAN DEFAULT true,
  weight DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Badge audit trail
CREATE TABLE IF NOT EXISTS badge_audit_trail (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(user_id) ON DELETE CASCADE,
  badge_id UUID REFERENCES doctor_badges(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'earned', 'revoked', 'updated', 'expired'
  old_values JSONB,
  new_values JSONB,
  reason TEXT,
  triggered_by VARCHAR(100), -- 'system', 'admin', 'manual'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_doctor_badges_doctor_id ON doctor_badges(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_badges_badge_type ON doctor_badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_doctor_badges_is_active ON doctor_badges(is_active);
CREATE INDEX IF NOT EXISTS idx_doctor_badges_earned_at ON doctor_badges(earned_at);
CREATE INDEX IF NOT EXISTS idx_doctor_badges_expires_at ON doctor_badges(expires_at);

CREATE INDEX IF NOT EXISTS idx_badge_criteria_badge_type ON badge_criteria(badge_type);
CREATE INDEX IF NOT EXISTS idx_badge_criteria_is_required ON badge_criteria(is_required);

CREATE INDEX IF NOT EXISTS idx_badge_audit_trail_doctor_id ON badge_audit_trail(doctor_id);
CREATE INDEX IF NOT EXISTS idx_badge_audit_trail_badge_id ON badge_audit_trail(badge_id);
CREATE INDEX IF NOT EXISTS idx_badge_audit_trail_action ON badge_audit_trail(action);
CREATE INDEX IF NOT EXISTS idx_badge_audit_trail_created_at ON badge_audit_trail(created_at);

-- Enable Row Level Security
ALTER TABLE doctor_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_audit_trail ENABLE ROW LEVEL SECURITY;

-- RLS Policies for doctor_badges
CREATE POLICY IF NOT EXISTS "Anyone can view active badges" ON doctor_badges
  FOR SELECT USING (is_active = true);

CREATE POLICY IF NOT EXISTS "Doctors can view their own badges" ON doctor_badges
  FOR SELECT USING (
    doctor_id IN (
      SELECT user_id FROM doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "System can manage all badges" ON doctor_badges
  FOR ALL USING (true);

-- RLS Policies for badge_categories
CREATE POLICY IF NOT EXISTS "Anyone can view badge categories" ON badge_categories
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "System can manage badge categories" ON badge_categories
  FOR ALL USING (true);

-- RLS Policies for badge_criteria
CREATE POLICY IF NOT EXISTS "Anyone can view badge criteria" ON badge_criteria
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "System can manage badge criteria" ON badge_criteria
  FOR ALL USING (true);

-- RLS Policies for badge_audit_trail
CREATE POLICY IF NOT EXISTS "Doctors can view their own badge audit trail" ON badge_audit_trail
  FOR SELECT USING (
    doctor_id IN (
      SELECT user_id FROM doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "System can manage badge audit trail" ON badge_audit_trail
  FOR ALL USING (true);

-- Insert default badge categories
INSERT INTO badge_categories (category_name, category_description, category_color, category_icon, display_order) VALUES
('verification', 'Verification and Credentials', 'blue', 'shield-check', 1),
('performance', 'Performance and Quality', 'green', 'star', 2),
('experience', 'Experience and Expertise', 'purple', 'academic-cap', 3),
('engagement', 'Patient Engagement', 'orange', 'heart', 4),
('compliance', 'Compliance and Security', 'red', 'lock-closed', 5)
ON CONFLICT DO NOTHING;

-- Insert default badge criteria
INSERT INTO badge_criteria (badge_type, criteria_name, criteria_description, criteria_type, criteria_value, is_required, weight) VALUES
-- SEP Verified Badge
('sep_verified', 'cedula_verified', 'Cédula profesional verificada con SEP', 'boolean', '{"value": true}', true, 1.0),
('sep_verified', 'license_active', 'Licencia médica activa', 'boolean', '{"value": true}', true, 1.0),

-- Top Rated Badge
('top_rated', 'average_rating', 'Calificación promedio alta', 'threshold', '{"min": 4.5}', true, 1.0),
('top_rated', 'review_count', 'Número mínimo de reseñas', 'threshold', '{"min": 20}', true, 1.0),

-- Fast Responder Badge
('fast_responder', 'response_time', 'Tiempo de respuesta promedio', 'threshold', '{"max_minutes": 15}', true, 1.0),
('fast_responder', 'response_consistency', 'Consistencia en tiempos de respuesta', 'threshold', '{"min_percentage": 80}', false, 0.5),

-- Highly Experienced Badge
('highly_experienced', 'consultation_count', 'Número de consultas completadas', 'threshold', '{"min": 100}', true, 1.0),
('highly_experienced', 'months_active', 'Meses activo en la plataforma', 'threshold', '{"min": 6}', false, 0.3),

-- Active Subscription Badge
('active_subscription', 'subscription_status', 'Suscripción activa', 'boolean', '{"value": "active"}', true, 1.0),
('active_subscription', 'payment_current', 'Pagos al día', 'boolean', '{"value": true}', true, 1.0),

-- Specialty Expert Badge
('specialty_expert', 'specialty_experience', 'Experiencia en especialidad', 'threshold', '{"min_years": 5}', false, 0.7),
('specialty_expert', 'specialty_consultations', 'Consultas en especialidad', 'threshold', '{"min": 50}', true, 1.0),

-- Patient Favorite Badge
('patient_favorite', 'repeat_patients', 'Pacientes recurrentes', 'threshold', '{"min_percentage": 30}', false, 0.8),
('patient_favorite', 'patient_recommendations', 'Recomendaciones de pacientes', 'threshold', '{"min": 10}', false, 0.6),

-- Compliance Champion Badge
('compliance_champion', 'nom_compliance', 'Cumplimiento NOM', 'boolean', '{"value": true}', true, 1.0),
('compliance_champion', 'privacy_compliance', 'Cumplimiento de privacidad', 'boolean', '{"value": true}', true, 1.0),

-- Early Adopter Badge
('early_adopter', 'join_date', 'Fecha de registro temprana', 'date_range', '{"before": "2024-06-01"}', true, 1.0),
('early_adopter', 'platform_contributions', 'Contribuciones a la plataforma', 'threshold', '{"min": 5}', false, 0.4)
ON CONFLICT DO NOTHING;

-- Create function to calculate doctor badges
CREATE OR REPLACE FUNCTION calculate_doctor_badges(doctor_uuid UUID)
RETURNS TABLE (
  badge_type VARCHAR(100),
  badge_title VARCHAR(255),
  badge_description TEXT,
  badge_icon VARCHAR(100),
  badge_color VARCHAR(50),
  criteria_met JSONB,
  earned_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  WITH doctor_data AS (
    SELECT 
      d.user_id,
      d.license_status,
      d.subscription_status,
      d.created_at as doctor_created_at,
      ds.average_rating,
      ds.total_reviews,
      ds.total_consultations,
      ds.response_time_avg_minutes,
      u.created_at as user_created_at
    FROM doctors d
    LEFT JOIN doctor_stats ds ON d.user_id = ds.doctor_id
    LEFT JOIN users u ON d.user_id = u.id
    WHERE d.user_id = doctor_uuid
  ),
  badge_calculations AS (
    SELECT 
      'sep_verified' as badge_type,
      'SEP Verificado' as badge_title,
      'Cédula profesional verificada con la Secretaría de Educación Pública' as badge_description,
      'shield-check' as badge_icon,
      'blue' as badge_color,
      jsonb_build_object(
        'cedula_verified', (dd.license_status = 'verified'),
        'license_active', (dd.license_status = 'verified')
      ) as criteria_met,
      CASE 
        WHEN dd.license_status = 'verified' THEN NOW()
        ELSE NULL
      END as earned_at
    FROM doctor_data dd
    
    UNION ALL
    
    SELECT 
      'top_rated' as badge_type,
      'Top Rated' as badge_title,
      'Calificación promedio de 4.5+ estrellas con 20+ reseñas' as badge_description,
      'star' as badge_icon,
      'gold' as badge_color,
      jsonb_build_object(
        'average_rating', COALESCE(dd.average_rating, 0),
        'review_count', COALESCE(dd.total_reviews, 0),
        'meets_criteria', (COALESCE(dd.average_rating, 0) >= 4.5 AND COALESCE(dd.total_reviews, 0) >= 20)
      ) as criteria_met,
      CASE 
        WHEN COALESCE(dd.average_rating, 0) >= 4.5 AND COALESCE(dd.total_reviews, 0) >= 20 THEN NOW()
        ELSE NULL
      END as earned_at
    FROM doctor_data dd
    
    UNION ALL
    
    SELECT 
      'fast_responder' as badge_type,
      'Fast Responder' as badge_title,
      'Tiempo de respuesta promedio menor a 15 minutos' as badge_description,
      'bolt' as badge_icon,
      'green' as badge_color,
      jsonb_build_object(
        'response_time_minutes', COALESCE(dd.response_time_avg_minutes, 0),
        'meets_criteria', (COALESCE(dd.response_time_avg_minutes, 0) > 0 AND COALESCE(dd.response_time_avg_minutes, 0) <= 15)
      ) as criteria_met,
      CASE 
        WHEN COALESCE(dd.response_time_avg_minutes, 0) > 0 AND COALESCE(dd.response_time_avg_minutes, 0) <= 15 THEN NOW()
        ELSE NULL
      END as earned_at
    FROM doctor_data dd
    
    UNION ALL
    
    SELECT 
      'highly_experienced' as badge_type,
      'Highly Experienced' as badge_title,
      '100+ consultas completadas en la plataforma' as badge_description,
      'academic-cap' as badge_icon,
      'purple' as badge_color,
      jsonb_build_object(
        'consultation_count', COALESCE(dd.total_consultations, 0),
        'months_active', EXTRACT(MONTH FROM AGE(NOW(), dd.doctor_created_at)),
        'meets_criteria', (COALESCE(dd.total_consultations, 0) >= 100)
      ) as criteria_met,
      CASE 
        WHEN COALESCE(dd.total_consultations, 0) >= 100 THEN NOW()
        ELSE NULL
      END as earned_at
    FROM doctor_data dd
    
    UNION ALL
    
    SELECT 
      'active_subscription' as badge_type,
      'Active Subscription' as badge_title,
      'Suscripción activa y pagos al día' as badge_description,
      'credit-card' as badge_icon,
      'green' as badge_color,
      jsonb_build_object(
        'subscription_status', dd.subscription_status,
        'meets_criteria', (dd.subscription_status = 'active')
      ) as criteria_met,
      CASE 
        WHEN dd.subscription_status = 'active' THEN NOW()
        ELSE NULL
      END as earned_at
    FROM doctor_data dd
    
    UNION ALL
    
    SELECT 
      'early_adopter' as badge_type,
      'Early Adopter' as badge_title,
      'Miembro fundador de Doctor.mx' as badge_description,
      'rocket-launch' as badge_icon,
      'orange' as badge_color,
      jsonb_build_object(
        'join_date', dd.user_created_at,
        'meets_criteria', (dd.user_created_at < '2024-06-01'::timestamp)
      ) as criteria_met,
      CASE 
        WHEN dd.user_created_at < '2024-06-01'::timestamp THEN NOW()
        ELSE NULL
      END as earned_at
    FROM doctor_data dd
  )
  SELECT 
    bc.badge_type,
    bc.badge_title,
    bc.badge_description,
    bc.badge_icon,
    bc.badge_color,
    bc.criteria_met,
    bc.earned_at
  FROM badge_calculations bc
  WHERE bc.earned_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to update doctor badges
CREATE OR REPLACE FUNCTION update_doctor_badges(doctor_uuid UUID)
RETURNS VOID AS $$
DECLARE
  badge_record RECORD;
  existing_badge UUID;
BEGIN
  -- Get current badges for this doctor
  FOR badge_record IN SELECT * FROM calculate_doctor_badges(doctor_uuid) LOOP
    -- Check if badge already exists
    SELECT id INTO existing_badge
    FROM doctor_badges
    WHERE doctor_id = doctor_uuid 
      AND badge_type = badge_record.badge_type
      AND is_active = true;
    
    IF existing_badge IS NULL THEN
      -- Insert new badge
      INSERT INTO doctor_badges (
        doctor_id,
        badge_type,
        badge_title,
        badge_description,
        badge_icon,
        badge_color,
        criteria_met,
        earned_at,
        is_active
      ) VALUES (
        doctor_uuid,
        badge_record.badge_type,
        badge_record.badge_title,
        badge_record.badge_description,
        badge_record.badge_icon,
        badge_record.badge_color,
        badge_record.criteria_met,
        badge_record.earned_at,
        true
      );
      
      -- Log badge earned
      INSERT INTO badge_audit_trail (
        doctor_id,
        badge_id,
        action,
        new_values,
        triggered_by
      ) VALUES (
        doctor_uuid,
        (SELECT id FROM doctor_badges WHERE doctor_id = doctor_uuid AND badge_type = badge_record.badge_type ORDER BY earned_at DESC LIMIT 1),
        'earned',
        badge_record.criteria_met,
        'system'
      );
    END IF;
  END LOOP;
  
  -- Deactivate badges that no longer meet criteria
  UPDATE doctor_badges
  SET is_active = false, updated_at = NOW()
  WHERE doctor_id = doctor_uuid
    AND is_active = true
    AND badge_type NOT IN (
      SELECT badge_type FROM calculate_doctor_badges(doctor_uuid)
    );
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update badges when doctor stats change
CREATE OR REPLACE FUNCTION trigger_update_doctor_badges()
RETURNS TRIGGER AS $$
BEGIN
  -- Update badges for the affected doctor
  PERFORM update_doctor_badges(NEW.doctor_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on doctor_stats table
DROP TRIGGER IF EXISTS trigger_doctor_stats_badges ON doctor_stats;
CREATE TRIGGER trigger_doctor_stats_badges
  AFTER INSERT OR UPDATE ON doctor_stats
  FOR EACH ROW EXECUTE FUNCTION trigger_update_doctor_badges();

-- Create trigger on doctors table
DROP TRIGGER IF EXISTS trigger_doctors_badges ON doctors;
CREATE TRIGGER trigger_doctors_badges
  AFTER INSERT OR UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION trigger_update_doctor_badges();

-- Add comments for documentation
COMMENT ON TABLE doctor_badges IS 'Trust badges earned by doctors based on various criteria';
COMMENT ON TABLE badge_categories IS 'Categories for organizing different types of badges';
COMMENT ON TABLE badge_criteria IS 'Criteria definitions for earning specific badges';
COMMENT ON TABLE badge_audit_trail IS 'Audit trail for badge changes and updates';

COMMENT ON COLUMN doctor_badges.badge_type IS 'Type of badge (sep_verified, top_rated, etc.)';
COMMENT ON COLUMN doctor_badges.badge_level IS 'Level of badge (standard, premium, elite)';
COMMENT ON COLUMN doctor_badges.criteria_met IS 'JSON object showing which criteria were met';
COMMENT ON COLUMN doctor_badges.expires_at IS 'Expiration date for time-limited badges';
COMMENT ON COLUMN doctor_badges.display_order IS 'Order for displaying badges on profile';
