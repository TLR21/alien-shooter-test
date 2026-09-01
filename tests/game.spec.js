import { test, expect } from '@playwright/test';

test.describe('Alien Shooter Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('should load the game page', async ({ page }) => {
    await expect(page.locator('#game-canvas')).toBeVisible();
    await expect(page.locator('#start-btn')).toBeVisible();
    await expect(page.locator('.screen-title')).toContainText('ALIEN SHOOTER');
  });

  test('should start game when start button clicked', async ({ page }) => {
    await page.click('#start-btn');
    await expect(page.locator('#screen-overlay')).toHaveClass(/hidden/);
    await expect(page.locator('#score-display')).toContainText('0');
    await expect(page.locator('#wave-display')).toContainText('1');
  });

  test('should have health bar at 100% initially', async ({ page }) => {
    await page.click('#start-btn');
    const healthBar = page.locator('#health-bar');
    // Check style attribute for percentage or computed width matches container
    const styleWidth = await healthBar.getAttribute('style');
    expect(styleWidth).toContain('100%');
  });

  test('should display FPS counter', async ({ page }) => {
    await expect(page.locator('#fps-counter')).toBeVisible();
  });

  test('should respond to keyboard input', async ({ page }) => {
    await page.click('#start-btn');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Space');
    // Just verify no errors - the game should handle input
  });

  test('should pause with P key', async ({ page }) => {
    await page.click('#start-btn');
    await page.keyboard.press('KeyP');
    await expect(page.locator('#screen-overlay')).not.toHaveClass(/hidden/);
    await expect(page.locator('.screen-title')).toContainText('PAUSED');
  });

  test('game canvas should render at correct resolution', async ({ page }) => {
    const canvas = page.locator('#game-canvas');
    await expect(canvas).toHaveAttribute('width', '800');
    await expect(canvas).toHaveAttribute('height', '600');
  });
});