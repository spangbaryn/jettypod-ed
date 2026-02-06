const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Stable mode step definitions for edge cases and error handling

When('I click the {string} tab again', async function (tabTitle) {
  const tab = this.page.locator('.slide-tab', { hasText: tabTitle });
  await tab.click();
});

Then('no animation occurs', async function () {
  // When clicking active tab, no exiting class should be added
  const exitingPanel = this.page.locator('.slide-tab-panel.exiting');
  await expect(exitingPanel).toHaveCount(0);
});

Then('the content remains unchanged', async function () {
  // The same panel should still be active
  const activePanel = this.page.locator('.slide-tab-panel.active');
  await expect(activePanel).toHaveCount(1);
});

When('I rapidly click between different tabs', async function () {
  const tabs = this.page.locator('.slide-tab');

  // Click tabs rapidly without waiting for animation
  for (let i = 0; i < 5; i++) {
    await tabs.nth(i % 3).click();
    await this.page.waitForTimeout(50); // Very short delay
  }
});

Then('only one tab is active at any time', async function () {
  const activeTabs = this.page.locator('.slide-tab.active');
  await expect(activeTabs).toHaveCount(1);
});

Then('only one content panel is visible at any time', async function () {
  // After animations settle, only one panel should be active
  await this.page.waitForTimeout(500);
  const activePanels = this.page.locator('.slide-tab-panel.active');
  await expect(activePanels).toHaveCount(1);
});

Then('no overlapping animations occur', async function () {
  // After settling, no panels should be in exiting state
  await this.page.waitForTimeout(500);
  const exitingPanels = this.page.locator('.slide-tab-panel.exiting');
  await expect(exitingPanels).toHaveCount(0);
});

When('I use keyboard to navigate between tabs', async function () {
  const firstTab = this.page.locator('.slide-tab').first();
  await firstTab.focus();
});

Then('I can focus on each tab', async function () {
  const tabs = this.page.locator('.slide-tab');
  const count = await tabs.count();

  for (let i = 0; i < count; i++) {
    await tabs.nth(i).focus();
    await expect(tabs.nth(i)).toBeFocused();
  }
});

Then('pressing Enter activates the focused tab', async function () {
  const secondTab = this.page.locator('.slide-tab').nth(1);
  await secondTab.focus();
  await this.page.keyboard.press('Enter');

  // Check if tab became active
  await expect(secondTab).toHaveClass(/active/);
});
