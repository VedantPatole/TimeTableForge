-- Production Environment Seed Data
-- Minimal essential data for production deployment

-- Clear existing data (in reverse dependency order)
DELETE FROM timetables;
DELETE FROM subjects;
DELETE FROM time_slots;
DELETE FROM rooms;
DELETE FROM faculty;
DELETE FROM students;
DELETE FROM divisions;
DELETE FROM departments;
DELETE FROM users;

-- Insert departments (essential structure)
INSERT INTO departments (name, code) VALUES
  ('Information Technology', 'IT'),
  ('Computer Science', 'CS'),
  ('Electronics & Computer Science', 'EXCS'),
  ('Electronics & Telecommunication', 'EXTC'),
  ('Biomedical Engineering', 'BME');

-- Insert basic divisions (1 per department for initial setup)
INSERT INTO divisions (name, department_id, capacity) 
SELECT 'IT-A', id, 60 FROM departments WHERE code = 'IT'
UNION ALL
SELECT 'CS-A', id, 60 FROM departments WHERE code = 'CS'
UNION ALL  
SELECT 'EXCS-A', id, 60 FROM departments WHERE code = 'EXCS'
UNION ALL
SELECT 'EXTC-A', id, 60 FROM departments WHERE code = 'EXTC'
UNION ALL
SELECT 'BME-A', id, 40 FROM departments WHERE code = 'BME';

-- Insert standard time slots
INSERT INTO time_slots (name, start_time, end_time) VALUES
  ('Slot 1', '09:00', '11:00'),
  ('Slot 2', '11:15', '13:15'),
  ('Slot 3', '13:45', '15:45'),
  ('Slot 4', '16:00', '18:00');

-- Insert essential rooms
INSERT INTO rooms (name, type, capacity) VALUES
  ('Room 101', 'classroom', 60),
  ('Room 102', 'classroom', 60),
  ('Lab 201', 'lab', 30),
  ('Lab 202', 'lab', 30),
  ('Auditorium', 'auditorium', 200);

-- Insert common subjects only (department-specific subjects added by admin)
INSERT INTO subjects (name, code, department_id, credits, type) VALUES
  ('Mathematics', 'MATH101', NULL, 4, 'common'),
  ('English', 'ENG101', NULL, 3, 'common'),
  ('Physics', 'PHY101', NULL, 4, 'common');

-- Insert default admin user
INSERT INTO users (name, password_hash, role) VALUES
  ('System Administrator', '$2b$10$placeholder_hash_change_immediately', 'admin');

-- Production deployments should:
-- 1. Change the admin password immediately after deployment
-- 2. Add actual faculty and student data through the web interface
-- 3. Configure additional divisions as needed
-- 4. Add department-specific subjects through the admin panel

COMMIT;