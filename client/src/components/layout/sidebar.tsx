import { Link, useLocation } from "wouter";
import { Home, Calendar, Building, Users, GraduationCap, DoorOpen, Book, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/timetables", label: "Timetables", icon: Calendar },
  { href: "/departments", label: "Departments", icon: Building },
  { href: "/faculty", label: "Faculty", icon: Users },
  { href: "/students", label: "Students", icon: GraduationCap },
  { href: "/rooms", label: "Rooms", icon: DoorOpen },
  { href: "/subjects", label: "Subjects", icon: Book },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border shadow-sm">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
            <Calendar className="text-primary-foreground text-lg" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">TimetableMS</h1>
            <p className="text-sm text-muted-foreground">Management System</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
        
        <div className="pt-4 mt-4 border-t border-border">
          <Link
            href="/settings"
            className="flex items-center space-x-3 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            data-testid="nav-settings"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
