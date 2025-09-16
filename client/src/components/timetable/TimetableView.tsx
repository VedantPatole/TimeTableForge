import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, BookOpen, AlertCircle, Download, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimetableViewProps {
  divisionId?: string;
  readonly?: boolean;
  showExportOptions?: boolean;
}

interface TimetableEntry {
  id: string;
  dayOfWeek: number;
  timeSlot: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
  };
  subject: {
    id: string;
    name: string;
    code: string;
    type: string;
  };
  faculty: {
    id: string;
    user: {
      name: string;
    };
    designation: string;
  };
  room: {
    id: string;
    name: string;
    type: string;
    capacity: number;
  };
}

const DAYS = [
  { id: 1, name: "Monday", short: "Mon" },
  { id: 2, name: "Tuesday", short: "Tue" },
  { id: 3, name: "Wednesday", short: "Wed" },
  { id: 4, name: "Thursday", short: "Thu" },
  { id: 5, name: "Friday", short: "Fri" },
];

const TimetableView: React.FC<TimetableViewProps> = ({
  divisionId,
  readonly = true,
  showExportOptions = false,
}) => {
  // Fetch timetable data
  const { data: timetableData, isLoading, error } = useQuery({
    queryKey: divisionId 
      ? [`/api/timetables?divisionId=${divisionId}`]
      : ["/api/timetable/my-schedule"],
  });

  // Fetch time slots for consistent grid structure
  const { data: timeSlotsData } = useQuery({
    queryKey: ["/api/slots"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Timetable...</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load timetable. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const timetables = (timetableData as any)?.data || [];
  const timeSlots = (timeSlotsData as any)?.data || [];
  
  // Organize timetable by day and time slot
  const organizedTimetable: Record<number, Record<string, TimetableEntry>> = {};
  
  // Initialize structure
  DAYS.forEach(day => {
    organizedTimetable[day.id] = {};
  });

  // Populate with actual data
  timetables.forEach((entry: TimetableEntry) => {
    if (organizedTimetable[entry.dayOfWeek]) {
      organizedTimetable[entry.dayOfWeek][entry.timeSlot.id] = entry;
    }
  });

  const getSubjectTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "theory": return "bg-blue-100 text-blue-800 border-blue-200";
      case "practical": return "bg-green-100 text-green-800 border-green-200";
      case "lab": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoomTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "classroom": return "text-blue-600";
      case "lab": return "text-purple-600";
      case "auditorium": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const handleExport = (format: "pdf" | "csv") => {
    // Implement export functionality
    console.log(`Exporting timetable as ${format}`);
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate schedule statistics
  const totalSlots = DAYS.length * timeSlots.length;
  const filledSlots = timetables.length;
  const utilizationPercentage = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Timetable
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Complete schedule for the academic week
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {filledSlots}/{totalSlots} slots ({utilizationPercentage}% utilized)
            </Badge>
            {showExportOptions && (
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {timetables.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No Timetable Available
              </h3>
              <p className="text-sm text-muted-foreground">
                The timetable for this division has not been created yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-4xl">
                {/* Header Row */}
                <div className="grid grid-cols-6 gap-2 mb-4">
                  <div className="p-3 font-semibold text-center bg-muted rounded-lg">
                    Day / Time
                  </div>
                  {timeSlots.map((slot: any) => (
                    <div key={slot.id} className="p-3 font-semibold text-center bg-muted rounded-lg">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-4 w-4" />
                        {slot.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {slot.startTime} - {slot.endTime}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Day Rows */}
                {DAYS.map((day) => (
                  <div key={day.id} className="grid grid-cols-6 gap-2 mb-3">
                    {/* Day Header */}
                    <div className="p-4 font-semibold bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-sm">{day.name}</div>
                        <div className="text-xs text-muted-foreground">{day.short}</div>
                      </div>
                    </div>

                    {/* Time Slots */}
                    {timeSlots.map((slot: any) => {
                      const entry = organizedTimetable[day.id][slot.id];

                      return (
                        <div 
                          key={slot.id}
                          className={cn(
                            "border rounded-lg p-3 min-h-24 transition-all",
                            entry 
                              ? "bg-white shadow-sm hover:shadow-md border-gray-200" 
                              : "bg-gray-50 border-dashed border-gray-300"
                          )}
                        >
                          {entry ? (
                            <div className="space-y-2">
                              {/* Subject */}
                              <div className="flex items-start gap-2">
                                <BookOpen className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-sm text-gray-900 truncate">
                                    {entry.subject.name}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge 
                                      variant="outline" 
                                      className={cn("text-xs", getSubjectTypeColor(entry.subject.type))}
                                    >
                                      {entry.subject.code}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {entry.subject.type}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Faculty */}
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-medium text-gray-700 truncate">
                                    {entry.faculty.user.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {entry.faculty.designation}
                                  </div>
                                </div>
                              </div>

                              {/* Room */}
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-purple-600 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className={cn("text-xs font-medium truncate", getRoomTypeColor(entry.room.type))}>
                                    {entry.room.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {entry.room.type} (Cap: {entry.room.capacity})
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <span className="text-xs text-muted-foreground">
                                Free Period
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Summary */}
      {timetables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Schedule Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{filledSlots}</div>
                <div className="text-sm text-blue-700">Total Classes</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{utilizationPercentage}%</div>
                <div className="text-sm text-green-700">Time Utilization</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(timetables.map((t: any) => t.subject.id)).size}
                </div>
                <div className="text-sm text-purple-700">Unique Subjects</div>
              </div>
            </div>

            {/* Daily Distribution */}
            <div className="mt-6">
              <h4 className="font-medium mb-3">Daily Class Distribution</h4>
              <div className="grid grid-cols-5 gap-2">
                {DAYS.map(day => {
                  const dayClasses = timetables.filter((t: any) => t.dayOfWeek === day.id).length;
                  return (
                    <div key={day.id} className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium text-lg">{dayClasses}</div>
                      <div className="text-xs text-muted-foreground">{day.short}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TimetableView;