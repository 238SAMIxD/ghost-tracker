import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function Popup() {
  const [currentDomain, setCurrentDomain] = useState<string>('—');
  const [blockedCount, setBlockedCount] = useState<number>(0);

  useEffect(() => {
    // Get current tab's domain
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab?.url) {
        try {
          const hostname = new URL(tab.url).hostname;
          if (!hostname) {
            setCurrentDomain('—');
            setBlockedCount(0);
            return;
          }

          setCurrentDomain(hostname);
          
          // Get blocked count for this domain
          chrome.runtime.sendMessage({ type: 'GET_EVENT_COUNT', hostDomain: hostname }, (response) => {
            if (response?.count !== undefined) {
              setBlockedCount(response.count);
            }
          });
        } catch {
          setCurrentDomain('—');
          setBlockedCount(0);
        }
      }
    });
  }, []);

  const handleOpenDashboard = () => {
    chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
    window.close();
  };

  return (
    <div className="dark w-popup p-5 font-sans bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-3xl">👻</span>
        <div>
          <h1 className="m-0 text-lg font-bold">Ghost Tracker</h1>
          <p className="m-0 text-xs text-muted-foreground">
            Tracking script interceptor
          </p>
        </div>
      </div>

      {/* Current domain */}
      <Card className="mb-3 shadow-sm">
        <CardContent className="p-3">
          <p className="text-xxs text-muted-foreground uppercase tracking-widest font-medium">
            Current Site
          </p>
          <p className="mt-1 text-sm font-semibold break-all">
            {currentDomain}
          </p>
        </CardContent>
      </Card>

      {/* Blocked count */}
      <Card className="mb-4 shadow-sm text-center">
        <CardContent className="p-3">
          <p className="text-xxs text-muted-foreground uppercase tracking-widest font-medium">
            Trackers Blocked
          </p>
          <p className="mt-2 text-4xl font-extrabold text-emerald-500">
            {blockedCount}
          </p>
        </CardContent>
      </Card>

      {/* Open dashboard button */}
      <Button
        onClick={handleOpenDashboard}
        className="w-full flex items-center justify-center gap-2"
      >
        <span>📊</span> Open Full Dashboard
      </Button>
    </div>
  );
}
