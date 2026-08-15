import { useEffect, useState } from 'react';

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
    <div className="w-[320px] p-5 font-sans bg-slate-950 text-slate-50">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-3xl">👻</span>
        <div>
          <h1 className="m-0 text-lg font-bold">Ghost Tracker</h1>
          <p className="m-0 text-xs text-slate-400">
            Tracking script interceptor
          </p>
        </div>
      </div>

      {/* Current domain */}
      <div className="bg-slate-900 rounded-lg p-3 mb-3 border border-slate-800 shadow-sm">
        <p className="m-0 text-[11px] text-slate-400 uppercase tracking-widest font-medium">
          Current Site
        </p>
        <p className="mt-1 mb-0 text-sm font-semibold break-all">
          {currentDomain}
        </p>
      </div>

      {/* Blocked count */}
      <div className="bg-slate-900 rounded-lg p-3 mb-4 text-center border border-slate-800 shadow-sm">
        <p className="m-0 text-[11px] text-slate-400 uppercase tracking-widest font-medium">
          Trackers Blocked
        </p>
        <p className="mt-2 mb-0 text-4xl font-extrabold text-emerald-500">
          {blockedCount}
        </p>
      </div>

      {/* Open dashboard button */}
      <button
        onClick={handleOpenDashboard}
        className="w-full py-2.5 px-4 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors cursor-pointer border border-indigo-500/50 shadow-sm flex items-center justify-center gap-2"
      >
        <span>📊</span> Open Full Dashboard
      </button>
    </div>
  );
}
