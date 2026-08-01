# Ghost Tracker Board Tasks

## 📍 PI 1: Core Extension Architecture & Interception Engine (MVP)

> **Goal:** Build the Manifest V3 foundation, background network interception engine, local database, and initial extension popup menu.

### 🛠️ Front-end Tasks

- [ ] `[FE] [PI-1]` **Project Scaffolding & Build Pipeline**
  - Initialize Vite + React + TypeScript with `@crxjs/vite-plugin`.
  - Configure `manifest.json` (V3 schema, permissions for `declarativeNetRequest`, `storage`, `activeTab`).
  - Set up Tailwind CSS styling.

- [ ] `[FE] [PI-1]` **Dexie.js IndexedDB Schema Setup**
  - Define `events` table schema (`id`, `timestamp`, `hostDomain`, `trackerUrl`, `category`, `blocked`).
  - Implement database access methods for background logging and popup reads.

- [ ] `[FE] [PI-1]` **Background Network Interceptor**
  - Create Manifest V3 Service Worker in `src/background/index.ts`.
  - Implement network listener to compare outgoing requests against blocklist domains.
  - Persist intercepted event objects directly to Dexie.js.

- [ ] `[FE] [PI-1]` **Extension Popup Interface (`popup.html`)**
  - Build lightweight React popup displaying current site domain.
  - Display live counter badge of blocked scripts on active tab.
  - Add "Open Full Dashboard" button launching `dashboard.html`.

### 🧪 QA Tasks

- [ ] `[QA] [PI-1]` **Playwright Framework Setup for Extensions**
  - Configure Playwright to launch Chromium with unpacked `/dist` extension.
  - Create custom fixture for extension testing (`extensionFixture.ts`).

- [ ] `[QA] [PI-1]` **Page Object Models (POM) Initialization**
  - Create `PopupPage.ts` POM for interacting with extension dropdown.
  - Create `TargetPage.ts` POM for loading test web pages.

- [ ] `[QA] [PI-1]` **Mock Tracking Test Harness Setup**
  - Build standard HTML test pages containing known tracking scripts (Analytics, Ads, Social widgets).

- [ ] `[QA] [PI-1]` **Automated Interception Test Suite**
  - *Test:* Verify extension badge increments matching actual blocked tracker count.
  - *Test:* Verify intercepted request details match records stored in IndexedDB.

**Acceptance Criteria (Definition of Done):** Navigating to a mock test page correctly intercepts tracking requests, stores event records in IndexedDB, and updates the popup counter UI without page errors.

---

## 📊 PI 2: Analytics Dashboard & Real-Time Sync

> **Goal:** Transform stored tracker data into an interactive React dashboard featuring live data synchronization and granular filtering.

### 🛠️ Front-end Tasks

- [ ] `[FE] [PI-2]` **Dashboard Layout & Shell Architecture**
  - Build `dashboard.html` single-page React app layout (Sidebar, Header, Metric Cards, Main Workspace).

- [ ] `[FE] [PI-2]` **Data Visualizations Component (Recharts/D3)**
  - Implement **Pie Chart:** Tracker breakdown by category (Analytics, Ads, Social, Telemetry).
  - Implement **Bar Chart:** Top 5 host domains with most tracker attempts.

- [ ] `[FE] [PI-2]` **Granular Tracker Data Table**
  - Build responsive table with column sorting (Timestamp, Domain, Category, Action).
  - Implement client-side search input and pagination controls.

- [ ] `[FE] [PI-2]` **Background-to-Dashboard Messaging Engine**
  - Set up `chrome.runtime.onMessage` listener in React dashboard.
  - Broadcast background worker events to auto-update charts when new trackers are caught in real-time.

### 🧪 QA Tasks

- [ ] `[QA] [PI-2]` **Dashboard Data Grid E2E Test Suite**
  - *Test:* Verify table search correctly filters records by domain and category.
  - *Test:* Verify table sorting by timestamp and category order.

- [ ] `[QA] [PI-2]` **Real-time Event Broadcast Tests**
  - *Test:* Keep dashboard tab open, navigate secondary tab to test site, assert dashboard metrics increment automatically without page refresh.

- [ ] `[QA] [PI-2]` **Database Purge & Reset Validation**
  - *Test:* Click "Clear Tracking History" in UI; assert IndexedDB tables are cleared and charts reset to empty state.

**Acceptance Criteria (Definition of Done):** Dashboard displays visual chart breakdowns, table filters function accurately on large datasets, and background events trigger real-time chart updates.

---

## 🔒 PI 3: Threat Intelligence & Privacy Controls

> **Goal:** Introduce external threat scores, custom whitelist controls, and audit log exports.

### 🛠️ Front-end Tasks

