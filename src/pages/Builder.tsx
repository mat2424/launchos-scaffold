import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Play, Upload } from "lucide-react";
import { ModernSearchBar } from "@/components/builder/ModernSearchBar";
import { ViewToggle, ViewMode } from "@/components/builder/ViewToggle";
import { ChatLogPanel, ChatMessage } from "@/components/builder/ChatLogPanel";
import { LivePreview } from "@/components/builder/LivePreview";
import { DebugLog } from "@/components/builder/DebugConsole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const defaultCode = `import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to AI Builder
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Start building your dream app with AI assistance. 
          Just describe what you want, and watch it come to life.
        </p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Get Started
        </button>
      </div>
    </div>
  );
}

export default App;`;

export default function Builder() {
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [code, setCode] = useState(defaultCode);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data, error } = await supabase
          .from("ai_sessions")
          .insert({
            messages: [],
          })
          .select()
          .single();

        if (error) throw error;
        setSessionId(data.id);
        addDebugLog("info", "Session initialized", data.id);
      } catch (error: any) {
        console.error("Failed to initialize session:", error);
        addDebugLog("error", "Failed to initialize session", error.message);
      }
    };

    initSession();
  }, []);

  const addDebugLog = (
    level: DebugLog["level"],
    message: string,
    details?: string
  ) => {
    setDebugLogs((prev) => [
      ...prev,
      { timestamp: new Date(), level, message, details },
    ]);
  };

  const handleSendMessage = async (content: string) => {
    if (!sessionId) {
      toast.error("Session not initialized");
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);
    addDebugLog("info", "Processing user request...");

    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `I'll help you with: "${content}"\n\nHere's what I suggest:\n\n\`\`\`tsx\n// Your generated code will appear here\n\`\`\``,
        timestamp: new Date(),
        files: ["App.tsx"],
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsGenerating(false);
      addDebugLog("success", "Response generated successfully");

      // Save to database
      saveMessagesToDatabase([...messages, userMessage, aiMessage]);
    }, 2000);
  };

  const saveMessagesToDatabase = async (updatedMessages: ChatMessage[]) => {
    if (!sessionId) return;

    try {
      const { error } = await supabase
        .from("ai_sessions")
        .update({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp.toISOString(),
          })),
        })
        .eq("id", sessionId);

      if (error) throw error;
      addDebugLog("info", "Messages saved to database");
    } catch (error: any) {
      console.error("Failed to save messages:", error);
      addDebugLog("error", "Failed to save messages", error.message);
    }
  };

  const handleApplyChanges = (messageId: string) => {
    addDebugLog("info", "Applying code changes...");
    // Extract code from message and update
    toast.success("Changes applied successfully");
    addDebugLog("success", "Code changes applied");
  };

  const handleClearLogs = () => {
    setDebugLogs([]);
  };

  return (
    <div className="flex h-screen flex-col space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Builder</h1>
          <p className="text-muted-foreground">Build with AI assistance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Commit Changes
          </Button>
          <Button className="gap-2">
            <Play className="h-4 w-4" />
            Deploy to Vercel
          </Button>
        </div>
      </div>

      {/* Modern Search Bar */}
      <div className="py-4">
        <ModernSearchBar onSend={handleSendMessage} isGenerating={isGenerating} />
      </div>

      {/* View Toggle */}
      <div className="flex justify-center">
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "preview" && (
          <div className="h-full rounded-lg border border-border bg-card overflow-hidden">
            <LivePreview code={code} isLoading={isGenerating} />
          </div>
        )}

        {viewMode === "split" && (
          <div className="grid h-full gap-4 lg:grid-cols-2">
            {/* Chat Log Panel */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <ChatLogPanel
                messages={messages}
                isGenerating={isGenerating}
                debugLogs={debugLogs}
                onClearLogs={handleClearLogs}
                onApplyChanges={handleApplyChanges}
              />
            </div>

            {/* Live Preview */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <LivePreview code={code} isLoading={isGenerating} />
            </div>
          </div>
        )}

        {viewMode === "code" && (
          <div className="h-full rounded-lg border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2">
              <span className="text-sm font-medium">App.tsx</span>
            </div>
            <Editor
              height="calc(100% - 41px)"
              defaultLanguage="typescript"
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
