import { DashboardLayout } from "@/components/DashboardLayout";
import { Search } from "lucide-react";

const students = [
  { id: 1, name: "Alex Johnson", email: "alex@university.edu", course: "CS 201", grade: "A-", attendance: "95%" },
  { id: 2, name: "Maria Garcia", email: "maria@university.edu", course: "PHY 101", grade: "B+", attendance: "88%" },
  { id: 3, name: "James Chen", email: "james@university.edu", course: "MATH 202", grade: "B", attendance: "92%" },
  { id: 4, name: "Sarah Kim", email: "sarah@university.edu", course: "CS 201", grade: "A", attendance: "97%" },
  { id: 5, name: "David Lee", email: "david@university.edu", course: "HIS 301", grade: "B+", attendance: "85%" },
  { id: 6, name: "Emma Wilson", email: "emma@university.edu", course: "BIO 201", grade: "A-", attendance: "90%" },
];

export default function StudentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Students</h1>
            <p className="text-muted-foreground mt-1">Manage your enrolled students</p>
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">Student</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">Email</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">Course</th>
                <th className="text-center text-xs font-semibold text-muted-foreground p-4">Grade</th>
                <th className="text-center text-xs font-semibold text-muted-foreground p-4">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                        {s.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-foreground">{s.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{s.email}</td>
                  <td className="p-4 text-sm text-foreground">{s.course}</td>
                  <td className="p-4 text-sm text-center font-semibold text-foreground">{s.grade}</td>
                  <td className="p-4 text-sm text-center text-foreground">{s.attendance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
