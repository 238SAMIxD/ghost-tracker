import { useEffect, useState } from 'react';
import type { TrackerEvent } from '@/db';

export function Dashboard() {
  const [events, setEvents] = useState<TrackerEvent[]>([]);
  const [totalBlocked, setTotalBlocked] = useState(0);

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
        setEvents((prev) => [message.payload as TrackerEvent, ...prev].slice(0, 200));
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

  const categoryColors: Record<string, string> = {
    analytics: 'var(--gt-accent-blue, #3b82f6)',
    ads: 'var(--gt-accent-red, #ef4444)',
    social: 'var(--gt-accent-purple, #a855f7)',
    telemetry: 'var(--gt-accent-yellow, #eab308)',
    unknown: 'var(--gt-text-secondary, #94a3b8)',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gt-bg-dark)', padding: 24 }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 36 }}>👻</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Ghost Tracker</h1>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--gt-text-secondary)' }}>
              Privacy Dashboard
            </p>
          </div>
        </div>
        <button
          onClick={handleClearHistory}
          style={{
            padding: '8px 16px',
            border: '1px solid var(--gt-accent-red)',
            borderRadius: 8,
            background: 'transparent',
            color: 'var(--gt-accent-red)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🗑️ Clear History
        </button>
      </header>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <MetricCard label="Total Blocked" value={totalBlocked} color="var(--gt-accent-green)" />
        <MetricCard label="Analytics" value={categoryCounts.analytics || 0} color={categoryColors.analytics} />
        <MetricCard label="Ads" value={categoryCounts.ads || 0} color={categoryColors.ads} />
        <MetricCard label="Social" value={categoryCounts.social || 0} color={categoryColors.social} />
        <MetricCard label="Telemetry" value={categoryCounts.telemetry || 0} color={categoryColors.telemetry} />
      </div>

      {/* Events Table */}
      <div style={{ background: 'var(--gt-bg-card)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gt-bg-surface)' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Recent Events</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--gt-text-secondary)' }}>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>Timestamp</th>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>Host Domain</th>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>Tracker URL</th>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--gt-text-secondary)' }}>
                    No tracker events recorded yet. Browse the web and Ghost Tracker will capture them here.
                  </td>
                </tr>
              )}
              {events.map((event, i) => (
                <tr key={event.id ?? i} style={{ borderTop: '1px solid var(--gt-bg-surface)' }}>
                  <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </td>
                  <td style={{ padding: '10px 16px' }}>{event.hostDomain}</td>
                  <td style={{ padding: '10px 16px', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {event.trackerUrl}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#fff',
                        background: categoryColors[event.category] || categoryColors.unknown,
                      }}
                    >
                      {event.category}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', color: event.blocked ? 'var(--gt-accent-green)' : 'var(--gt-accent-red)' }}>
                    {event.blocked ? '🛡️ Blocked' : '⚠️ Allowed'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{
        background: 'var(--gt-bg-card)',
        borderRadius: 12,
        padding: 20,
        textAlign: 'center',
      }}
    >
      <p style={{ margin: 0, fontSize: 11, color: 'var(--gt-text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </p>
      <p style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 800, color }}>{value}</p>
    </div>
  );
}
