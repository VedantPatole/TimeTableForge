import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Dr. Johnson</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button variant="outline" size="icon" data-testid="button-notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground" data-testid="text-username">Dr. Johnson</p>
              <p className="text-xs text-muted-foreground" data-testid="text-role">Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">DJ</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
