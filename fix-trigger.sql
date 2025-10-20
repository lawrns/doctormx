-- Fix the trigger to use the correct column name
DROP TRIGGER IF EXISTS trigger_create_free_questions_for_new_user ON users;

CREATE OR REPLACE FUNCTION create_free_questions_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_free_questions (user_id, questions_used, questions_remaining, reset_date)
    VALUES (NEW.id, 0, 5, CURRENT_DATE);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_create_free_questions_for_new_user
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_free_questions_for_new_user();
