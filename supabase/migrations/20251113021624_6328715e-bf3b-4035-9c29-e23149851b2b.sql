-- Add deployment URL and subdomain columns to projects table
ALTER TABLE public.projects 
ADD COLUMN deployment_url TEXT,
ADD COLUMN subdomain TEXT UNIQUE,
ADD COLUMN description TEXT;

-- Add index for subdomain lookups
CREATE INDEX idx_projects_subdomain ON public.projects(subdomain);

-- Add index for deployments by project and status
CREATE INDEX idx_deployments_project_status ON public.deployments(project_id, status);