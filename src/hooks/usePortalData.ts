import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useCourses() {
  const { user, supabaseUser } = useAuth();

  return useQuery({
    queryKey: ["courses", user?.role, supabaseUser?.id],
    queryFn: async () => {
      if (user?.role === "professor") {
        const { data, error } = await supabase
          .from("courses")
          .select("*, profiles!courses_professor_id_fkey(full_name)")
          .eq("professor_id", supabaseUser!.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data;
      } else {
        // Student: get enrolled courses
        const { data: enrollments } = await supabase
          .from("course_enrollments")
          .select("course_id")
          .eq("student_id", supabaseUser!.id);

        if (!enrollments?.length) {
          // Return all courses if not enrolled in any (for demo)
          const { data, error } = await supabase
            .from("courses")
            .select("*, profiles!courses_professor_id_fkey(full_name)")
            .order("created_at", { ascending: false });
          if (error) throw error;
          return data;
        }

        const courseIds = enrollments.map((e) => e.course_id);
        const { data, error } = await supabase
          .from("courses")
          .select("*, profiles!courses_professor_id_fkey(full_name)")
          .in("id", courseIds)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data;
      }
    },
    enabled: !!supabaseUser,
  });
}

export function useAssignments() {
  const { supabaseUser } = useAuth();

  return useQuery({
    queryKey: ["assignments", supabaseUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("*, courses(code, name)")
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!supabaseUser,
  });
}

export function useSubmissions() {
  const { user, supabaseUser } = useAuth();

  return useQuery({
    queryKey: ["submissions", supabaseUser?.id, user?.role],
    queryFn: async () => {
      if (user?.role === "professor") {
        const { data, error } = await supabase
          .from("submissions")
          .select("*, assignments(title, course_id, courses(code)), profiles!submissions_student_id_fkey(full_name)")
          .order("submitted_at", { ascending: false });
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase
        .from("submissions")
        .select("*, assignments(title, course_id, courses(code))")
        .eq("student_id", supabaseUser!.id)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!supabaseUser,
  });
}

export function useGrades() {
  const { user, supabaseUser } = useAuth();

  return useQuery({
    queryKey: ["grades", supabaseUser?.id, user?.role],
    queryFn: async () => {
      if (user?.role === "professor") {
        const { data, error } = await supabase
          .from("grades")
          .select("*, assignments(title, course_id, courses(code, name)), profiles!grades_student_id_fkey(full_name)")
          .order("graded_at", { ascending: false });
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase
        .from("grades")
        .select("*, assignments(title, course_id, courses(code, name))")
        .eq("student_id", supabaseUser!.id)
        .order("graded_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!supabaseUser,
  });
}

export function useAttendance() {
  const { supabaseUser } = useAuth();

  return useQuery({
    queryKey: ["attendance", supabaseUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*, courses(code, name)")
        .eq("student_id", supabaseUser!.id)
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!supabaseUser,
  });
}

export function useStudentsList() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["students-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, course_enrollments(course_id, courses(code, name))")
        .eq("role", "student")
        .order("full_name", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: user?.role === "professor",
  });
}

export function useDashboardStats() {
  const { user, supabaseUser } = useAuth();

  return useQuery({
    queryKey: ["dashboard-stats", supabaseUser?.id, user?.role],
    queryFn: async () => {
      if (user?.role === "professor") {
        const [courses, assignments, students] = await Promise.all([
          supabase.from("courses").select("id", { count: "exact" }).eq("professor_id", supabaseUser!.id),
          supabase.from("assignments").select("id", { count: "exact" }),
          supabase.from("profiles").select("id", { count: "exact" }).eq("role", "student"),
        ]);
        return {
          coursesCount: courses.count || 0,
          assignmentsCount: assignments.count || 0,
          studentsCount: students.count || 0,
        };
      }

      const [courses, assignments, submissions] = await Promise.all([
        supabase.from("course_enrollments").select("id", { count: "exact" }).eq("student_id", supabaseUser!.id),
        supabase.from("assignments").select("id", { count: "exact" }),
        supabase.from("submissions").select("id", { count: "exact" }).eq("student_id", supabaseUser!.id),
      ]);
      return {
        coursesCount: courses.count || 0,
        assignmentsCount: assignments.count || 0,
        submissionsCount: submissions.count || 0,
      };
    },
    enabled: !!supabaseUser,
  });
}
