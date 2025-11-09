import { Eye, Code, Columns3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "preview" | "split" | "code";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  const options = [
    { value: "preview" as ViewMode, label: "Preview", icon: Eye },
    { value: "split" as ViewMode, label: "Split", icon: Columns3 },
    { value: "code" as ViewMode, label: "Code", icon: Code },
  ];

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1">
      {options.map(({ value: optionValue, label, icon: Icon }) => (
        <button
          key={optionValue}
          onClick={() => onChange(optionValue)}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
            value === optionValue
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
