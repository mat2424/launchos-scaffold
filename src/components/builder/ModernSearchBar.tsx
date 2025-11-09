import { useState } from "react";
import { Sparkles, Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModernSearchBarProps {
  onSend: (message: string) => void;
  isGenerating?: boolean;
}

export function ModernSearchBar({ onSend, isGenerating }: ModernSearchBarProps) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isGenerating) {
      onSend(input.trim());
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div
        className={cn(
          "relative flex items-center gap-3 rounded-2xl bg-card border-2 px-4 py-3 shadow-lg transition-all duration-200",
          isFocused
            ? "border-primary shadow-xl ring-4 ring-primary/10"
            : "border-border shadow-md"
        )}
      >
        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isGenerating}
          placeholder="Ask AI to build or modify anything..."
          className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />

        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full hover:bg-muted"
        >
          <Mic className="h-4 w-4" />
        </Button>

        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isGenerating}
          className={cn(
            "h-10 w-10 rounded-full transition-all duration-200",
            input.trim() && !isGenerating
              ? "scale-100 opacity-100"
              : "scale-95 opacity-50"
          )}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
