-- Migration 004: Conflict Detection Constraints
-- Adds advanced constraints to prevent overlapping timetable slots

-- Function to check for room conflicts (same room, day, time slot)
CREATE OR REPLACE FUNCTION check_room_conflict()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM timetables 
        WHERE room_id = NEW.room_id 
        AND day_of_week = NEW.day_of_week 
        AND time_slot_id = NEW.time_slot_id 
        AND is_active = true 
        AND id != COALESCE(NEW.id, '')
    ) THEN
        RAISE EXCEPTION 'Room conflict: Room % is already booked for day % time slot %', 
            NEW.room_id, NEW.day_of_week, NEW.time_slot_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check for faculty conflicts (same faculty, day, time slot)
CREATE OR REPLACE FUNCTION check_faculty_conflict()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM timetables 
        WHERE faculty_id = NEW.faculty_id 
        AND day_of_week = NEW.day_of_week 
        AND time_slot_id = NEW.time_slot_id 
        AND is_active = true 
        AND id != COALESCE(NEW.id, '')
    ) THEN
        RAISE EXCEPTION 'Faculty conflict: Faculty % is already assigned for day % time slot %', 
            NEW.faculty_id, NEW.day_of_week, NEW.time_slot_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check for division conflicts (same division, day, time slot)
CREATE OR REPLACE FUNCTION check_division_conflict()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM timetables 
        WHERE division_id = NEW.division_id 
        AND day_of_week = NEW.day_of_week 
        AND time_slot_id = NEW.time_slot_id 
        AND is_active = true 
        AND id != COALESCE(NEW.id, '')
    ) THEN
        RAISE EXCEPTION 'Division conflict: Division % already has a class for day % time slot %', 
            NEW.division_id, NEW.day_of_week, NEW.time_slot_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate room capacity against division capacity
CREATE OR REPLACE FUNCTION check_room_capacity()
RETURNS TRIGGER AS $$
DECLARE
    room_cap INTEGER;
    div_cap INTEGER;
BEGIN
    SELECT capacity INTO room_cap FROM rooms WHERE id = NEW.room_id;
    SELECT capacity INTO div_cap FROM divisions WHERE id = NEW.division_id;
    
    IF room_cap < div_cap THEN
        RAISE EXCEPTION 'Room capacity insufficient: Room % (capacity %) cannot accommodate division % (capacity %)', 
            NEW.room_id, room_cap, NEW.division_id, div_cap;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check subject-department compatibility
CREATE OR REPLACE FUNCTION check_subject_department()
RETURNS TRIGGER AS $$
DECLARE
    subject_dept_id VARCHAR;
    division_dept_id VARCHAR;
BEGIN
    SELECT department_id INTO subject_dept_id FROM subjects WHERE id = NEW.subject_id;
    SELECT department_id INTO division_dept_id FROM divisions WHERE id = NEW.division_id;
    
    -- Allow common subjects (NULL department_id) for any division
    IF subject_dept_id IS NOT NULL AND subject_dept_id != division_dept_id THEN
        RAISE EXCEPTION 'Subject-Department mismatch: Subject % belongs to different department than division %', 
            NEW.subject_id, NEW.division_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check faculty-department compatibility
CREATE OR REPLACE FUNCTION check_faculty_department()
RETURNS TRIGGER AS $$
DECLARE
    faculty_dept_id VARCHAR;
    subject_dept_id VARCHAR;
    division_dept_id VARCHAR;
BEGIN
    SELECT department_id INTO faculty_dept_id FROM faculty WHERE id = NEW.faculty_id;
    SELECT department_id INTO subject_dept_id FROM subjects WHERE id = NEW.subject_id;
    SELECT department_id INTO division_dept_id FROM divisions WHERE id = NEW.division_id;
    
    -- Faculty should belong to same department as subject (if subject has department)
    -- Or faculty should belong to same department as division (for common subjects)
    IF subject_dept_id IS NOT NULL THEN
        IF faculty_dept_id != subject_dept_id THEN
            RAISE EXCEPTION 'Faculty-Subject mismatch: Faculty % from department % cannot teach subject % from department %', 
                NEW.faculty_id, faculty_dept_id, NEW.subject_id, subject_dept_id;
        END IF;
    ELSE
        -- For common subjects, faculty can be from any department
        -- This allows flexibility for common subjects like Math, English, Physics
        NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for conflict detection
DROP TRIGGER IF EXISTS trigger_room_conflict ON timetables;
CREATE TRIGGER trigger_room_conflict
    BEFORE INSERT OR UPDATE ON timetables
    FOR EACH ROW
    WHEN (NEW.is_active = true)
    EXECUTE FUNCTION check_room_conflict();

DROP TRIGGER IF EXISTS trigger_faculty_conflict ON timetables;
CREATE TRIGGER trigger_faculty_conflict
    BEFORE INSERT OR UPDATE ON timetables
    FOR EACH ROW
    WHEN (NEW.is_active = true)
    EXECUTE FUNCTION check_faculty_conflict();

DROP TRIGGER IF EXISTS trigger_division_conflict ON timetables;
CREATE TRIGGER trigger_division_conflict
    BEFORE INSERT OR UPDATE ON timetables
    FOR EACH ROW
    WHEN (NEW.is_active = true)
    EXECUTE FUNCTION check_division_conflict();

DROP TRIGGER IF EXISTS trigger_room_capacity ON timetables;
CREATE TRIGGER trigger_room_capacity
    BEFORE INSERT OR UPDATE ON timetables
    FOR EACH ROW
    EXECUTE FUNCTION check_room_capacity();

DROP TRIGGER IF EXISTS trigger_subject_department ON timetables;
CREATE TRIGGER trigger_subject_department
    BEFORE INSERT OR UPDATE ON timetables
    FOR EACH ROW
    EXECUTE FUNCTION check_subject_department();

DROP TRIGGER IF EXISTS trigger_faculty_department ON timetables;
CREATE TRIGGER trigger_faculty_department
    BEFORE INSERT OR UPDATE ON timetables
    FOR EACH ROW
    EXECUTE FUNCTION check_faculty_department();

-- Create unique constraint for active timetable entries to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_timetables_unique_active
ON timetables (division_id, day_of_week, time_slot_id)
WHERE is_active = true;

-- Create unique constraint for room booking to prevent double booking
CREATE UNIQUE INDEX IF NOT EXISTS idx_timetables_room_unique_active
ON timetables (room_id, day_of_week, time_slot_id)
WHERE is_active = true;

-- Create unique constraint for faculty assignment to prevent double booking
CREATE UNIQUE INDEX IF NOT EXISTS idx_timetables_faculty_unique_active
ON timetables (faculty_id, day_of_week, time_slot_id)
WHERE is_active = true;

-- Record this migration as applied
INSERT INTO schema_migrations (version) VALUES ('004_conflict_detection')
ON CONFLICT (version) DO NOTHING;