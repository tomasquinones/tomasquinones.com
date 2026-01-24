import { test, expect } from '@playwright/test';

const themes = [
  'synthwave',
  'renaissance',
  'hacker',
  'c64',
  'vector',
  'ascii',
  'atari2600',
  'nes',
  'mario',
  'hannabarbera',
  'tron',
  'woodsman',
  'jurassicpark',
  'ghostbusters',
  'sevensamurai',
  'godzilla',
];

test.describe('Design Kit Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure clean state
    await page.goto('/design-kit/');
    await page.evaluate(() => localStorage.clear());
  });

  test('default theme full page screenshot', async ({ page }) => {
    await page.goto('/design-kit/');
    // Wait for fonts to load
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('design-kit-default.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  for (const theme of themes) {
    test(`${theme} theme screenshot`, async ({ page }) => {
      await page.goto('/design-kit/');
      await page.selectOption('#theme-select', theme);
      // Wait for theme CSS to load and fonts
      await page.waitForLoadState('networkidle');
      // Small delay to ensure theme transition completes
      await page.waitForTimeout(100);
      await expect(page).toHaveScreenshot(`design-kit-${theme}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      });
    });
  }

  test('hero section screenshot', async ({ page }) => {
    await page.goto('/design-kit/');
    await page.waitForLoadState('networkidle');
    const hero = page.locator('.hero-container');
    await expect(hero).toHaveScreenshot('hero-section.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('buttons section screenshot', async ({ page }) => {
    await page.goto('/design-kit/');
    await page.waitForLoadState('networkidle');
    // Find the buttons section
    const buttonsSection = page.locator('section').filter({ hasText: 'Buttons' }).first();
    await expect(buttonsSection).toHaveScreenshot('buttons-section.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('cards section screenshot', async ({ page }) => {
    await page.goto('/design-kit/');
    await page.waitForLoadState('networkidle');
    // Find the cards section
    const cardsSection = page.locator('section').filter({ hasText: 'Cards' }).first();
    await expect(cardsSection).toHaveScreenshot('cards-section.png', {
      maxDiffPixelRatio: 0.01,
    });
  });
});
