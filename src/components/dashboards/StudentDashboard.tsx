import {
  BookOpen,
  FileText,
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { GradeChart } from "@/components/dashboard/GradeChart";
import { UpcomingDeadlines } from "@/components/dashboard/UpcomingDeadlines";
import { RecentAssignments } from "@/components/dashboard/RecentAssignments";

export function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's your academic overview</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Enrolled Courses"
          value="6"
          icon={BookOpen}
          trend="+1 this semester"
          variant="primary"
        />
        <KpiCard
          title="Total Assignments"
          value="24"
          icon={FileText}
          trend="8 pending"
          variant="info"
        />
        <KpiCard
          title="Submitted"
          value="16"
          icon={CheckCircle2}
          trend="67% completion"
          variant="success"
        />
        <KpiCard
          title="Attendance"
          value="92%"
          icon={TrendingUp}
          trend="Above average"
          variant="warning"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart />
        <GradeChart />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingDeadlines />
        <RecentAssignments />
      </div>
    </div>
  );
}
