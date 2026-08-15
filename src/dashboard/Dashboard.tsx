import { useEffect, useState } from 'react';
import type { TrackerEvent } from '@/db';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricCard } from './components/MetricCard';

export type ViewType = 'overview' | 'events' | 'settings';

export function Dashboard() {
  const [events, setEvents] = useState<TrackerEvent[]>([]);
  const [totalBlocked, setTotalBlocked] = useState(0);
  const [currentView, setCurrentView] = useState<ViewType>('overview');

  useEffect(() => {
    // Fetch initial data
    chrome.runtime.sendMessage({ type: 'GET_EVENTS', limit: 200 }, (response) => {
      if (Array.isArray(response)) {
        setEvents(response);
      }
    });

    chrome.runtime.sendMessage({ type: 'GET_EVENT_COUNT' }, (response) => {
      if (response?.count !== undefined) {
        setTotalBlocked(response.count);
      }
    });

    // Listen for real-time events
    const listener = (message: { type: string; payload: TrackerEvent }) => {
      if (message.type === 'TRACKER_INTERCEPTED') {
        setEvents((prev) => [message.payload, ...prev].slice(0, 200));
        setTotalBlocked((prev) => prev + 1);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const handleClearHistory = () => {
    chrome.runtime.sendMessage({ type: 'CLEAR_EVENTS' }, () => {
      setEvents([]);
      setTotalBlocked(0);
    });
  };

  // Compute category counts
  const categoryCounts = events.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const categoryColors: Record<TrackerEvent['category'], string> = {
    analytics: '#3b82f6', // blue-500
    ads: '#ef4444', // red-500
    social: '#a855f7', // purple-500
    telemetry: '#eab308', // yellow-500
    unknown: '#94a3b8', // slate-400
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 font-sans antialiased overflow-hidden selection:bg-indigo-500/30">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header currentView={currentView} onClearHistory={handleClearHistory} />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Overview View */}
            {currentView === 'overview' && (
              <>
                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <MetricCard label="Total Blocked" value={totalBlocked} color="#22c55e" />
                  <MetricCard label="Analytics" value={categoryCounts.analytics || 0} color={categoryColors.analytics} />
                  <MetricCard label="Ads" value={categoryCounts.ads || 0} color={categoryColors.ads} />
                  <MetricCard label="Social" value={categoryCounts.social || 0} color={categoryColors.social} />
                  <MetricCard label="Telemetry" value={categoryCounts.telemetry || 0} color={categoryColors.telemetry} />
                </div>

                {/* Dashboard summary placeholder - Future Charts go here */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 h-64 border-dashed">
                  <span className="text-4xl mb-3">📈</span>
                  <p className="font-medium">Data Visualizations coming soon (PI-2)</p>
                </div>
              </>
            )}

            {/* Events Log View */}
            {(currentView === 'overview' || currentView === 'events') && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-800">
                  <h2 className="m-0 text-base font-bold text-slate-100">Recent Tracker Events</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-900/50 text-slate-400 text-[11px] uppercase tracking-wider">
                        <th className="px-6 py-4 font-medium">Timestamp</th>
                        <th className="px-6 py-4 font-medium">Host Domain</th>
                        <th className="px-6 py-4 font-medium">Tracker URL</th>
                        <th className="px-6 py-4 font-medium">Category</th>
                        <th className="px-6 py-4 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {events.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                            No tracker events recorded yet. Browse the web and Ghost Tracker will capture them here.
                          </td>
                        </tr>
                      )}
                      {events.map((event, i) => (
                        <tr key={event.id ?? i} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-3 whitespace-nowrap text-slate-300">
                            {new Date(event.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-3 font-medium text-slate-200">{event.hostDomain}</td>
                          <td className="px-6 py-3 max-w-[300px] truncate text-slate-400">
                            {event.trackerUrl}
                          </td>
                          <td className="px-6 py-3">
                            <span
                              className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-white"
                              style={{ backgroundColor: categoryColors[event.category] || categoryColors.unknown }}
                            >
                              {event.category}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            {event.blocked ? (
                              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Blocked
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Allowed
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Settings View */}
            {currentView === 'settings' && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 h-64 border-dashed">
                <span className="text-4xl mb-3">⚙️</span>
                <p className="font-medium">Settings Panel coming soon</p>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
