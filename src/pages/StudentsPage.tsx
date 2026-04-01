import { DashboardLayout } from "@/components/DashboardLayout";
import { useStudentsList } from "@/hooks/usePortalData";

export default function StudentsPage() {
  const { data: students, isLoading } = useStudentsList();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1">Manage your enrolled students</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading students...</div>
        ) : !students?.length ? (
          <div className="text-center py-12 text-muted-foreground">No students enrolled yet.</div>
        ) : (
          <div className="rounded-xl bg-card border border-border shadow-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground p-4">Student</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground p-4">Enrolled Courses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((s: any) => (
                  <tr key={s.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                          {s.full_name?.charAt(0) || "?"}
                        </div>
                        <span className="text-sm font-medium text-foreground">{s.full_name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {s.course_enrollments?.length
                        ? s.course_enrollments.map((e: any) => e.courses?.code).filter(Boolean).join(", ") || "None"
                        : "None"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
