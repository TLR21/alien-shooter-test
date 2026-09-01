# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: game.spec.js >> Alien Shooter Game >> should display FPS counter
- Location: tests\game.spec.js:30:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - generic:
      - generic:
        - generic: Score
        - generic: "0"
      - generic: Health
      - generic:
        - generic: Wave
        - generic: "1"
    - generic [ref=e5]:
      - heading "ALIEN SHOOTER" [level=1] [ref=e6]
      - paragraph [ref=e7]: Ultimate OpenCode Integration Test — Defend the galaxy from the alien invasion!
      - generic [ref=e8]:
        - generic [ref=e9]:
          - generic [ref=e10]: W A S D
          - text: /
          - generic [ref=e11]: Arrow Keys
          - text: Move
        - generic [ref=e12]:
          - generic [ref=e13]: Space
          - text: /
          - generic [ref=e14]: Click
          - text: Shoot
        - generic [ref=e15]:
          - generic [ref=e16]: P
          - text: Pause
      - button "Start Game" [ref=e17] [cursor=pointer]
  - generic [ref=e18]: "FPS: 241"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Alien Shooter Game', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('http://localhost:3000');
> 6  |     await page.waitForLoadState('networkidle');
     |                ^ Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
  7  |   });
  8  | 
  9  |   test('should load the game page', async ({ page }) => {
  10 |     await expect(page.locator('#game-canvas')).toBeVisible();
  11 |     await expect(page.locator('#start-btn')).toBeVisible();
  12 |     await expect(page.locator('.screen-title')).toContainText('ALIEN SHOOTER');
  13 |   });
  14 | 
  15 |   test('should start game when start button clicked', async ({ page }) => {
  16 |     await page.click('#start-btn');
  17 |     await expect(page.locator('#screen-overlay')).toHaveClass(/hidden/);
  18 |     await expect(page.locator('#score-display')).toContainText('0');
  19 |     await expect(page.locator('#wave-display')).toContainText('1');
  20 |   });
  21 | 
  22 |   test('should have health bar at 100% initially', async ({ page }) => {
  23 |     await page.click('#start-btn');
  24 |     const healthBar = page.locator('#health-bar');
  25 |     // Check style attribute for percentage or computed width matches container
  26 |     const styleWidth = await healthBar.getAttribute('style');
  27 |     expect(styleWidth).toContain('100%');
  28 |   });
  29 | 
  30 |   test('should display FPS counter', async ({ page }) => {
  31 |     await expect(page.locator('#fps-counter')).toBeVisible();
  32 |   });
  33 | 
  34 |   test('should respond to keyboard input', async ({ page }) => {
  35 |     await page.click('#start-btn');
  36 |     await page.keyboard.press('ArrowRight');
  37 |     await page.keyboard.press('ArrowLeft');
  38 |     await page.keyboard.press('Space');
  39 |     // Just verify no errors - the game should handle input
  40 |   });
  41 | 
  42 |   test('should pause with P key', async ({ page }) => {
  43 |     await page.click('#start-btn');
  44 |     await page.keyboard.press('KeyP');
  45 |     await expect(page.locator('#screen-overlay')).not.toHaveClass(/hidden/);
  46 |     await expect(page.locator('.screen-title')).toContainText('PAUSED');
  47 |   });
  48 | 
  49 |   test('game canvas should render at correct resolution', async ({ page }) => {
  50 |     const canvas = page.locator('#game-canvas');
  51 |     await expect(canvas).toHaveAttribute('width', '800');
  52 |     await expect(canvas).toHaveAttribute('height', '600');
  53 |   });
  54 | });
```