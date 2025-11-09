import { useState } from "react";
import { Monitor, Tablet, Smartphone, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DeviceSize = "desktop" | "tablet" | "mobile";

interface LivePreviewProps {
  code: string;
  isLoading?: boolean;
}

export function LivePreview({ code, isLoading }: LivePreviewProps) {
  const [device, setDevice] = useState<DeviceSize>("desktop");
  const [key, setKey] = useState(0);

  const deviceSizes = {
    desktop: { width: "100%", height: "100%", icon: Monitor },
    tablet: { width: "768px", height: "100%", icon: Tablet },
    mobile: { width: "375px", height: "100%", icon: Smartphone },
  };

  const handleRefresh = () => {
    setKey((prev) => prev + 1);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">localhost:3000</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Device Selector */}
          {(Object.keys(deviceSizes) as DeviceSize[]).map((size) => {
            const Icon = deviceSizes[size].icon;
            return (
              <Button
                key={size}
                size="icon"
                variant={device === size ? "secondary" : "ghost"}
                onClick={() => setDevice(size)}
                className="h-8 w-8"
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}

          <div className="mx-2 h-4 w-px bg-border" />

          <Button
            size="icon"
            variant="ghost"
            onClick={handleRefresh}
            className="h-8 w-8"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => window.open("about:blank")}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-slate-100 p-4">
        <div
          className={cn(
            "mx-auto h-full bg-white shadow-xl transition-all duration-300",
            device === "mobile" && "rounded-[2.5rem] border-[14px] border-slate-800",
            device === "tablet" && "rounded-2xl border-8 border-slate-700"
          )}
          style={{
            width: deviceSizes[device].width,
            maxWidth: "100%",
          }}
        >
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="space-y-4 text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Loading preview...</p>
              </div>
            </div>
          ) : (
            <iframe
              key={key}
              srcDoc={`
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                      * { margin: 0; padding: 0; box-sizing: border-box; }
                      body { font-family: system-ui, -apple-system, sans-serif; }
                    </style>
                  </head>
                  <body>
                    <div id="root"></div>
                    <script type="module">
                      ${code.replace('export default App;', '')}
                      
                      const root = document.getElementById('root');
                      try {
                        const appElement = document.createElement('div');
                        const result = App();
                        if (result && result.props && result.props.children) {
                          appElement.innerHTML = result.props.children;
                        }
                        root.appendChild(appElement);
                      } catch (error) {
                        root.innerHTML = '<div style="padding: 20px; color: red;">Error rendering preview: ' + error.message + '</div>';
                      }
                    </script>
                  </body>
                </html>
              `}
              className="h-full w-full"
              title="preview"
              sandbox="allow-scripts"
            />
          )}
        </div>
      </div>
    </div>
  );
}
