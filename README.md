# 👻 Ghost Tracker

> **A Manifest V3 Chrome Extension that intercepts, categorizes, and visualizes web tracking scripts in real-time.**

[![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)]()
[![Chrome MV3](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?style=flat-square&logo=google-chrome&logoColor=white)]()
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)]()
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)]()
[![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?style=flat-square&logo=playwright&logoColor=white)]()

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development (with HMR)
npm run dev

# Build for production
npm run build

# Package as .zip for Chrome Web Store
npm run build:zip

# Run E2E tests
npm test
```

### Load in Chrome (Development)

1. Run `npm run dev`
2. Open `chrome://extensions/`
3. Enable **Developer mode**
4. Click **Load unpacked** → select the `dist/` folder
5. The Ghost Tracker icon appears in your toolbar

---

## 🏗️ Architecture

```
ghost-tracker/
├── src/
│   ├── manifest.config.ts        # Dynamic Manifest V3 definition
│   ├── background/index.ts       # Service Worker — request interception
│   ├── popup/                    # Extension popup UI (React)
│   ├── dashboard/                # Full analytics dashboard (React)
│   ├── db/index.ts               # Dexie.js IndexedDB schema
│   ├── utils/blocklist.ts        # Tracker domain categorization
│   ├── rules/                    # DeclarativeNetRequest static rules
│   └── index.css                 # Tailwind CSS entry
├── tests/
│   ├── fixtures/                 # Playwright extension fixture
│   ├── pages/                    # Page Object Models
│   ├── mocks/                    # Test pages with tracker scripts
│   └── popup.spec.ts             # E2E test suites
├── public/icons/                 # Extension icons
└── docs/                         # Test strategy & documentation
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Chrome Manifest V3 Service Worker |
| **UI Framework** | React 19 + TypeScript 5.8 |
| **Bundler** | Vite 6 + @crxjs/vite-plugin |
| **Styling** | Tailwind CSS 4 |
| **Database** | Dexie.js 4 (IndexedDB) |
| **Charts** | Recharts |
| **Testing** | Playwright (E2E) |
| **CI/CD** | GitHub Actions |

---

## 👥 Team

| Name | Role | Focus |
|------|------|-------|
| **Samuel Jędrzejewski** | Front-end Engineer | Extension architecture, React UI, data layer |
| **Maciej Miszewski** | QA Engineer | E2E testing, performance testing, CI/CD |

---

## 📋 Project Roadmap

- **PI-1:** Core Extension Architecture & Interception Engine (MVP)
- **PI-2:** Analytics Dashboard & Real-Time Sync
- **PI-3:** Threat Intelligence & Privacy Controls
- **PI-4:** Performance, Stress & Client-Side Load Testing
- **PI-5:** Hardening, CI/CD Pipeline & Portfolio Polish

---

## 📄 License

This project is developed as part of an academic portfolio. All rights reserved.
