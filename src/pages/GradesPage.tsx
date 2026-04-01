import { DashboardLayout } from "@/components/DashboardLayout";
import { useGrades } from "@/hooks/usePortalData";

const gradeColor = (grade: string | null) => {
  if (!grade) return "text-muted-foreground bg-muted";
  if (grade.startsWith("A")) return "text-success bg-success/10";
  if (grade.startsWith("B")) return "text-info bg-info/10";
  return "text-warning bg-warning/10";
};

export default function GradesPage() {
  const { data: grades, isLoading } = useGrades();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Grades</h1>
          <p className="text-muted-foreground mt-1">Your academic performance</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading grades...</div>
        ) : !grades?.length ? (
          <div className="text-center py-12 text-muted-foreground">No grades yet.</div>
        ) : (
          <div className="rounded-xl bg-card border border-border shadow-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground p-4">Assignment</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground p-4">Course</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground p-4">Points</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground p-4">Grade</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground p-4">Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {grades.map((g: any) => (
                  <tr key={g.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-4 text-sm font-medium text-foreground">{g.assignments?.title || "—"}</td>
                    <td className="p-4 text-sm text-primary font-semibold">{g.assignments?.courses?.code || "—"}</td>
                    <td className="p-4 text-sm text-center text-muted-foreground">{g.points}/{g.assignments?.max_points || 100}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block text-sm font-bold px-3 py-1 rounded-lg ${gradeColor(g.letter_grade)}`}>
                        {g.letter_grade || "—"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{g.feedback || "—"}</td>
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
