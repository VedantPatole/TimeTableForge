-- Migration 002: Performance Indexes
-- Adds indexes for frequently queried columns to improve query performance

-- Indexes for foreign key lookups
CREATE INDEX IF NOT EXISTS idx_divisions_department_id ON divisions(department_id);
CREATE INDEX IF NOT EXISTS idx_students_division_id ON students(division_id);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_faculty_department_id ON faculty(department_id);
CREATE INDEX IF NOT EXISTS idx_faculty_user_id ON faculty(user_id);
CREATE INDEX IF NOT EXISTS idx_subjects_department_id ON subjects(department_id);

-- Indexes for timetable queries (most critical for performance)
CREATE INDEX IF NOT EXISTS idx_timetables_division_id ON timetables(division_id);
CREATE INDEX IF NOT EXISTS idx_timetables_subject_id ON timetables(subject_id);
CREATE INDEX IF NOT EXISTS idx_timetables_faculty_id ON timetables(faculty_id);
CREATE INDEX IF NOT EXISTS idx_timetables_room_id ON timetables(room_id);
CREATE INDEX IF NOT EXISTS idx_timetables_time_slot_id ON timetables(time_slot_id);
CREATE INDEX IF NOT EXISTS idx_timetables_day_of_week ON timetables(day_of_week);
CREATE INDEX IF NOT EXISTS idx_timetables_is_active ON timetables(is_active);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_timetables_day_active ON timetables(day_of_week, is_active);
CREATE INDEX IF NOT EXISTS idx_timetables_room_day ON timetables(room_id, day_of_week, time_slot_id);

-- Indexes for active/inactive filtering
CREATE INDEX IF NOT EXISTS idx_rooms_is_active ON rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_time_slots_is_active ON time_slots(is_active);

-- Indexes for ordering and searching
CREATE INDEX IF NOT EXISTS idx_students_roll_number ON students(roll_number);
CREATE INDEX IF NOT EXISTS idx_faculty_employee_id ON faculty(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_start_time ON time_slots(start_time);

-- Record this migration as applied
INSERT INTO schema_migrations (version) VALUES ('002_add_indexes')
ON CONFLICT (version) DO NOTHING;