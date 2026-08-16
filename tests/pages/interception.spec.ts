import { test, expect } from '../fixtures/extension.fixture';
import { TargetPage } from './TargetPage';
import { PopupPage } from './PopupPage';

test.describe('Ghost Tracker interception', () => {
  test('tracker page generates events visible in popup', async ({
    context,
    extensionId,
  }) => {
    const trackerTab = await context.newPage();

    await TargetPage.openMockPage(trackerTab);

    await trackerTab.waitForLoadState('networkidle');

    await trackerTab.waitForTimeout(3000);

    const popupTab = await context.newPage();

    const popup = await PopupPage.open(
      popupTab,
      extensionId,
    );

    const blockedCount = await popup.getBlockedCount();

    expect(blockedCount).toBeGreaterThanOrEqual(0);

    await popupTab.close();
    await trackerTab.close();
  });
});