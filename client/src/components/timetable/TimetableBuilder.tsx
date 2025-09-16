import React, { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import SlotSelector from "./SlotSelector";
import { AlertCircle, CheckCircle, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface TimeSlotData {
  subjectId?: string;
  facultyId?: string;
  roomId?: string;
  conflicts?: string[];
  isLocked?: boolean;
}

interface TimetableData {
  [day: number]: {
    [timeSlotId: string]: TimeSlotData;
  };
}

interface TimetableBuilderProps {
  divisionId: string;
  onTimetableComplete?: (timetable: any[]) => void;
  readOnly?: boolean;
}

const DAYS = [
  { id: 1, name: "Monday", short: "Mon" },
  { id: 2, name: "Tuesday", short: "Tue" },
  { id: 3, name: "Wednesday", short: "Wed" },
  { id: 4, name: "Thursday", short: "Thu" },
  { id: 5, name: "Friday", short: "Fri" },
];

const TimetableBuilder: React.FC<TimetableBuilderProps> = ({
  divisionId,
  onTimetableComplete,
  readOnly = false,
}) => {
  const [timetableData, setTimetableData] = useState<TimetableData>({});
  const [selectedCell, setSelectedCell] = useState<{day: number, slot: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch time slots for grid columns
  const { data: timeSlotsData, isLoading: isLoadingSlots } = useQuery({
    queryKey: ["/api/slots"],
  });

  // Fetch reference data for display names
  const { data: subjectsData } = useQuery({
    queryKey: ["/api/subjects"],
  });

  const { data: facultyData } = useQuery({
    queryKey: ["/api/faculty"],
  });

  const { data: roomsData } = useQuery({
    queryKey: ["/api/rooms"],
  });

  const timeSlots = (timeSlotsData as any)?.data || [];
  const subjects = (subjectsData as any)?.data || [];
  const faculty = (facultyData as any)?.data || [];
  const rooms = (roomsData as any)?.data || [];

  // Check for conflicts when selections change
  const checkConflictsMutation = useMutation({
    mutationFn: async (timetableEntries: any[]): Promise<any> => {
      const response = await apiRequest("POST", "/api/timetable/create", timetableEntries);
      return response.json();
    },
  });

  // Note: Real-time conflict checking would require a dedicated validation endpoint
  // For now, conflicts are checked only on submit

  // Submit final timetable
  const submitTimetable = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Convert timetableData to API format
      const entries = [];
      
      for (const [dayStr, dayData] of Object.entries(timetableData)) {
        const day = parseInt(dayStr);
        for (const [timeSlotId, slotData] of Object.entries(dayData)) {
          const typedSlotData = slotData as TimeSlotData;
          if (typedSlotData.subjectId && typedSlotData.facultyId && typedSlotData.roomId) {
            entries.push({
              divisionId,
              subjectId: typedSlotData.subjectId,
              facultyId: typedSlotData.facultyId,
              roomId: typedSlotData.roomId,
              timeSlotId,
              dayOfWeek: day,
              isActive: true,
            });
          }
        }
      }

      if (entries.length === 0) {
        throw new Error("No valid timetable entries to submit");
      }

      const result = await checkConflictsMutation.mutateAsync(entries);
      
      setSubmitSuccess(true);
      if (onTimetableComplete) {
        onTimetableComplete((result as any).data?.created_entries || entries);
      }
      
      // Refresh related queries
      queryClient.invalidateQueries({ queryKey: ["/api/timetables"] });
      
    } catch (error: any) {
      console.error("Submit error:", error);
      // Handle API errors properly - need to parse the thrown error
      try {
        const errorMessage = error.message || error.toString();
        if (errorMessage.includes("409:")) {
          // Parse conflict data from error message
          setSubmitError("Scheduling conflicts detected. Please review and resolve conflicts before submitting.");
        } else {
          setSubmitError(errorMessage || "Failed to submit timetable");
        }
      } catch (parseError) {
        setSubmitError("Failed to submit timetable");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [timetableData, divisionId, onTimetableComplete, queryClient, checkConflictsMutation]);

  const updateConflicts = (conflicts: any[]) => {
    // Mark cells with conflicts
    setTimetableData(prev => {
      const updated = { ...prev };
      
      conflicts.forEach((conflict: any) => {
        const entry = conflict.conflicted_entry;
        if (entry && updated[entry.day_of_week] && updated[entry.day_of_week][entry.time_slot_id]) {
          updated[entry.day_of_week][entry.time_slot_id] = {
            ...updated[entry.day_of_week][entry.time_slot_id],
            conflicts: conflict.conflict_details.map((d: any) => d.message)
          };
        }
      });
      
      return updated;
    });
  };

  const updateSlot = useCallback((day: number, timeSlotId: string, field: keyof TimeSlotData, value: string) => {
    setTimetableData(prev => {
      const updated = { ...prev };
      if (!updated[day]) updated[day] = {};
      if (!updated[day][timeSlotId]) updated[day][timeSlotId] = {};
      
      updated[day][timeSlotId] = {
        ...updated[day][timeSlotId],
        [field]: value,
        conflicts: undefined, // Clear conflicts when user changes something
      };
      
      return updated;
    });
  }, []);

  // Clear conflicts when user changes selections
  useEffect(() => {
    if (selectedCell) {
      setTimetableData(prev => {
        const updated = { ...prev };
        if (updated[selectedCell.day] && updated[selectedCell.day][selectedCell.slot]) {
          updated[selectedCell.day][selectedCell.slot] = {
            ...updated[selectedCell.day][selectedCell.slot],
            conflicts: undefined,
          };
        }
        return updated;
      });
    }
  }, [selectedCell]);

  const getSlotData = (day: number, timeSlotId: string): TimeSlotData => {
    return timetableData[day]?.[timeSlotId] || {};
  };

  // Helper functions to get display names
  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find((s: any) => s.id === subjectId);
    return subject ? `${subject.name} (${subject.code})` : subjectId;
  };

  const getFacultyName = (facultyId: string) => {
    const facultyMember = faculty.find((f: any) => f.id === facultyId);
    return facultyMember ? `${facultyMember.user?.name || 'Unknown'} - ${facultyMember.designation}` : facultyId;
  };

  const getRoomName = (roomId: string) => {
    const room = rooms.find((r: any) => r.id === roomId);
    return room ? `${room.name} (${room.type})` : roomId;
  };

  const getSlotStatus = (slotData: TimeSlotData) => {
    if (slotData.conflicts && slotData.conflicts.length > 0) return "conflict";
    if (slotData.subjectId && slotData.facultyId && slotData.roomId) return "complete";
    if (slotData.subjectId || slotData.facultyId || slotData.roomId) return "partial";
    return "empty";
  };

  const getSlotStatusColor = (status: string) => {
    switch (status) {
      case "complete": return "bg-green-100 border-green-300 hover:bg-green-50";
      case "partial": return "bg-yellow-100 border-yellow-300 hover:bg-yellow-50";
      case "conflict": return "bg-red-100 border-red-300 hover:bg-red-50";
      default: return "bg-gray-50 border-gray-200 hover:bg-gray-100";
    }
  };

  if (isLoadingSlots) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Timetable Builder...</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasCompleteSchedule = () => {
    let filledSlots = 0;
    let totalSlots = DAYS.length * timeSlots.length;
    
    for (const day of DAYS) {
      for (const slot of timeSlots) {
        const slotData = getSlotData(day.id, slot.id);
        if (slotData.subjectId && slotData.facultyId && slotData.roomId) {
          filledSlots++;
        }
      }
    }
    
    return { filledSlots, totalSlots, isComplete: filledSlots > 0 };
  };

  const scheduleStats = hasCompleteSchedule();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Timetable Builder</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Build your weekly schedule by selecting subjects, faculty, and rooms for each time slot
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {scheduleStats.filledSlots}/{scheduleStats.totalSlots} slots filled
            </Badge>
            {!readOnly && (
              <Button 
                onClick={submitTimetable}
                disabled={!scheduleStats.isComplete || isSubmitting}
                className="min-w-24"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Submit
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {submitSuccess && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Timetable has been successfully created and saved.
              </AlertDescription>
            </Alert>
          )}
          
          {submitError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Grid Container */}
          <div className="overflow-x-auto">
            <div className="min-w-4xl">
              {/* Header Row */}
              <div className="grid grid-cols-6 gap-2 mb-2">
                <div className="p-2 font-medium text-center text-sm bg-muted rounded">
                  Day / Time
                </div>
                {timeSlots.map((slot: any) => (
                  <div key={slot.id} className="p-2 font-medium text-center text-xs bg-muted rounded">
                    <div>{slot.name}</div>
                    <div className="text-muted-foreground">
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </div>
                ))}
              </div>

              {/* Day Rows */}
              {DAYS.map((day) => (
                <div key={day.id} className="grid grid-cols-6 gap-2 mb-2">
                  {/* Day Header */}
                  <div className="p-3 font-medium bg-muted rounded flex items-center justify-center text-sm">
                    <div className="text-center">
                      <div>{day.name}</div>
                      <div className="text-xs text-muted-foreground">{day.short}</div>
                    </div>
                  </div>

                  {/* Time Slots */}
                  {timeSlots.map((slot: any) => {
                    const slotData = getSlotData(day.id, slot.id);
                    const status = getSlotStatus(slotData);
                    const isSelected = selectedCell?.day === day.id && selectedCell?.slot === slot.id;

                    return (
                      <div 
                        key={slot.id}
                        className={cn(
                          "border-2 rounded-lg p-2 transition-all cursor-pointer min-h-24",
                          getSlotStatusColor(status),
                          isSelected && "ring-2 ring-blue-500",
                          readOnly && "cursor-default"
                        )}
                        onClick={() => !readOnly && setSelectedCell(
                          isSelected ? null : { day: day.id, slot: slot.id }
                        )}
                      >
                        {/* Slot Content */}
                        <div className="space-y-1">
                          {slotData.subjectId && (
                            <div className="text-xs font-medium text-blue-700 truncate" title={getSubjectName(slotData.subjectId)}>
                              📚 {getSubjectName(slotData.subjectId)}
                            </div>
                          )}
                          {slotData.facultyId && (
                            <div className="text-xs text-green-700 truncate" title={getFacultyName(slotData.facultyId)}>
                              👨‍🏫 {getFacultyName(slotData.facultyId)}
                            </div>
                          )}
                          {slotData.roomId && (
                            <div className="text-xs text-purple-700 truncate" title={getRoomName(slotData.roomId)}>
                              🏫 {getRoomName(slotData.roomId)}
                            </div>
                          )}
                          {slotData.conflicts && slotData.conflicts.length > 0 && (
                            <div className="text-xs text-red-600 font-medium">
                              ⚠️ Conflict!
                            </div>
                          )}
                          {!slotData.subjectId && !slotData.facultyId && !slotData.roomId && (
                            <div className="text-xs text-muted-foreground text-center">
                              Click to configure
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Selection Panel */}
          {selectedCell && !readOnly && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  Configure {DAYS.find(d => d.id === selectedCell.day)?.name} - {
                    timeSlots.find((s: any) => s.id === selectedCell.slot)?.name
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <SlotSelector
                      type="subject"
                      value={getSlotData(selectedCell.day, selectedCell.slot).subjectId}
                      onChange={(value) => updateSlot(selectedCell.day, selectedCell.slot, "subjectId", value)}
                      divisionId={divisionId}
                      dayOfWeek={selectedCell.day}
                      timeSlotId={selectedCell.slot}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Faculty</label>
                    <SlotSelector
                      type="faculty"
                      value={getSlotData(selectedCell.day, selectedCell.slot).facultyId}
                      onChange={(value) => updateSlot(selectedCell.day, selectedCell.slot, "facultyId", value)}
                      divisionId={divisionId}
                      dayOfWeek={selectedCell.day}
                      timeSlotId={selectedCell.slot}
                      subjectId={getSlotData(selectedCell.day, selectedCell.slot).subjectId}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Room</label>
                    <SlotSelector
                      type="room"
                      value={getSlotData(selectedCell.day, selectedCell.slot).roomId}
                      onChange={(value) => updateSlot(selectedCell.day, selectedCell.slot, "roomId", value)}
                      divisionId={divisionId}
                      dayOfWeek={selectedCell.day}
                      timeSlotId={selectedCell.slot}
                      subjectId={getSlotData(selectedCell.day, selectedCell.slot).subjectId}
                    />
                  </div>
                </div>
                
                {getSlotData(selectedCell.day, selectedCell.slot).conflicts && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Scheduling Conflicts</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside mt-2">
                        {getSlotData(selectedCell.day, selectedCell.slot).conflicts?.map((conflict, idx) => (
                          <li key={idx} className="text-sm">{conflict}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimetableBuilder;