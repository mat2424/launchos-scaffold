import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Package, Globe, TrendingUp, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { data: products } = useQuery({
    queryKey: ['products-count'],
    queryFn: async () => {
      const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  const { data: projects } = useQuery({
    queryKey: ['projects-count'],
    queryFn: async () => {
      const { count } = await supabase.from('projects').select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  const { data: revenue } = useQuery({
    queryKey: ['total-revenue'],
    queryFn: async () => {
      const { data } = await supabase.from('orders').select('amount');
      return data?.reduce((sum, order) => sum + Number(order.amount), 0) || 0;
    }
  });

  const { data: sessions } = useQuery({
    queryKey: ['ai-sessions-count'],
    queryFn: async () => {
      const { count } = await supabase.from('ai_sessions').select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data: orders } = await supabase
        .from('orders')
        .select('*, products(title)')
        .order('created_at', { ascending: false })
        .limit(5);
      return orders || [];
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to LaunchOS</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenue?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">From all orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products || 0}</div>
            <p className="text-xs text-muted-foreground">Listed products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Projects</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects || 0}</div>
            <p className="text-xs text-muted-foreground">Hosted projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions || 0}</div>
            <p className="text-xs text-muted-foreground">Total sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {!recentActivity || recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent orders yet</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-accent p-2">
                      <Package className="h-4 w-4 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {order.products?.title || 'Product'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">${Number(order.amount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer transition-colors hover:bg-accent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Add Product</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create a new product for your catalog
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:bg-accent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Deploy Project</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Deploy your latest changes to production
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:bg-accent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Start Building</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use AI to build or modify your projects
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
