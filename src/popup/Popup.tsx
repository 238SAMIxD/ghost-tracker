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
          setCurrentDomain(new URL(tab.url).hostname);
        } catch {
          setCurrentDomain('—');
        }
      }
    });

    // Get blocked count
    chrome.runtime.sendMessage({ type: 'GET_EVENT_COUNT' }, (response) => {
      if (response?.count !== undefined) {
        setBlockedCount(response.count);
      }
    });
  }, []);

  const handleOpenDashboard = () => {
    chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
    window.close();
  };

  return (
    <div
      style={{
        width: 320,
        padding: 20,
        fontFamily: "'Inter', system-ui, sans-serif",
        background: 'var(--gt-bg-dark, #0f172a)',
        color: 'var(--gt-text-primary, #f8fafc)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 28 }}>👻</span>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Ghost Tracker</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--gt-text-secondary, #94a3b8)' }}>
            Tracking script interceptor
          </p>
        </div>
      </div>

      {/* Current domain */}
      <div
        style={{
          background: 'var(--gt-bg-card, #1e293b)',
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <p style={{ margin: 0, fontSize: 11, color: 'var(--gt-text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: 1 }}>
          Current Site
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 600, wordBreak: 'break-all' }}>
          {currentDomain}
        </p>
      </div>

      {/* Blocked count */}
      <div
        style={{
          background: 'var(--gt-bg-card, #1e293b)',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          textAlign: 'center',
        }}
      >
        <p style={{ margin: 0, fontSize: 11, color: 'var(--gt-text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: 1 }}>
          Trackers Blocked
        </p>
        <p
          style={{
            margin: '8px 0 0',
            fontSize: 36,
            fontWeight: 800,
            color: 'var(--gt-accent-green, #22c55e)',
          }}
        >
          {blockedCount}
        </p>
      </div>

      {/* Open dashboard button */}
      <button
        onClick={handleOpenDashboard}
        style={{
          width: '100%',
          padding: '10px 16px',
          border: 'none',
          borderRadius: 8,
          background: 'var(--gt-primary, #6366f1)',
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gt-primary-hover, #4f46e5)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--gt-primary, #6366f1)')}
      >
        📊 Open Full Dashboard
      </button>
    </div>
  );
}
