import { DashboardLayout } from "@/components/DashboardLayout";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";

export default function AttendancePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground mt-1">Your attendance records and analytics</p>
        </div>
        <AttendanceChart />

        <div className="rounded-xl bg-card border border-border shadow-card p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Course-wise Attendance</h3>
          <div className="space-y-4">
            {[
              { course: "CS 201", pct: 95 },
              { course: "PHY 101", pct: 88 },
              { course: "MATH 202", pct: 92 },
              { course: "HIS 301", pct: 85 },
              { course: "ENG 102", pct: 97 },
              { course: "BIO 201", pct: 90 },
            ].map((c) => (
              <div key={c.course} className="flex items-center gap-4">
                <span className="text-sm font-semibold text-foreground w-20">{c.course}</span>
                <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-primary rounded-full transition-all"
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-foreground w-12 text-right">{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