- [ ] `[FE] [PI-3]` **Whitelisting & Exception Management**
  - Build UI toggle in popup/dashboard: "Pause tracking defense for this site".
  - Store domain whitelist in `chrome.storage.local`.
  - Modify background service worker to bypass rule enforcement on whitelisted hosts.

- [ ] `[FE] [PI-3]` **Threat Reputation Lookup Component**
  - Fetch domain threat scores via third-party security API (e.g., AbuseIPDB / VirusTotal or mocked API endpoint).
  - Display threat badges (High / Medium / Low Risk) in tracker details modal.

- [ ] `[FE] [PI-3]` **Audit Log Exporter**
  - Implement "Export Security Audit Log" button generating downloadable `.csv` and `.json` files from IndexedDB history.

### 🧪 QA Tasks

- [ ] `[QA] [PI-3]` **Postman API Test Suite (Threat Intelligence)**
  - Create Postman collection validating threat API responses, schema integrity, and error states (Rate Limits, 403, 500).

- [ ] `[QA] [PI-3]` **Whitelisting E2E Test Suite**
  - *Test:* Enable whitelist on target domain; verify network requests pass unblocked and badge count stays at 0.

- [ ] `[QA] [PI-3]` **Data Export Verification Tests**
  - *Test:* Trigger CSV export in Playwright, parse downloaded file, and assert column structures and row counts match active IndexedDB state.

**Acceptance Criteria (Definition of Done):** Whitelisting effectively toggles protection per site, threat API responses map cleanly to UI badges, and CSV exports match database contents.

---

## ⚡ PI 4: Performance, Stress & Client-Side Load Testing

> **Goal:** Benchmark client-side resource impact, storage concurrency, and network overhead.

### 🛠️ Front-end Tasks

- [ ] `[FE] [PI-4]` **IndexedDB Query & Pagination Optimization**
  - Add database compound indexes in Dexie.js (`[hostDomain+timestamp]`) to speed up chart aggregation queries.
  - Implement virtualized table rendering (`react-window`) for data tables exceeding 5,000 rows.

- [ ] `[FE] [PI-4]` **Background Worker Memory Management**
  - Implement event throttling and batch database writes to minimize disk I/O under heavy traffic.

### 🧪 QA Tasks

- [ ] `[QA] [PI-4]` **Database Stress Testing (50,000 Records)**
  - Write seed script injecting 50k mock tracking events into Dexie.js.
  - Measure and assert React dashboard initial render latency remains under 250ms.

- [ ] `[QA] [PI-4]` **Network Flooding Test Script**
  - Create test page firing 1,000 rapid concurrent network requests.
  - Assert service worker processes traffic without dropping events or crashing browser tabs.

- [ ] `[QA] [PI-4]` **Memory Endurance Playwright Run**
  - Execute 1-hour automated Playwright loop visiting 100+ websites.
  - Extract Chrome DevTools Protocol (CDP) JS Heap metrics to verify zero memory leaks in Service Worker process.

**Acceptance Criteria (Definition of Done):** Dashboard renders smoothly with 50,000+ stored logs; high-volume request bursts execute without tab freezing or memory growth spikes.

---

## 🚀 PI 5: Hardening, CI/CD Pipeline & Portfolio Polish

> **Goal:** Automate CI checks, enforce strict security, and produce a high-caliber GitHub repository.

### 🛠️ Front-end Tasks

- [ ] `[FE] [PI-5]` **Accessibility (a11y) & Visual Polish**
  - Audit React dashboard for full keyboard navigation, screen reader ARIA labels, and WCAG AA color contrast.
  - Add dark mode toggle and sleek animations.

- [ ] `[FE] [PI-5]` **Extension Production Packaging**
  - Configure production build scripts (`npm run build:zip`) generating clean `.zip` web store package.
  - Review Manifest V3 Content Security Policy (CSP) compliance.

### 🧪 QA Tasks

- [ ] `[QA] [PI-5]` **GitHub Actions Automation Pipeline**
  - Create `.github/workflows/e2e-tests.yml`.
  - Configure pipeline to build extension, launch headless Chromium, and execute full Playwright E2E suite on every Pull Request.

- [ ] `[QA] [PI-5]` **Test Artifacts & Documentation**
  - Create `/docs` directory containing:
    - `TEST_STRATEGY.md` (Scope, Environment, Risk Matrix).
    - `TRACEABILITY_MATRIX.md` (Requirement vs Automated Test coverage).
    - `SAMPLE_BUG_REPORTS.md` (Real issue report examples).

### 🤝 Joint Team Deliverable

- [ ] `[FE + QA]` **GitHub Showcase README**
  - Add build passing badges and automated coverage status.
  - Embed high-quality GIF/video demo of the React dashboard in action.
  - Add **"Engineering Architecture"** section (FE design decisions & QA test strategy).
