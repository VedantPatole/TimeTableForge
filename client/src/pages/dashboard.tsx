import StatsCards from "@/components/dashboard/stats-cards";
import TodaysSchedule from "@/components/dashboard/todays-schedule";
import RoomOccupancy from "@/components/dashboard/room-occupancy";
import DepartmentOverview from "@/components/dashboard/department-overview";
import RecentActivity from "@/components/dashboard/recent-activity";

export default function Dashboard() {
  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      <StatsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TodaysSchedule />
        </div>
        <div className="space-y-6">
          <RoomOccupancy />
          <DepartmentOverview />
        </div>
      </div>
      
      <RecentActivity />
    </div>
  );
}
