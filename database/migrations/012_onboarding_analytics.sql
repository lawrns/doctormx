-- Onboarding Analytics System Migration
-- Create comprehensive onboarding funnel tracking system

-- Doctor onboarding events table
CREATE TABLE IF NOT EXISTS doctor_onboarding_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(user_id) ON DELETE CASCADE,
  email VARCHAR(255),
  event_name VARCHAR(100) NOT NULL,
  event_data JSONB,
  session_id UUID,
  user_agent TEXT,
  ip_address VARCHAR(50),
  referrer VARCHAR(500),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_term VARCHAR(100),
  utm_content VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Onboarding funnel stages
CREATE TABLE IF NOT EXISTS onboarding_funnel_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stage_name VARCHAR(100) NOT NULL,
  stage_order INTEGER NOT NULL,
  stage_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Onboarding sessions
CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(user_id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  current_stage VARCHAR(100),
  total_time_minutes INTEGER,
  abandonment_reason VARCHAR(255),
  conversion_source VARCHAR(100),
  utm_data JSONB,
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  country VARCHAR(100),
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Onboarding conversion metrics
CREATE TABLE IF NOT EXISTS onboarding_conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(user_id) ON DELETE CASCADE,
  conversion_type VARCHAR(100) NOT NULL, -- 'signup', 'verification', 'subscription', 'first_consult'
  conversion_date TIMESTAMP DEFAULT NOW(),
  time_to_convert_minutes INTEGER,
  conversion_source VARCHAR(100),
  conversion_value DECIMAL(10,2),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- A/B test experiments
CREATE TABLE IF NOT EXISTS onboarding_experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_name VARCHAR(100) NOT NULL,
  experiment_description TEXT,
  variant_a_name VARCHAR(100),
  variant_b_name VARCHAR(100),
  traffic_split DECIMAL(3,2) DEFAULT 0.5,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP,
  success_metric VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- A/B test assignments
CREATE TABLE IF NOT EXISTS experiment_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID REFERENCES onboarding_experiments(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(user_id) ON DELETE CASCADE,
  variant VARCHAR(10) NOT NULL, -- 'A' or 'B'
  assigned_at TIMESTAMP DEFAULT NOW(),
  conversion_achieved BOOLEAN DEFAULT false,
  conversion_date TIMESTAMP,
  metadata JSONB
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_events_doctor_id ON doctor_onboarding_events(doctor_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_event_name ON doctor_onboarding_events(event_name);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_created_at ON doctor_onboarding_events(created_at);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_session_id ON doctor_onboarding_events(session_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_email ON doctor_onboarding_events(email);

CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_doctor_id ON onboarding_sessions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_session_id ON onboarding_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_started_at ON onboarding_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_current_stage ON onboarding_sessions(current_stage);

CREATE INDEX IF NOT EXISTS idx_onboarding_conversions_doctor_id ON onboarding_conversions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_conversions_conversion_type ON onboarding_conversions(conversion_type);
CREATE INDEX IF NOT EXISTS idx_onboarding_conversions_conversion_date ON onboarding_conversions(conversion_date);

CREATE INDEX IF NOT EXISTS idx_experiment_assignments_experiment_id ON experiment_assignments(experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_assignments_doctor_id ON experiment_assignments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_experiment_assignments_variant ON experiment_assignments(variant);

-- Enable Row Level Security
ALTER TABLE doctor_onboarding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_funnel_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for doctor_onboarding_events
CREATE POLICY IF NOT EXISTS "Doctors can view their own onboarding events" ON doctor_onboarding_events
  FOR SELECT USING (
    doctor_id IN (
      SELECT user_id FROM doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "System can manage all onboarding events" ON doctor_onboarding_events
  FOR ALL USING (true);

-- RLS Policies for onboarding_sessions
CREATE POLICY IF NOT EXISTS "Doctors can view their own onboarding sessions" ON onboarding_sessions
  FOR SELECT USING (
    doctor_id IN (
      SELECT user_id FROM doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "System can manage all onboarding sessions" ON onboarding_sessions
  FOR ALL USING (true);

-- RLS Policies for onboarding_conversions
CREATE POLICY IF NOT EXISTS "Doctors can view their own conversions" ON onboarding_conversions
  FOR SELECT USING (
    doctor_id IN (
      SELECT user_id FROM doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "System can manage all conversions" ON onboarding_conversions
  FOR ALL USING (true);

-- RLS Policies for other tables
CREATE POLICY IF NOT EXISTS "Anyone can view funnel stages" ON onboarding_funnel_stages
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "System can manage funnel stages" ON onboarding_funnel_stages
  FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Anyone can view experiments" ON onboarding_experiments
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "System can manage experiments" ON onboarding_experiments
  FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Doctors can view their own experiment assignments" ON experiment_assignments
  FOR SELECT USING (
    doctor_id IN (
      SELECT user_id FROM doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "System can manage experiment assignments" ON experiment_assignments
  FOR ALL USING (true);

-- Insert default funnel stages
INSERT INTO onboarding_funnel_stages (stage_name, stage_order, stage_description) VALUES
('landing_page_view', 1, 'Doctor visits landing page'),
('signup_started', 2, 'Doctor begins signup process'),
('signup_completed', 3, 'Doctor completes basic signup'),
('documents_uploaded', 4, 'Doctor uploads verification documents'),
('verification_completed', 5, 'Doctor verification completed'),
('subscription_started', 6, 'Doctor begins subscription process'),
('subscription_completed', 7, 'Doctor completes subscription'),
('first_login', 8, 'Doctor logs into dashboard'),
('first_consultation', 9, 'Doctor completes first consultation'),
('onboarding_complete', 10, 'Doctor fully onboarded')
ON CONFLICT DO NOTHING;

-- Create function to track onboarding event
CREATE OR REPLACE FUNCTION track_onboarding_event(
  p_doctor_id UUID,
  p_email VARCHAR(255),
  p_event_name VARCHAR(100),
  p_event_data JSONB DEFAULT NULL,
  p_session_id UUID DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address VARCHAR(50) DEFAULT NULL,
  p_referrer VARCHAR(500) DEFAULT NULL,
  p_utm_source VARCHAR(100) DEFAULT NULL,
  p_utm_medium VARCHAR(100) DEFAULT NULL,
  p_utm_campaign VARCHAR(100) DEFAULT NULL,
  p_utm_term VARCHAR(100) DEFAULT NULL,
  p_utm_content VARCHAR(100) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  -- Insert the event
  INSERT INTO doctor_onboarding_events (
    doctor_id,
    email,
    event_name,
    event_data,
    session_id,
    user_agent,
    ip_address,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content
  ) VALUES (
    p_doctor_id,
    p_email,
    p_event_name,
    p_event_data,
    p_session_id,
    p_user_agent,
    p_ip_address,
    p_referrer,
    p_utm_source,
    p_utm_medium,
    p_utm_campaign,
    p_utm_term,
    p_utm_content
  ) RETURNING id INTO event_id;

  -- Update or create onboarding session
  IF p_session_id IS NOT NULL THEN
    INSERT INTO onboarding_sessions (
      doctor_id,
      session_id,
      current_stage,
      utm_data,
      device_type,
      browser,
      os,
      country,
      city
    ) VALUES (
      p_doctor_id,
      p_session_id,
      p_event_name,
      jsonb_build_object(
        'utm_source', p_utm_source,
        'utm_medium', p_utm_medium,
        'utm_campaign', p_utm_campaign,
        'utm_term', p_utm_term,
        'utm_content', p_utm_content
      ),
      CASE 
        WHEN p_user_agent ILIKE '%mobile%' OR p_user_agent ILIKE '%android%' OR p_user_agent ILIKE '%iphone%' THEN 'mobile'
        WHEN p_user_agent ILIKE '%tablet%' OR p_user_agent ILIKE '%ipad%' THEN 'tablet'
        ELSE 'desktop'
      END,
      CASE 
        WHEN p_user_agent ILIKE '%chrome%' THEN 'Chrome'
        WHEN p_user_agent ILIKE '%firefox%' THEN 'Firefox'
        WHEN p_user_agent ILIKE '%safari%' THEN 'Safari'
        WHEN p_user_agent ILIKE '%edge%' THEN 'Edge'
        ELSE 'Other'
      END,
      CASE 
        WHEN p_user_agent ILIKE '%windows%' THEN 'Windows'
        WHEN p_user_agent ILIKE '%mac%' THEN 'macOS'
        WHEN p_user_agent ILIKE '%linux%' THEN 'Linux'
        WHEN p_user_agent ILIKE '%android%' THEN 'Android'
        WHEN p_user_agent ILIKE '%iphone%' OR p_user_agent ILIKE '%ipad%' THEN 'iOS'
        ELSE 'Other'
      END,
      'Unknown', -- Country (would need IP geolocation service)
      'Unknown'  -- City (would need IP geolocation service)
    )
    ON CONFLICT (session_id) DO UPDATE SET
      current_stage = p_event_name,
      updated_at = NOW();
  END IF;

  RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get onboarding funnel metrics
CREATE OR REPLACE FUNCTION get_onboarding_funnel_metrics(
  p_start_date TIMESTAMP DEFAULT NULL,
  p_end_date TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
  stage_name VARCHAR(100),
  stage_order INTEGER,
  total_events BIGINT,
  unique_doctors BIGINT,
  conversion_rate DECIMAL(5,2),
  dropoff_rate DECIMAL(5,2),
  avg_time_minutes DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH stage_metrics AS (
    SELECT 
      ofs.stage_name,
      ofs.stage_order,
      COUNT(doe.id) as total_events,
      COUNT(DISTINCT doe.doctor_id) as unique_doctors,
      AVG(EXTRACT(EPOCH FROM (doe.created_at - os.started_at)) / 60) as avg_time_minutes
    FROM onboarding_funnel_stages ofs
    LEFT JOIN doctor_onboarding_events doe ON ofs.stage_name = doe.event_name
    LEFT JOIN onboarding_sessions os ON doe.session_id = os.session_id
    WHERE ofs.is_active = true
      AND (p_start_date IS NULL OR doe.created_at >= p_start_date)
      AND (p_end_date IS NULL OR doe.created_at <= p_end_date)
    GROUP BY ofs.stage_name, ofs.stage_order
    ORDER BY ofs.stage_order
  ),
  conversion_rates AS (
    SELECT 
      sm.stage_name,
      sm.stage_order,
      sm.total_events,
      sm.unique_doctors,
      sm.avg_time_minutes,
      CASE 
        WHEN LAG(sm.unique_doctors) OVER (ORDER BY sm.stage_order) > 0 
        THEN ROUND((sm.unique_doctors::DECIMAL / LAG(sm.unique_doctors) OVER (ORDER BY sm.stage_order)) * 100, 2)
        ELSE 100.00
      END as conversion_rate,
      CASE 
        WHEN LAG(sm.unique_doctors) OVER (ORDER BY sm.stage_order) > 0 
        THEN ROUND(((LAG(sm.unique_doctors) OVER (ORDER BY sm.stage_order) - sm.unique_doctors)::DECIMAL / LAG(sm.unique_doctors) OVER (ORDER BY sm.stage_order)) * 100, 2)
        ELSE 0.00
      END as dropoff_rate
    FROM stage_metrics sm
  )
  SELECT 
    cr.stage_name,
    cr.stage_order,
    cr.total_events,
    cr.unique_doctors,
    cr.conversion_rate,
    cr.dropoff_rate,
    cr.avg_time_minutes
  FROM conversion_rates cr
  ORDER BY cr.stage_order;
END;
$$ LANGUAGE plpgsql;

-- Create function to get doctor acquisition stats
CREATE OR REPLACE FUNCTION get_doctor_acquisition_stats(
  p_start_date TIMESTAMP DEFAULT NULL,
  p_end_date TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
  date DATE,
  new_signups BIGINT,
  completed_onboarding BIGINT,
  active_subscriptions BIGINT,
  first_consultations BIGINT,
  conversion_rate DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH daily_stats AS (
    SELECT 
      DATE(doe.created_at) as date,
      COUNT(DISTINCT CASE WHEN doe.event_name = 'signup_completed' THEN doe.doctor_id END) as new_signups,
      COUNT(DISTINCT CASE WHEN doe.event_name = 'onboarding_complete' THEN doe.doctor_id END) as completed_onboarding,
      COUNT(DISTINCT CASE WHEN doe.event_name = 'subscription_completed' THEN doe.doctor_id END) as active_subscriptions,
      COUNT(DISTINCT CASE WHEN doe.event_name = 'first_consultation' THEN doe.doctor_id END) as first_consultations
    FROM doctor_onboarding_events doe
    WHERE (p_start_date IS NULL OR doe.created_at >= p_start_date)
      AND (p_end_date IS NULL OR doe.created_at <= p_end_date)
    GROUP BY DATE(doe.created_at)
  )
  SELECT 
    ds.date,
    ds.new_signups,
    ds.completed_onboarding,
    ds.active_subscriptions,
    ds.first_consultations,
    CASE 
      WHEN ds.new_signups > 0 
      THEN ROUND((ds.completed_onboarding::DECIMAL / ds.new_signups) * 100, 2)
      ELSE 0.00
    END as conversion_rate
  FROM daily_stats ds
  ORDER BY ds.date DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to identify dropoff points
CREATE OR REPLACE FUNCTION identify_dropoff_points(
  p_start_date TIMESTAMP DEFAULT NULL,
  p_end_date TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
  stage_name VARCHAR(100),
  stage_order INTEGER,
  dropoff_count BIGINT,
  dropoff_rate DECIMAL(5,2),
  common_reasons TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  WITH stage_dropoffs AS (
    SELECT 
      ofs.stage_name,
      ofs.stage_order,
      COUNT(DISTINCT os.doctor_id) as dropoff_count,
      ROUND(
        (COUNT(DISTINCT os.doctor_id)::DECIMAL / 
         (SELECT COUNT(DISTINCT doctor_id) FROM onboarding_sessions 
          WHERE (p_start_date IS NULL OR started_at >= p_start_date)
            AND (p_end_date IS NULL OR started_at <= p_end_date))) * 100, 2
      ) as dropoff_rate
    FROM onboarding_funnel_stages ofs
    LEFT JOIN onboarding_sessions os ON ofs.stage_name = os.current_stage
    WHERE ofs.is_active = true
      AND os.completed_at IS NULL
      AND (p_start_date IS NULL OR os.started_at >= p_start_date)
      AND (p_end_date IS NULL OR os.started_at <= p_end_date)
    GROUP BY ofs.stage_name, ofs.stage_order
  )
  SELECT 
    sd.stage_name,
    sd.stage_order,
    sd.dropoff_count,
    sd.dropoff_rate,
    ARRAY['Session timeout', 'Technical issues', 'Complexity', 'Payment concerns'] as common_reasons
  FROM stage_dropoffs sd
  WHERE sd.dropoff_count > 0
  ORDER BY sd.dropoff_rate DESC;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE doctor_onboarding_events IS 'Individual events tracked during doctor onboarding process';
COMMENT ON TABLE onboarding_funnel_stages IS 'Defined stages in the onboarding funnel';
COMMENT ON TABLE onboarding_sessions IS 'Complete onboarding sessions with metadata';
COMMENT ON TABLE onboarding_conversions IS 'Conversion events and their values';
COMMENT ON TABLE onboarding_experiments IS 'A/B test experiments for onboarding optimization';
COMMENT ON TABLE experiment_assignments IS 'Individual doctor assignments to experiment variants';

COMMENT ON COLUMN doctor_onboarding_events.event_name IS 'Name of the onboarding event (signup_started, verification_completed, etc.)';
COMMENT ON COLUMN doctor_onboarding_events.event_data IS 'Additional data about the event';
COMMENT ON COLUMN doctor_onboarding_events.session_id IS 'Session identifier for grouping related events';
COMMENT ON COLUMN onboarding_sessions.current_stage IS 'Current stage in the onboarding process';
COMMENT ON COLUMN onboarding_sessions.total_time_minutes IS 'Total time spent in onboarding session';
COMMENT ON COLUMN onboarding_sessions.abandonment_reason IS 'Reason for abandoning the onboarding process';
COMMENT ON COLUMN onboarding_conversions.conversion_type IS 'Type of conversion (signup, verification, subscription, etc.)';
COMMENT ON COLUMN onboarding_conversions.time_to_convert_minutes IS 'Time taken to achieve this conversion';
COMMENT ON COLUMN onboarding_conversions.conversion_value IS 'Monetary value of the conversion';
