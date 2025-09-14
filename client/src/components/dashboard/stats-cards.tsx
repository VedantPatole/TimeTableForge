import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, DoorOpen, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: "Total Students",
      value: stats?.totalStudents || 0,
      change: "+12% from last semester",
      icon: GraduationCap,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Faculty Members",
      value: stats?.totalFaculty || 0,
      change: "+3 new hires",
      icon: Users,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Active Rooms",
      value: stats?.activeRooms || 0,
      change: "All operational",
      icon: DoorOpen,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Weekly Classes",
      value: stats?.weeklyClasses || 0,
      change: "Peak schedule",
      icon: Calendar,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                  <p className="text-3xl font-bold text-foreground" data-testid={`stat-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    {item.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600">{item.change}</p>
                </div>
                <div className={`w-12 h-12 ${item.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${item.iconColor} text-xl`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
