import { db } from '../db';
import { timetables, timeSlots, faculty, rooms, divisions, subjects } from '@shared/schema';
import { eq, and, or, ne, sql } from 'drizzle-orm';

export interface AvailabilityRequest {
  subjectId?: string;
  timeSlotId?: string;
  dayOfWeek: number;
  divisionId: string;
}

export interface AvailableSlot {
  faculty: {
    id: string;
    name: string;
    designation: string;
  };
  room: {
    id: string;
    name: string;
    type: string;
    capacity: number;
  };
  timeSlot: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
  };
  subject?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface ClashCheckResult {
  hasConflict: boolean;
  conflicts: {
    type: 'faculty' | 'room' | 'division' | 'student_limit';
    message: string;
    details?: any;
  }[];
}

export class AvailabilityController {
  /**
   * Check for comprehensive clashes before creating a timetable entry
   */
  async checkClashes(
    divisionId: string,
    facultyId: string,
    roomId: string,
    timeSlotId: string,
    dayOfWeek: number,
    excludeTimetableId?: string
  ): Promise<ClashCheckResult> {
    const conflicts: ClashCheckResult['conflicts'] = [];

    // Check faculty double-booking
    const facultyClash = await this.checkFacultyClash(facultyId, timeSlotId, dayOfWeek, excludeTimetableId);
    if (facultyClash) {
      conflicts.push({
        type: 'faculty',
        message: `Faculty is already scheduled during this time slot`,
        details: facultyClash
      });
    }

    // Check room double-booking
    const roomClash = await this.checkRoomClash(roomId, timeSlotId, dayOfWeek, excludeTimetableId);
    if (roomClash) {
      conflicts.push({
        type: 'room',
        message: `Room is already occupied during this time slot`,
        details: roomClash
      });
    }

    // Check division conflicts
    const divisionClash = await this.checkDivisionClash(divisionId, timeSlotId, dayOfWeek, excludeTimetableId);
    if (divisionClash) {
      conflicts.push({
        type: 'division',
        message: `Division already has a class scheduled during this time slot`,
        details: divisionClash
      });
    }

    // Check student daily limit (3 slots per day)
    const studentLimitClash = await this.checkStudentDailyLimit(divisionId, dayOfWeek, excludeTimetableId);
    if (studentLimitClash.exceedsLimit) {
      conflicts.push({
        type: 'student_limit',
        message: `Students can only have 3 slots per day. Current day has ${studentLimitClash.currentCount} slots.`,
        details: studentLimitClash
      });
    }

    return {
      hasConflict: conflicts.length > 0,
      conflicts
    };
  }

  /**
   * Check if faculty is already scheduled at this time
   */
  private async checkFacultyClash(
    facultyId: string,
    timeSlotId: string,
    dayOfWeek: number,
    excludeTimetableId?: string
  ) {
    const conditions = [
      eq(timetables.facultyId, facultyId),
      eq(timetables.timeSlotId, timeSlotId),
      eq(timetables.dayOfWeek, dayOfWeek),
      eq(timetables.isActive, true)
    ];

    if (excludeTimetableId) {
      conditions.push(ne(timetables.id, excludeTimetableId));
    }

    const [clash] = await db
      .select({
        id: timetables.id,
        divisionName: divisions.name,
        subjectName: subjects.name
      })
      .from(timetables)
      .innerJoin(divisions, eq(timetables.divisionId, divisions.id))
      .innerJoin(subjects, eq(timetables.subjectId, subjects.id))
      .where(and(...conditions))
      .limit(1);

    return clash || null;
  }

  /**
   * Check if room is already occupied at this time
   */
  private async checkRoomClash(
    roomId: string,
    timeSlotId: string,
    dayOfWeek: number,
    excludeTimetableId?: string
  ) {
    const conditions = [
      eq(timetables.roomId, roomId),
      eq(timetables.timeSlotId, timeSlotId),
      eq(timetables.dayOfWeek, dayOfWeek),
      eq(timetables.isActive, true)
    ];

    if (excludeTimetableId) {
      conditions.push(ne(timetables.id, excludeTimetableId));
    }

    const [clash] = await db
      .select({
        id: timetables.id,
        divisionName: divisions.name,
        subjectName: subjects.name,
        facultyName: faculty.employeeId
      })
      .from(timetables)
      .innerJoin(divisions, eq(timetables.divisionId, divisions.id))
      .innerJoin(subjects, eq(timetables.subjectId, subjects.id))
      .innerJoin(faculty, eq(timetables.facultyId, faculty.id))
      .where(and(...conditions))
      .limit(1);

    return clash || null;
  }

