import type { ViewType } from '../Dashboard';

interface SidebarProps {
  currentView: ViewType;
  onChangeView: (view: ViewType) => void;
}

export function Sidebar({ currentView, onChangeView }: SidebarProps) {
  const navItems: { id: ViewType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'events', label: 'Events Log', icon: '📋' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-full shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-sidebar-border/50">
        <span className="text-3xl">👻</span>
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
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              }`}
            >
              <span className="text-lg opacity-80">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border/50 text-center">
        <p className="text-xs text-muted-foreground">Manifest V3 Extension</p>
      </div>
    </aside>
  );
}
