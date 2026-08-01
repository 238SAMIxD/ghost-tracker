import type { Page } from '@playwright/test';

/**
 * Page Object Model for the Ghost Tracker extension popup.
 */
export class PopupPage {
  constructor(private readonly page: Page) {}

  static async open(page: Page, extensionId: string): Promise<PopupPage> {
    await page.goto(`chrome-extension://${extensionId}/src/popup/index.html`);
    await page.waitForSelector('#root');
    return new PopupPage(page);
  }

  /** Get the displayed current domain text */
  async getCurrentDomain(): Promise<string> {
    const el = this.page.locator('text=Current Site').locator('..');
    const domainEl = el.locator('p').last();
    return (await domainEl.textContent()) ?? '';
  }

  /** Get the blocked tracker count */
  async getBlockedCount(): Promise<number> {
    const el = this.page.locator('text=Trackers Blocked').locator('..');
    const countEl = el.locator('p').last();
    const text = (await countEl.textContent()) ?? '0';
    return parseInt(text, 10);
  }

  /** Click the Open Full Dashboard button */
  async openDashboard(): Promise<void> {
    await this.page.click('button:has-text("Open Full Dashboard")');
  }

  /** Get the page title text */
  async getTitle(): Promise<string> {
    const h1 = this.page.locator('h1');
    return (await h1.textContent()) ?? '';
  }
}
