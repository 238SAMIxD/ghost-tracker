import { defineManifest } from '@crxjs/vite-plugin';
import packageJson from '../package.json';

const { version, description } = packageJson;

export default defineManifest(async (env) => ({
  manifest_version: 3,
  name: env.mode === 'development' ? `[DEV] Ghost Tracker` : 'Ghost Tracker',
  description,
  version,
  permissions: [
    'storage',
    'activeTab',
    'declarativeNetRequest',
    'declarativeNetRequestWithHostAccess',
    'webRequest',
    'tabs',
  ],
  host_permissions: ['<all_urls>'],
  action: {
    default_popup: 'src/popup/index.html',
    default_icon: {
      '16': 'public/icons/icon16.png',
      '48': 'public/icons/icon48.png',
      '128': 'public/icons/icon128.png',
    },
  },
  icons: {
    '16': 'public/icons/icon16.png',
    '48': 'public/icons/icon48.png',
    '128': 'public/icons/icon128.png',
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module' as const,
  },
  declarative_net_request: {
    rule_resources: [
      {
        id: 'ghost_tracker_blocklist',
        enabled: true,
        path: 'src/rules/declarative_rules.json',
      },
    ],
  },
  web_accessible_resources: [
    {
      resources: ['src/dashboard/index.html'],
      matches: ['<all_urls>'],
    },
  ],
}));
