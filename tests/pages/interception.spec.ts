import { test, expect } from '../fixtures/extension.fixture';
import type { BrowserContext, Page } from '@playwright/test';
import { TargetPage } from './TargetPage';
import { PopupPage } from './PopupPage';

const expectedTrackers = [
  {
    url: 'https://www.google-analytics.com/analytics.js',
    category: 'analytics',
  },
  {
    url: 'https://www.googletagmanager.com/gtag/js?id=TEST-123',
    category: 'analytics',
  },
  {
    url: 'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
    category: 'ads',
  },
  {
    url: 'https://connect.facebook.net/en_US/sdk.js',
    category: 'social',
  },
  {
    url: 'https://www.clarity.ms/tag/test123',
    category: 'telemetry',
  },
] as const;

interface StoredTrackerEvent {
  timestamp: number;
  hostDomain: string;
  trackerUrl: string;
  category: string;
  blocked: boolean;
}

async function getStoredEvents(page: Page): Promise<StoredTrackerEvent[]> {
  return await page.evaluate(() => {
    return new Promise<StoredTrackerEvent[]>((resolve, reject) => {
      const request = indexedDB.open('GhostTrackerDB');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const database = request.result;
        const transaction = database.transaction('events', 'readonly');
        const eventsRequest = transaction.objectStore('events').getAll();

        eventsRequest.onerror = () => reject(eventsRequest.error);
        eventsRequest.onsuccess = () => {
          resolve(eventsRequest.result as StoredTrackerEvent[]);
          database.close();
        };
      };
    });
  });
}

async function getBadgeText(context: BrowserContext, targetUrl: string): Promise<string> {
  const [background] = context.serviceWorkers();
  if (!background) return '';

  return await background.evaluate(async (url) => {
    const tabs = await chrome.tabs.query({});
    const tab = tabs.find((candidate) => candidate.url === url);
    if (tab?.id === undefined) return '';

    return await chrome.action.getBadgeText({ tabId: tab.id });
  }, targetUrl);
}

test.describe('Ghost Tracker interception', () => {
  test('blocked badge count and IndexedDB records match intercepted trackers', async ({
    context,
    extensionId,
  }) => {
    const trackerTab = await context.newPage();
    const requestedTrackerUrls = new Set<string>();
    const failedTrackerUrls = new Set<string>();

    trackerTab.on('request', (request) => {
      if (expectedTrackers.some((tracker) => tracker.url === request.url())) {
        requestedTrackerUrls.add(request.url());
      }
    });
    trackerTab.on('requestfailed', (request) => {
      if (expectedTrackers.some((tracker) => tracker.url === request.url())) {
        failedTrackerUrls.add(request.url());
      }
    });

    await TargetPage.openMockPage(trackerTab);

    await trackerTab.waitForLoadState('networkidle');
    const targetHost = new URL(trackerTab.url()).hostname;

    const popupTab = await context.newPage();

    await PopupPage.open(popupTab, extensionId);

    await expect
      .poll(async () => (await getStoredEvents(popupTab)).length, {
        timeout: 10000,
      })
      .toBe(expectedTrackers.length);

    const events = await getStoredEvents(popupTab);
    const eventsByUrl = new Map(events.map((event) => [event.trackerUrl, event]));

    expect(events).toHaveLength(expectedTrackers.length);
    expect([...eventsByUrl.keys()].sort()).toEqual(
      expectedTrackers.map((tracker) => tracker.url).sort(),
    );

    for (const tracker of expectedTrackers) {
      const event = eventsByUrl.get(tracker.url);
      expect(event).toBeDefined();
      expect(event).toMatchObject({
        trackerUrl: tracker.url,
        category: tracker.category,
        hostDomain: targetHost,
        blocked: true,
      });
      expect(event?.timestamp).toBeGreaterThan(0);
    }

    const blockedCount = events.filter((event) => event.blocked).length;
    expect(blockedCount).toBe(requestedTrackerUrls.size);
    expect([...failedTrackerUrls].sort()).toEqual(
      expectedTrackers.map((tracker) => tracker.url).sort(),
    );

    await expect
      .poll(() => getBadgeText(context, trackerTab.url()), { timeout: 10000 })
      .toBe(String(blockedCount));

    await popupTab.close();
    await trackerTab.close();
  });
});
