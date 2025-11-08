import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, Globe, GitBranch, Activity, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function Hosting() {
  const queryClient = useQueryClient();

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: deployments } = useQuery({
    queryKey: ['deployments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deployments')
        .select('*, projects(name)')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel('hosting-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deployments' }, () => {
        queryClient.invalidateQueries({ queryKey: ['deployments'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hosting</h1>
          <p className="text-muted-foreground">Manage your deployments</p>
        </div>
        <Button className="gap-2">
          <Github className="h-4 w-4" />
          Connect GitHub
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {!projects || projects.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Globe className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">No projects yet</p>
              <p className="text-sm text-muted-foreground mb-4">Create your first project to get started</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          projects.map((project: any) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <Badge variant={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.repo_url && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GitBranch className="h-4 w-4" />
                      <span className="truncate">{project.repo_url}</span>
                    </div>
                  )}
                  {project.last_deploy_at && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Activity className="h-4 w-4" />
                      <span>Last deployed {new Date(project.last_deploy_at).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      View Logs
                    </Button>
                    <Button size="sm" className="flex-1">
                      Deploy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Recent Deployments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          {!deployments || deployments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No deployments yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Build ID</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deployments.map((deploy: any) => (
                  <TableRow key={deploy.id}>
                    <TableCell className="font-medium">{deploy.build_id}</TableCell>
                    <TableCell>{deploy.projects?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        {deploy.branch}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(deploy.status)}>
                        {deploy.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(deploy.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
