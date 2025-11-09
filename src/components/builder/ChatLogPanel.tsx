import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { DebugConsole, DebugLog } from "./DebugConsole";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  files?: string[];
}

interface ChatLogPanelProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  debugLogs: DebugLog[];
  onClearLogs: () => void;
  onApplyChanges?: (messageId: string) => void;
}

export function ChatLogPanel({
  messages,
  isGenerating,
  debugLogs,
  onClearLogs,
  onApplyChanges,
}: ChatLogPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div ref={scrollRef} className="space-y-4 p-4">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <div className="space-y-2">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h3 className="text-lg font-semibold">Start Building</h3>
                  <p className="text-sm text-muted-foreground">
                    Describe what you want to build, and I'll help you create it.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                  files={message.files}
                  onApply={
                    message.role === "assistant" && onApplyChanges
                      ? () => onApplyChanges(message.id)
                      : undefined
                  }
                />
              ))
            )}
            {isGenerating && <TypingIndicator />}
          </div>
        </ScrollArea>
      </div>

      <DebugConsole logs={debugLogs} onClear={onClearLogs} />
    </div>
  );
}
