import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Faculty() {
  const { data: faculty, isLoading } = useQuery({
    queryKey: ["/api/faculty"],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Faculty</h1>
          <p className="text-muted-foreground">Manage faculty members</p>
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
        <h1 className="text-2xl font-semibold text-foreground">Faculty</h1>
        <p className="text-muted-foreground">Manage faculty members</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Faculty Members</CardTitle>
        </CardHeader>
        <CardContent>
          {faculty?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Employee ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Designation</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {faculty.map((member: any) => (
                    <tr key={member.id} className="table-hover border-b border-border/50" data-testid={`faculty-${member.employeeId}`}>
                      <td className="py-3 px-4">
                        <Badge variant="outline" data-testid={`faculty-emp-id-${member.employeeId}`}>
                          {member.employeeId}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-foreground" data-testid={`faculty-name-${member.employeeId}`}>
                        {member.userId}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground" data-testid={`faculty-dept-${member.employeeId}`}>
                        {member.departmentId}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground" data-testid={`faculty-designation-${member.employeeId}`}>
                        {member.designation}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground" data-testid="no-faculty">
              No faculty members found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
