import * as React from "react";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef(
  (
    {
      className,
      value = 0,
      max = 100,
      label,
      showPercentage = false,
      color = "emerald",
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const colorClasses = {
      emerald: "bg-emerald-500",
      blue: "bg-blue-500",
      red: "bg-red-500",
      amber: "bg-amber-500",
      purple: "bg-purple-500",
    };

    const textColorClasses = {
      emerald: "text-emerald-600",
      blue: "text-blue-600",
      red: "text-red-600",
      amber: "text-amber-600",
      purple: "text-purple-600",
    };

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {(label || showPercentage) && (
          <div className="flex justify-between items-center">
            {label && (
              <span className="font-medium text-gray-900">{label}</span>
            )}
            {showPercentage && (
              <span className={cn("font-semibold", textColorClasses[color])}>
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              colorClasses[color]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
