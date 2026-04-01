import {
  BookOpen, FileText, CheckCircle2, Clock, TrendingUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { GradeChart } from "@/components/dashboard/GradeChart";
import { UpcomingDeadlines } from "@/components/dashboard/UpcomingDeadlines";
import { RecentAssignments } from "@/components/dashboard/RecentAssignments";
import { useDashboardStats } from "@/hooks/usePortalData";

export function StudentDashboard() {
  const { user } = useAuth();
  const { data: stats } = useDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's your academic overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Enrolled Courses" value={String(stats?.coursesCount || 0)} icon={BookOpen} trend="This semester" variant="primary" />
        <KpiCard title="Total Assignments" value={String(stats?.assignmentsCount || 0)} icon={FileText} trend="All courses" variant="info" />
        <KpiCard title="Submitted" value={String(stats?.submissionsCount || 0)} icon={CheckCircle2} trend="Completed" variant="success" />
        <KpiCard title="Attendance" value="—" icon={TrendingUp} trend="Track your attendance" variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart />
        <GradeChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingDeadlines />
        <RecentAssignments />
      </div>
    </div>
  );
}
