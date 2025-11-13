import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, GitBranch, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface DeploymentLogsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
}

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'building':
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    case 'pending':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'success':
      return 'default';
    case 'pending':
    case 'building':
      return 'secondary';
    case 'failed':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function DeploymentLogsDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
}: DeploymentLogsDialogProps) {
  const { data: deployments, isLoading } = useQuery({
    queryKey: ['deployment-logs', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deployments')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: open && !!projectId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Deployment History</DialogTitle>
          <DialogDescription>
            Recent deployments for <span className="font-semibold">{projectName}</span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !deployments || deployments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">No deployments yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Deploy your project to see deployment history here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {deployments.map((deployment) => (
                <div
                  key={deployment.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(deployment.status)}
                        <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                          {deployment.build_id}
                        </code>
                        <Badge variant={getStatusColor(deployment.status)}>
                          {deployment.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <GitBranch className="h-3 w-3" />
                          <span>{deployment.branch}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(deployment.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {deployment.status === 'failed' && (
                        <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                          Deployment failed. Check logs for details.
                        </div>
                      )}

                      {deployment.status === 'building' && (
                        <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-sm text-blue-600">
                          Build in progress...
                        </div>
                      )}

                      {deployment.status === 'success' && (
                        <div className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded text-sm text-green-600">
                          Successfully deployed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
