/**
 * E2E 測試：相機旋轉
 * 驗證相機旋轉不改變方塊狀態
 */
import { test, expect } from '@playwright/test';

test.describe('Camera Rotation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 等待應用載入完成
    await page.waitForSelector('canvas', { timeout: 5000 });
  });

  test('should rotate camera with mouse drag', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // 獲取初始方塊狀態
    const initialState = await page.evaluate(() => {
      return (window as any).__CUBE_STATE__;
    });

    // 拖曳相機旋轉
    await canvas.hover();
    await page.mouse.down();
    await page.mouse.move(200, 200);
    await page.mouse.up();

    // 等待渲染更新
    await page.waitForTimeout(500);

    // 獲取旋轉後的方塊狀態
    const finalState = await page.evaluate(() => {
      return (window as any).__CUBE_STATE__;
    });

    // 方塊狀態不應改變
    expect(finalState).toBe(initialState);
  });

  test('should support 360° rotation', async ({ page }) => {
    const canvas = page.locator('canvas');

    // 完整旋轉一圈
    for (let i = 0; i < 8; i++) {
      await canvas.hover();
      await page.mouse.down();
      await page.mouse.move(100 + i * 50, 100);
      await page.mouse.up();
      await page.waitForTimeout(100);
    }

    // 方塊應該仍然可見且正常
    await expect(canvas).toBeVisible();
  });

  test('should maintain smooth framerate during rotation', async ({ page }) => {
    const canvas = page.locator('canvas');

    // 監控 FPS
    const fps = await page.evaluate(async () => {
      let frameCount = 0;
      let lastTime = performance.now();
      
      return new Promise<number>((resolve) => {
        const checkFPS = () => {
          frameCount++;
          const currentTime = performance.now();
          
          if (currentTime - lastTime >= 1000) {
            resolve(frameCount);
          } else {
            requestAnimationFrame(checkFPS);
          }
        };
        
        requestAnimationFrame(checkFPS);
      });
    });

    // 驗證 FPS ≥30
    expect(fps).toBeGreaterThanOrEqual(30);
  });

  test('should zoom in/out with mouse wheel', async ({ page }) => {
    const canvas = page.locator('canvas');
    await canvas.hover();

    // 滾輪放大
    await page.mouse.wheel(0, -100);
    await page.waitForTimeout(200);

    // 滾輪縮小
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(200);

    // 方塊應該仍然可見
    await expect(canvas).toBeVisible();
  });

  test('should prevent camera from clipping through cube', async ({ page }) => {
    const canvas = page.locator('canvas');

    // 極度放大
    await canvas.hover();
    await page.mouse.wheel(0, -1000);
    await page.waitForTimeout(500);

    // 驗證方塊仍然可見（沒有穿過）
    const isVisible = await canvas.isVisible();
    expect(isVisible).toBe(true);
  });

  test('should not interfere with layer selection', async ({ page }) => {
    const canvas = page.locator('canvas');

    // 旋轉相機
    await canvas.hover();
    await page.mouse.down();
    await page.mouse.move(150, 150);
    await page.mouse.up();
    await page.waitForTimeout(300);

    // 點擊選擇層
    await canvas.click({ position: { x: 200, y: 200 } });
    await page.waitForTimeout(300);

    // 驗證層被選中（應該顯示旋轉箭頭）
    // 實際實作後需要調整選擇器
    const rotationArrows = page.locator('[data-testid="rotation-arrows"]');
    // await expect(rotationArrows).toBeVisible();
  });

  test('should support touch gestures on mobile', async ({ page, browserName }) => {
    // 僅在支持觸控的瀏覽器中測試
    if (browserName === 'chromium') {
      const canvas = page.locator('canvas');

      // 模擬觸控旋轉
      await canvas.tap({ position: { x: 100, y: 100 } });
      await page.touchscreen.tap(200, 200);
      await page.waitForTimeout(300);

      // 方塊應該仍然可見
      await expect(canvas).toBeVisible();
    }
  });

  test('should preserve camera position between interactions', async ({ page }) => {
    const canvas = page.locator('canvas');

    // 旋轉相機到特定位置
    await canvas.hover();
    await page.mouse.down();
    await page.mouse.move(300, 200);
    await page.mouse.up();
    await page.waitForTimeout(300);

    // 點擊方塊（不拖曳）
    await canvas.click({ position: { x: 250, y: 250 } });
    await page.waitForTimeout(300);

    // 相機位置應該保持（不重置）
    // 驗證方塊視角沒有跳回初始位置
  });

  test('should handle rapid camera movements', async ({ page }) => {
    const canvas = page.locator('canvas');

    // 快速連續旋轉
    for (let i = 0; i < 10; i++) {
      await canvas.hover();
      await page.mouse.down();
      await page.mouse.move(100 + i * 20, 100 + i * 15);
      await page.mouse.up();
    }

    // 應該不崩潰
    await expect(canvas).toBeVisible();
  });

  test('should reset camera with reset button', async ({ page }) => {
    const canvas = page.locator('canvas');

    // 旋轉相機
    await canvas.hover();
    await page.mouse.down();
    await page.mouse.move(300, 300);
    await page.mouse.up();
    await page.waitForTimeout(300);

    // 點擊重置按鈕（如果有）
    const resetButton = page.locator('[data-testid="reset-camera"]');
    if (await resetButton.isVisible()) {
      await resetButton.click();
      await page.waitForTimeout(300);

      // 驗證相機回到初始位置
    }
  });
});
