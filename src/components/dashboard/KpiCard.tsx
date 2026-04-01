import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: string;
  variant: "primary" | "success" | "warning" | "info";
}

const variantStyles = {
  primary: "gradient-primary",
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
};

export function KpiCard({ title, value, icon: Icon, trend, variant }: KpiCardProps) {
  return (
    <div className="rounded-xl bg-card border border-border p-5 shadow-card hover:shadow-elevated transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-display font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{trend}</p>
        </div>
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", variantStyles[variant])}>
          <Icon className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>
    </div>
  );
}
