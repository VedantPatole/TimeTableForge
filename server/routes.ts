import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDepartmentSchema, insertDivisionSchema, insertStudentSchema, insertFacultySchema, insertRoomSchema, insertSubjectSchema, insertTimeSlotSchema, insertTimetableSchema, insertUserSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize sample data on server start
  await storage.initializeSampleData();

  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/todays-schedule", async (req, res) => {
    try {
      const schedule = await storage.getTodaysTimetables();
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch today's schedule" });
    }
  });

  app.get("/api/dashboard/room-occupancy", async (req, res) => {
    try {
      const occupancy = await storage.getRoomOccupancy();
      res.json(occupancy);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch room occupancy" });
    }
  });

  app.get("/api/dashboard/department-overview", async (req, res) => {
    try {
      const overview = await storage.getDepartmentOverview();
      res.json(overview);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch department overview" });
    }
  });

  // Users routes
  app.get("/api/users", async (req, res) => {
    try {
      // This would typically require pagination
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // Departments routes
  app.get("/api/departments", async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch departments" });
    }
  });

  app.post("/api/departments", async (req, res) => {
    try {
      const deptData = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(deptData);
      res.json(department);
    } catch (error) {
      res.status(400).json({ error: "Invalid department data" });
    }
  });

  // Divisions routes
  app.get("/api/divisions", async (req, res) => {
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

  app.post("/api/divisions", async (req, res) => {
    try {
      const divisionData = insertDivisionSchema.parse(req.body);
      const division = await storage.createDivision(divisionData);
      res.json(division);
    } catch (error) {
      res.status(400).json({ error: "Invalid division data" });
    }
  });

  // Students routes
  app.get("/api/students", async (req, res) => {
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

  app.post("/api/students", async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(studentData);
      res.json(student);
    } catch (error) {
      res.status(400).json({ error: "Invalid student data" });
    }
  });

  // Faculty routes
  app.get("/api/faculty", async (req, res) => {
    try {
      const { departmentId } = req.query;
      const faculty = departmentId
        ? await storage.getFacultyByDepartment(departmentId as string)
        : await storage.getFaculty();
      res.json(faculty);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch faculty" });
    }
  });

  app.post("/api/faculty", async (req, res) => {
    try {
      const facultyData = insertFacultySchema.parse(req.body);
      const faculty = await storage.createFaculty(facultyData);
      res.json(faculty);
    } catch (error) {
      res.status(400).json({ error: "Invalid faculty data" });
    }
  });

  // Rooms routes
  app.get("/api/rooms", async (req, res) => {
    try {
      const rooms = await storage.getRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rooms" });
    }
  });

  app.post("/api/rooms", async (req, res) => {
    try {
      const roomData = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(roomData);
      res.json(room);
    } catch (error) {
      res.status(400).json({ error: "Invalid room data" });
    }
  });

  // Subjects routes
  app.get("/api/subjects", async (req, res) => {
    try {
      const { departmentId } = req.query;
      const subjects = departmentId
        ? await storage.getSubjectsByDepartment(departmentId as string)
        : await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subjects" });
    }
  });

  app.post("/api/subjects", async (req, res) => {
    try {
      const subjectData = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(subjectData);
      res.json(subject);
    } catch (error) {
      res.status(400).json({ error: "Invalid subject data" });
    }
  });

  // Time slots routes
  app.get("/api/time-slots", async (req, res) => {
    try {
      const timeSlots = await storage.getTimeSlots();
      res.json(timeSlots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch time slots" });
    }
  });

  app.post("/api/time-slots", async (req, res) => {
    try {
      const timeSlotData = insertTimeSlotSchema.parse(req.body);
      const timeSlot = await storage.createTimeSlot(timeSlotData);
      res.json(timeSlot);
    } catch (error) {
      res.status(400).json({ error: "Invalid time slot data" });
    }
  });

  // Timetables routes
  app.get("/api/timetables", async (req, res) => {
    try {
      const { divisionId } = req.query;
      const timetables = divisionId
        ? await storage.getTimetablesByDivision(divisionId as string)
        : await storage.getTimetables();
      res.json(timetables);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch timetables" });
    }
  });

  app.post("/api/timetables", async (req, res) => {
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
