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
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Login from "@/components/auth/Login";
import AuthNavbar from "@/components/auth/Navbar";
import AuthDashboard from "@/components/auth/Dashboard";

function Router() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        <AuthNavbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1">
            <Switch>
              <Route path="/" component={AuthDashboard} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/timetables" component={Timetables} />
              <Route path="/departments" component={Departments} />
              <Route path="/faculty" component={Faculty} />
              <Route path="/students" component={Students} />
              <Route path="/rooms" component={Rooms} />
              <Route path="/subjects" component={Subjects} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
