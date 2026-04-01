import { Calendar, Clock } from "lucide-react";

const deadlines = [
  { title: "Data Structures - HW 5", course: "CS 201", due: "Apr 5, 2026", urgent: true },
  { title: "Physics Lab Report", course: "PHY 101", due: "Apr 8, 2026", urgent: false },
  { title: "Essay - Modern History", course: "HIS 301", due: "Apr 12, 2026", urgent: false },
  { title: "Calculus Problem Set", course: "MATH 202", due: "Apr 15, 2026", urgent: false },
];

export function UpcomingDeadlines() {
  return (
    <div className="rounded-xl bg-card border border-border p-6 shadow-card">
      <h3 className="font-display font-semibold text-foreground mb-4">Upcoming Deadlines</h3>
      <div className="space-y-3">
        {deadlines.map((d, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${d.urgent ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{d.title}</p>
              <p className="text-xs text-muted-foreground">{d.course}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{d.due}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
