import { DashboardLayout } from "@/components/DashboardLayout";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Users, FileText, Award, Clock, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, supabaseUser } = useAuth();

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: assignments } = useQuery({
    queryKey: ["course-assignments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("course_id", id!)
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: enrollments } = useQuery({
    queryKey: ["course-enrollments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_enrollments")
        .select("student_id, enrolled_at")
        .eq("course_id", id!);
      if (error) throw error;
      if (!data?.length) return [];
      const studentIds = data.map((e) => e.student_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", studentIds);
      return data.map((e) => ({
        ...e,
        profile: profiles?.find((p) => p.user_id === e.student_id),
      }));
    },
    enabled: !!id,
  });

  const { data: grades } = useQuery({
    queryKey: ["course-grades", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grades")
        .select("*, assignments!inner(title, course_id)")
        .eq("assignments.course_id", id!)
        .order("graded_at", { ascending: false });
      if (error) throw error;
      if (!data?.length) return [];
      const studentIds = [...new Set(data.map((g) => g.student_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", studentIds);
      return data.map((g) => ({
        ...g,
        student_name: profiles?.find((p) => p.user_id === g.student_id)?.full_name || "Unknown",
      }));
    },
    enabled: !!id,
  });

  const { data: submissions } = useQuery({
    queryKey: ["course-submissions", id],
    queryFn: async () => {
      const assignmentIds = assignments?.map((a) => a.id) || [];
      if (!assignmentIds.length) return [];
      const { data, error } = await supabase
        .from("submissions")
        .select("*, assignments(title)")
        .in("assignment_id", assignmentIds)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!assignments?.length,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12 text-muted-foreground">Loading course...</div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="text-center py-12 text-muted-foreground">Course not found.</div>
      </DashboardLayout>
    );
  }

  const isPast = (date: string) => new Date(date) < new Date();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Link to="/courses" className="mt-1 p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs font-semibold">{course.code}</Badge>
              <span className="text-xs text-muted-foreground">{course.semester}</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mt-1">{course.name}</h1>
            {course.schedule && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                <Clock className="w-4 h-4" /> {course.schedule}
              </p>
            )}
            {course.description && (
              <p className="text-sm text-muted-foreground mt-2">{course.description}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{assignments?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Assignments</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{enrollments?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{submissions?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Submissions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{grades?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Grades</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="assignments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                {!assignments?.length ? (
                  <p className="text-sm text-muted-foreground py-4">No assignments yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Max Points</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.title}</TableCell>
                          <TableCell>{new Date(a.due_date).toLocaleDateString()}</TableCell>
                          <TableCell>{a.max_points}</TableCell>
                          <TableCell>
                            {isPast(a.due_date) ? (
                              <Badge variant="secondary" className="text-xs">Closed</Badge>
                            ) : (
                              <Badge className="text-xs bg-success/10 text-success border-0">Active</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enrolled Students</CardTitle>
              </CardHeader>
              <CardContent>
                {!enrollments?.length ? (
                  <p className="text-sm text-muted-foreground py-4">No students enrolled yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Enrolled</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrollments.map((e: any) => (
                        <TableRow key={e.student_id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                {(e.profile?.full_name || "?")[0].toUpperCase()}
                              </div>
                              {e.profile?.full_name || "Unknown"}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(e.enrolled_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Grades</CardTitle>
              </CardHeader>
              <CardContent>
                {!grades?.length ? (
                  <p className="text-sm text-muted-foreground py-4">No grades recorded yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Assignment</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Feedback</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grades.map((g: any) => (
                        <TableRow key={g.id}>
                          <TableCell className="font-medium">{g.student_name}</TableCell>
                          <TableCell>{g.assignments?.title}</TableCell>
                          <TableCell>{g.points}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{g.letter_grade || "—"}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                            {g.feedback || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
