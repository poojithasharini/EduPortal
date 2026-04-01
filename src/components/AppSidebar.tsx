import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  GraduationCap,
  User,
  BarChart3,
  Users,
  ClipboardList,
  LogOut,
  ChevronLeft,
  Star,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useState } from "react";

const studentLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/courses", icon: BookOpen, label: "Courses" },
  { to: "/assignments", icon: FileText, label: "Assignments" },
  { to: "/grades", icon: GraduationCap, label: "Grades" },
  { to: "/attendance", icon: BarChart3, label: "Attendance" },
  { to: "/profile", icon: User, label: "Profile" },
];

const professorLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/courses", icon: BookOpen, label: "Courses" },
  { to: "/assignments", icon: ClipboardList, label: "Assignments" },
  { to: "/grading", icon: Star, label: "Grading" },
  { to: "/students", icon: Users, label: "Students" },
  { to: "/grades", icon: GraduationCap, label: "Grades" },
  { to: "/attendance", icon: BarChart3, label: "Attendance" },
  { to: "/profile", icon: User, label: "Profile" },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const links = user?.role === "professor" ? professorLinks : studentLinks;

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-card transition-all duration-300 h-screen sticky top-0",
        collapsed ? "w-[68px]" : "w-[250px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-lg text-foreground truncate">
            EduPortal
          </span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "gradient-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-3 space-y-2">
        {!collapsed && user && (
          <div className="px-3 py-2 rounded-lg bg-secondary">
            <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-1.5 rounded-lg text-muted-foreground hover:bg-secondary transition-all"
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>
    </aside>
  );
}
