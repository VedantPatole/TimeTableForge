-- Development Environment Seed Data
-- Comprehensive sample data for development and testing

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

-- Insert departments
INSERT INTO departments (id, name, code) VALUES
  ('dept-it', 'Information Technology', 'IT'),
  ('dept-cs', 'Computer Science', 'CS'),
  ('dept-excs', 'Electronics & Computer Science', 'EXCS'),
  ('dept-extc', 'Electronics & Telecommunication', 'EXTC'),
  ('dept-bme', 'Biomedical Engineering', 'BME');

-- Insert divisions
INSERT INTO divisions (id, name, department_id, capacity) VALUES
  ('div-it-a', 'IT-A', 'dept-it', 60),
  ('div-it-b', 'IT-B', 'dept-it', 60),
  ('div-it-c', 'IT-C', 'dept-it', 60),
  ('div-cs-a', 'CS-A', 'dept-cs', 60),
  ('div-cs-b', 'CS-B', 'dept-cs', 60),
  ('div-cs-c', 'CS-C', 'dept-cs', 60),
  ('div-excs-a', 'EXCS-A', 'dept-excs', 60),
  ('div-excs-b', 'EXCS-B', 'dept-excs', 60),
  ('div-extc-a', 'EXTC-A', 'dept-extc', 60),
  ('div-extc-b', 'EXTC-B', 'dept-extc', 60),
  ('div-bme-a', 'BME-A', 'dept-bme', 40);

-- Insert time slots
INSERT INTO time_slots (id, name, start_time, end_time) VALUES
  ('slot-1', 'Slot 1', '09:00', '11:00'),
  ('slot-2', 'Slot 2', '11:15', '13:15'),
  ('slot-3', 'Slot 3', '13:45', '15:45'),
  ('slot-4', 'Slot 4', '16:00', '18:00');

-- Insert rooms
INSERT INTO rooms (id, name, type, capacity) VALUES
  ('room-101', 'Room 101', 'classroom', 60),
  ('room-102', 'Room 102', 'classroom', 60),
  ('room-105', 'Room 105', 'classroom', 60),
  ('lab-201', 'Lab 201', 'lab', 30),
  ('lab-202', 'Lab 202', 'lab', 30),
  ('lab-301', 'Lab 301', 'lab', 30),
  ('auditorium', 'Auditorium', 'auditorium', 200);

-- Insert subjects
INSERT INTO subjects (id, name, code, department_id, credits, type) VALUES
  -- Common subjects
  ('subj-math', 'Mathematics', 'MATH101', NULL, 4, 'common'),
  ('subj-eng', 'English', 'ENG101', NULL, 3, 'common'),
  ('subj-phy', 'Physics', 'PHY101', NULL, 4, 'common'),
  
  -- IT subjects
  ('subj-db', 'Database Systems', 'IT201', 'dept-it', 4, 'theory'),
  ('subj-web', 'Web Development', 'IT202', 'dept-it', 3, 'practical'),
  ('subj-se', 'Software Engineering', 'IT203', 'dept-it', 4, 'theory'),
  ('subj-net', 'Computer Networks', 'IT204', 'dept-it', 4, 'theory'),
  
  -- CS subjects
  ('subj-ds', 'Data Structures', 'CS201', 'dept-cs', 4, 'theory'),
  ('subj-algo', 'Algorithms', 'CS202', 'dept-cs', 4, 'theory'),
  ('subj-os', 'Operating Systems', 'CS203', 'dept-cs', 4, 'theory'),
  ('subj-prog', 'Programming Lab', 'CS204', 'dept-cs', 2, 'practical'),
  
  -- EXCS subjects
  ('subj-de', 'Digital Electronics', 'EC201', 'dept-excs', 4, 'theory'),
  ('subj-micro', 'Microprocessors', 'EC202', 'dept-excs', 4, 'theory'),
  ('subj-vlsi', 'VLSI Design', 'EC203', 'dept-excs', 3, 'practical'),
  
  -- EXTC subjects
  ('subj-comm', 'Communication Systems', 'ET201', 'dept-extc', 4, 'theory'),
  ('subj-signal', 'Signal Processing', 'ET202', 'dept-extc', 4, 'theory'),
  ('subj-security', 'Network Security', 'ET203', 'dept-extc', 4, 'theory'),
  
  -- BME subjects
  ('subj-bio', 'Biomedical Engineering', 'BM201', 'dept-bme', 4, 'theory'),
  ('subj-devices', 'Medical Devices', 'BM202', 'dept-bme', 3, 'practical'),
  ('subj-biomech', 'Biomechanics', 'BM203', 'dept-bme', 4, 'theory');

