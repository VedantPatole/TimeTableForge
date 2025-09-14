import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DoorClosed, DoorOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RoomOccupancy() {
  const { data: rooms, isLoading } = useQuery({
    queryKey: ["/api/dashboard/room-occupancy"],
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Room Occupancy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">Room Occupancy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rooms?.map((room: any) => (
          <div key={room.id} className="flex items-center justify-between" data-testid={`room-${room.name.replace(/\s+/g, '-').toLowerCase()}`}>
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                room.isOccupied ? 'bg-red-100' : 'bg-green-100'
              }`}>
                {room.isOccupied ? (
                  <DoorClosed className="text-red-600 text-sm" />
                ) : (
                  <DoorOpen className="text-green-600 text-sm" />
                )}
              </div>
              <span className="text-sm font-medium text-foreground" data-testid={`room-name-${room.name.replace(/\s+/g, '-').toLowerCase()}`}>
                {room.name}
              </span>
            </div>
            <span className={`status-badge ${room.isOccupied ? 'status-occupied' : 'status-active'}`}>
              {room.isOccupied ? 'Occupied' : 'Available'}
            </span>
          </div>
        )) || (
          <div className="text-center py-4 text-muted-foreground" data-testid="no-rooms">
            No room data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
