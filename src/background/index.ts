import { db, type TrackerEvent } from '@/db';
import { categorizeTracker, isTrackerUrl } from '@/utils/blocklist';

/**
 * Ghost Tracker — Background Service Worker
 *
 * Listens for web requests, detects tracker domains,
 * logs events to IndexedDB via Dexie.js, and updates the badge count.
 */

// Listen for web requests and detect trackers
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!details.url || details.tabId < 0) return;

    if (isTrackerUrl(details.url)) {
      const category = categorizeTracker(details.url);

      const event: Omit<TrackerEvent, 'id'> = {
        timestamp: Date.now(),
        hostDomain: new URL(details.initiator || details.url).hostname,
        trackerUrl: details.url,
        category,
        blocked: true,
      };

      // Persist to IndexedDB
      db.logEvent(event);

      // Update badge count for the tab
      updateBadge(details.tabId);

      // Broadcast to open dashboard/popup
      chrome.runtime.sendMessage({
        type: 'TRACKER_INTERCEPTED',
        payload: event,
      }).catch(() => {
        // No listeners — popup/dashboard not open
      });
    }
  },
  { urls: ['<all_urls>'] },
);

// Update extension badge with blocked count for a specific tab
async function updateBadge(tabId: number): Promise<void> {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url) return;

    const hostname = new URL(tab.url).hostname;
    const count = await db.getEventCountByHost(hostname);

    chrome.action.setBadgeText({ text: count > 0 ? String(count) : '', tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#6366f1', tabId });
  } catch {
    // Tab may have been closed
  }
}

// Reset badge on tab navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    chrome.action.setBadgeText({ text: '', tabId });
  }
});

// Handle messages from popup/dashboard
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_EVENTS') {
    db.getEvents(message.limit).then(sendResponse);
    return true; // async response
  }

  if (message.type === 'GET_EVENT_COUNT') {
    if (typeof message.hostDomain === 'string') {
      if (message.hostDomain === '') {
        sendResponse({ count: 0 });
      } else {
        db.getEventCountByHost(message.hostDomain).then((count) => sendResponse({ count }));
      }
    } else {
      db.getEventCount().then((count) => sendResponse({ count }));
    }
    return true;
  }

  if (message.type === 'CLEAR_EVENTS') {
    db.clearEvents().then(() => sendResponse({ success: true }));
    return true;
  }

  if (message.type === 'OPEN_DASHBOARD') {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/dashboard/index.html') });
    sendResponse({ success: true });
  }
});

console.log('[Ghost Tracker] Background service worker initialized.');
