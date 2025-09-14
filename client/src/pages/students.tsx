import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Students() {
  const { data: students, isLoading } = useQuery({
    queryKey: ["/api/students"],
  });

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
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Students</h1>
        <p className="text-muted-foreground">Manage student records</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
        </CardHeader>
        <CardContent>
          {students?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Roll Number</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Division</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Year</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student: any) => (
                    <tr key={student.id} className="table-hover border-b border-border/50" data-testid={`student-${student.rollNumber}`}>
                      <td className="py-3 px-4">
                        <Badge variant="outline" data-testid={`student-roll-${student.rollNumber}`}>
                          {student.rollNumber}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-foreground" data-testid={`student-name-${student.rollNumber}`}>
                        {student.userId}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground" data-testid={`student-division-${student.rollNumber}`}>
                        {student.divisionId}
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
