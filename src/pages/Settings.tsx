import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { logger, LogLevel } from "@/lib/logger";
import { Download, Trash2, RefreshCw } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const [logs, setLogs] = useState(logger.getLogs());
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');

  const refreshLogs = () => {
    setLogs(logger.getLogs());
    logger.info('Logs refreshed', 'Settings');
  };

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
    logger.info('Logs cleared', 'Settings');
    refreshLogs();
  };

  const downloadLogs = () => {
    const logsJson = logger.exportLogs();
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `launchos-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logger.info('Logs exported', 'Settings');
  };

  const filteredLogs = selectedLevel === 'all'
    ? logs
    : logs.filter(log => log.level === selectedLevel);

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.DEBUG:
        return 'bg-blue-500';
      case LogLevel.INFO:
        return 'bg-green-500';
      case LogLevel.WARN:
        return 'bg-yellow-500';
      case LogLevel.ERROR:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and project settings</p>
      </div>

      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your current account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled />
          </div>
          <div className="space-y-2">
            <Label>User ID</Label>
            <Input value={user?.id || ''} disabled className="font-mono text-xs" />
          </div>
          <div className="space-y-2">
            <Label>Account Created</Label>
            <Input
              value={user?.created_at ? new Date(user.created_at).toLocaleString() : ''}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label>Email Confirmed</Label>
            <Badge variant={user?.email_confirmed_at ? "default" : "secondary"}>
              {user?.email_confirmed_at ? 'Confirmed' : 'Not Confirmed'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Project Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Project</CardTitle>
          <CardDescription>Configure project settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input id="project-name" placeholder="My Project" defaultValue="My Project" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-domain">Custom Domain</Label>
            <Input id="project-domain" placeholder="myproject.com" />
          </div>
          <Button>Update Project</Button>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>Manage your API keys for integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openai-key">OpenAI API Key</Label>
            <Input id="openai-key" type="password" placeholder="sk-..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stripe-key">Stripe API Key</Label>
            <Input id="stripe-key" type="password" placeholder="sk_test_..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="github-token">GitHub Token</Label>
            <Input id="github-token" type="password" placeholder="ghp_..." />
          </div>
          <Button>Save API Keys</Button>
        </CardContent>
      </Card>

      {/* Application Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Application Logs</CardTitle>
          <CardDescription>View and manage application logs for debugging</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Tabs value={selectedLevel} onValueChange={(v) => setSelectedLevel(v as LogLevel | 'all')} className="w-full">
              <TabsList>
                <TabsTrigger value="all">All ({logs.length})</TabsTrigger>
                <TabsTrigger value={LogLevel.DEBUG}>Debug</TabsTrigger>
                <TabsTrigger value={LogLevel.INFO}>Info</TabsTrigger>
                <TabsTrigger value={LogLevel.WARN}>Warn</TabsTrigger>
                <TabsTrigger value={LogLevel.ERROR}>Error</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={refreshLogs}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={downloadLogs}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={clearLogs}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[400px] w-full rounded-md border p-4 bg-black/5">
            <div className="space-y-2 font-mono text-xs">
              {filteredLogs.length === 0 ? (
                <p className="text-muted-foreground">No logs available</p>
              ) : (
                filteredLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <Badge className={`${getLevelColor(log.level)} text-white shrink-0`}>
                      {log.level}
                    </Badge>
                    <span className="text-muted-foreground shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    {log.context && (
                      <Badge variant="outline" className="shrink-0">
                        {log.context}
                      </Badge>
                    )}
                    <span className="break-all">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Project</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete this project and all of its data
              </p>
            </div>
            <Button variant="destructive">Delete Project</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
