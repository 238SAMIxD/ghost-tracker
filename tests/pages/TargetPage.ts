import type { Page } from '@playwright/test';
import path from 'path';

/**
 * Page Object Model for loading test web pages
 * containing known tracker scripts.
 */
export class TargetPage {
  constructor(private readonly page: Page) {}

  /** Navigate to the local mock tracker test page */
  static async openMockPage(page: Page): Promise<TargetPage> {
    const mockPagePath = path.resolve(__dirname, '../mocks/tracker-test-page.html');
    await page.goto(`file://${mockPagePath}`);
    return new TargetPage(page);
  }

  /** Navigate to a custom URL */
  static async openUrl(page: Page, url: string): Promise<TargetPage> {
    await page.goto(url);
    return new TargetPage(page);
  }

  /** Wait for the page to fully load */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /** Get the page title */
  async getTitle(): Promise<string> {
    return this.page.title();
  }
}
