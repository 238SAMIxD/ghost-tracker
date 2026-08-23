import type { Page } from '@playwright/test';

export class TargetPage {
  constructor(private readonly page: Page) {}

  static async openMockPage(page: Page): Promise<TargetPage> {
    const mockPageUrl = new URL('../mocks/tracker-test-page.html', import.meta.url);

    await page.goto(mockPageUrl.href);

    return new TargetPage(page);
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }
}
