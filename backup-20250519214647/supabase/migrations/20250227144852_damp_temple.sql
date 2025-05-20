/*
  # Dentist Database Schema

  1. New Tables
    - `dentists`
      - Core dentist information including name, contact details, location
    - `dentist_services`
      - Services/treatments offered by each dentist
    - `dentist_reviews`
      - Patient reviews and ratings
    - `dentist_images`
      - Images associated with dentist profiles
    - `dentist_prices`
      - Price ranges for different treatments
    - `dentist_insurances`
      - Insurance providers accepted by dentists
    - `dentist_languages`
      - Languages spoken by dentists

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for public read access where appropriate

  3. Changes
    - Create initial schema with all required tables
    - Set up relationships between tables
    - Add indexes for performance
*/

-- Create dentists table
CREATE TABLE IF NOT EXISTS dentists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_name text NOT NULL,
  clinic_id text,
  address text,
  phone text,
  description text,
  has_review boolean DEFAULT false,
  review_rating decimal(2,1),
  review_quote text,
  review_text text,
  review_person text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  location text,
  is_verified boolean DEFAULT false,
  is_premium boolean DEFAULT false,
  website text,
  email text,
  latitude decimal(10,8),
  longitude decimal(11,8)
);

-- Create dentist_services table
CREATE TABLE IF NOT EXISTS dentist_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id uuid REFERENCES dentists(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create dentist_prices table
CREATE TABLE IF NOT EXISTS dentist_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id uuid REFERENCES dentists(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  price_min decimal(10,2),
  price_max decimal(10,2),
  created_at timestamptz DEFAULT now()
);

-- Create dentist_reviews table
CREATE TABLE IF NOT EXISTS dentist_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id uuid REFERENCES dentists(id) ON DELETE CASCADE,
  rating decimal(2,1) NOT NULL,
  review_text text,
  reviewer_name text,
  reviewer_location text,
  review_date date,
  created_at timestamptz DEFAULT now()
);

-- Create dentist_images table
CREATE TABLE IF NOT EXISTS dentist_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id uuid REFERENCES dentists(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_type text,
  created_at timestamptz DEFAULT now()
);

-- Create dentist_insurances table
CREATE TABLE IF NOT EXISTS dentist_insurances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id uuid REFERENCES dentists(id) ON DELETE CASCADE,
  insurance_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create dentist_languages table
CREATE TABLE IF NOT EXISTS dentist_languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id uuid REFERENCES dentists(id) ON DELETE CASCADE,
  language_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE dentists ENABLE ROW LEVEL SECURITY;
ALTER TABLE dentist_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE dentist_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE dentist_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE dentist_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE dentist_insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE dentist_languages ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Public read access for dentists
CREATE POLICY "Public can view dentists"
  ON dentists
  FOR SELECT
  TO public
  USING (true);

-- Public read access for services
CREATE POLICY "Public can view services"
  ON dentist_services
  FOR SELECT
  TO public
  USING (true);

-- Public read access for prices
CREATE POLICY "Public can view prices"
  ON dentist_prices
  FOR SELECT
  TO public
  USING (true);

-- Public read access for reviews
CREATE POLICY "Public can view reviews"
  ON dentist_reviews
  FOR SELECT
  TO public
  USING (true);

-- Public read access for images
CREATE POLICY "Public can view images"
  ON dentist_images
  FOR SELECT
  TO public
  USING (true);

-- Public read access for insurances
CREATE POLICY "Public can view insurances"
  ON dentist_insurances
  FOR SELECT
  TO public
  USING (true);

-- Public read access for languages
CREATE POLICY "Public can view languages"
  ON dentist_languages
  FOR SELECT
  TO public
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS dentists_location_idx ON dentists(location);
CREATE INDEX IF NOT EXISTS dentists_rating_idx ON dentists(review_rating);
CREATE INDEX IF NOT EXISTS dentists_premium_idx ON dentists(is_premium);
CREATE INDEX IF NOT EXISTS dentist_services_name_idx ON dentist_services(service_name);
CREATE INDEX IF NOT EXISTS dentist_prices_service_idx ON dentist_prices(service_name);
CREATE INDEX IF NOT EXISTS dentist_reviews_rating_idx ON dentist_reviews(rating);
CREATE INDEX IF NOT EXISTS dentist_insurances_name_idx ON dentist_insurances(insurance_name);
CREATE INDEX IF NOT EXISTS dentist_languages_name_idx ON dentist_languages(language_name);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_dentists_updated_at
  BEFORE UPDATE ON dentists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();