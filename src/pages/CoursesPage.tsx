import { DashboardLayout } from "@/components/DashboardLayout";
import { BookOpen, Clock, Plus, UserPlus, LogIn } from "lucide-react";
import { useCourses } from "@/hooks/usePortalData";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";

const colorCycle = ["gradient-primary", "gradient-accent", "gradient-warm"];

export default function CoursesPage() {
  const { data: courses, isLoading } = useCourses();
  const { user, supabaseUser } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [schedule, setSchedule] = useState("");
  const [creating, setCreating] = useState(false);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [showEnroll, setShowEnroll] = useState<string | null>(null);
  const [studentEmail, setStudentEmail] = useState("");
  const queryClient = useQueryClient();

  // For students: get their enrollment IDs
  const { data: myEnrollments } = useQuery({
    queryKey: ["my-enrollments", supabaseUser?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("course_enrollments")
        .select("course_id")
        .eq("student_id", supabaseUser!.id);
      return data?.map((e) => e.course_id) || [];
    },
    enabled: !!supabaseUser && user?.role === "student",
  });

  // For students: get all available courses to browse
  const { data: allCourses } = useQuery({
    queryKey: ["all-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!supabaseUser && user?.role === "student",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUser) return;
    setCreating(true);
    const { error } = await supabase.from("courses").insert({
      code, name, schedule, professor_id: supabaseUser.id,
    });
    setCreating(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Course created!");
    setShowCreate(false);
    setCode(""); setName(""); setSchedule("");
    queryClient.invalidateQueries({ queryKey: ["courses"] });
  };

  // Student self-enroll
  const handleSelfEnroll = async (courseId: string) => {
    if (!supabaseUser) return;
    setEnrollingId(courseId);
    const { error } = await supabase.from("course_enrollments").insert({
      course_id: courseId,
      student_id: supabaseUser.id,
    });
    setEnrollingId(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Enrolled successfully!");
    queryClient.invalidateQueries({ queryKey: ["courses"] });
    queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
  };

  // Professor enroll student by email
  const handleEnrollStudent = async (courseId: string) => {
    if (!studentEmail.trim()) return;
    // Find student profile by looking up profiles
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("role", "student")
      .ilike("full_name", `%${studentEmail.trim()}%`)
      .limit(1)
      .single();

    if (pErr || !profile) {
      toast.error("Student not found. Search by name.");
      return;
    }

    const { error } = await supabase.from("course_enrollments").insert({
      course_id: courseId,
      student_id: profile.user_id,
    });
    if (error) {
      if (error.message.includes("duplicate")) toast.error("Student already enrolled.");
      else toast.error(error.message);
      return;
    }
    toast.success("Student enrolled!");
    setStudentEmail("");
    setShowEnroll(null);
    queryClient.invalidateQueries({ queryKey: ["courses"] });
  };

  const browseCourses = user?.role === "student" ? allCourses : null;
  const unenrolledCourses = browseCourses?.filter(
    (c: any) => !myEnrollments?.includes(c.id)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Courses</h1>
            <p className="text-muted-foreground mt-1">
              {user?.role === "professor" ? "Manage your courses" : "Your enrolled courses"}
            </p>
          </div>
          {user?.role === "professor" && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-2 gradient-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Create Course
            </button>
          )}
        </div>

        {showCreate && (
          <form onSubmit={handleCreate} className="rounded-xl bg-card border border-border p-6 shadow-card space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input value={code} onChange={e => setCode(e.target.value)} placeholder="Course Code (e.g. CS 201)" required
                className="rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" />
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Course Name" required
                className="rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" />
              <input value={schedule} onChange={e => setSchedule(e.target.value)} placeholder="Schedule (e.g. Mon/Wed 10 AM)"
                className="rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <button type="submit" disabled={creating}
              className="gradient-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50">
              {creating ? "Creating..." : "Create Course"}
            </button>
          </form>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading courses...</div>
        ) : !courses?.length ? (
          <div className="text-center py-12 text-muted-foreground">
            No courses yet. {user?.role === "professor" ? "Create your first course!" : "Browse available courses below to enroll."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course: any, i: number) => (
              <div key={course.id} className="rounded-xl bg-card border border-border shadow-card hover:shadow-elevated transition-all overflow-hidden">
                <div className={`h-2 ${colorCycle[i % 3]}`} />
                <div className="p-5 space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">{course.code}</span>
                    <h3 className="text-lg font-display font-semibold text-foreground mt-2">{course.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {course.profiles?.full_name || user?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {course.schedule && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {course.schedule}
                      </span>
                    )}
                  </div>
                  {/* Professor: enroll student button */}
                  {user?.role === "professor" && (
                    <div>
                      <button
                        onClick={() => setShowEnroll(showEnroll === course.id ? null : course.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Enroll Student
                      </button>
                      {showEnroll === course.id && (
                        <div className="mt-2 flex gap-2">
                          <input
                            value={studentEmail}
                            onChange={(e) => setStudentEmail(e.target.value)}
                            placeholder="Student name..."
                            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                          />
                          <button
                            onClick={() => handleEnrollStudent(course.id)}
                            className="gradient-primary text-primary-foreground px-3 py-2 rounded-lg text-xs font-semibold"
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Student: Browse & enroll section */}
        {user?.role === "student" && unenrolledCourses && unenrolledCourses.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-display font-semibold text-foreground">Available Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {unenrolledCourses.map((course: any, i: number) => (
                <div key={course.id} className="rounded-xl bg-card border border-border shadow-card hover:shadow-elevated transition-all overflow-hidden">
                  <div className={`h-2 ${colorCycle[i % 3]}`} />
                  <div className="p-5 space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">{course.code}</span>
                      <h3 className="text-lg font-display font-semibold text-foreground mt-2">{course.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{course.profiles?.full_name}</p>
                    </div>
                    {course.schedule && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" /> {course.schedule}
                      </div>
                    )}
                    <button
                      onClick={() => handleSelfEnroll(course.id)}
                      disabled={enrollingId === course.id}
                      className="flex items-center gap-2 w-full justify-center gradient-accent text-accent-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      <LogIn className="w-4 h-4" />
                      {enrollingId === course.id ? "Enrolling..." : "Enroll"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
