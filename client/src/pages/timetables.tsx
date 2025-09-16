import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TimetableBuilder from "@/components/timetable/TimetableBuilder";
import TimetableView from "@/components/timetable/TimetableView";
import { Plus, Calendar, Grid } from "lucide-react";

export default function Timetables() {
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [activeTab, setActiveTab] = useState("view");

  // Fetch divisions for selection
  const { data: divisionsResponse } = useQuery({
    queryKey: ["/api/divisions"],
  });

  const divisions = (divisionsResponse as any)?.data || [];

  const handleTimetableComplete = (newTimetable: any[]) => {
    console.log("Timetable completed:", newTimetable);
    // Switch to view tab after successful creation
    setActiveTab("view");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Timetables</h1>
          <p className="text-muted-foreground">Create and manage class schedules</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          Academic Schedule Management
        </Badge>
      </div>

      {/* Division Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Division</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose a division to view or create its timetable
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-sm">
              <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose division..." />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((division: any) => (
                    <SelectItem key={division.id} value={division.id}>
                      {division.name} - {division.department?.name || 'Unknown Dept'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedDivision && (
              <Badge variant="secondary">
                {divisions.find((d: any) => d.id === selectedDivision)?.name} selected
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {selectedDivision ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="view" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              View Timetable
            </TabsTrigger>
            <TabsTrigger value="build" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              Build Timetable
            </TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="space-y-6">
            <TimetableView 
              divisionId={selectedDivision}
              showExportOptions={true}
            />
          </TabsContent>

          <TabsContent value="build" className="space-y-6">
            <TimetableBuilder
              divisionId={selectedDivision}
              onTimetableComplete={handleTimetableComplete}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="text-center space-y-4">
              <Grid className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No Division Selected
                </h3>
                <p className="text-sm text-muted-foreground">
                  Please select a division from the dropdown above to view or create its timetable.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
