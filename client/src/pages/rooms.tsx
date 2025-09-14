import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DoorOpen, Users } from "lucide-react";

export default function Rooms() {
  const { data: rooms, isLoading } = useQuery({
    queryKey: ["/api/rooms"],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Rooms</h1>
          <p className="text-muted-foreground">Manage classrooms and laboratories</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Rooms</h1>
        <p className="text-muted-foreground">Manage classrooms and laboratories</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms?.map((room: any) => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow" data-testid={`room-card-${room.name.replace(/\s+/g, '-').toLowerCase()}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <DoorOpen className="h-5 w-5" />
                  <span data-testid={`room-name-${room.name.replace(/\s+/g, '-').toLowerCase()}`}>{room.name}</span>
                </CardTitle>
                <Badge variant={room.type === 'lab' ? 'default' : 'secondary'} data-testid={`room-type-${room.name.replace(/\s+/g, '-').toLowerCase()}`}>
                  {room.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Capacity: <span className="font-medium text-foreground" data-testid={`room-capacity-${room.name.replace(/\s+/g, '-').toLowerCase()}`}>
                      {room.capacity}
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={room.isActive ? 'default' : 'secondary'}>
                    {room.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Added: {new Date(room.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )) || (
          <div className="col-span-full text-center py-8 text-muted-foreground" data-testid="no-rooms">
            No rooms found
          </div>
        )}
      </div>
    </div>
  );
}
