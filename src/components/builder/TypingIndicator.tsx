import { cn } from "@/lib/utils";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-1 px-4 py-3 rounded-2xl bg-muted">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn("h-2 w-2 rounded-full bg-muted-foreground animate-bounce")}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.6s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