-- Insert users (faculty and students)
INSERT INTO users (id, name, password_hash, role) VALUES
  -- Faculty users
  ('user-f1', 'Dr. Smith', 'hashed_password', 'faculty'),
  ('user-f2', 'Prof. Johnson', 'hashed_password', 'faculty'),
  ('user-f3', 'Dr. Williams', 'hashed_password', 'faculty'),
  ('user-f4', 'Dr. Chen', 'hashed_password', 'faculty'),
  ('user-f5', 'Prof. Davis', 'hashed_password', 'faculty'),
  ('user-f6', 'Dr. Wilson', 'hashed_password', 'faculty'),
  ('user-f7', 'Prof. Miller', 'hashed_password', 'faculty'),
  ('user-f8', 'Dr. Brown', 'hashed_password', 'faculty'),
  ('user-f9', 'Prof. Garcia', 'hashed_password', 'faculty'),
  ('user-f10', 'Dr. Martinez', 'hashed_password', 'faculty'),
  -- Admin user
  ('user-admin', 'Administrator', 'hashed_password', 'admin'),
  -- Sample students (first 20)
  ('user-s1', 'Alice Johnson', 'hashed_password', 'student'),
  ('user-s2', 'Bob Smith', 'hashed_password', 'student'),
  ('user-s3', 'Carol Williams', 'hashed_password', 'student'),
  ('user-s4', 'David Brown', 'hashed_password', 'student'),
  ('user-s5', 'Eva Davis', 'hashed_password', 'student'),
  ('user-s6', 'Frank Miller', 'hashed_password', 'student'),
  ('user-s7', 'Grace Wilson', 'hashed_password', 'student'),
  ('user-s8', 'Henry Moore', 'hashed_password', 'student'),
  ('user-s9', 'Ivy Taylor', 'hashed_password', 'student'),
  ('user-s10', 'Jack Anderson', 'hashed_password', 'student'),
  ('user-s11', 'Kelly Thomas', 'hashed_password', 'student'),
  ('user-s12', 'Liam Jackson', 'hashed_password', 'student'),
  ('user-s13', 'Maya White', 'hashed_password', 'student'),
  ('user-s14', 'Noah Harris', 'hashed_password', 'student'),
  ('user-s15', 'Olivia Martin', 'hashed_password', 'student'),
  ('user-s16', 'Paul Garcia', 'hashed_password', 'student'),
  ('user-s17', 'Quinn Rodriguez', 'hashed_password', 'student'),
  ('user-s18', 'Ruby Lewis', 'hashed_password', 'student'),
  ('user-s19', 'Sam Robinson', 'hashed_password', 'student'),
  ('user-s20', 'Tina Clark', 'hashed_password', 'student');

-- Insert faculty
INSERT INTO faculty (id, user_id, employee_id, department_id, designation) VALUES
  ('fac-1', 'user-f1', 'EMP1001', 'dept-it', 'Professor'),
  ('fac-2', 'user-f2', 'EMP1002', 'dept-it', 'Assistant Professor'),
  ('fac-3', 'user-f3', 'EMP1003', 'dept-cs', 'Professor'),
  ('fac-4', 'user-f4', 'EMP1004', 'dept-cs', 'Assistant Professor'),
  ('fac-5', 'user-f5', 'EMP1005', 'dept-excs', 'Professor'),
  ('fac-6', 'user-f6', 'EMP1006', 'dept-excs', 'Assistant Professor'),
  ('fac-7', 'user-f7', 'EMP1007', 'dept-extc', 'Professor'),
  ('fac-8', 'user-f8', 'EMP1008', 'dept-extc', 'Assistant Professor'),
  ('fac-9', 'user-f9', 'EMP1009', 'dept-bme', 'Professor'),
  ('fac-10', 'user-f10', 'EMP1010', 'dept-bme', 'Assistant Professor');

-- Insert students
INSERT INTO students (id, user_id, roll_number, division_id, year) VALUES
  ('std-1', 'user-s1', 'ITA001', 'div-it-a', 2),
  ('std-2', 'user-s2', 'ITB002', 'div-it-b', 2),
  ('std-3', 'user-s3', 'ITC003', 'div-it-c', 2),
  ('std-4', 'user-s4', 'CSA004', 'div-cs-a', 2),
  ('std-5', 'user-s5', 'CSB005', 'div-cs-b', 2),
  ('std-6', 'user-s6', 'CSC006', 'div-cs-c', 2),
  ('std-7', 'user-s7', 'EXCSA007', 'div-excs-a', 2),
  ('std-8', 'user-s8', 'EXCSB008', 'div-excs-b', 2),
  ('std-9', 'user-s9', 'EXTCA009', 'div-extc-a', 2),
  ('std-10', 'user-s10', 'EXTCB010', 'div-extc-b', 2),
  ('std-11', 'user-s11', 'BMEA011', 'div-bme-a', 2),
  ('std-12', 'user-s12', 'ITA012', 'div-it-a', 3),
  ('std-13', 'user-s13', 'ITB013', 'div-it-b', 3),
  ('std-14', 'user-s14', 'ITC014', 'div-it-c', 3),
  ('std-15', 'user-s15', 'CSA015', 'div-cs-a', 3),
  ('std-16', 'user-s16', 'CSB016', 'div-cs-b', 3),
  ('std-17', 'user-s17', 'CSC017', 'div-cs-c', 3),
  ('std-18', 'user-s18', 'EXCSA018', 'div-excs-a', 3),
  ('std-19', 'user-s19', 'EXCSB019', 'div-excs-b', 3),
  ('std-20', 'user-s20', 'EXTCA020', 'div-extc-a', 3);

-- Insert sample timetable entries for Monday (conflict-free scheduling)
INSERT INTO timetables (division_id, subject_id, faculty_id, room_id, time_slot_id, day_of_week) VALUES
  -- Monday schedule for IT-A 
  ('div-it-a', 'subj-db', 'fac-1', 'room-101', 'slot-1', 1),
  ('div-it-a', 'subj-web', 'fac-2', 'auditorium', 'slot-2', 1),  -- Theory portion in auditorium
  ('div-it-a', 'subj-math', 'fac-1', 'room-101', 'slot-3', 1),
  
  -- Monday schedule for CS-A (different rooms and time slots)
  ('div-cs-a', 'subj-ds', 'fac-3', 'room-102', 'slot-1', 1),
  ('div-cs-a', 'subj-algo', 'fac-3', 'room-102', 'slot-3', 1),
  
  -- Monday schedule for EXCS-A (different time slots to avoid conflicts)
  ('div-excs-a', 'subj-de', 'fac-5', 'room-105', 'slot-2', 1),
  ('div-excs-a', 'subj-micro', 'fac-6', 'auditorium', 'slot-4', 1);

COMMIT;