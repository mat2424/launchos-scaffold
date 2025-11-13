import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Declare EdgeRuntime global for background tasks
declare const EdgeRuntime: {
  waitUntil(promise: Promise<unknown>): void;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is authenticated
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = roles?.some(r => r.role === 'admin');
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { project_id, branch = 'main' } = await req.json();

    if (!project_id) {
      return new Response(
        JSON.stringify({ error: 'project_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      console.error('Project not found:', projectError);
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate build ID
    const buildId = `build-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    console.log(`Starting deployment for project ${project_id}, build ${buildId}`);

    // Create deployment record
    const { data: deployment, error: deploymentError } = await supabase
      .from('deployments')
      .insert({
        project_id,
        build_id: buildId,
        branch,
        status: 'pending',
      })
      .select()
      .single();

    if (deploymentError) {
      console.error('Failed to create deployment:', deploymentError);
      return new Response(
        JSON.stringify({ error: 'Failed to create deployment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Start background deployment process
    EdgeRuntime.waitUntil(
      (async () => {
        try {
          console.log(`Background: Processing deployment ${buildId}`);
          
          // Simulate building phase
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          await supabase
            .from('deployments')
            .update({ status: 'building' })
            .eq('id', deployment.id);

          console.log(`Background: Building deployment ${buildId}`);

          // Simulate deployment phase
          await new Promise(resolve => setTimeout(resolve, 3000));

          // Random success/failure for testing (90% success rate)
          const success = Math.random() > 0.1;

          if (success) {
            await supabase
              .from('deployments')
              .update({ status: 'success' })
              .eq('id', deployment.id);

            await supabase
              .from('projects')
              .update({
                status: 'active',
                last_deploy_at: new Date().toISOString(),
              })
              .eq('id', project_id);

            console.log(`Background: Deployment ${buildId} completed successfully`);
          } else {
            await supabase
              .from('deployments')
              .update({ status: 'failed' })
              .eq('id', deployment.id);

            console.log(`Background: Deployment ${buildId} failed`);
          }
        } catch (error) {
          console.error(`Background: Error in deployment ${buildId}:`, error);
          await supabase
            .from('deployments')
            .update({ status: 'failed' })
            .eq('id', deployment.id);
        }
      })()
    );

    return new Response(
      JSON.stringify({
        success: true,
        deployment: {
          id: deployment.id,
          build_id: buildId,
          status: 'pending',
          project_name: project.name,
          deployment_url: project.deployment_url,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in deploy-project function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
