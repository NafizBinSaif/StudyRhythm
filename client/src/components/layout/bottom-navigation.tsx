import { Home, Calendar, BookOpen, BarChart3, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/schedule", label: "Schedule", icon: Calendar },
    { path: "/subjects", label: "Subjects", icon: BookOpen },
    { path: "/exams", label: "Exams", icon: BarChart3 },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link key={path} href={path}>
            <Button
              variant="ghost"
              className={`flex flex-col items-center py-2 px-3 h-auto ${
                location === path ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  );
}
