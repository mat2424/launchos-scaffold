import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Globe, Calendar, ExternalLink, Home } from "lucide-react";

export default function PublicProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['public-project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Project not found');
      return data;
    },
    enabled: !!projectId,
  });

  useEffect(() => {
    document.title = project?.name 
      ? `${project.name} - Deployed Project`
      : 'Deployed Project';
  }, [project?.name]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Project Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              The project you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-2">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">{project.name}</h1>
          </div>
          
          {project.description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {project.description}
            </p>
          )}

          <div className="flex items-center justify-center gap-3">
            <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
              {project.status}
            </Badge>
            {project.last_deploy_at && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Last deployed {new Date(project.last_deploy_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Project Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.deployment_url && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Deployment URL</h3>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <code className="text-sm flex-1 truncate">{project.deployment_url}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(project.deployment_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {project.subdomain && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Subdomain</h3>
                <p className="text-sm bg-muted p-3 rounded-md font-mono">{project.subdomain}</p>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
              <p className="text-sm">{new Date(project.created_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for actual project content */}
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <Globe className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Project Content</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                This is a placeholder for your deployed project content. 
                In a production environment, this would display your actual application or website.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Powered by Your Hosting Platform
          </p>
        </div>
      </div>
    </div>
  );
}
