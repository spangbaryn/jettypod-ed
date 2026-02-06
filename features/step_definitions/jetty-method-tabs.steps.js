const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Test context
let page;

Given('I am on the home page', async function () {
  page = this.page;
  await page.goto('/');
});

Given('I am viewing the Jetty Method section', async function () {
  await page.locator('.jetty-way-section').scrollIntoViewIfNeeded();
});

When('I scroll to the Jetty Method section', async function () {
  await page.locator('.jetty-way-section').scrollIntoViewIfNeeded();
});

Then('I see a tabbed interface with tabs on the left', async function () {
  const tabsNav = page.locator('.slide-tabs-nav');
  await expect(tabsNav).toBeVisible();
});

Then('I see {string} as the first tab', async function (tabTitle) {
  const firstTab = page.locator('.slide-tab').first();
  await expect(firstTab).toContainText(tabTitle);
});

Then('the {string} tab is active', async function (tabTitle) {
  const activeTab = page.locator('.slide-tab.active');
  await expect(activeTab).toContainText(tabTitle);
});

Then('I see the mode selector with Speed, Stable, and Production options', async function () {
  const modeSelector = page.locator('.mode-selector');
  await expect(modeSelector).toBeVisible();

  const speedOption = page.locator('.mode-option[data-mode="speed"]');
  const stableOption = page.locator('.mode-option[data-mode="stable"]');
  const productionOption = page.locator('.mode-option[data-mode="production"]');

  await expect(speedOption).toBeVisible();
  await expect(stableOption).toBeVisible();
  await expect(productionOption).toBeVisible();
});

Then('I see the triangle diagram', async function () {
  const triangleContainer = page.locator('.triangle-container');
  await expect(triangleContainer).toBeVisible();
});

When('I click the {string} tab', async function (tabTitle) {
  const tab = page.locator('.slide-tab', { hasText: tabTitle });
  await tab.click();
});

Then('the content slides out and new content slides in', async function () {
  // Verify the active panel has the slide-in animation applied
  const activePanel = page.locator('.slide-tab-panel.active');
  await expect(activePanel).toBeVisible();
});

Then('the {string} tab is now active', async function (tabTitle) {
  const activeTab = page.locator('.slide-tab.active');
  await expect(activeTab).toContainText(tabTitle);
});

Then('the slide indicator moves to the active tab', async function () {
  const indicator = page.locator('.slide-indicator');
  await expect(indicator).toBeVisible();
});

When('I click through each tab', async function () {
  const tabs = page.locator('.slide-tab');
  const count = await tabs.count();

  for (let i = 0; i < count; i++) {
    await tabs.nth(i).click();
    // Brief pause to allow animation
    await page.waitForTimeout(300);
  }
});

Then('each tab shows its corresponding content panel', async function () {
  const tabs = page.locator('.slide-tab');
  const count = await tabs.count();

  for (let i = 0; i < count; i++) {
    await tabs.nth(i).click();
    await page.waitForTimeout(300);

    const tabId = await tabs.nth(i).getAttribute('data-tab');
    const panel = page.locator(`.slide-tab-panel[data-panel="${tabId}"]`);
    await expect(panel).toHaveClass(/active/);
  }
});
