import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", attendance: 95 },
  { month: "Feb", attendance: 88 },
  { month: "Mar", attendance: 92 },
  { month: "Apr", attendance: 85 },
  { month: "May", attendance: 90 },
  { month: "Jun", attendance: 94 },
];

export function AttendanceChart() {
  return (
    <div className="rounded-xl bg-card border border-border p-6 shadow-card">
      <h3 className="font-display font-semibold text-foreground mb-4">Attendance Overview</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(220 9% 46%)" }} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(220 9% 46%)" }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid hsl(220 13% 91%)",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07)",
              }}
            />
            <Bar dataKey="attendance" fill="hsl(234 89% 60%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
