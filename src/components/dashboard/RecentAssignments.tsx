import { FileText, CheckCircle2, Clock } from "lucide-react";

const assignments = [
  { title: "Binary Trees Implementation", course: "CS 201", status: "submitted", grade: "A" },
  { title: "Electromagnetic Waves", course: "PHY 101", status: "pending", grade: null },
  { title: "Integration Techniques", course: "MATH 202", status: "submitted", grade: "B+" },
  { title: "World War II Analysis", course: "HIS 301", status: "pending", grade: null },
];

export function RecentAssignments() {
  return (
    <div className="rounded-xl bg-card border border-border p-6 shadow-card">
      <h3 className="font-display font-semibold text-foreground mb-4">Recent Assignments</h3>
      <div className="space-y-3">
        {assignments.map((a, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{a.title}</p>
              <p className="text-xs text-muted-foreground">{a.course}</p>
            </div>
            <div className="flex items-center gap-2">
              {a.grade && (
                <span className="text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded-md">
                  {a.grade}
                </span>
              )}
              {a.status === "submitted" ? (
                <CheckCircle2 className="w-4 h-4 text-success" />
              ) : (
                <Clock className="w-4 h-4 text-warning" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
