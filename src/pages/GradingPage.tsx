import { DashboardLayout } from "@/components/DashboardLayout";
import { useSubmissions } from "@/hooks/usePortalData";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, Star, X } from "lucide-react";

export default function GradingPage() {
  const { data: submissions, isLoading } = useSubmissions();
  const { supabaseUser } = useAuth();
  const queryClient = useQueryClient();
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [points, setPoints] = useState("");
  const [letterGrade, setLetterGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const handleGrade = async (submission: any) => {
    if (!supabaseUser || !points) return;
    setSaving(true);

    const { error } = await supabase.from("grades").insert({
      submission_id: submission.id,
      assignment_id: submission.assignment_id,
      student_id: submission.student_id,
      grader_id: supabaseUser.id,
      points: parseInt(points),
      letter_grade: letterGrade || null,
      feedback: feedback || null,
    });

    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    // Update submission status
    await supabase.from("submissions").update({ status: "graded" }).eq("id", submission.id);

    toast.success("Grade submitted!");
    setGradingId(null);
    setPoints("");
    setLetterGrade("");
    setFeedback("");
    setSaving(false);
    queryClient.invalidateQueries({ queryKey: ["submissions"] });
    queryClient.invalidateQueries({ queryKey: ["grades"] });
  };

  const pending = (submissions || []).filter((s: any) => s.status !== "graded");
  const graded = (submissions || []).filter((s: any) => s.status === "graded");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Grade Submissions</h1>
          <p className="text-muted-foreground mt-1">Review and grade student submissions</p>
        </div>

        {/* Pending submissions */}
        <div className="space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" /> Pending ({pending.length})
          </h2>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : !pending.length ? (
            <div className="text-center py-8 text-muted-foreground rounded-xl bg-card border border-border">
              No pending submissions to grade.
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((s: any) => (
                <div key={s.id} className="rounded-xl bg-card border border-border shadow-card p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{s.assignments?.title || "Assignment"}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.profiles?.full_name || "Student"} · {s.assignments?.courses?.code || ""} · 
                        Submitted {new Date(s.submitted_at).toLocaleDateString()}
                      </p>
                      {s.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{s.notes}"</p>}
                      {s.file_url && (
                        <span className="inline-flex items-center gap-1 text-xs text-primary mt-1">
                          📎 File attached
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setGradingId(gradingId === s.id ? null : s.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold hover:opacity-90"
                    >
                      <Star className="w-3.5 h-3.5" /> Grade
                    </button>
                  </div>

                  {/* Grading form */}
                  {gradingId === s.id && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3 animate-fade-in">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Points</label>
                          <input
                            type="number"
                            value={points}
                            onChange={(e) => setPoints(e.target.value)}
                            placeholder={`Out of ${s.assignments?.max_points || 100}`}
                            min="0"
                            max={s.assignments?.max_points || 100}
                            required
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Letter Grade</label>
                          <select
                            value={letterGrade}
                            onChange={(e) => setLetterGrade(e.target.value)}
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            <option value="">Select</option>
                            {["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"].map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Feedback</label>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Add feedback for the student..."
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 min-h-[60px] resize-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleGrade(s)}
                          disabled={saving || !points}
                          className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Submit Grade"}
                        </button>
                        <button
                          onClick={() => setGradingId(null)}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Graded */}
        {graded.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" /> Graded ({graded.length})
            </h2>
            <div className="space-y-3">
              {graded.map((s: any) => (
                <div key={s.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border shadow-card">
                  <div className="w-10 h-10 rounded-lg bg-success/10 text-success flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{s.assignments?.title || "Assignment"}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.profiles?.full_name || "Student"} · {s.assignments?.courses?.code || ""}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-md">Graded</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
