import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DepartmentOverview() {
  const { data: departments, isLoading } = useQuery({
    queryKey: ["/api/dashboard/department-overview"],
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Department Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">Department Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {departments?.map((dept: any) => (
          <div key={dept.id} className="flex items-center justify-between" data-testid={`department-${dept.code.toLowerCase()}`}>
            <div>
              <p className="text-sm font-medium text-foreground" data-testid={`dept-name-${dept.code.toLowerCase()}`}>
                {dept.name}
              </p>
              <p className="text-xs text-muted-foreground" data-testid={`dept-info-${dept.code.toLowerCase()}`}>
                {dept.divisions} divisions, {dept.faculty} faculty
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground" data-testid={`dept-students-${dept.code.toLowerCase()}`}>
                {dept.students}
              </p>
              <p className="text-xs text-muted-foreground">students</p>
            </div>
          </div>
        )) || (
          <div className="text-center py-4 text-muted-foreground" data-testid="no-departments">
            No department data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
