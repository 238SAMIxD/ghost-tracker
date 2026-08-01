/**
 * Ghost Tracker — Known Tracker Domain Blocklist
 *
 * Domains are categorized by tracker type.
 */

export type TrackerCategory = 'analytics' | 'ads' | 'social' | 'telemetry' | 'unknown';

const TRACKER_DOMAINS: Record<TrackerCategory, string[]> = {
  analytics: [
    'google-analytics.com',
    'googletagmanager.com',
    'analytics.google.com',
    'hotjar.com',
    'mixpanel.com',
    'segment.io',
    'segment.com',
    'amplitude.com',
    'fullstory.com',
    'mouseflow.com',
    'heap.io',
    'heapanalytics.com',
    'matomo.cloud',
    'plausible.io',
  ],
  ads: [
    'doubleclick.net',
    'googlesyndication.com',
    'googleadservices.com',
    'adnxs.com',
    'amazon-adsystem.com',
    'criteo.com',
    'criteo.net',
    'taboola.com',
    'outbrain.com',
    'adsrvr.org',
    'adform.net',
    'rubiconproject.com',
  ],
  social: [
    'connect.facebook.net',
    'facebook.com/tr',
    'platform.twitter.com',
    'platform.linkedin.com',
    'snap.licdn.com',
    'sc-static.net',
    'tiktok.com/i18n',
    'pinterest.com/ct',
  ],
  telemetry: [
    'sentry.io',
    'bugsnag.com',
    'newrelic.com',
    'nr-data.net',
    'datadoghq.com',
    'browser-intake-datadoghq.com',
    'logr-ingest.com',
    'clarity.ms',
  ],
  unknown: [],
};

/** Check if a URL belongs to a known tracker domain */
export function isTrackerUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return Object.values(TRACKER_DOMAINS)
      .flat()
      .some((domain) => hostname === domain || hostname.endsWith('.' + domain));
  } catch {
    return false;
  }
}

/** Categorize a URL into a tracker category */
export function categorizeTracker(url: string): TrackerCategory {
  try {
    const hostname = new URL(url).hostname;
    for (const [category, domains] of Object.entries(TRACKER_DOMAINS)) {
      if (domains.some((domain) => hostname === domain || hostname.endsWith('.' + domain))) {
        return category as TrackerCategory;
      }
    }
  } catch {
    // Invalid URL
  }
  return 'unknown';
}

/** Get all tracker domains, optionally filtered by category */
export function getTrackerDomains(category?: TrackerCategory): string[] {
  if (category) {
    return TRACKER_DOMAINS[category] ?? [];
  }
  return Object.values(TRACKER_DOMAINS).flat();
}
