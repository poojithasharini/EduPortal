import { FileText, CheckCircle2, User } from "lucide-react";

const submissions = [
  { student: "Alex Johnson", assignment: "Binary Trees", course: "CS 201", status: "graded", grade: "A" },
  { student: "Maria Garcia", assignment: "Lab Report 3", course: "PHY 101", status: "pending", grade: null },
  { student: "James Chen", assignment: "Integration HW", course: "MATH 202", status: "graded", grade: "B+" },
  { student: "Sarah Kim", assignment: "Essay Draft", course: "HIS 301", status: "pending", grade: null },
  { student: "David Lee", assignment: "Sorting Algorithms", course: "CS 201", status: "graded", grade: "A-" },
];

export function RecentSubmissions() {
  return (
    <div className="rounded-xl bg-card border border-border p-6 shadow-card">
      <h3 className="font-display font-semibold text-foreground mb-4">Recent Submissions</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-semibold text-muted-foreground pb-3">Student</th>
              <th className="text-left text-xs font-semibold text-muted-foreground pb-3">Assignment</th>
              <th className="text-left text-xs font-semibold text-muted-foreground pb-3">Course</th>
              <th className="text-left text-xs font-semibold text-muted-foreground pb-3">Status</th>
              <th className="text-left text-xs font-semibold text-muted-foreground pb-3">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {submissions.map((s, i) => (
              <tr key={i} className="hover:bg-secondary/50 transition-colors">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                      {s.student.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-foreground">{s.student}</span>
                  </div>
                </td>
                <td className="py-3 text-sm text-foreground">{s.assignment}</td>
                <td className="py-3 text-sm text-muted-foreground">{s.course}</td>
                <td className="py-3">
                  {s.status === "graded" ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-md">
                      <CheckCircle2 className="w-3 h-3" /> Graded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-warning bg-warning/10 px-2 py-1 rounded-md">
                      Pending
                    </span>
                  )}
                </td>
                <td className="py-3 text-sm font-semibold text-foreground">{s.grade || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
