import { useAuth } from "@/contexts/AuthContext";
import { StudentDashboard } from "@/components/dashboards/StudentDashboard";
import { ProfessorDashboard } from "@/components/dashboards/ProfessorDashboard";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      {user?.role === "professor" ? <ProfessorDashboard /> : <StudentDashboard />}
    </DashboardLayout>
  );
}
