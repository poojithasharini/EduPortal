import { useState, useRef, useEffect } from "react";
import { Bell, Calendar, FileText, X } from "lucide-react";
import { useAssignments } from "@/hooks/usePortalData";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: assignments } = useAssignments();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Generate notifications from upcoming deadlines
  const now = new Date();
  const upcoming = (assignments || [])
    .filter((a: any) => new Date(a.due_date) > now)
    .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 8);

  const urgentCount = upcoming.filter(
    (a: any) => new Date(a.due_date).getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000
  ).length;

  const formatTimeLeft = (dueDate: string) => {
    const diff = new Date(dueDate).getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return "Due soon!";
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {urgentCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-[10px] font-bold text-destructive-foreground">
            {urgentCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 rounded-xl bg-card border border-border shadow-elevated z-50 animate-fade-in overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-display font-semibold text-foreground text-sm">Notifications</h3>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {!upcoming.length ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No upcoming deadlines 🎉
              </div>
            ) : (
              upcoming.map((a: any) => {
                const isUrgent = new Date(a.due_date).getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000;
                return (
                  <div
                    key={a.id}
                    className={`flex items-start gap-3 p-3 border-b border-border/50 hover:bg-secondary/50 transition-colors ${
                      isUrgent ? "bg-destructive/5" : ""
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${
                      isUrgent ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                    }`}>
                      {isUrgent ? <Calendar className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{a.title}</p>
                      <p className="text-[11px] text-muted-foreground">{a.courses?.code}</p>
                      <p className={`text-[11px] font-medium mt-0.5 ${isUrgent ? "text-destructive" : "text-muted-foreground"}`}>
                        {formatTimeLeft(a.due_date)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
