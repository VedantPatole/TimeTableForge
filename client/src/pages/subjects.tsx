import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Book, GraduationCap, Laptop } from "lucide-react";

export default function Subjects() {
  const { data: subjects, isLoading } = useQuery({
    queryKey: ["/api/subjects"],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Subjects</h1>
          <p className="text-muted-foreground">Manage academic subjects and courses</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
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

  const getSubjectIcon = (type: string) => {
    switch (type) {
      case 'practical':
        return <Laptop className="h-5 w-5" />;
      case 'common':
        return <GraduationCap className="h-5 w-5" />;
      default:
        return <Book className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'practical':
        return 'bg-blue-100 text-blue-800';
      case 'common':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Subjects</h1>
        <p className="text-muted-foreground">Manage academic subjects and courses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects?.map((subject: any) => (
          <Card key={subject.id} className="hover:shadow-lg transition-shadow" data-testid={`subject-card-${subject.code.toLowerCase()}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center space-x-2">
                  {getSubjectIcon(subject.type)}
                  <span data-testid={`subject-name-${subject.code.toLowerCase()}`}>{subject.name}</span>
                </CardTitle>
                <Badge variant="outline" data-testid={`subject-code-${subject.code.toLowerCase()}`}>
                  {subject.code}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <Badge className={getTypeColor(subject.type)} data-testid={`subject-type-${subject.code.toLowerCase()}`}>
                    {subject.type}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Credits:</span>
                  <span className="text-sm font-medium text-foreground" data-testid={`subject-credits-${subject.code.toLowerCase()}`}>
                    {subject.credits}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Department:</span>
                  <span className="text-sm font-medium text-foreground" data-testid={`subject-dept-${subject.code.toLowerCase()}`}>
                    {subject.departmentId || 'Common'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Added: {new Date(subject.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )) || (
          <div className="col-span-full text-center py-8 text-muted-foreground" data-testid="no-subjects">
            No subjects found
          </div>
        )}
      </div>
    </div>
  );
}
