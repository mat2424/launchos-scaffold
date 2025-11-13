import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const projectSchema = z.object({
  name: z.string()
    .min(3, "Project name must be at least 3 characters")
    .max(50, "Project name must be less than 50 characters")
    .regex(/^[a-zA-Z0-9\s-]+$/, "Project name can only contain letters, numbers, spaces, and hyphens"),
  description: z.string().max(200, "Description must be less than 200 characters").optional(),
  subdomain: z.string()
    .min(3, "Subdomain must be at least 3 characters")
    .max(30, "Subdomain must be less than 30 characters")
    .regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens")
    .regex(/^[a-z]/, "Subdomain must start with a letter")
    .regex(/[a-z0-9]$/, "Subdomain must end with a letter or number"),
});

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subdomain: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generateSubdomain = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 30);
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      subdomain: prev.subdomain || generateSubdomain(name),
    }));
    setErrors(prev => ({ ...prev, name: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Validate form data
      const validatedData = projectSchema.parse(formData);

      // Check if subdomain is unique
      const { data: existingProject } = await supabase
        .from('projects')
        .select('id')
        .eq('subdomain', validatedData.subdomain)
        .maybeSingle();

      if (existingProject) {
        setErrors({ subdomain: "This subdomain is already taken" });
        setLoading(false);
        return;
      }

      // Generate deployment URL
      const deploymentUrl = `https://${validatedData.subdomain}.yourapp.com`;

      // Create project
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          name: validatedData.name,
          description: validatedData.description || null,
          subdomain: validatedData.subdomain,
          deployment_url: deploymentUrl,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh projects list
      queryClient.invalidateQueries({ queryKey: ['projects'] });

      toast({
        title: "Project created successfully!",
        description: (
          <div className="flex flex-col gap-2">
            <p>Your project is ready to deploy.</p>
            <code className="text-xs bg-muted p-2 rounded">{deploymentUrl}</code>
          </div>
        ),
      });

      // Reset form and close dialog
      setFormData({ name: "", description: "", subdomain: "" });
      onOpenChange(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: "Failed to create project",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a new project and get a shareable deployment URL.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              placeholder="My Awesome Project"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subdomain">Subdomain *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="subdomain"
                placeholder="my-awesome-project"
                value={formData.subdomain}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, subdomain: e.target.value }));
                  setErrors(prev => ({ ...prev, subdomain: "" }));
                }}
                disabled={loading}
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">.yourapp.com</span>
            </div>
            {errors.subdomain && (
              <p className="text-sm text-destructive">{errors.subdomain}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="A brief description of your project..."
              value={formData.description}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, description: e.target.value }));
                setErrors(prev => ({ ...prev, description: "" }));
              }}
              disabled={loading}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
