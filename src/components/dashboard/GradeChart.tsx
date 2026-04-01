import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { course: "Math", grade: 88 },
  { course: "Physics", grade: 76 },
  { course: "CS", grade: 92 },
  { course: "English", grade: 85 },
  { course: "History", grade: 79 },
  { course: "Bio", grade: 90 },
];

export function GradeChart() {
  return (
    <div className="rounded-xl bg-card border border-border p-6 shadow-card">
      <h3 className="font-display font-semibold text-foreground mb-4">Grade Performance</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
            <XAxis dataKey="course" tick={{ fontSize: 12, fill: "hsl(220 9% 46%)" }} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(220 9% 46%)" }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid hsl(220 13% 91%)",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07)",
              }}
            />
            <Line
              type="monotone"
              dataKey="grade"
              stroke="hsl(167 72% 46%)"
              strokeWidth={2.5}
              dot={{ fill: "hsl(167 72% 46%)", r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
