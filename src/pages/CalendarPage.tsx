import { DashboardLayout } from "@/components/DashboardLayout";
import { useAssignments } from "@/hooks/usePortalData";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isPast,
  differenceInDays,
} from "date-fns";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const { data: assignments, isLoading } = useAssignments();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const assignmentsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    assignments?.forEach((a: any) => {
      const key = format(new Date(a.due_date), "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });
    return map;
  }, [assignments]);

  const selectedAssignments = selectedDate
    ? assignmentsByDate[format(selectedDate, "yyyy-MM-dd")] || []
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground mt-1">Assignment deadlines at a glance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 rounded-xl bg-card border border-border shadow-card p-6">
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-secondary transition-all text-muted-foreground hover:text-foreground">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-display font-bold text-foreground">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-secondary transition-all text-muted-foreground hover:text-foreground">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
              ))}
              {calendarDays.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const dayAssignments = assignmentsByDate[key] || [];
                const inMonth = isSameMonth(day, currentMonth);
                const selected = selectedDate && isSameDay(day, selectedDate);
                const hasUrgent = dayAssignments.some((a: any) => {
                  const diff = differenceInDays(new Date(a.due_date), new Date());
                  return diff >= 0 && diff <= 2;
                });

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all",
                      !inMonth && "opacity-30",
                      isToday(day) && "ring-2 ring-primary/40",
                      selected ? "gradient-primary text-primary-foreground" : "hover:bg-secondary",
                      !selected && inMonth && "text-foreground",
                    )}
                  >
                    <span className="font-medium">{format(day, "d")}</span>
                    {dayAssignments.length > 0 && (
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full mt-0.5",
                        selected ? "bg-primary-foreground" : hasUrgent ? "bg-destructive" : "bg-primary"
                      )} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected day panel */}
          <div className="rounded-xl bg-card border border-border shadow-card p-6">
            <h3 className="font-display font-semibold text-foreground mb-4">
              {selectedDate ? format(selectedDate, "EEEE, MMM d") : "Select a day"}
            </h3>
            {!selectedDate ? (
              <p className="text-sm text-muted-foreground">Click a date to see deadlines.</p>
            ) : selectedAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No deadlines on this day.</p>
            ) : (
              <div className="space-y-3">
                {selectedAssignments.map((a: any) => {
                  const overdue = isPast(new Date(a.due_date));
                  return (
                    <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                      <FileText className={cn("w-4 h-4 mt-0.5", overdue ? "text-destructive" : "text-primary")} />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{a.courses?.code} · {format(new Date(a.due_date), "h:mm a")}</p>
                        {overdue && <span className="text-xs text-destructive font-medium">Overdue</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