  /**
   * Check if division already has a class at this time
   */
  private async checkDivisionClash(
    divisionId: string,
    timeSlotId: string,
    dayOfWeek: number,
    excludeTimetableId?: string
  ) {
    const conditions = [
      eq(timetables.divisionId, divisionId),
      eq(timetables.timeSlotId, timeSlotId),
      eq(timetables.dayOfWeek, dayOfWeek),
      eq(timetables.isActive, true)
    ];

    if (excludeTimetableId) {
      conditions.push(ne(timetables.id, excludeTimetableId));
    }

    const [clash] = await db
      .select({
        id: timetables.id,
        subjectName: subjects.name,
        facultyName: faculty.employeeId,
        roomName: rooms.name
      })
      .from(timetables)
      .innerJoin(subjects, eq(timetables.subjectId, subjects.id))
      .innerJoin(faculty, eq(timetables.facultyId, faculty.id))
      .innerJoin(rooms, eq(timetables.roomId, rooms.id))
      .where(and(...conditions))
      .limit(1);

    return clash || null;
  }

  /**
   * Check if students already have 3 slots for the day
   */
  private async checkStudentDailyLimit(
    divisionId: string,
    dayOfWeek: number,
    excludeTimetableId?: string
  ): Promise<{ exceedsLimit: boolean; currentCount: number; maxLimit: number }> {
    const conditions = [
      eq(timetables.divisionId, divisionId),
      eq(timetables.dayOfWeek, dayOfWeek),
      eq(timetables.isActive, true)
    ];

    if (excludeTimetableId) {
      conditions.push(ne(timetables.id, excludeTimetableId));
    }

    const result = await db
      .select({
        count: sql<number>`count(*)`
      })
      .from(timetables)
      .where(and(...conditions));

    const currentCount = result[0]?.count || 0;
    const maxLimit = 3;

    return {
      exceedsLimit: currentCount >= maxLimit,
      currentCount,
      maxLimit
    };
  }

  /**
   * Get available slots for a given criteria
   */
  async getAvailableSlots(request: AvailabilityRequest): Promise<AvailableSlot[]> {
    const { subjectId, timeSlotId, dayOfWeek, divisionId } = request;

    // Get all possible combinations
    const facultyQuery = db.select().from(faculty);
    const roomQuery = db.select().from(rooms).where(eq(rooms.isActive, true));
    const timeSlotQuery = timeSlotId 
      ? db.select().from(timeSlots).where(and(eq(timeSlots.id, timeSlotId), eq(timeSlots.isActive, true)))
      : db.select().from(timeSlots).where(eq(timeSlots.isActive, true));

    const [allFaculty, allRooms, availableTimeSlots] = await Promise.all([
      facultyQuery,
      roomQuery,
      timeSlotQuery
    ]);

    const availableSlots: AvailableSlot[] = [];

    // Check each combination for conflicts
    for (const facultyMember of allFaculty) {
      for (const room of allRooms) {
        for (const slot of availableTimeSlots) {
          const clashResult = await this.checkClashes(
            divisionId,
            facultyMember.id,
            room.id,
            slot.id,
            dayOfWeek
          );

          if (!clashResult.hasConflict) {
            let subjectInfo;
            if (subjectId) {
              const [subject] = await db
                .select()
                .from(subjects)
                .where(eq(subjects.id, subjectId))
                .limit(1);
              subjectInfo = subject;
            }

            availableSlots.push({
              faculty: {
                id: facultyMember.id,
                name: facultyMember.employeeId,
                designation: facultyMember.designation,
              },
              room: {
                id: room.id,
                name: room.name,
                type: room.type,
                capacity: room.capacity,
              },
              timeSlot: {
                id: slot.id,
                name: slot.name,
                startTime: slot.startTime,
                endTime: slot.endTime,
              },
              subject: subjectInfo,
            });
          }
        }
      }
    }

    return availableSlots;
  }

  /**
   * Get student's complete timetable
   */
  async getStudentTimetable(divisionId: string): Promise<any[]> {
    const result = await db
      .select({
        id: timetables.id,
        dayOfWeek: timetables.dayOfWeek,
        subject: {
          id: subjects.id,
          name: subjects.name,
          code: subjects.code,
          type: subjects.type,
          credits: subjects.credits,
        },
        faculty: {
          id: faculty.id,
          employeeId: faculty.employeeId,
          designation: faculty.designation,
        },
        room: {
          id: rooms.id,
          name: rooms.name,
          type: rooms.type,
          capacity: rooms.capacity,
        },
        timeSlot: {
          id: timeSlots.id,
          name: timeSlots.name,
          startTime: timeSlots.startTime,
          endTime: timeSlots.endTime,
        },
      })
      .from(timetables)
      .innerJoin(subjects, eq(timetables.subjectId, subjects.id))
      .innerJoin(faculty, eq(timetables.facultyId, faculty.id))
      .innerJoin(rooms, eq(timetables.roomId, rooms.id))
      .innerJoin(timeSlots, eq(timetables.timeSlotId, timeSlots.id))
      .where(and(eq(timetables.divisionId, divisionId), eq(timetables.isActive, true)))
      .orderBy(timetables.dayOfWeek, timeSlots.startTime);

    return result;
  }
}