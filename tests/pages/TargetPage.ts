import type { Page } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TargetPage {
  constructor(private readonly page: Page) {}

  static async openMockPage(page: Page): Promise<TargetPage> {
    const mockPagePath = path.resolve(
      __dirname,
      '../mocks/tracker-test-page.html'
    );

    await page.goto(`file://${mockPagePath}`);

    return new TargetPage(page);
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }
}