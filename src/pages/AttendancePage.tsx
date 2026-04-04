import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendance, useCourses } from "@/hooks/usePortalData";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

function ProfessorAttendance() {
  const { data: courses } = useCourses();
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [saving, setSaving] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  // Get enrolled students for selected course
  const { data: enrolledStudents } = useQuery({
    queryKey: ["enrolled-students", selectedCourse],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_enrollments")
        .select("student_id, profiles!course_enrollments_student_id_fkey(full_name, user_id)")
        .eq("course_id", selectedCourse);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCourse,
  });

  // Get existing attendance for this date/course
  const { data: existingAttendance } = useQuery({
    queryKey: ["attendance-record", selectedCourse, date],
    queryFn: async () => {
      const { data } = await supabase
        .from("attendance")
        .select("*")
        .eq("course_id", selectedCourse)
        .eq("date", date);
      return data || [];
    },
    enabled: !!selectedCourse && !!date,
  });

  const handleStatusChange = (studentId: string, status: string) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedCourse || !enrolledStudents?.length) return;
    setSaving(true);

    const records = enrolledStudents.map((e: any) => ({
      course_id: selectedCourse,
      student_id: e.student_id,
      date,
      status: statuses[e.student_id] || "present",
    }));

    // Upsert: delete existing for this course/date, then insert
    await supabase
      .from("attendance")
      .delete()
      .eq("course_id", selectedCourse)
      .eq("date", date);

    const { error } = await supabase.from("attendance").insert(records);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Attendance saved!");
    queryClient.invalidateQueries({ queryKey: ["attendance-record"] });
  };

  // Initialize statuses from existing attendance
  const getStatus = (studentId: string) => {
    if (statuses[studentId]) return statuses[studentId];
    const existing = existingAttendance?.find((a: any) => a.student_id === studentId);
    return existing?.status || "present";
  };

  const statusOptions = [
    { value: "present", label: "Present", icon: CheckCircle, color: "text-green-500" },
    { value: "absent", label: "Absent", icon: XCircle, color: "text-destructive" },
    { value: "late", label: "Late", icon: Clock, color: "text-yellow-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-card border border-border shadow-card p-6">
        <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" /> Record Attendance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <select
            value={selectedCourse}
            onChange={(e) => { setSelectedCourse(e.target.value); setStatuses({}); }}
            className="rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Select Course</option>
            {courses?.map((c: any) => (
              <option key={c.id} value={c.id}>{c.code} – {c.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setStatuses({}); }}
            className="rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {selectedCourse && (!enrolledStudents || enrolledStudents.length === 0) ? (
          <p className="text-sm text-muted-foreground">No students enrolled in this course yet.</p>
        ) : selectedCourse && enrolledStudents ? (
          <div className="space-y-3">
            {enrolledStudents.map((e: any) => {
              const currentStatus = getStatus(e.student_id);
              return (
                <div key={e.student_id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <span className="text-sm font-medium text-foreground">
                    {(e as any).profiles?.full_name || "Unknown"}
                  </span>
                  <div className="flex gap-2">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleStatusChange(e.student_id, opt.value)}
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                          currentStatus === opt.value
                            ? "bg-card border border-border shadow-sm " + opt.color
                            : "text-muted-foreground hover:bg-card"
                        )}
                      >
                        <opt.icon className="w-3.5 h-3.5" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="gradient-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 mt-4"
            >
              {saving ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StudentAttendanceView() {
  const { data: attendance, isLoading } = useAttendance();

  const courseStats = attendance?.reduce((acc: any, record: any) => {
    const key = record.courses?.code || record.course_id;
    if (!acc[key]) acc[key] = { name: record.courses?.name || key, present: 0, total: 0 };
    acc[key].total++;
    if (record.status === "present" || record.status === "late") acc[key].present++;
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="space-y-6">
      <AttendanceChart />
      <div className="rounded-xl bg-card border border-border shadow-card p-6">
        <h3 className="font-display font-semibold text-foreground mb-4">Course-wise Attendance</h3>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : !courseStats || Object.keys(courseStats).length === 0 ? (
          <p className="text-sm text-muted-foreground">No attendance records yet.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(courseStats).map(([code, stats]: any) => {
              const pct = Math.round((stats.present / stats.total) * 100);
              return (
                <div key={code} className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-foreground w-20">{code}</span>
                  <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-foreground w-12 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent records */}
      {attendance && attendance.length > 0 && (
        <div className="rounded-xl bg-card border border-border shadow-card p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Recent Records</h3>
          <div className="space-y-2">
            {attendance.slice(0, 20).map((r: any) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <span className="text-sm font-medium text-foreground">{r.courses?.code}</span>
                  <span className="text-xs text-muted-foreground ml-2">{format(new Date(r.date), "MMM d, yyyy")}</span>
                </div>
                <span className={cn(
                  "text-xs font-semibold px-2 py-1 rounded-md capitalize",
                  r.status === "present" ? "bg-green-500/10 text-green-600" :
                  r.status === "late" ? "bg-yellow-500/10 text-yellow-600" :
                  "bg-destructive/10 text-destructive"
                )}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AttendancePage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground mt-1">
            {user?.role === "professor" ? "Record and manage attendance" : "Your attendance records and analytics"}
          </p>
        </div>
        {user?.role === "professor" ? <ProfessorAttendance /> : <StudentAttendanceView />}
      </div>
    </DashboardLayout>
  );
}
