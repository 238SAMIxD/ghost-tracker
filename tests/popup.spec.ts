import { test, expect } from './fixtures/extension.fixture';
import { PopupPage } from './pages/PopupPage';

test.describe('Ghost Tracker Popup', () => {
  test('popup renders with title and blocked count', async ({ page, extensionId }) => {
    const popup = await PopupPage.open(page, extensionId);

    const title = await popup.getTitle();
    expect(title).toBe('Ghost Tracker');

    const count = await popup.getBlockedCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('popup displays current domain', async ({ page, extensionId }) => {
    const popup = await PopupPage.open(page, extensionId);
    const domain = await popup.getCurrentDomain();
    // When opened directly, domain might be empty or extension URL
    expect(domain).toBeTruthy();
  });
});
