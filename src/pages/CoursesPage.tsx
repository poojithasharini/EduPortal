import { DashboardLayout } from "@/components/DashboardLayout";
import { BookOpen, Users, Clock } from "lucide-react";

const courses = [
  { id: 1, code: "CS 201", name: "Data Structures & Algorithms", professor: "Dr. Sarah Williams", students: 42, schedule: "Mon/Wed 10:00 AM", color: "gradient-primary" },
  { id: 2, code: "PHY 101", name: "Introduction to Physics", professor: "Dr. James Brown", students: 58, schedule: "Tue/Thu 2:00 PM", color: "gradient-accent" },
  { id: 3, code: "MATH 202", name: "Calculus II", professor: "Dr. Emily Davis", students: 35, schedule: "Mon/Wed/Fri 9:00 AM", color: "gradient-warm" },
  { id: 4, code: "HIS 301", name: "Modern World History", professor: "Dr. Michael Lee", students: 28, schedule: "Tue/Thu 11:00 AM", color: "gradient-primary" },
  { id: 5, code: "ENG 102", name: "Academic Writing", professor: "Dr. Lisa Chen", students: 30, schedule: "Wed/Fri 1:00 PM", color: "gradient-accent" },
  { id: 6, code: "BIO 201", name: "Cell Biology", professor: "Dr. Robert Kim", students: 45, schedule: "Mon/Wed 3:00 PM", color: "gradient-warm" },
];

export default function CoursesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Courses</h1>
            <p className="text-muted-foreground mt-1">Your enrolled courses this semester</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <div key={course.id} className="rounded-xl bg-card border border-border shadow-card hover:shadow-elevated transition-all overflow-hidden">
              <div className={`h-2 ${course.color}`} />
              <div className="p-5 space-y-4">
                <div>
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">
                    {course.code}
                  </span>
                  <h3 className="text-lg font-display font-semibold text-foreground mt-2">{course.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{course.professor}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> {course.students}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {course.schedule}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
