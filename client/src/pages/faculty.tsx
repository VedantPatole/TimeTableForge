import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Plus } from "lucide-react";
import { insertFacultySchema, insertUserSchema, type Faculty, type Department } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { z } from "zod";
import axios from "axios";

// Combined schema for creating faculty with user
const createFacultySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required").refine(
    (email) => email.endsWith("@college.edu"), 
    "Email must be a college email (@college.edu)"
  ),
  password: z.string().min(6, "Password must be at least 6 characters"),
  employeeId: z.string().min(1, "Employee ID is required"),
  departmentId: z.string().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
});

type CreateFacultyForm = z.infer<typeof createFacultySchema>;

export default function Faculty() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: facultyResponse, isLoading } = useQuery({
    queryKey: ["/api/faculty"],
  });

  const { data: departmentsResponse } = useQuery({
    queryKey: ["/api/departments"],
  });

  const faculty = (facultyResponse as any)?.success ? (facultyResponse as any).data : [];
  const departments = (departmentsResponse as any) || [];

  const form = useForm<CreateFacultyForm>({
    resolver: zodResolver(createFacultySchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      employeeId: "",
      departmentId: "",
      designation: "",
    },
  });

  const createFacultyMutation = useMutation({
    mutationFn: async (data: CreateFacultyForm) => {
      // First create the user with plain password (server will hash it)
      const userResponse = await axios.post('/api/users', {
        name: data.name,
        email: data.email,
        password: data.password, // Send as plain password, server will hash
        role: 'faculty',
      });

      if (userResponse.data.error) {
        throw new Error(userResponse.data.error || 'Failed to create user');
      }

      // Then create the faculty record
      const facultyResponse = await axios.post('/api/faculty', {
        userId: userResponse.data.id,
        employeeId: data.employeeId,
        departmentId: data.departmentId,
        designation: data.designation,
      });

      if (facultyResponse.data.error) {
        throw new Error(facultyResponse.data.error || 'Failed to create faculty');
      }

      return facultyResponse.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faculty"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Faculty member created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create faculty member",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateFacultyForm) => {
    createFacultyMutation.mutate(data);
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Faculty</h1>
          <p className="text-muted-foreground">Manage faculty members</p>
        </div>
        {user?.role === 'admin' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-faculty">
                <Plus className="h-4 w-4 mr-2" />
                Add Faculty
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Faculty Member</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Dr. John Smith" {...field} data-testid="input-faculty-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="dr.smith@college.edu" 
                            {...field} 
                            data-testid="input-faculty-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Password (min 6 characters)" 
                            {...field} 
                            data-testid="input-faculty-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee ID</FormLabel>
                        <FormControl>
                          <Input placeholder="EMP1001" {...field} data-testid="input-faculty-employee-id" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="departmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-faculty-department">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.map((dept: any) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name} ({dept.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Designation</FormLabel>
                        <FormControl>
                          <Input placeholder="Professor / Assistant Professor" {...field} data-testid="input-faculty-designation" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel-faculty"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createFacultyMutation.isPending}
                      data-testid="button-submit-faculty"
                    >
                      {createFacultyMutation.isPending ? "Creating..." : "Create Faculty"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
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
