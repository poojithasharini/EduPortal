import { DashboardLayout } from "@/components/DashboardLayout";

const grades = [
  { course: "CS 201", name: "Data Structures", assignments: 6, avg: "A-", points: "92/100" },
  { course: "PHY 101", name: "Intro to Physics", assignments: 5, avg: "B+", points: "85/100" },
  { course: "MATH 202", name: "Calculus II", assignments: 4, avg: "B", points: "82/100" },
  { course: "HIS 301", name: "Modern History", assignments: 3, avg: "A", points: "95/100" },
  { course: "ENG 102", name: "Academic Writing", assignments: 4, avg: "B+", points: "87/100" },
  { course: "BIO 201", name: "Cell Biology", assignments: 3, avg: "A-", points: "90/100" },
];

const gradeColor = (grade: string) => {
  if (grade.startsWith("A")) return "text-success bg-success/10";
  if (grade.startsWith("B")) return "text-info bg-info/10";
  return "text-warning bg-warning/10";
};

export default function GradesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Grades</h1>
          <p className="text-muted-foreground mt-1">Your academic performance across courses</p>
        </div>

        <div className="rounded-xl bg-card border border-border shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">Course</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">Name</th>
                <th className="text-center text-xs font-semibold text-muted-foreground p-4">Assignments</th>
                <th className="text-center text-xs font-semibold text-muted-foreground p-4">Points</th>
                <th className="text-center text-xs font-semibold text-muted-foreground p-4">Average</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {grades.map((g, i) => (
                <tr key={i} className="hover:bg-secondary/30 transition-colors">
                  <td className="p-4 text-sm font-semibold text-primary">{g.course}</td>
                  <td className="p-4 text-sm text-foreground">{g.name}</td>
                  <td className="p-4 text-sm text-center text-muted-foreground">{g.assignments}</td>
                  <td className="p-4 text-sm text-center text-muted-foreground">{g.points}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-block text-sm font-bold px-3 py-1 rounded-lg ${gradeColor(g.avg)}`}>
                      {g.avg}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
