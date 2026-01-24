import { test, expect } from '@playwright/test';

test.describe('Design Kit Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/design-kit/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('page loads successfully', async ({ page }) => {
    await page.goto('/design-kit/');
    await expect(page).toHaveTitle(/Design Kit/);
    await expect(page.locator('.style-guide')).toBeVisible();
  });

  test('theme selector is visible and has all themes', async ({ page }) => {
    await page.goto('/design-kit/');
    const themeSelect = page.locator('#theme-select');
    await expect(themeSelect).toBeVisible();

    const options = await themeSelect.locator('option').allTextContents();
    expect(options).toContain('Synthwave Cyberpunk');
    expect(options).toContain('Renaissance Man');
    expect(options).toContain('80s Hacker Man');
    expect(options).toContain('Commodore 64');
    expect(options.length).toBe(16);
  });

  test('switching themes updates title and subtitle', async ({ page }) => {
    await page.goto('/design-kit/');

    // Check default theme
    await expect(page.locator('#theme-title')).toHaveText('SYNTHWAVE');
    await expect(page.locator('#theme-subtitle')).toHaveText('Cyberpunk Design Kit');

    // Switch to Renaissance theme
    await page.selectOption('#theme-select', 'renaissance');
    await expect(page.locator('#theme-title')).toHaveText('RENAISSANCE');
    await expect(page.locator('#theme-subtitle')).toHaveText('Refined Minimalism');

    // Switch to Hacker theme
    await page.selectOption('#theme-select', 'hacker');
    await expect(page.locator('#theme-title')).toHaveText('HACKERMAN');
    await expect(page.locator('#theme-subtitle')).toHaveText('Shall We Play A Game?');
  });

  test('theme changes CSS stylesheet', async ({ page }) => {
    await page.goto('/design-kit/');

    // Check default stylesheet
    const stylesheet = page.locator('#theme-stylesheet');
    await expect(stylesheet).toHaveAttribute('href', 'styles/themes/synthwave.css');

    // Switch theme and verify stylesheet changes
    await page.selectOption('#theme-select', 'tron');
    await expect(stylesheet).toHaveAttribute('href', 'styles/themes/tron.css');
  });

  test('localStorage persists theme preference', async ({ page }) => {
    await page.goto('/design-kit/');

    // Select a theme
    await page.selectOption('#theme-select', 'jurassicpark');

    // Verify localStorage was updated
    const savedTheme = await page.evaluate(() => localStorage.getItem('preferred-theme'));
    expect(savedTheme).toBe('jurassicpark');

    // Reload and verify theme persists
    await page.reload();
    await expect(page.locator('#theme-select')).toHaveValue('jurassicpark');
    await expect(page.locator('#theme-title')).toHaveText('JURASSIC PARK');
  });

  test('CRT toggle works', async ({ page }) => {
    await page.goto('/design-kit/');

    const crtToggle = page.locator('#crt-toggle');
    await expect(crtToggle).toBeVisible();
    await expect(crtToggle).toBeChecked();

    // Uncheck CRT toggle
    await crtToggle.uncheck();
    await expect(crtToggle).not.toBeChecked();

    // Verify class is added to html element
    await expect(page.locator('html')).toHaveClass(/crt-disabled/);

    // Check it again
    await crtToggle.check();
    await expect(page.locator('html')).not.toHaveClass(/crt-disabled/);
  });

  test('CRT preference persists in localStorage', async ({ page }) => {
    await page.goto('/design-kit/');

    // Uncheck CRT toggle
    await page.locator('#crt-toggle').uncheck();

    // Verify localStorage
    const savedCRT = await page.evaluate(() => localStorage.getItem('crt-enabled'));
    expect(savedCRT).toBe('false');

    // Reload and verify persists
    await page.reload();
    await expect(page.locator('#crt-toggle')).not.toBeChecked();
  });

  test('all button variants render', async ({ page }) => {
    await page.goto('/design-kit/');

    await expect(page.locator('button.btn-primary').first()).toBeVisible();
    await expect(page.locator('button.btn-secondary').first()).toBeVisible();
    await expect(page.locator('button.btn-ghost').first()).toBeVisible();
  });

  test('all card variants render', async ({ page }) => {
    await page.goto('/design-kit/');

    const cards = page.locator('.card');
    await expect(cards).toHaveCount(3);
    await expect(page.locator('.card-glow')).toBeVisible();
  });

  test('all badge colors render', async ({ page }) => {
    await page.goto('/design-kit/');

    await expect(page.locator('.badge-pink').first()).toBeVisible();
    await expect(page.locator('.badge-cyan').first()).toBeVisible();
    await expect(page.locator('.badge-purple').first()).toBeVisible();
  });

  test('form inputs render', async ({ page }) => {
    await page.goto('/design-kit/');

    await expect(page.locator('input[type="text"].input')).toBeVisible();
    await expect(page.locator('input[type="email"].input')).toBeVisible();
    await expect(page.locator('input[type="search"].input')).toBeVisible();
  });

  test('color swatches render', async ({ page }) => {
    await page.goto('/design-kit/');

    const swatches = page.locator('.color-swatch');
    const count = await swatches.count();
    expect(count).toBeGreaterThanOrEqual(10);
  });

  test('gradient sections render', async ({ page }) => {
    await page.goto('/design-kit/');

    await expect(page.getByText('--gradient-sunset')).toBeVisible();
    await expect(page.getByText('--gradient-ocean')).toBeVisible();
    await expect(page.getByText('--gradient-horizon')).toBeVisible();
    await expect(page.getByText('--gradient-chrome')).toBeVisible();
  });

  test('hero section renders', async ({ page }) => {
    await page.goto('/design-kit/');

    await expect(page.locator('.hero-container')).toBeVisible();
    await expect(page.getByText('TOMAS QUINONES')).toBeVisible();
    await expect(page.getByRole('link', { name: 'View Projects' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get In Touch' })).toBeVisible();
  });

  test('theme-specific taglines toggle correctly', async ({ page }) => {
    await page.goto('/design-kit/');

    // Synthwave tagline should be visible
    await expect(page.locator('.tagline-synthwave').first()).toBeVisible();
    await expect(page.locator('.tagline-tron').first()).toBeHidden();

    // Switch to Tron
    await page.selectOption('#theme-select', 'tron');
    await expect(page.locator('.tagline-tron').first()).toBeVisible();
    await expect(page.locator('.tagline-synthwave').first()).toBeHidden();
  });
});
