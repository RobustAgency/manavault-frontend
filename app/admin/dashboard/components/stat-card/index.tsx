import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  bgColor : string;
  color: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  bgColor,
  color,
  delay = 0,
}: StatCardProps) {

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover",
        "animate-slide-up"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold tracking-tight text-foreground">
              {value}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110",
            bgColor
          )}
        >
          <Icon className={cn("h-6 w-6", color)} />
        </div>
      </div>
    </div>
  );
}
