import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Departments() {
  const { data: departments, isLoading } = useQuery({
    queryKey: ["/api/departments"],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Departments</h1>
          <p className="text-muted-foreground">Manage academic departments</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
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
        <h1 className="text-2xl font-semibold text-foreground">Departments</h1>
        <p className="text-muted-foreground">Manage academic departments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments?.map((department: any) => (
          <Card key={department.id} className="hover:shadow-lg transition-shadow" data-testid={`department-card-${department.code.toLowerCase()}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg" data-testid={`dept-name-${department.code.toLowerCase()}`}>
                  {department.name}
                </CardTitle>
                <Badge variant="secondary" data-testid={`dept-code-${department.code.toLowerCase()}`}>
                  {department.code}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Department Code: <span className="font-medium text-foreground">{department.code}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Created: <span className="font-medium text-foreground">
                    {new Date(department.createdAt).toLocaleDateString()}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        )) || (
          <div className="col-span-full text-center py-8 text-muted-foreground" data-testid="no-departments">
            No departments found
          </div>
        )}
      </div>
    </div>
  );
}
