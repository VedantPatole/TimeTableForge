import { 
  users, departments, divisions, students, faculty, rooms, subjects, timeSlots, timetables,
  type User, type InsertUser, type Department, type InsertDepartment, 
  type Division, type InsertDivision, type Student, type InsertStudent,
  type Faculty, type InsertFaculty, type Room, type InsertRoom,
  type Subject, type InsertSubject, type TimeSlot, type InsertTimeSlot,
  type Timetable, type InsertTimetable
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(name: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Departments
  getDepartments(): Promise<Department[]>;
  getDepartment(id: string): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;

  // Divisions
  getDivisions(): Promise<Division[]>;
  getDivisionsByDepartment(departmentId: string): Promise<Division[]>;
  createDivision(division: InsertDivision): Promise<Division>;

  // Students
  getStudents(): Promise<Student[]>;
  getStudentsByDivision(divisionId: string): Promise<Student[]>;
  getStudentWithDepartment(userId: string): Promise<any>;
  createStudent(student: InsertStudent): Promise<Student>;

  // Faculty
  getFaculty(): Promise<Faculty[]>;
  getFacultyByDepartment(departmentId: string): Promise<Faculty[]>;
  createFaculty(faculty: InsertFaculty): Promise<Faculty>;

  // Rooms
  getRooms(): Promise<Room[]>;
  getRoom(id: string): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;

  // Subjects
  getSubjects(): Promise<Subject[]>;
  getSubjectsByDepartment(departmentId: string): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;

  // Time Slots
  getTimeSlots(): Promise<TimeSlot[]>;
  createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot>;

  // Timetables
  getTimetables(): Promise<Timetable[]>;
  getTimetablesByDivision(divisionId: string): Promise<Timetable[]>;
  getTodaysTimetables(): Promise<any[]>;
  createTimetable(timetable: InsertTimetable): Promise<Timetable>;
  createTimetableWithTransaction(timetableData: InsertTimetable[]): Promise<Timetable[]>;

  // Dashboard Stats
  getDashboardStats(): Promise<{
    totalStudents: number;
    totalFaculty: number;
    activeRooms: number;
    weeklyClasses: number;
  }>;

  // Room Occupancy
  getRoomOccupancy(): Promise<any[]>;

  // Department Overview
  getDepartmentOverview(): Promise<any[]>;

  // Initialize sample data
  initializeSampleData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(name: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.name, name));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getDepartments(): Promise<Department[]> {
    return await db.select().from(departments).orderBy(departments.name);
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department || undefined;
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const [department] = await db.insert(departments).values(insertDepartment).returning();
    return department;
  }

  async getDivisions(): Promise<Division[]> {
    return await db.select().from(divisions).orderBy(divisions.name);
  }

  async getDivisionsByDepartment(departmentId: string): Promise<Division[]> {
    return await db.select().from(divisions).where(eq(divisions.departmentId, departmentId));
  }

  async createDivision(insertDivision: InsertDivision): Promise<Division> {
    const [division] = await db.insert(divisions).values(insertDivision).returning();
    return division;
  }

  async getStudents(): Promise<Student[]> {
    return await db.select().from(students).orderBy(students.rollNumber);
  }

  async getStudentsByDivision(divisionId: string): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.divisionId, divisionId));
  }

  async getStudentWithDepartment(userId: string): Promise<any> {
    const result = await db
      .select({
        student: students,
        division: divisions,
        department: departments
      })
      .from(students)
      .innerJoin(divisions, eq(students.divisionId, divisions.id))
      .innerJoin(departments, eq(divisions.departmentId, departments.id))
      .where(eq(students.userId, userId));
    
    return result[0] || null;
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db.insert(students).values(insertStudent).returning();
    return student;
  }

  async getFaculty(): Promise<Faculty[]> {
    return await db.select().from(faculty).orderBy(faculty.employeeId);
  }

  async getFacultyByDepartment(departmentId: string): Promise<Faculty[]> {
    return await db.select().from(faculty).where(eq(faculty.departmentId, departmentId));
  }

  async createFaculty(insertFaculty: InsertFaculty): Promise<Faculty> {
    const [facultyMember] = await db.insert(faculty).values(insertFaculty).returning();
    return facultyMember;
  }

  async getRooms(): Promise<Room[]> {
    return await db.select().from(rooms).orderBy(rooms.name);
  }

  async getRoom(id: string): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room || undefined;
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const [room] = await db.insert(rooms).values(insertRoom).returning();
    return room;
  }

  async getSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects).orderBy(subjects.name);
  }

  async getSubjectsByDepartment(departmentId: string): Promise<Subject[]> {
    return await db.select().from(subjects).where(eq(subjects.departmentId, departmentId));
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const [subject] = await db.insert(subjects).values(insertSubject).returning();
    return subject;
  }

  async getTimeSlots(): Promise<TimeSlot[]> {
    return await db.select().from(timeSlots).orderBy(timeSlots.startTime);
  }

  async createTimeSlot(insertTimeSlot: InsertTimeSlot): Promise<TimeSlot> {
    const [timeSlot] = await db.insert(timeSlots).values(insertTimeSlot).returning();
    return timeSlot;
  }

  async getTimetables(): Promise<Timetable[]> {
    return await db.select().from(timetables).orderBy(timetables.dayOfWeek);
  }

  async getTimetablesByDivision(divisionId: string): Promise<Timetable[]> {
    return await db.select().from(timetables).where(eq(timetables.divisionId, divisionId));
  }

  async createTimetable(insertTimetable: InsertTimetable): Promise<Timetable> {
    const [timetable] = await db.insert(timetables).values(insertTimetable).returning();
    return timetable;
  }

  async createTimetableWithTransaction(timetableData: InsertTimetable[]): Promise<Timetable[]> {
    return await db.transaction(async (tx) => {
      const results = [];
      for (const data of timetableData) {
        const [timetable] = await tx.insert(timetables).values(data).returning();
        results.push(timetable);
      }
      return results;
    });
  }

  async getTodaysTimetables(): Promise<any[]> {
    const today = new Date().getDay();
    const dayOfWeek = today === 0 ? 7 : today; // Convert Sunday from 0 to 7

    const result = await db
      .select({
        id: timetables.id,
        dayOfWeek: timetables.dayOfWeek,
        subject: subjects.name,
        subjectCode: subjects.code,
        faculty: users.name,
        room: rooms.name,
        division: divisions.name,
        department: departments.name,
        startTime: timeSlots.startTime,
        endTime: timeSlots.endTime,
        timeSlotName: timeSlots.name,
      })
      .from(timetables)
      .innerJoin(subjects, eq(timetables.subjectId, subjects.id))
      .innerJoin(faculty, eq(timetables.facultyId, faculty.id))
      .innerJoin(users, eq(faculty.userId, users.id))
      .innerJoin(rooms, eq(timetables.roomId, rooms.id))
      .innerJoin(divisions, eq(timetables.divisionId, divisions.id))
      .innerJoin(departments, eq(divisions.departmentId, departments.id))
      .innerJoin(timeSlots, eq(timetables.timeSlotId, timeSlots.id))
      .where(and(eq(timetables.dayOfWeek, dayOfWeek), eq(timetables.isActive, true)))
      .orderBy(timeSlots.startTime);

    return result;
  }

  async getDashboardStats(): Promise<{
    totalStudents: number;
    totalFaculty: number;
    activeRooms: number;
    weeklyClasses: number;
  }> {
    const [studentCount] = await db.select({ count: sql<number>`count(*)` }).from(students);
    const [facultyCount] = await db.select({ count: sql<number>`count(*)` }).from(faculty);
    const [roomCount] = await db.select({ count: sql<number>`count(*)` }).from(rooms).where(eq(rooms.isActive, true));
    const [classCount] = await db.select({ count: sql<number>`count(*)` }).from(timetables).where(eq(timetables.isActive, true));

    return {
      totalStudents: Number(studentCount.count),
      totalFaculty: Number(facultyCount.count),
      activeRooms: Number(roomCount.count),
      weeklyClasses: Number(classCount.count),
    };
  }

  async getRoomOccupancy(): Promise<any[]> {
    const today = new Date().getDay();
    const dayOfWeek = today === 0 ? 7 : today;
    const currentTime = new Date().toTimeString().slice(0, 5);

    const occupiedRooms = await db
      .select({
        roomId: rooms.id,
        roomName: rooms.name,
        isOccupied: sql<boolean>`true`,
      })
      .from(timetables)
      .innerJoin(rooms, eq(timetables.roomId, rooms.id))
      .innerJoin(timeSlots, eq(timetables.timeSlotId, timeSlots.id))
      .where(and(
        eq(timetables.dayOfWeek, dayOfWeek),
        eq(timetables.isActive, true),
        sql`${timeSlots.startTime} <= ${currentTime} AND ${timeSlots.endTime} > ${currentTime}`
      ));

    const allRooms = await db.select().from(rooms).where(eq(rooms.isActive, true));

    return allRooms.map(room => {
      const occupied = occupiedRooms.find(or => or.roomId === room.id);
      return {
        id: room.id,
        name: room.name,
        type: room.type,
        isOccupied: !!occupied,
        status: occupied ? 'occupied' : 'available',
      };
    });
  }

  async getDepartmentOverview(): Promise<any[]> {
    const result = await db
      .select({
        departmentId: departments.id,
        departmentName: departments.name,
        departmentCode: departments.code,
        divisionCount: sql<number>`count(distinct ${divisions.id})`,
        studentCount: sql<number>`count(distinct ${students.id})`,
        facultyCount: sql<number>`count(distinct ${faculty.id})`,
      })
      .from(departments)
      .leftJoin(divisions, eq(departments.id, divisions.departmentId))
      .leftJoin(students, eq(divisions.id, students.divisionId))
      .leftJoin(faculty, eq(departments.id, faculty.departmentId))
      .groupBy(departments.id, departments.name, departments.code)
      .orderBy(departments.name);

    return result.map(dept => ({
      id: dept.departmentId,
      name: dept.departmentName,
      code: dept.departmentCode,
      divisions: Number(dept.divisionCount),
      students: Number(dept.studentCount),
      faculty: Number(dept.facultyCount),
    }));
  }

  async initializeSampleData(): Promise<void> {
    // Check if data already exists
    const existingDepts = await this.getDepartments();
    if (existingDepts.length > 0) {
      return; // Data already initialized
    }

    // Create departments
    const itDept = await this.createDepartment({ name: "Information Technology", code: "IT" });
    const csDept = await this.createDepartment({ name: "Computer Science", code: "CS" });
    const excsDept = await this.createDepartment({ name: "Electronics & Computer Science", code: "EXCS" });
    const extcDept = await this.createDepartment({ name: "Electronics & Telecommunication", code: "EXTC" });
    const bmeDept = await this.createDepartment({ name: "Biomedical Engineering", code: "BME" });

    // Create divisions
    const itDivA = await this.createDivision({ name: "IT-A", departmentId: itDept.id, capacity: 60 });
    const itDivB = await this.createDivision({ name: "IT-B", departmentId: itDept.id, capacity: 60 });
    const itDivC = await this.createDivision({ name: "IT-C", departmentId: itDept.id, capacity: 60 });

    const csDivA = await this.createDivision({ name: "CS-A", departmentId: csDept.id, capacity: 60 });
    const csDivB = await this.createDivision({ name: "CS-B", departmentId: csDept.id, capacity: 60 });
    const csDivC = await this.createDivision({ name: "CS-C", departmentId: csDept.id, capacity: 60 });

    const excsDivA = await this.createDivision({ name: "EXCS-A", departmentId: excsDept.id, capacity: 60 });
    const excsDivB = await this.createDivision({ name: "EXCS-B", departmentId: excsDept.id, capacity: 60 });

    const extcDivA = await this.createDivision({ name: "EXTC-A", departmentId: extcDept.id, capacity: 60 });
    const extcDivB = await this.createDivision({ name: "EXTC-B", departmentId: extcDept.id, capacity: 60 });

    const bmeDivA = await this.createDivision({ name: "BME-A", departmentId: bmeDept.id, capacity: 40 });

    // Create time slots
    await this.createTimeSlot({ name: "Slot 1", startTime: "09:00", endTime: "11:00" });
    await this.createTimeSlot({ name: "Slot 2", startTime: "11:15", endTime: "13:15" });
    await this.createTimeSlot({ name: "Slot 3", startTime: "13:45", endTime: "15:45" });
    await this.createTimeSlot({ name: "Slot 4", startTime: "16:00", endTime: "18:00" });

    // Create rooms
    await this.createRoom({ name: "Room 101", type: "classroom", capacity: 60 });
    await this.createRoom({ name: "Room 102", type: "classroom", capacity: 60 });
    await this.createRoom({ name: "Room 105", type: "classroom", capacity: 60 });
    await this.createRoom({ name: "Lab 201", type: "lab", capacity: 30 });
    await this.createRoom({ name: "Lab 202", type: "lab", capacity: 30 });
    await this.createRoom({ name: "Lab 301", type: "lab", capacity: 30 });
    await this.createRoom({ name: "Auditorium", type: "classroom", capacity: 200 });

    // Create subjects
    const subjects = [
      // Common subjects
      { name: "Mathematics", code: "MATH101", departmentId: null, type: "common" },
      { name: "English", code: "ENG101", departmentId: null, type: "common" },
      { name: "Physics", code: "PHY101", departmentId: null, type: "common" },
      
      // IT subjects
      { name: "Database Systems", code: "IT201", departmentId: itDept.id, type: "theory" },
      { name: "Web Development", code: "IT202", departmentId: itDept.id, type: "practical" },
      { name: "Software Engineering", code: "IT203", departmentId: itDept.id, type: "theory" },
      { name: "Computer Networks", code: "IT204", departmentId: itDept.id, type: "theory" },
      
      // CS subjects
      { name: "Data Structures", code: "CS201", departmentId: csDept.id, type: "theory" },
      { name: "Algorithms", code: "CS202", departmentId: csDept.id, type: "theory" },
      { name: "Operating Systems", code: "CS203", departmentId: csDept.id, type: "theory" },
      { name: "Programming Lab", code: "CS204", departmentId: csDept.id, type: "practical" },
      
      // EXCS subjects
      { name: "Digital Electronics", code: "EC201", departmentId: excsDept.id, type: "theory" },
      { name: "Microprocessors", code: "EC202", departmentId: excsDept.id, type: "theory" },
      { name: "VLSI Design", code: "EC203", departmentId: excsDept.id, type: "practical" },
      
      // EXTC subjects
      { name: "Communication Systems", code: "ET201", departmentId: extcDept.id, type: "theory" },
      { name: "Signal Processing", code: "ET202", departmentId: extcDept.id, type: "theory" },
      { name: "Network Security", code: "ET203", departmentId: extcDept.id, type: "theory" },
      
      // BME subjects
      { name: "Biomedical Engineering", code: "BM201", departmentId: bmeDept.id, type: "theory" },
      { name: "Medical Devices", code: "BM202", departmentId: bmeDept.id, type: "practical" },
      { name: "Biomechanics", code: "BM203", departmentId: bmeDept.id, type: "theory" },
    ];

    for (const subject of subjects) {
      await this.createSubject(subject);
    }

    // Create sample users and faculty
    const facultyUsers = [
      { name: "Dr. Smith", passwordHash: "hashed_password", role: "faculty" },
      { name: "Prof. Johnson", passwordHash: "hashed_password", role: "faculty" },
      { name: "Dr. Williams", passwordHash: "hashed_password", role: "faculty" },
      { name: "Dr. Chen", passwordHash: "hashed_password", role: "faculty" },
      { name: "Prof. Davis", passwordHash: "hashed_password", role: "faculty" },
      { name: "Dr. Wilson", passwordHash: "hashed_password", role: "faculty" },
      { name: "Prof. Miller", passwordHash: "hashed_password", role: "faculty" },
      { name: "Dr. Brown", passwordHash: "hashed_password", role: "faculty" },
      { name: "Prof. Garcia", passwordHash: "hashed_password", role: "faculty" },
      { name: "Dr. Martinez", passwordHash: "hashed_password", role: "faculty" },
    ];

    const createdFaculty = [];
    for (let i = 0; i < facultyUsers.length; i++) {
      const user = await this.createUser(facultyUsers[i]);
      const deptId = [itDept.id, csDept.id, excsDept.id, extcDept.id, bmeDept.id][i % 5];
      const faculty = await this.createFaculty({
        userId: user.id,
        employeeId: `EMP${1000 + i}`,
        departmentId: deptId,
        designation: i < 5 ? "Professor" : "Assistant Professor",
      });
      createdFaculty.push(faculty);
    }

    // Create sample students
    const divisions = [itDivA, itDivB, itDivC, csDivA, csDivB, csDivC, excsDivA, excsDivB, extcDivA, extcDivB, bmeDivA];
    for (let i = 0; i < 50; i++) {
      const user = await this.createUser({
        name: `Student ${i + 1}`,
        passwordHash: "hashed_password",
        role: "student",
      });
      
      const division = divisions[i % divisions.length];
      await this.createStudent({
        userId: user.id,
        rollNumber: `${division.name.replace('-', '')}${String(i + 1).padStart(3, '0')}`,
        divisionId: division.id,
        year: Math.floor(i / 10) + 1,
      });
    }
  }
}

export const storage = new DatabaseStorage();
