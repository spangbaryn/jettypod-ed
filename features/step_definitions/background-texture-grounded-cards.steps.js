const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

let page;

Given('I am on the home page', async function () {
  page = this.page;
  await page.goto('/');
});

When('the page loads', async function () {
  await page.waitForLoadState('domcontentloaded');
});

When('I look at any card element', async function () {
  // Cards are visible on page load, no action needed
  await page.waitForLoadState('domcontentloaded');
});

Then('the body has a warm gradient overlay', async function () {
  const beforeStyles = await page.evaluate(() => {
    return window.getComputedStyle(document.body, '::before').backgroundImage;
  });
  expect(beforeStyles).toContain('gradient');
});

Then('the body has a noise grain texture', async function () {
  const afterStyles = await page.evaluate(() => {
    return window.getComputedStyle(document.body, '::after').backgroundImage;
  });
  expect(afterStyles).toContain('url(');
});

Then('the body has a faint grid pattern', async function () {
  const gridEl = page.locator('.grid-texture');
  await expect(gridEl).toBeAttached();
  const bgImage = await gridEl.evaluate(el => {
    return window.getComputedStyle(el).backgroundImage;
  });
  expect(bgImage).toContain('linear-gradient');
});

Then('the card has a 1px tan border', async function () {
  const card = page.locator('.hero-card');
  const border = await card.evaluate(el => {
    const style = window.getComputedStyle(el);
    return {
      width: style.borderTopWidth,
      style: style.borderTopStyle
    };
  });
  expect(border.width).toBe('1px');
  expect(border.style).toBe('solid');
});

Then('the card has a tight contact shadow at its base', async function () {
  const card = page.locator('.hero-card');
  const shadow = await card.evaluate(el => {
    return window.getComputedStyle(el).boxShadow;
  });
  // Contact shadow has small vertical offset (1-2px) and small blur (2-3px)
  expect(shadow).not.toBe('none');
  // Verify it's not a large diffuse shadow by checking the shadow string
  // Contact shadow pattern: 0px 1px 2px ...
  expect(shadow).toMatch(/0px [12]px [23]px/);
});

Then('the card does not have a diffuse float shadow', async function () {
  const card = page.locator('.hero-card');
  const shadow = await card.evaluate(el => {
    return window.getComputedStyle(el).boxShadow;
  });
  // Diffuse float shadows have large blur values (12px+) and large offsets (4px+)
  // Ensure no shadow component has blur >= 12px
  const hasLargeBlur = /\d+px \d+px (1[2-9]|[2-9]\d|\d{3,})px/.test(shadow);
  expect(hasLargeBlur).toBe(false);
});
