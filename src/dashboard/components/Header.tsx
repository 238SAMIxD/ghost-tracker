import type { ViewType } from '../Dashboard';

interface HeaderProps {
  currentView: ViewType;
  onClearHistory: () => void;
}

export function Header({ currentView, onClearHistory }: HeaderProps) {
  const titles: Record<ViewType, string> = {
    overview: 'Overview',
    events: 'Events Log',
    settings: 'Settings',
  };

  return (
    <header className="h-20 bg-slate-950 flex items-center justify-between px-8 border-b border-slate-800/50 shrink-0">
      <h2 className="text-xl font-bold text-slate-100 m-0">
        {titles[currentView] || 'Dashboard'}
      </h2>

      <div className="flex items-center gap-4">
        {currentView !== 'settings' && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-colors"
          >
            <span className="text-base">🗑️</span>
            Clear History
          </button>
        )}
      </div>
    </header>
  );
}
