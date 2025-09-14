import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, time } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("student"), // student, faculty, admin
  createdAt: timestamp("created_at").defaultNow(),
});

// Departments table
export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Divisions table
export const divisions = pgTable("divisions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  departmentId: varchar("department_id").notNull().references(() => departments.id),
  capacity: integer("capacity").notNull().default(60),
  createdAt: timestamp("created_at").defaultNow(),
});

// Students table
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  rollNumber: text("roll_number").notNull().unique(),
  divisionId: varchar("division_id").notNull().references(() => divisions.id),
  year: integer("year").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Faculty table
export const faculty = pgTable("faculty", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  employeeId: text("employee_id").notNull().unique(),
  departmentId: varchar("department_id").notNull().references(() => departments.id),
  designation: text("designation").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Rooms table
export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  type: text("type").notNull(), // classroom, lab
  capacity: integer("capacity").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subjects table
export const subjects = pgTable("subjects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  departmentId: varchar("department_id").references(() => departments.id),
  credits: integer("credits").notNull().default(3),
  type: text("type").notNull().default("theory"), // theory, practical, common
  createdAt: timestamp("created_at").defaultNow(),
});

// Time slots table
export const timeSlots = pgTable("time_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Timetables table
export const timetables = pgTable("timetables", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  divisionId: varchar("division_id").notNull().references(() => divisions.id),
  subjectId: varchar("subject_id").notNull().references(() => subjects.id),
  facultyId: varchar("faculty_id").notNull().references(() => faculty.id),
  roomId: varchar("room_id").notNull().references(() => rooms.id),
  timeSlotId: varchar("time_slot_id").notNull().references(() => timeSlots.id),
  dayOfWeek: integer("day_of_week").notNull(), // 1=Monday, 7=Sunday
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  student: one(students),
  faculty: one(faculty),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
  divisions: many(divisions),
  faculty: many(faculty),
  subjects: many(subjects),
}));

export const divisionsRelations = relations(divisions, ({ one, many }) => ({
  department: one(departments, {
    fields: [divisions.departmentId],
    references: [departments.id],
  }),
  students: many(students),
  timetables: many(timetables),
}));

export const studentsRelations = relations(students, ({ one }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  division: one(divisions, {
    fields: [students.divisionId],
    references: [divisions.id],
  }),
}));

export const facultyRelations = relations(faculty, ({ one, many }) => ({
  user: one(users, {
    fields: [faculty.userId],
    references: [users.id],
  }),
  department: one(departments, {
    fields: [faculty.departmentId],
    references: [departments.id],
  }),
  timetables: many(timetables),
}));

export const roomsRelations = relations(rooms, ({ many }) => ({
  timetables: many(timetables),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  department: one(departments, {
    fields: [subjects.departmentId],
    references: [departments.id],
  }),
  timetables: many(timetables),
}));

export const timeSlotsRelations = relations(timeSlots, ({ many }) => ({
  timetables: many(timetables),
}));

export const timetablesRelations = relations(timetables, ({ one }) => ({
  division: one(divisions, {
    fields: [timetables.divisionId],
    references: [divisions.id],
  }),
  subject: one(subjects, {
    fields: [timetables.subjectId],
    references: [subjects.id],
  }),
  faculty: one(faculty, {
    fields: [timetables.facultyId],
    references: [faculty.id],
  }),
  room: one(rooms, {
    fields: [timetables.roomId],
    references: [rooms.id],
  }),
  timeSlot: one(timeSlots, {
    fields: [timetables.timeSlotId],
    references: [timeSlots.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  createdAt: true,
});

export const insertDivisionSchema = createInsertSchema(divisions).omit({
  id: true,
  createdAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export const insertFacultySchema = createInsertSchema(faculty).omit({
  id: true,
  createdAt: true,
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true,
});

export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
  createdAt: true,
});

export const insertTimeSlotSchema = createInsertSchema(timeSlots).omit({
  id: true,
  createdAt: true,
});

export const insertTimetableSchema = createInsertSchema(timetables).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type Division = typeof divisions.$inferSelect;
export type InsertDivision = z.infer<typeof insertDivisionSchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type Faculty = typeof faculty.$inferSelect;
export type InsertFaculty = z.infer<typeof insertFacultySchema>;

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;

export type TimeSlot = typeof timeSlots.$inferSelect;
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;

export type Timetable = typeof timetables.$inferSelect;
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;
