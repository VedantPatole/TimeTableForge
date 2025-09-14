-- Staging Environment Seed Data
-- Minimal realistic data for testing and staging

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

-- Insert departments (all 5 departments)
INSERT INTO departments (name, code) VALUES
  ('Information Technology', 'IT'),
  ('Computer Science', 'CS'),
  ('Electronics & Computer Science', 'EXCS'),
  ('Electronics & Telecommunication', 'EXTC'),
  ('Biomedical Engineering', 'BME');

-- Insert divisions (minimal set - 1 per major department)
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

-- Insert essential time slots
INSERT INTO time_slots (name, start_time, end_time) VALUES
  ('Morning Slot', '09:00', '11:00'),
  ('Afternoon Slot', '13:45', '15:45');

-- Insert essential rooms
INSERT INTO rooms (name, type, capacity) VALUES
  ('Room 101', 'classroom', 60),
  ('Lab 201', 'lab', 30),
  ('Auditorium', 'auditorium', 200);

-- Insert core subjects
INSERT INTO subjects (name, code, department_id, credits, type) VALUES
  -- Common subjects
  ('Mathematics', 'MATH101', NULL, 4, 'common'),
  ('English', 'ENG101', NULL, 3, 'common'),
  -- One subject per department for testing
  ('Database Systems', 'IT201', (SELECT id FROM departments WHERE code = 'IT'), 4, 'theory'),
  ('Data Structures', 'CS201', (SELECT id FROM departments WHERE code = 'CS'), 4, 'theory'),
  ('Digital Electronics', 'EC201', (SELECT id FROM departments WHERE code = 'EXCS'), 4, 'theory'),
  ('Communication Systems', 'ET201', (SELECT id FROM departments WHERE code = 'EXTC'), 4, 'theory'),
  ('Biomedical Engineering', 'BM201', (SELECT id FROM departments WHERE code = 'BME'), 4, 'theory');

-- Insert test users
INSERT INTO users (name, password_hash, role) VALUES
  -- Test faculty
  ('Dr. Test Faculty', 'test_password', 'faculty'),
  ('Prof. Sample Teacher', 'test_password', 'faculty'),
  -- Test admin
  ('Test Administrator', 'test_password', 'admin'),
  -- Test students
  ('Test Student 1', 'test_password', 'student'),
  ('Test Student 2', 'test_password', 'student'),
  ('Test Student 3', 'test_password', 'student');

-- Insert test faculty
INSERT INTO faculty (user_id, employee_id, department_id, designation)
SELECT u.id, 'TEST001', d.id, 'Test Professor'
FROM users u, departments d 
WHERE u.name = 'Dr. Test Faculty' AND d.code = 'IT'
UNION ALL
SELECT u.id, 'TEST002', d.id, 'Test Professor'
FROM users u, departments d 
WHERE u.name = 'Prof. Sample Teacher' AND d.code = 'CS';

-- Insert test students
INSERT INTO students (user_id, roll_number, division_id, year)
SELECT u.id, 'TEST001', div.id, 2
FROM users u, divisions div, departments d
WHERE u.name = 'Test Student 1' AND div.name = 'IT-A' AND div.department_id = d.id AND d.code = 'IT'
UNION ALL
SELECT u.id, 'TEST002', div.id, 2
FROM users u, divisions div, departments d
WHERE u.name = 'Test Student 2' AND div.name = 'CS-A' AND div.department_id = d.id AND d.code = 'CS'
UNION ALL
SELECT u.id, 'TEST003', div.id, 2
FROM users u, divisions div, departments d
WHERE u.name = 'Test Student 3' AND div.name = 'BME-A' AND div.department_id = d.id AND d.code = 'BME';

COMMIT;