import { BookOpen, Users, ClipboardList, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { GradeChart } from "@/components/dashboard/GradeChart";
import { RecentSubmissions } from "@/components/dashboard/RecentSubmissions";
import { useDashboardStats } from "@/hooks/usePortalData";

export function ProfessorDashboard() {
  const { user } = useAuth();
  const { data: stats } = useDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Welcome, {user?.name} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Manage your courses and students</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Active Courses" value={String(stats?.coursesCount || 0)} icon={BookOpen} trend="Your courses" variant="primary" />
        <KpiCard title="Total Students" value={String(stats?.studentsCount || 0)} icon={Users} trend="Enrolled" variant="info" />
        <KpiCard title="Assignments" value={String(stats?.assignmentsCount || 0)} icon={ClipboardList} trend="Created" variant="success" />
        <KpiCard title="Avg. Grade" value="—" icon={TrendingUp} trend="Analytics" variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart />
        <GradeChart />
      </div>

      <RecentSubmissions />
    </div>
  );
}
