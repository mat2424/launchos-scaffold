import { Copy, Check, FileCode } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  files?: string[];
  onApply?: () => void;
}

export function MessageBubble({
  role,
  content,
  timestamp,
  files,
  onApply,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCodeBlock = content.includes("```");
  const codeContent = isCodeBlock
    ? content.match(/```[\s\S]*?```/g)?.[0]?.replace(/```\w*\n?/g, "").trim()
    : null;

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {files && files.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {files.map((file) => (
              <div
                key={file}
                className="inline-flex items-center gap-1 rounded-full bg-background/20 px-2 py-1 text-xs"
              >
                <FileCode className="h-3 w-3" />
                {file}
              </div>
            ))}
          </div>
        )}

        {isCodeBlock && codeContent ? (
          <div className="space-y-2">
            <p className="text-sm">{content.split("```")[0].trim()}</p>
            <div className="relative rounded-lg bg-slate-900 p-4 text-sm">
              <pre className="overflow-x-auto text-slate-100">
                <code>{codeContent}</code>
              </pre>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCopy}
                className="absolute top-2 right-2 h-8 w-8 text-slate-400 hover:text-slate-100"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        )}

        {timestamp && (
          <p className="mt-2 text-xs opacity-70">
            {timestamp.toLocaleTimeString()}
          </p>
        )}

        {onApply && !isUser && (
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              onClick={onApply}
              className="h-8 rounded-full text-xs"
            >
              Apply Changes
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-full text-xs"
            >
              Reject
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
