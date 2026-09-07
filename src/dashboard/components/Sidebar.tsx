import type { ViewType } from '../Dashboard';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, List, Settings, Ghost } from 'lucide-react';

interface SidebarProps {
  currentView: ViewType;
  onChangeView: (view: ViewType) => void;
}

export function Sidebar({ currentView, onChangeView }: SidebarProps) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'events', label: 'Events Log', icon: List },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-full shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-sidebar-border/50">
        <Ghost className="h-8 w-8 text-primary" />
        <div>
          <h1 className="m-0 text-xl font-extrabold tracking-tight">Ghost Tracker</h1>
          <p className="m-0 text-xs text-muted-foreground font-medium">Privacy Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-micro uppercase tracking-wider text-muted-foreground font-bold mb-3 px-3">
          Menu
        </div>
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              onClick={() => onChangeView(item.id)}
              className={`w-full justify-start gap-3 px-3 py-5 text-sm font-medium ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5 opacity-80" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border/50 text-center">
        <p className="text-xs text-muted-foreground">Manifest V3 Extension</p>
      </div>
    </aside>
  );
}
