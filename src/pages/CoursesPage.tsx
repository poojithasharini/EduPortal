import { DashboardLayout } from "@/components/DashboardLayout";
import { BookOpen, Users, Clock, Plus } from "lucide-react";
import { useCourses } from "@/hooks/usePortalData";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const colorCycle = ["gradient-primary", "gradient-accent", "gradient-warm"];

export default function CoursesPage() {
  const { data: courses, isLoading } = useCourses();
  const { user, supabaseUser } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [schedule, setSchedule] = useState("");
  const [creating, setCreating] = useState(false);
  const queryClient = useQueryClient();

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
            No courses yet. {user?.role === "professor" ? "Create your first course!" : "You haven't been enrolled in any courses yet."}
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
