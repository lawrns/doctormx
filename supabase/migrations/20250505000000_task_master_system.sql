-- Task Master System Migration
-- This migration adds tables for the Task Master system that manages tasks from perfectflow.md

-- Tasks table to store main task information
CREATE TABLE IF NOT EXISTS task_master_tasks (
  id BIGINT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  details TEXT,
  test_strategy TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subtasks table for storing subtasks under main tasks
CREATE TABLE IF NOT EXISTS task_master_subtasks (
  id TEXT PRIMARY KEY,
  task_id BIGINT NOT NULL REFERENCES task_master_tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Task dependencies table
CREATE TABLE IF NOT EXISTS task_master_dependencies (
  id SERIAL PRIMARY KEY,
  task_id BIGINT NOT NULL REFERENCES task_master_tasks(id) ON DELETE CASCADE,
  depends_on_task_id BIGINT NOT NULL REFERENCES task_master_tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, depends_on_task_id)
);

-- Activity log for tasks and subtasks
CREATE TABLE IF NOT EXISTS task_master_activity_log (
  id SERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'subtask')),
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'status_change')),
  previous_state JSONB,
  new_state JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Task tags for categorization
CREATE TABLE IF NOT EXISTS task_master_tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Junction table for task-tag relationships
CREATE TABLE IF NOT EXISTS task_master_task_tags (
  task_id BIGINT NOT NULL REFERENCES task_master_tasks(id) ON DELETE CASCADE,
  tag_id INT NOT NULL REFERENCES task_master_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (task_id, tag_id)
);

-- Task analytics table
CREATE TABLE IF NOT EXISTS task_master_analytics (
  id SERIAL PRIMARY KEY,
  task_id BIGINT REFERENCES task_master_tasks(id) ON DELETE CASCADE,
  progress_percentage INT CHECK (progress_percentage BETWEEN 0 AND 100),
  estimated_completion_date TIMESTAMPTZ,
  time_spent_minutes INT DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to tables
CREATE TRIGGER update_task_master_tasks_timestamp
BEFORE UPDATE ON task_master_tasks
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_task_master_subtasks_timestamp
BEFORE UPDATE ON task_master_subtasks
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Views for easier querying
CREATE OR REPLACE VIEW task_master_overview AS
SELECT 
  t.id AS task_id,
  t.title AS task_title,
  t.description AS task_description,
  t.priority AS task_priority,
  t.status AS task_status,
  COUNT(s.id) AS total_subtasks,
  SUM(CASE WHEN s.status = 'completed' THEN 1 ELSE 0 END) AS completed_subtasks,
  CASE 
    WHEN COUNT(s.id) = 0 THEN 0
    ELSE ROUND((SUM(CASE WHEN s.status = 'completed' THEN 1 ELSE 0 END)::numeric / COUNT(s.id)::numeric) * 100)
  END AS progress_percentage,
  t.created_at,
  t.updated_at
FROM task_master_tasks t
LEFT JOIN task_master_subtasks s ON t.id = s.task_id
GROUP BY t.id;

-- Row Level Security Policies
ALTER TABLE task_master_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_master_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_master_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_master_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_master_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_master_task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_master_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy for tasks (example for authenticated users)
CREATE POLICY task_master_tasks_policy ON task_master_tasks 
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policy for subtasks
CREATE POLICY task_master_subtasks_policy ON task_master_subtasks 
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policy for dependencies
CREATE POLICY task_master_dependencies_policy ON task_master_dependencies 
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policy for activity log
CREATE POLICY task_master_activity_log_policy ON task_master_activity_log 
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policy for tags
CREATE POLICY task_master_tags_policy ON task_master_tags 
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policy for task tags
CREATE POLICY task_master_task_tags_policy ON task_master_task_tags 
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policy for analytics
CREATE POLICY task_master_analytics_policy ON task_master_analytics 
  FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX idx_task_master_subtasks_task_id ON task_master_subtasks(task_id);
CREATE INDEX idx_task_master_dependencies_task_id ON task_master_dependencies(task_id);
CREATE INDEX idx_task_master_dependencies_depends_on ON task_master_dependencies(depends_on_task_id);
CREATE INDEX idx_task_master_activity_log_entity ON task_master_activity_log(entity_type, entity_id);
CREATE INDEX idx_task_master_task_tags_task_id ON task_master_task_tags(task_id);
CREATE INDEX idx_task_master_analytics_task_id ON task_master_analytics(task_id);

-- Create functions for task management

-- Function to update task status based on subtask completion
CREATE OR REPLACE FUNCTION update_task_status_based_on_subtasks()
RETURNS TRIGGER AS $$
DECLARE
  total_count INTEGER;
  completed_count INTEGER;
  in_progress_count INTEGER;
BEGIN
  -- Count total, completed, and in-progress subtasks
  SELECT 
    COUNT(*), 
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END),
    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END)
  INTO 
    total_count, 
    completed_count,
    in_progress_count
  FROM task_master_subtasks
  WHERE task_id = NEW.task_id;
  
  -- Update task status based on subtasks
  IF total_count > 0 THEN
    IF completed_count = total_count THEN
      -- All subtasks completed -> task completed
      UPDATE task_master_tasks SET status = 'completed' WHERE id = NEW.task_id;
    ELSIF completed_count > 0 OR in_progress_count > 0 THEN
      -- Some subtasks completed or in progress -> task in progress
      UPDATE task_master_tasks SET status = 'in_progress' WHERE id = NEW.task_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for subtask status changes
