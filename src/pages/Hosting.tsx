import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, Globe, GitBranch, Activity, Plus, ExternalLink, Copy, Trash2, Rocket } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";
import CreateProjectDialog from "@/components/hosting/CreateProjectDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Hosting() {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [deployingProjectId, setDeployingProjectId] = useState<string | null>(null);

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
      case 'building': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied to clipboard!",
      description: "Deployment URL has been copied.",
    });
  };

  const handleDeploy = async (projectId: string) => {
    setDeployingProjectId(projectId);
    try {
      // Create deployment record
      const buildId = `build-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      const { error: deployError } = await supabase
        .from('deployments')
        .insert({
          project_id: projectId,
          build_id: buildId,
          branch: 'main',
          status: 'pending',
        });

      if (deployError) throw deployError;

      toast({
        title: "Deployment started",
        description: "Your project is being deployed...",
      });

      // Simulate deployment process
      setTimeout(async () => {
        // Update deployment status to building
        await supabase
          .from('deployments')
          .update({ status: 'building' })
          .eq('build_id', buildId);

        // After a delay, mark as success and update project
        setTimeout(async () => {
          await supabase
            .from('deployments')
            .update({ status: 'success' })
            .eq('build_id', buildId);

          await supabase
            .from('projects')
            .update({ 
              status: 'active',
              last_deploy_at: new Date().toISOString(),
            })
            .eq('id', projectId);

          toast({
            title: "Deployment successful!",
            description: "Your project is now live.",
          });

          setDeployingProjectId(null);
        }, 3000);
      }, 2000);
    } catch (error) {
      toast({
        title: "Deployment failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      setDeployingProjectId(null);
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteProjectId) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', deleteProjectId);

      if (error) throw error;

      toast({
        title: "Project deleted",
        description: "The project has been removed successfully.",
      });

      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (error) {
      toast({
        title: "Failed to delete project",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setDeleteProjectId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hosting</h1>
          <p className="text-muted-foreground">Manage your deployments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Github className="h-4 w-4" />
            Connect GitHub
          </Button>
          <Button className="gap-2" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {!projects || projects.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Globe className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">No projects yet</p>
              <p className="text-sm text-muted-foreground mb-4">Create your first project to get started</p>
              <Button onClick={() => setCreateDialogOpen(true)}>
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
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  {project.deployment_url && (
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                      <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <code className="text-xs flex-1 truncate">{project.deployment_url}</code>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => handleCopyUrl(project.deployment_url)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => window.open(project.deployment_url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

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
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleDeploy(project.id)}
                      disabled={deployingProjectId === project.id}
                    >
                      {deployingProjectId === project.id ? (
                        <>
                          <Rocket className="h-4 w-4 mr-2 animate-pulse" />
                          Deploying...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-4 w-4 mr-2" />
                          Deploy
                        </>
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="px-2"
                      onClick={() => setDeleteProjectId(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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

      <CreateProjectDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
      />

      <AlertDialog open={!!deleteProjectId} onOpenChange={() => setDeleteProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
              All deployments associated with this project will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
