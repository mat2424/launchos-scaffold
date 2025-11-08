import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, Globe, Play, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const mockProjects = [
  {
    id: 1,
    name: "my-saas-app",
    repo: "github.com/user/my-saas-app",
    status: "deployed",
    lastDeploy: "2 hours ago",
    domain: "my-saas.vercel.app",
  },
  {
    id: 2,
    name: "landing-page",
    repo: "github.com/user/landing-page",
    status: "building",
    lastDeploy: "5 minutes ago",
    domain: "landing.vercel.app",
  },
  {
    id: 3,
    name: "portfolio-site",
    repo: "github.com/user/portfolio",
    status: "deployed",
    lastDeploy: "1 day ago",
    domain: "portfolio.vercel.app",
  },
];

const mockDeployments = [
  { id: "abc123", branch: "main", status: "Ready", timestamp: "2 hours ago" },
  { id: "def456", branch: "main", status: "Building", timestamp: "5 minutes ago" },
  { id: "ghi789", branch: "feature/ui", status: "Ready", timestamp: "1 day ago" },
  { id: "jkl012", branch: "main", status: "Ready", timestamp: "2 days ago" },
];

export default function Hosting() {
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

      {/* Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{project.name}</h3>
                    <Badge
                      variant={project.status === "deployed" ? "default" : "secondary"}
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Github className="h-3 w-3" />
                      {project.repo}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {project.domain}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last deployed {project.lastDeploy}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Logs
                  </Button>
                  <Button size="sm" className="gap-1">
                    <Play className="h-3 w-3" />
                    Deploy
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deployments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Build ID</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDeployments.map((deployment) => (
                <TableRow key={deployment.id}>
                  <TableCell className="font-mono text-sm">{deployment.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{deployment.branch}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        deployment.status === "Ready" ? "default" : "secondary"
                      }
                    >
                      {deployment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {deployment.timestamp}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View Logs
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
