import { DashboardLayout } from "@/components/DashboardLayout";
import { FileText, CheckCircle2, Clock, Upload, Search } from "lucide-react";
import { useState } from "react";

const allAssignments = [
  { id: 1, title: "Binary Trees Implementation", course: "CS 201", due: "Apr 5, 2026", status: "submitted", grade: "A" },
  { id: 2, title: "Electromagnetic Waves Report", course: "PHY 101", due: "Apr 8, 2026", status: "pending", grade: null },
  { id: 3, title: "Integration Problem Set", course: "MATH 202", due: "Apr 10, 2026", status: "submitted", grade: "B+" },
  { id: 4, title: "World War II Essay", course: "HIS 301", due: "Apr 12, 2026", status: "pending", grade: null },
  { id: 5, title: "Sorting Algorithms Analysis", course: "CS 201", due: "Apr 15, 2026", status: "submitted", grade: "A-" },
  { id: 6, title: "Cell Membrane Lab Report", course: "BIO 201", due: "Apr 18, 2026", status: "pending", grade: null },
  { id: 7, title: "Academic Essay Final Draft", course: "ENG 102", due: "Apr 20, 2026", status: "submitted", grade: "B" },
  { id: 8, title: "Newton's Laws Experiment", course: "PHY 101", due: "Apr 22, 2026", status: "pending", grade: null },
];

export default function AssignmentsPage() {
  const [filter, setFilter] = useState<"all" | "submitted" | "pending">("all");
  const [search, setSearch] = useState("");

  const filtered = allAssignments.filter((a) => {
    if (filter !== "all" && a.status !== filter) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.course.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Assignments</h1>
          <p className="text-muted-foreground mt-1">Track and manage your assignments</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 flex-1 max-w-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm outline-none flex-1 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "submitted", "pending"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  filter === f
                    ? "gradient-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border shadow-card hover:shadow-elevated transition-all"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${a.status === "submitted" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                {a.status === "submitted" ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.course} · Due: {a.due}</p>
              </div>
              <div className="flex items-center gap-3">
                {a.grade && (
                  <span className="text-sm font-bold text-success bg-success/10 px-3 py-1 rounded-lg">{a.grade}</span>
                )}
                {a.status === "pending" && (
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
                    <Upload className="w-3.5 h-3.5" /> Submit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
