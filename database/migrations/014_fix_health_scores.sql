-- Fix health_scores table by adding missing 'level' column
ALTER TABLE health_scores ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Update existing records to have level 1
UPDATE health_scores SET level = 1 WHERE level IS NULL;

-- Add constraint to ensure level is positive
ALTER TABLE health_scores ADD CONSTRAINT health_scores_level_check CHECK (level > 0);

-- Add index for level queries
CREATE INDEX IF NOT EXISTS health_scores_level_idx ON health_scores(level);

