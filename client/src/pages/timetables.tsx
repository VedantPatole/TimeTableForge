import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Timetables() {
  const { data: timetables, isLoading } = useQuery({
    queryKey: ["/api/timetables"],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Timetables</h1>
          <p className="text-muted-foreground">Manage class schedules and timetables</p>
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
        <h1 className="text-2xl font-semibold text-foreground">Timetables</h1>
        <p className="text-muted-foreground">Manage class schedules and timetables</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Timetables</CardTitle>
        </CardHeader>
        <CardContent>
          {timetables?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Day</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Time</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Subject</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Faculty</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Room</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Division</th>
                  </tr>
                </thead>
                <tbody>
                  {timetables.map((timetable: any) => (
                    <tr key={timetable.id} className="table-hover border-b border-border/50" data-testid={`timetable-${timetable.id}`}>
                      <td className="py-3 px-4 text-sm text-foreground">{timetable.dayOfWeek}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{timetable.timeSlotId}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{timetable.subjectId}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{timetable.facultyId}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{timetable.roomId}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{timetable.divisionId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground" data-testid="no-timetables">
              No timetables found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
