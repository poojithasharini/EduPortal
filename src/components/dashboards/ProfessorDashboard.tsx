import {
  BookOpen,
  Users,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { GradeChart } from "@/components/dashboard/GradeChart";
import { RecentSubmissions } from "@/components/dashboard/RecentSubmissions";

export function ProfessorDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Welcome, {user?.name} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Manage your courses and students</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Active Courses" value="4" icon={BookOpen} trend="2 this semester" variant="primary" />
        <KpiCard title="Total Students" value="128" icon={Users} trend="+12 enrolled" variant="info" />
        <KpiCard title="Assignments Created" value="18" icon={ClipboardList} trend="5 active" variant="success" />
        <KpiCard title="Avg. Grade" value="B+" icon={TrendingUp} trend="Stable trend" variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart />
        <GradeChart />
      </div>

      <RecentSubmissions />
    </div>
  );
}