CREATE TRIGGER update_task_status_on_subtask_change
AFTER INSERT OR UPDATE OF status ON task_master_subtasks
FOR EACH ROW
EXECUTE FUNCTION update_task_status_based_on_subtasks();

-- Function to create activity log entries
CREATE OR REPLACE FUNCTION log_task_master_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO task_master_activity_log (
      entity_type, 
      entity_id, 
      action, 
      previous_state, 
      new_state
    ) VALUES (
      TG_ARGV[0],
      CASE WHEN TG_ARGV[0] = 'task' THEN NEW.id::TEXT ELSE NEW.id END,
      'create',
      NULL,
      to_jsonb(NEW)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log when certain fields change
    IF (TG_ARGV[0] = 'task' AND (OLD.status <> NEW.status OR OLD.priority <> NEW.priority OR OLD.title <> NEW.title OR OLD.description <> NEW.description)) OR
       (TG_ARGV[0] = 'subtask' AND (OLD.status <> NEW.status OR OLD.priority <> NEW.priority OR OLD.title <> NEW.title OR OLD.description <> NEW.description)) THEN
      
      INSERT INTO task_master_activity_log (
        entity_type, 
        entity_id, 
        action, 
        previous_state, 
        new_state
      ) VALUES (
        TG_ARGV[0],
        CASE WHEN TG_ARGV[0] = 'task' THEN NEW.id::TEXT ELSE NEW.id END,
        CASE WHEN OLD.status <> NEW.status THEN 'status_change' ELSE 'update' END,
        to_jsonb(OLD),
        to_jsonb(NEW)
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO task_master_activity_log (
      entity_type, 
      entity_id, 
      action, 
      previous_state, 
      new_state
    ) VALUES (
      TG_ARGV[0],
      CASE WHEN TG_ARGV[0] = 'task' THEN OLD.id::TEXT ELSE OLD.id END,
      'delete',
      to_jsonb(OLD),
      NULL
    );
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create activity log triggers
CREATE TRIGGER log_task_activity
AFTER INSERT OR UPDATE OR DELETE ON task_master_tasks
FOR EACH ROW EXECUTE FUNCTION log_task_master_activity('task');

CREATE TRIGGER log_subtask_activity
AFTER INSERT OR UPDATE OR DELETE ON task_master_subtasks
FOR EACH ROW EXECUTE FUNCTION log_task_master_activity('subtask');

-- Function to update analytics when tasks or subtasks change
CREATE OR REPLACE FUNCTION update_task_analytics()
RETURNS TRIGGER AS $$
DECLARE
  task_id_val BIGINT;
  total_subtasks INTEGER;
  completed_subtasks INTEGER;
  progress NUMERIC;
BEGIN
  -- Determine the task_id based on whether this is a task or subtask trigger
  IF TG_ARGV[0] = 'task' THEN
    task_id_val := NEW.id;
  ELSE
    task_id_val := NEW.task_id;
  END IF;
  
  -- Calculate progress
  SELECT 
    COUNT(*), 
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)
  INTO 
    total_subtasks, 
    completed_subtasks
  FROM task_master_subtasks
  WHERE task_id = task_id_val;
  
  IF total_subtasks > 0 THEN
    progress := (completed_subtasks::NUMERIC / total_subtasks::NUMERIC) * 100;
  ELSE
    progress := CASE WHEN NEW.status = 'completed' THEN 100 ELSE 0 END;
  END IF;
  
  -- Update or insert analytics record
  INSERT INTO task_master_analytics (
    task_id, 
    progress_percentage
  ) VALUES (
    task_id_val, 
    progress::INTEGER
  )
  ON CONFLICT (task_id)
  DO UPDATE SET 
    progress_percentage = progress::INTEGER,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create analytics update triggers
CREATE TRIGGER update_task_analytics_on_task_change
AFTER INSERT OR UPDATE ON task_master_tasks
FOR EACH ROW EXECUTE FUNCTION update_task_analytics('task');

CREATE TRIGGER update_task_analytics_on_subtask_change
AFTER INSERT OR UPDATE ON task_master_subtasks
FOR EACH ROW EXECUTE FUNCTION update_task_analytics('subtask');