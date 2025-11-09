import { ReactNode } from "react";
import { NavLink } from "./NavLink";
import { LayoutDashboard, Package, Globe, Code, Settings, Search, Command, LogOut, User } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { logger } from "@/lib/logger";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package },
  { name: "Hosting", href: "/hosting", icon: Globe },
  { name: "Builder", href: "/builder", icon: Code },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    logger.info('User initiated sign out', 'DashboardLayout');
    try {
      await signOut();
    } catch (error) {
      logger.error('Sign out failed', 'DashboardLayout', { error });
      // Consider adding user-facing error notification here
    }
  };
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card">
        <div className="flex h-16 items-center border-b border-border px-6">
          <h1 className="text-xl font-bold text-foreground">LaunchOS</h1>
        </div>
        
        <nav className="flex flex-col gap-1 p-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === "/"}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              activeClassName="bg-accent text-accent-foreground"
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ask AI or search... (Cmd+K)"
                className="w-full pl-10 pr-4"
              />
              <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-xs text-muted-foreground">
                <Command className="h-3 w-3" />K
              </kbd>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <select className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
              <option>My Project</option>
            </select>

            <div className="flex items-center gap-2 border-l border-border pl-4">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="ml-2"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
