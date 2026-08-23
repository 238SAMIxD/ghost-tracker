import { test as base, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Ghost Tracker — Playwright Extension Fixture
 *
 * Launches Chromium with the unpacked extension loaded
 * and extracts the extension ID from the service worker.
 */
export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({}, use) => {
    const pathToExtension = path.resolve(__dirname, '../../dist');
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        '--allow-file-access-from-files',
      ],
    });
    // Playwright's fixture callback is intentionally named `use`.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent('serviceworker');
    }
    await background.evaluate(() => undefined);
    const extensionId = background.url().split('/')[2];
    // Playwright's fixture callback is intentionally named `use`.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(extensionId);
  },
});

export { expect } from '@playwright/test';
