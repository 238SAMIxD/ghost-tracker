import type { ViewType } from '../Dashboard';
import { Button } from '@/components/ui/button';

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
    <header className="h-20 bg-background flex items-center justify-between px-8 border-b border-border shrink-0">
      <h2 className="text-xl font-bold m-0">
        {titles[currentView] || 'Dashboard'}
      </h2>

      <div className="flex items-center gap-4">
        {currentView !== 'settings' && (
          <Button
            variant="destructive"
            onClick={onClearHistory}
            className="flex items-center gap-2"
          >
            <span className="text-base">🗑️</span>
            Clear History
          </Button>
        )}
      </div>
    </header>
  );
}
