import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, Globe, Code, ArrowUpRight } from "lucide-react";

export default function Dashboard() {
  const stats = [
    { name: "Total Products", value: "12", icon: Package, change: "+2 this week" },
    { name: "Total Sales", value: "$24,350", icon: TrendingUp, change: "+12.5% from last month" },
    { name: "Active Projects", value: "3", icon: Globe, change: "2 deployed today" },
    { name: "AI Sessions", value: "47", icon: Code, change: "+8 this week" },
  ];

  const recentActivity = [
    { title: "New product created", description: "Premium Template Pack", time: "2 hours ago" },
    { title: "Deployment successful", description: "my-app.vercel.app", time: "4 hours ago" },
    { title: "AI session completed", description: "Landing page redesign", time: "6 hours ago" },
    { title: "Order received", description: "$299.00 - Pro License", time: "1 day ago" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to LaunchOS</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer transition-colors hover:bg-accent">
          <CardHeader>
            <CardTitle className="text-base">Create Product</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Add a new product to your CRM</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer transition-colors hover:bg-accent">
          <CardHeader>
            <CardTitle className="text-base">Deploy Project</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Push your latest changes live</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer transition-colors hover:bg-accent">
          <CardHeader>
            <CardTitle className="text-base">Start AI Session</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Build with AI assistance</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
