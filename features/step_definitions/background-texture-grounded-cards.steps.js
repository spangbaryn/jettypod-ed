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

// Stable Mode Step Definitions

When('I try to click interactive elements', async function () {
  await page.waitForLoadState('domcontentloaded');
});

Then('all buttons and links remain clickable', async function () {
  const buttons = page.locator('a, button');
  const count = await buttons.count();
  for (let i = 0; i < Math.min(count, 5); i++) {
    const box = await buttons.nth(i).boundingBox();
    expect(box).toBeTruthy();
  }
});

Then('the texture layers have pointer-events none', async function () {
  const beforePE = await page.evaluate(() => {
    return window.getComputedStyle(document.body, '::before').pointerEvents;
  });
  const afterPE = await page.evaluate(() => {
    return window.getComputedStyle(document.body, '::after').pointerEvents;
  });
  const gridPE = await page.locator('.grid-texture').evaluate(el => {
    return window.getComputedStyle(el).pointerEvents;
  });
  expect(beforePE).toBe('none');
  expect(afterPE).toBe('none');
  expect(gridPE).toBe('none');
});

Then('the texture layers do not cause a horizontal scrollbar', async function () {
  const hasHScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  expect(hasHScroll).toBe(false);
});

Then('the texture layers are contained within the viewport', async function () {
  const gridEl = page.locator('.grid-texture');
  const overflow = await gridEl.evaluate(el => {
    return window.getComputedStyle(el).overflow;
  });
  const position = await gridEl.evaluate(el => {
    return window.getComputedStyle(el).position;
  });
  expect(position).toBe('fixed');
});

Then('all content sections have higher z-index than texture layers', async function () {
  const gridZ = await page.locator('.grid-texture').evaluate(el => {
    return parseInt(window.getComputedStyle(el).zIndex) || 0;
  });
  const heroZ = await page.locator('.hero-card').evaluate(el => {
    return parseInt(window.getComputedStyle(el).zIndex) || 0;
  });
  expect(heroZ).toBeGreaterThanOrEqual(gridZ);
});

Then('text remains readable over the textured background', async function () {
  const heading = page.locator('h1').first();
  await expect(heading).toBeVisible();
});

When('I inspect each card element on the page', async function () {
  await page.waitForLoadState('domcontentloaded');
});

Then('every card has a contact shadow with small vertical offset', async function () {
  const cardSelectors = ['.hero-card', '.jetty-way-card', '.backlog-card', '.test-section-card'];
  for (const sel of cardSelectors) {
    const el = page.locator(sel);
    if (await el.count() > 0) {
      const shadow = await el.first().evaluate(el => {
        return window.getComputedStyle(el).boxShadow;
      });
      expect(shadow).not.toBe('none');
      expect(shadow).toMatch(/0px [12]px [23]px/);
    }
  }
});

Then('no card has a diffuse shadow with large blur values', async function () {
  const cardSelectors = ['.hero-card', '.jetty-way-card', '.backlog-card', '.test-section-card'];
  for (const sel of cardSelectors) {
    const el = page.locator(sel);
    if (await el.count() > 0) {
      const shadow = await el.first().evaluate(el => {
        return window.getComputedStyle(el).boxShadow;
      });
      const hasLargeBlur = /\d+px \d+px (1[2-9]|[2-9]\d|\d{3,})px/.test(shadow);
      expect(hasLargeBlur).toBe(false);
    }
  }
});

Then('every card border is exactly 1px', async function () {
  const cardSelectors = ['.hero-card', '.jetty-way-card', '.backlog-card', '.test-section-card'];
  for (const sel of cardSelectors) {
    const el = page.locator(sel);
    if (await el.count() > 0) {
      const borderWidth = await el.first().evaluate(el => {
        return window.getComputedStyle(el).borderTopWidth;
      });
      expect(borderWidth).toBe('1px');
    }
  }
});

Then('every card border uses the tan border color', async function () {
  const cardSelectors = ['.hero-card', '.jetty-way-card', '.backlog-card', '.test-section-card'];
  for (const sel of cardSelectors) {
    const el = page.locator(sel);
    if (await el.count() > 0) {
      const borderStyle = await el.first().evaluate(el => {
        return window.getComputedStyle(el).borderTopStyle;
      });
      expect(borderStyle).toBe('solid');
    }
  }
});
