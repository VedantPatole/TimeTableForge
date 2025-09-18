import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Upload, Plus } from "lucide-react";
import { useState } from "react";

interface StudentWithDetails {
  id: string;
  rollNumber: string;
  year: number;
  userName: string;
  userEmail: string;
  divisionName: string;
  departmentName: string;
  departmentCode: string;
  capacity: number;
  createdAt: string;
}

interface StudentsResponse {
  success: boolean;
  data: StudentWithDetails[];
}

export default function Students() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  
  const { data: response, isLoading } = useQuery<StudentsResponse>({
    queryKey: ["/api/students"],
  });
  
  const students = response?.data || [];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Students</h1>
          <p className="text-muted-foreground">Manage student records</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Students</h1>
          <p className="text-muted-foreground">Manage student records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-upload-excel">
            <Upload className="h-4 w-4 mr-2" />
            Upload Excel
          </Button>
          <Button data-testid="button-add-student">
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Year Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          variant={selectedYear === null ? "default" : "outline"}
          onClick={() => setSelectedYear(null)}
          data-testid="filter-all-years"
        >
          All Years
        </Button>
        {[1, 2, 3, 4].map(year => {
          const yearStudents = students.filter(s => s.year === year);
          return (
            <Button 
              key={year}
              variant={selectedYear === year ? "default" : "outline"}
              onClick={() => setSelectedYear(year)}
              data-testid={`filter-year-${year}`}
            >
              Year {year} ({yearStudents.length})
            </Button>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedYear ? `Year ${selectedYear} Students` : 'All Students'} 
            ({students.filter(s => selectedYear === null || s.year === selectedYear).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Roll Number</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Division</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Year</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {students
                    .filter(student => selectedYear === null || student.year === selectedYear)
                    .map((student) => (
                    <tr key={student.id} className="table-hover border-b border-border/50" data-testid={`student-${student.rollNumber}`}>
                      <td className="py-3 px-4">
                        <Badge variant="outline" data-testid={`student-roll-${student.rollNumber}`}>
                          {student.rollNumber}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-foreground" data-testid={`student-name-${student.rollNumber}`}>
                        {student.userName}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground" data-testid={`student-email-${student.rollNumber}`}>
                        {student.userEmail}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground" data-testid={`student-division-${student.rollNumber}`}>
                        {student.divisionName}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground" data-testid={`student-department-${student.rollNumber}`}>
                        <Badge variant="secondary">{student.departmentCode}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground" data-testid={`student-year-${student.rollNumber}`}>
                        Year {student.year}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground" data-testid="no-students">
              No students found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
