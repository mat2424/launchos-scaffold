import { useState } from "react";
import { Terminal, ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface DebugLog {
  timestamp: Date;
  level: "info" | "success" | "warning" | "error";
  message: string;
  details?: string;
}

interface DebugConsoleProps {
  logs: DebugLog[];
  onClear: () => void;
}

export function DebugConsole({ logs, onClear }: DebugConsoleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getLevelColor = (level: DebugLog["level"]) => {
    switch (level) {
      case "success":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      default:
        return "text-blue-500";
    }
  };

  const getLevelLabel = (level: DebugLog["level"]) => {
    return level.toUpperCase().padEnd(7);
  };

  return (
    <div className="border-t border-border bg-slate-950">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-2 text-sm text-slate-200 hover:bg-slate-900"
      >
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          <span className="font-medium">Debug Console</span>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs">
            {logs.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {logs.length > 0 && (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="h-6 w-6 text-slate-400 hover:text-slate-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </div>
      </button>

      {isExpanded && (
        <ScrollArea className="h-48">
          <div className="space-y-1 p-2 font-mono text-xs">
            {logs.length === 0 ? (
              <div className="py-4 text-center text-slate-500">
                No logs yet. Debug information will appear here.
              </div>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-2 rounded px-2 py-1 hover:bg-slate-900",
                    getLevelColor(log.level)
                  )}
                >
                  <span className="text-slate-500">
                    [{log.timestamp.toLocaleTimeString()}]
                  </span>
                  <span className="font-semibold">
                    {getLevelLabel(log.level)}
                  </span>
                  <span className="text-slate-200">{log.message}</span>
                  {log.details && (
                    <span className="text-slate-400">- {log.details}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
