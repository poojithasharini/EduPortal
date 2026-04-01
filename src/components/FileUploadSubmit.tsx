import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, File, X, Loader2 } from "lucide-react";

interface FileUploadSubmitProps {
  assignmentId: string;
  onSuccess?: () => void;
}

export function FileUploadSubmit({ assignmentId, onSuccess }: FileUploadSubmitProps) {
  const { supabaseUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!supabaseUser) return;
    setUploading(true);

    let fileUrl: string | null = null;

    try {
      // Upload file if selected
      if (file) {
        const ext = file.name.split(".").pop();
        const filePath = `${supabaseUser.id}/${assignmentId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("submissions")
          .upload(filePath, file);

        if (uploadError) {
          toast.error("File upload failed: " + uploadError.message);
          setUploading(false);
          return;
        }
        fileUrl = filePath;
      }

      // Create submission record
      const { error } = await supabase.from("submissions").insert({
        assignment_id: assignmentId,
        student_id: supabaseUser.id,
        file_url: fileUrl,
        notes: notes || null,
        status: "submitted",
      });

      if (error) {
        toast.error(error.message);
        setUploading(false);
        return;
      }

      toast.success("Assignment submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      setShowForm(false);
      setFile(null);
      setNotes("");
      onSuccess?.();
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
      >
        <Upload className="w-3.5 h-3.5" /> Submit
      </button>
    );
  }

  return (
    <div className="mt-3 p-4 rounded-lg border border-border bg-secondary/30 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Submit Assignment</span>
        <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* File upload */}
      <div>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.zip,.py,.js,.java,.cpp,.c,.html,.css"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        {file ? (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border">
            <File className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground flex-1 truncate">{file.name}</span>
            <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</span>
            <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-destructive">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/40 transition-colors"
          >
            <Upload className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Click to attach a file (optional)</p>
          </button>
        )}
      </div>

      {/* Notes */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add notes (optional)"
        className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 min-h-[60px] resize-none"
      />

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={uploading}
        className="w-full gradient-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" /> Submit Assignment
          </>
        )}
      </button>
    </div>
  );
}
