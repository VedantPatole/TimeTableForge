import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RecentActivity() {
  // Mock recent activity data for now
  const activities = [
    {
      id: 1,
      time: "2 min ago",
      action: "Schedule Updated",
      user: "Dr. Smith",
      initials: "DS",
      details: "Modified Database Systems lecture for IT-A",
      status: "Completed",
      statusColor: "status-active",
    },
    {
      id: 2,
      time: "15 min ago",
      action: "Room Booking",
      user: "Prof. Johnson",
      initials: "PJ",
      details: "Reserved Lab 201 for Web Dev practical",
      status: "Approved",
      statusColor: "status-active",
    },
    {
      id: 3,
      time: "1 hour ago",
      action: "New Faculty",
      user: "Admin",
      initials: "AD",
      details: "Added Dr. Williams to EXTC department",
      status: "Pending",
      statusColor: "status-pending",
    },
  ];

  return (
    <Card className="p-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-foreground">Recent Activity</CardTitle>
          <Button variant="ghost" className="text-primary hover:text-primary/80 font-medium" data-testid="button-view-all">
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Time</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Details</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id} className="table-hover border-b border-border/50" data-testid={`activity-${activity.id}`}>
                <td className="py-3 px-4">
                  <span className="text-sm text-muted-foreground" data-testid={`activity-time-${activity.id}`}>
                    {activity.time}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm font-medium text-foreground" data-testid={`activity-action-${activity.id}`}>
                    {activity.action}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">{activity.initials}</span>
                    </div>
                    <span className="text-sm text-foreground" data-testid={`activity-user-${activity.id}`}>
                      {activity.user}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-muted-foreground" data-testid={`activity-details-${activity.id}`}>
                    {activity.details}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`status-badge ${activity.statusColor}`}>
                    {activity.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
