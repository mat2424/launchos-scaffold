import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileCode, Play, Upload, FolderTree } from "lucide-react";
import { Card } from "@/components/ui/card";

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

const mockFiles = [
  { name: "App.tsx", type: "file" },
  { name: "index.tsx", type: "file" },
  { name: "styles.css", type: "file" },
  { name: "components", type: "folder" },
];

export default function Builder() {
  const [code, setCode] = useState(defaultCode);

  return (
    <div className="space-y-4">
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

      {/* AI Command Input */}
      <Card className="p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ask AI to build or modify anything... (e.g., 'Add a navigation bar with login button')"
            className="flex-1"
          />
          <Button>Generate</Button>
        </div>
      </Card>

      {/* Editor Layout */}
      <div className="grid h-[calc(100vh-300px)] gap-4 lg:grid-cols-2">
        {/* Code Editor */}
        <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2">
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">App.tsx</span>
            </div>
            <Button variant="ghost" size="sm">
              <FolderTree className="h-4 w-4" />
            </Button>
          </div>
          
          {/* File Explorer Sidebar (simplified) */}
          <div className="flex flex-1">
            <div className="w-48 border-r border-border bg-muted/30 p-2">
              <div className="space-y-1">
                {mockFiles.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent"
                  >
                    {file.type === "folder" ? "📁" : "📄"}
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1">
              <Editor
                height="100%"
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
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2">
            <span className="text-sm font-medium">Preview</span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>localhost:3000</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-white">
            <iframe
              srcDoc={`
                <!DOCTYPE html>
                <html>
                  <head>
                    <script src="https://cdn.tailwindcss.com"></script>
                  </head>
                  <body>
                    <div id="root"></div>
                    <script type="module">
                      ${code.replace('export default App;', '')}
                      
                      const root = document.getElementById('root');
                      root.innerHTML = '';
                      const appElement = document.createElement('div');
                      appElement.innerHTML = App().props.children;
                      root.appendChild(appElement);
                    </script>
                  </body>
                </html>
              `}
              className="h-full w-full"
              title="preview"
              sandbox="allow-scripts"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
