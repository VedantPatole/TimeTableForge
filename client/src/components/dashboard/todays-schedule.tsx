import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function TodaysSchedule() {
  const { data: schedule, isLoading } = useQuery({
    queryKey: ["/api/dashboard/todays-schedule"],
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (startTime: string) => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    
    if (currentTime >= startTime) {
      return <span className="status-badge status-active">Active</span>;
    }
    return <span className="status-badge status-pending">Upcoming</span>;
  };

  const getStatusColor = (index: number) => {
    const colors = ['bg-primary', 'bg-accent', 'bg-green-500', 'bg-purple-500'];
    return colors[index % colors.length];
  };

  return (
    <Card className="p-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-foreground">Today's Schedule</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="secondary" size="sm" data-testid="button-today">
              Today
            </Button>
            <Button variant="ghost" size="sm" data-testid="button-week">
              Week
            </Button>
            <Button variant="ghost" size="sm" data-testid="button-month">
              Month
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {schedule?.map((slot: any, index: number) => (
            <div
              key={slot.id}
              className="flex items-center p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              data-testid={`schedule-slot-${index}`}
            >
              <div className="w-20 text-sm font-medium text-muted-foreground">
                {slot.startTime}
              </div>
              <div className="flex-1 px-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 ${getStatusColor(index)} rounded-full`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground" data-testid={`slot-subject-${index}`}>
                      {slot.subject}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span data-testid={`slot-faculty-${index}`}>{slot.faculty}</span> • 
                      <span data-testid={`slot-room-${index}`}> {slot.room}</span> • 
                      <span data-testid={`slot-division-${index}`}> {slot.division}</span>
                    </p>
                  </div>
                  {getStatusBadge(slot.startTime)}
                </div>
              </div>
            </div>
          )) || (
            <div className="text-center py-8 text-muted-foreground" data-testid="no-schedule">
              No classes scheduled for today
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
