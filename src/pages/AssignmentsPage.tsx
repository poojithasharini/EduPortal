import { DashboardLayout } from "@/components/DashboardLayout";
import { FileText, CheckCircle2, Clock, Upload, Search, Plus } from "lucide-react";
import { useState } from "react";
import { useAssignments, useSubmissions, useCourses } from "@/hooks/usePortalData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { FileUploadSubmit } from "@/components/FileUploadSubmit";

export default function AssignmentsPage() {
  const [filter, setFilter] = useState<"all" | "submitted" | "pending">("all");
  const [search, setSearch] = useState("");
  const { data: assignments, isLoading } = useAssignments();
  const { data: submissions } = useSubmissions();
  const { user, supabaseUser } = useAuth();
  const { data: courses } = useCourses();
  const queryClient = useQueryClient();

  // Professor create assignment
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const submittedIds = new Set(submissions?.map((s: any) => s.assignment_id) || []);

  const enriched = (assignments || []).map((a: any) => ({
    ...a,
    status: submittedIds.has(a.id) ? "submitted" : "pending",
    courseCode: a.courses?.code || "",
    courseName: a.courses?.name || "",
  }));

  const filtered = enriched.filter((a: any) => {
    if (filter !== "all" && a.status !== filter) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.courseCode.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const { error } = await supabase.from("assignments").insert({
      title, description, course_id: courseId, due_date: new Date(dueDate).toISOString(),
    });
    setCreating(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Assignment created!");
    setShowCreate(false);
    setTitle(""); setDescription(""); setCourseId(""); setDueDate("");
    queryClient.invalidateQueries({ queryKey: ["assignments"] });
  };

  const handleSubmit = async (assignmentId: string) => {
    if (!supabaseUser) return;
    const { error } = await supabase.from("submissions").insert({
      assignment_id: assignmentId,
      student_id: supabaseUser.id,
      status: "submitted",
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Assignment submitted!");
    queryClient.invalidateQueries({ queryKey: ["submissions"] });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Assignments</h1>
            <p className="text-muted-foreground mt-1">Track and manage assignments</p>
          </div>
          {user?.role === "professor" && (
            <button onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-2 gradient-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90">
              <Plus className="w-4 h-4" /> Create Assignment
            </button>
          )}
        </div>

        {showCreate && (
          <form onSubmit={handleCreate} className="rounded-xl bg-card border border-border p-6 shadow-card space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Assignment Title" required
                className="rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" />
              <select value={courseId} onChange={e => setCourseId(e.target.value)} required
                className="rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Select Course</option>
                {(courses || []).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)"
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 min-h-[80px]" />
            <div className="flex items-center gap-4">
              <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} required
                className="rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" />
              <button type="submit" disabled={creating}
                className="gradient-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 flex-1 max-w-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search assignments..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm outline-none flex-1 text-foreground placeholder:text-muted-foreground" />
          </div>
          <div className="flex gap-2">
            {(["all", "submitted", "pending"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  filter === f ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}>{f}</button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading assignments...</div>
        ) : !filtered.length ? (
          <div className="text-center py-12 text-muted-foreground">No assignments found.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a: any) => (
              <div key={a.id} className="rounded-xl bg-card border border-border shadow-card hover:shadow-elevated transition-all">
                <div className="flex items-center gap-4 p-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${a.status === "submitted" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                    {a.status === "submitted" ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.courseCode} · Due: {new Date(a.due_date).toLocaleDateString()}</p>
                    {a.description && <p className="text-xs text-muted-foreground mt-1">{a.description}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    {a.status === "pending" && user?.role === "student" && (
                      <FileUploadSubmit assignmentId={a.id} />
                    )}
                    {a.status === "submitted" && (
                      <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-md">Submitted</span>
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
