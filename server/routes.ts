import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDepartmentSchema, insertDivisionSchema, insertStudentSchema, insertFacultySchema, insertRoomSchema, insertSubjectSchema, insertTimeSlotSchema, insertTimetableSchema, insertUserSchema } from "@shared/schema";
import { authenticateToken, requireRole, type AuthenticatedRequest } from "./middleware/auth";
import { AvailabilityController } from "./controllers/availabilityController";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize sample data on server start
  await storage.initializeSampleData();

  // Initialize availability controller
  const availabilityController = new AvailabilityController();

  // Authentication endpoints
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          error: "Email and password are required" 
        });
      }

      // Validate college email domain
      const allowedDomains = ['@college.edu', '@student.college.edu'];
      const isValidCollegeEmail = allowedDomains.some(domain => email.endsWith(domain));
      if (!isValidCollegeEmail) {
        return res.status(400).json({
          success: false,
          error: "Please use a valid college email address"
        });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: "Invalid email or password" 
        });
      }

      // Validate password using bcrypt
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          error: "Invalid email or password" 
        });
      }

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'dev-jwt-secret-key-CHANGE-IN-PRODUCTION-fixed-for-stability';
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        jwtSecret,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        error: "Internal server error" 
      });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    // Since we're using stateless JWT, logout is handled client-side
    res.json({
      success: true,
      message: "Logged out successfully"
    });
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          error: "Not authenticated" 
        });
      }

      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: "User not found" 
        });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ 
        success: false, 
        error: "Internal server error" 
      });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/todays-schedule", authenticateToken, async (req, res) => {
    try {
      const schedule = await storage.getTodaysTimetables();
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch today's schedule" });
    }
  });

  app.get("/api/dashboard/room-occupancy", authenticateToken, async (req, res) => {
    try {
      const occupancy = await storage.getRoomOccupancy();
      res.json(occupancy);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch room occupancy" });
    }
  });

  app.get("/api/dashboard/department-overview", authenticateToken, async (req, res) => {
    try {
      const overview = await storage.getDepartmentOverview();
      res.json(overview);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch department overview" });
    }
  });

  // Users routes
  app.get("/api/users", authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      // This would typically require pagination
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // Departments routes
  app.get("/api/departments", authenticateToken, async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch departments" });
    }
  });

  app.post("/api/departments", authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const deptData = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(deptData);
      res.json(department);
    } catch (error) {
      res.status(400).json({ error: "Invalid department data" });
    }
  });

  // Divisions routes
  app.get("/api/divisions", authenticateToken, async (req, res) => {
    try {
      const { departmentId } = req.query;
      const divisions = departmentId 
        ? await storage.getDivisionsByDepartment(departmentId as string)
        : await storage.getDivisions();
      res.json(divisions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch divisions" });
    }
  });

  app.post("/api/divisions", authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const divisionData = insertDivisionSchema.parse(req.body);
      const division = await storage.createDivision(divisionData);
      res.json(division);
    } catch (error) {
      res.status(400).json({ error: "Invalid division data" });
    }
  });

  // Students routes
  app.get("/api/students", authenticateToken, requireRole(['admin', 'faculty']), async (req, res) => {
    try {
      const { divisionId } = req.query;
      const students = divisionId
        ? await storage.getStudentsByDivision(divisionId as string)
        : await storage.getStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  app.post("/api/students", authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(studentData);
      res.json(student);
    } catch (error) {
      res.status(400).json({ error: "Invalid student data" });
    }
  });

  // Faculty routes
  app.get("/api/faculty", authenticateToken, async (req, res) => {
    try {
      const { departmentId } = req.query;
      const faculty = departmentId
        ? await storage.getFacultyByDepartment(departmentId as string)
        : await storage.getFaculty();
      
      res.json({ 
        success: true, 
        data: faculty 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch faculty" 
      });
    }
  });

  app.post("/api/faculty", authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const facultyData = insertFacultySchema.parse(req.body);
      const faculty = await storage.createFaculty(facultyData);
      res.json(faculty);
    } catch (error) {
      res.status(400).json({ error: "Invalid faculty data" });
    }
  });

  // Rooms routes
  app.get("/api/rooms", authenticateToken, async (req, res) => {
    try {
      const rooms = await storage.getRooms();
      
      res.json({ 
        success: true, 
        data: rooms 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch rooms" 
      });
    }
  });

  app.post("/api/rooms", authenticateToken, requireRole(['admin', 'faculty']), async (req, res) => {
    try {
      const roomData = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(roomData);
      res.json(room);
    } catch (error) {
      res.status(400).json({ error: "Invalid room data" });
    }
  });

  // Core Data API - Protected routes with JWT authentication
  app.get("/api/subjects", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      let subjects;
      
      if (req.user?.role === 'student') {
        // Students only see subjects from their department
        const studentData = await storage.getStudentWithDepartment(req.user.id);
        if (!studentData) {
          return res.status(404).json({ 
            success: false, 
            error: "Student data not found" 
          });
        }
        subjects = await storage.getSubjectsByDepartment(studentData.department.id);
      } else {
        // Faculty and admin can see all subjects or filter by department
        const { departmentId } = req.query;
        subjects = departmentId
          ? await storage.getSubjectsByDepartment(departmentId as string)
          : await storage.getSubjects();
      }
      
      res.json({ 
        success: true, 
        data: subjects 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch subjects" 
      });
    }
  });

  // New endpoint: Get student's department and division info
  app.get("/api/my-department", authenticateToken, requireRole(['student']), async (req: AuthenticatedRequest, res) => {
    try {
      const studentData = await storage.getStudentWithDepartment(req.user!.id);
      
      if (!studentData) {
        return res.status(404).json({ 
          success: false, 
          error: "Student data not found" 
        });
      }
      
      res.json({ 
        success: true, 
        data: {
          department: studentData.department,
          division: studentData.division,
          student: studentData.student
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch student department information" 
      });
    }
  });

  app.post("/api/subjects", authenticateToken, requireRole(['admin', 'faculty']), async (req, res) => {
    try {
      const subjectData = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(subjectData);
      res.json(subject);
    } catch (error) {
      res.status(400).json({ error: "Invalid subject data" });
    }
  });

  // Time slots routes (aliased as /api/slots for compatibility)
  app.get("/api/slots", authenticateToken, async (req, res) => {
    try {
      const timeSlots = await storage.getTimeSlots();
      
      res.json({ 
        success: true, 
        data: timeSlots 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch time slots" 
      });
    }
  });
  
  // Keep existing route for backward compatibility
  app.get("/api/time-slots", authenticateToken, async (req, res) => {
    try {
      const timeSlots = await storage.getTimeSlots();
      
      res.json({ 
        success: true, 
        data: timeSlots 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch time slots" 
      });
    }
  });

  app.post("/api/time-slots", authenticateToken, requireRole(['admin', 'faculty']), async (req, res) => {
    try {
      const timeSlotData = insertTimeSlotSchema.parse(req.body);
      const timeSlot = await storage.createTimeSlot(timeSlotData);
      res.json(timeSlot);
    } catch (error) {
      res.status(400).json({ error: "Invalid time slot data" });
    }
  });

  // === CORE TIMETABLE LOGIC API ENDPOINTS ===
  
  // GET /api/timetable/available-slots - Get available faculty/room/slot combinations
  app.get("/api/timetable/available-slots", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { subject_id, slot_id, day_of_week, division_id } = req.query;

      // Validation
      if (!day_of_week || !division_id) {
        return res.status(400).json({
          success: false,
          error: "day_of_week and division_id are required parameters"
        });
      }

      const dayOfWeekNum = parseInt(day_of_week as string);
      if (dayOfWeekNum < 1 || dayOfWeekNum > 7) {
        return res.status(400).json({
          success: false,
          error: "day_of_week must be between 1 (Monday) and 7 (Sunday)"
        });
      }

      // For students, verify they can only query their own division
      if (req.user?.role === 'student') {
        const studentData = await storage.getStudentWithDepartment(req.user.id);
        if (!studentData || studentData.division.id !== division_id) {
          return res.status(403).json({
            success: false,
            error: "Students can only view availability for their own division"
          });
        }
      }

      const availableSlots = await availabilityController.getAvailableSlots({
        subjectId: subject_id as string,
        timeSlotId: slot_id as string,
        dayOfWeek: dayOfWeekNum,
        divisionId: division_id as string,
      });

      res.json({
        success: true,
        data: {
          available_combinations: availableSlots,
          total_available: availableSlots.length,
          query_parameters: {
            subject_id: subject_id || null,
            slot_id: slot_id || null,
            day_of_week: dayOfWeekNum,
            division_id: division_id
          }
        }
      });
    } catch (error) {
      console.error('Error fetching available slots:', error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch available slots"
      });
    }
  });

  // POST /api/timetable/create - Create timetable entries with comprehensive clash detection
  app.post("/api/timetable/create", authenticateToken, requireRole(['admin', 'faculty']), async (req, res) => {
    try {
      const timetableEntries = Array.isArray(req.body) ? req.body : [req.body];

      // Validate each entry
      const validatedEntries = [];
      const allConflicts = [];

      for (const entry of timetableEntries) {
        // Parse and validate the entry
        const parsedEntry = insertTimetableSchema.parse(entry);
        validatedEntries.push(parsedEntry);

        // Check for clashes
        const clashResult = await availabilityController.checkClashes(
          parsedEntry.divisionId,
          parsedEntry.facultyId,
          parsedEntry.roomId,
          parsedEntry.timeSlotId,
          parsedEntry.dayOfWeek
        );

        if (clashResult.hasConflict) {
          allConflicts.push({
            entry: parsedEntry,
            conflicts: clashResult.conflicts
          });
        }
      }

      // If any conflicts exist, return all of them
      if (allConflicts.length > 0) {
        return res.status(409).json({
          success: false,
          error: "Timetable conflicts detected",
          conflicts: allConflicts.map(conflict => ({
            conflicted_entry: {
              division_id: conflict.entry.divisionId,
              subject_id: conflict.entry.subjectId,
              faculty_id: conflict.entry.facultyId,
              room_id: conflict.entry.roomId,
              time_slot_id: conflict.entry.timeSlotId,
              day_of_week: conflict.entry.dayOfWeek
            },
            conflict_details: conflict.conflicts.map(c => ({
              type: c.type,
              message: c.message,
              details: c.details
            }))
          }))
        });
      }

      // Create timetable entries using transaction for atomicity
      const createdTimetables = await storage.createTimetableWithTransaction(validatedEntries);

      res.status(201).json({
        success: true,
        data: {
          created_entries: createdTimetables,
          total_created: createdTimetables.length,
          message: "Timetable entries created successfully"
        }
      });
    } catch (error: any) {
      console.error('Error creating timetable:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: "Invalid timetable data format",
          validation_errors: error.errors
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to create timetable entries"
      });
    }
  });

  // GET /api/timetable/my-schedule - Get student's complete timetable
  app.get("/api/timetable/my-schedule", authenticateToken, requireRole(['student']), async (req: AuthenticatedRequest, res) => {
    try {
      // Get student's division
      const studentData = await storage.getStudentWithDepartment(req.user!.id);
      
      if (!studentData) {
        return res.status(404).json({
          success: false,
          error: "Student data not found"
        });
      }

      // Get complete timetable for the student's division
      const timetable = await availabilityController.getStudentTimetable(studentData.division.id);

      // Group by day of week for better organization
      const organizedSchedule: Record<number, any[]> = {
        1: [], // Monday
        2: [], // Tuesday
        3: [], // Wednesday
        4: [], // Thursday
        5: [], // Friday
        6: [], // Saturday
        7: []  // Sunday
      };

      let totalClasses = 0;
      const subjectsSummary = new Map();

      timetable.forEach(entry => {
        organizedSchedule[entry.dayOfWeek].push({
          id: entry.id,
          subject: entry.subject,
          faculty: entry.faculty,
          room: entry.room,
          time_slot: entry.timeSlot
        });

        totalClasses++;

        // Track subjects summary
        const subjectKey = entry.subject.id;
        if (!subjectsSummary.has(subjectKey)) {
          subjectsSummary.set(subjectKey, {
            subject: entry.subject,
            total_classes: 0,
            weekly_hours: 0
          });
        }
        subjectsSummary.get(subjectKey).total_classes++;
      });

      res.json({
        success: true,
        data: {
          student_info: {
            division: studentData.division,
            department: studentData.department
          },
          weekly_schedule: {
            monday: organizedSchedule[1],
            tuesday: organizedSchedule[2],
            wednesday: organizedSchedule[3],
            thursday: organizedSchedule[4],
            friday: organizedSchedule[5],
            saturday: organizedSchedule[6],
            sunday: organizedSchedule[7]
          },
          summary: {
            total_classes_per_week: totalClasses,
            subjects: Array.from(subjectsSummary.values()),
            daily_distribution: {
              monday: organizedSchedule[1].length,
              tuesday: organizedSchedule[2].length,
              wednesday: organizedSchedule[3].length,
              thursday: organizedSchedule[4].length,
              friday: organizedSchedule[5].length,
              saturday: organizedSchedule[6].length,
              sunday: organizedSchedule[7].length
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching student schedule:', error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch student schedule"
      });
    }
  });

  // Timetables routes - Core data API with authentication
  app.get("/api/timetables", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { divisionId } = req.query;
      let timetables;
      
      if (req.user?.role === 'student') {
        // Students only see timetables for their division
        const studentData = await storage.getStudentWithDepartment(req.user.id);
        if (!studentData) {
          return res.status(404).json({ 
            success: false, 
            error: "Student data not found" 
          });
        }
        timetables = await storage.getTimetablesByDivision(studentData.division.id);
      } else {
        // Faculty and admin can see all timetables or filter by division
        timetables = divisionId
          ? await storage.getTimetablesByDivision(divisionId as string)
          : await storage.getTimetables();
      }
      
      res.json({ 
        success: true, 
        data: timetables 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch timetables" 
      });
    }
  });

  app.post("/api/timetables", authenticateToken, requireRole(['admin', 'faculty']), async (req, res) => {
    try {
      const timetableData = insertTimetableSchema.parse(req.body);
      const timetable = await storage.createTimetable(timetableData);
      res.json(timetable);
    } catch (error) {
      res.status(400).json({ error: "Invalid timetable data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
