import Dexie, { type EntityTable } from 'dexie';

/**
 * Ghost Tracker — IndexedDB Schema (Dexie.js v4)
 */

export interface TrackerEvent {
  id?: number;
  timestamp: number;
  hostDomain: string;
  trackerUrl: string;
  category: 'analytics' | 'ads' | 'social' | 'telemetry' | 'unknown';
  blocked: boolean;
}

export interface UserSetting {
  key: string;
  value: string | boolean | number;
}

class GhostTrackerDB extends Dexie {
  events!: EntityTable<TrackerEvent, 'id'>;
  settings!: EntityTable<UserSetting, 'key'>;

  constructor() {
    super('GhostTrackerDB');

    this.version(1).stores({
      events: '++id, timestamp, hostDomain, trackerUrl, category, blocked, [hostDomain+timestamp]',
      settings: '&key',
    });
  }

  /** Log a new tracker event */
  async logEvent(event: Omit<TrackerEvent, 'id'>): Promise<number> {
    return this.events.add(event as TrackerEvent) as Promise<number>;
  }

  /** Retrieve recent events, ordered by timestamp descending */
  async getEvents(limit = 100): Promise<TrackerEvent[]> {
    return this.events.orderBy('timestamp').reverse().limit(limit).toArray();
  }

  /** Get total event count */
  async getEventCount(): Promise<number> {
    return this.events.count();
  }

  /** Get event count for a specific host domain */
  async getEventCountByHost(hostDomain: string): Promise<number> {
    return this.events.where('hostDomain').equals(hostDomain).count();
  }

  /** Clear all tracked events */
  async clearEvents(): Promise<void> {
    return this.events.clear();
  }
}

export const db = new GhostTrackerDB();
