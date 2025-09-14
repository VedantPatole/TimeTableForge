import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Timetables from "@/pages/timetables";
import Departments from "@/pages/departments";
import Faculty from "@/pages/faculty";
import Students from "@/pages/students";
import Rooms from "@/pages/rooms";
import Subjects from "@/pages/subjects";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

function Router() {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/timetables" component={Timetables} />
            <Route path="/departments" component={Departments} />
            <Route path="/faculty" component={Faculty} />
            <Route path="/students" component={Students} />
            <Route path="/rooms" component={Rooms} />
            <Route path="/subjects" component={Subjects} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
