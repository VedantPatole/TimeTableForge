-- Migration 003: Additional Constraints
-- Adds business logic constraints and data integrity rules

-- Constraint to ensure day_of_week is valid (1-7, Monday-Sunday)
ALTER TABLE timetables 
ADD CONSTRAINT check_day_of_week 
CHECK (day_of_week >= 1 AND day_of_week <= 7);

-- Constraint to ensure year is reasonable (1-4 for undergraduate)
ALTER TABLE students 
ADD CONSTRAINT check_student_year 
CHECK (year >= 1 AND year <= 4);

-- Constraint to ensure room capacity is positive
ALTER TABLE rooms 
ADD CONSTRAINT check_room_capacity 
CHECK (capacity > 0);

-- Constraint to ensure division capacity is positive
ALTER TABLE divisions 
ADD CONSTRAINT check_division_capacity 
CHECK (capacity > 0);

-- Constraint to ensure subject credits are positive
ALTER TABLE subjects 
ADD CONSTRAINT check_subject_credits 
CHECK (credits > 0);

-- Constraint to ensure time slots are logical (end_time > start_time)
ALTER TABLE time_slots 
ADD CONSTRAINT check_time_slot_order 
CHECK (end_time > start_time);

-- Constraint to ensure valid room types
ALTER TABLE rooms 
ADD CONSTRAINT check_room_type 
CHECK (type IN ('classroom', 'lab', 'auditorium', 'office'));

-- Constraint to ensure valid subject types
ALTER TABLE subjects 
ADD CONSTRAINT check_subject_type 
CHECK (type IN ('theory', 'practical', 'common'));

-- Constraint to ensure valid user roles
ALTER TABLE users 
ADD CONSTRAINT check_user_role 
CHECK (role IN ('student', 'faculty', 'admin'));

-- Record this migration as applied
INSERT INTO schema_migrations (version) VALUES ('003_add_constraints')
ON CONFLICT (version) DO NOTHING;