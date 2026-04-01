import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, User, GraduationCap } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, supabaseUser } = useAuth();
  const [fullName, setFullName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!supabaseUser) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("user_id", supabaseUser.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile updated!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account information</p>
        </div>

        <div className="rounded-xl bg-card border border-border shadow-card p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-display font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">{user?.name}</h2>
              <p className="text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                <User className="w-4 h-4 inline mr-1.5" />Full Name
              </label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                <Mail className="w-4 h-4 inline mr-1.5" />Email
              </label>
              <input type="email" defaultValue={user?.email} disabled
                className="w-full rounded-lg border border-input bg-muted px-4 py-3 text-sm text-muted-foreground" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                <GraduationCap className="w-4 h-4 inline mr-1.5" />Role
              </label>
              <input type="text" defaultValue={user?.role} disabled
                className="w-full rounded-lg border border-input bg-muted px-4 py-3 text-sm text-muted-foreground capitalize" />
            </div>
            <button onClick={handleSave} disabled={saving}
              className="gradient-primary text-primary-foreground rounded-lg px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
