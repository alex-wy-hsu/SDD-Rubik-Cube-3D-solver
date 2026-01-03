/**
 * E2E test for scramble functionality
 * Tests: launch app → verify scramble displayed → check seed display → click re-scramble → verify new state
 */
import { test, expect } from '@playwright/test';

test.describe('Scramble Management', () => {
  test('should display scramble on app launch', async ({ page }) => {
    await page.goto('/');
    
    // Wait for app to load
    await page.waitForLoadState('networkidle');
    
    // Should display seed
    const seedDisplay = page.locator('[data-testid="seed-display"]');
    await expect(seedDisplay).toBeVisible();
    
    // Seed should be non-empty
    const seedText = await seedDisplay.textContent();
    expect(seedText).toBeTruthy();
    expect(seedText?.length).toBeGreaterThan(0);
  });

  test('should display scramble button', async ({ page }) => {
    await page.goto('/');
    
    const scrambleButton = page.locator('[data-testid="scramble-button"]');
    await expect(scrambleButton).toBeVisible();
    await expect(scrambleButton).toBeEnabled();
  });

  test('should generate new scramble when button clicked', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get initial seed
    const seedDisplay = page.locator('[data-testid="seed-display"]');
    const initialSeed = await seedDisplay.textContent();
    
    // Click scramble button
    const scrambleButton = page.locator('[data-testid="scramble-button"]');
    await scrambleButton.click();
    
    // Wait for new scramble
    await page.waitForTimeout(500);
    
    // Seed should change
    const newSeed = await seedDisplay.textContent();
    expect(newSeed).not.toBe(initialSeed);
  });

  test('should update cube visual when re-scrambled', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for 3D canvas to render
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Take snapshot of initial state
    const initialSnapshot = await page.screenshot();
    
    // Re-scramble
    const scrambleButton = page.locator('[data-testid="scramble-button"]');
    await scrambleButton.click();
    
    // Wait for animation/update
    await page.waitForTimeout(1000);
    
    // Take snapshot of new state
    const newSnapshot = await page.screenshot();
    
    // Snapshots should be different (cube state changed)
    expect(initialSnapshot).not.toEqual(newSnapshot);
  });

  test('should display seed in correct format', async ({ page }) => {
    await page.goto('/');
    
    const seedDisplay = page.locator('[data-testid="seed-display"]');
    const seedText = await seedDisplay.textContent();
    
    // Seed should be alphanumeric
    expect(seedText).toMatch(/^[a-zA-Z0-9_]+$/);
  });

  test('should maintain cube validity after scramble', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click scramble multiple times
    const scrambleButton = page.locator('[data-testid="scramble-button"]');
    
    for (let i = 0; i < 3; i++) {
      await scrambleButton.click();
      await page.waitForTimeout(500);
      
      // Check for error messages
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).not.toBeVisible();
    }
  });

  test('should show loading state during scramble generation', async ({ page }) => {
    await page.goto('/');
    
    const scrambleButton = page.locator('[data-testid="scramble-button"]');
    
    // Slow down network to observe loading state
    await page.route('**/api/scramble/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.continue();
    });
    
    await scrambleButton.click();
    
    // Should show loading indicator
    const loadingIndicator = page.locator('[data-testid="loading-indicator"]');
    await expect(loadingIndicator).toBeVisible({ timeout: 200 });
  });

  test('should disable button during scramble generation', async ({ page }) => {
    await page.goto('/');
    
    const scrambleButton = page.locator('[data-testid="scramble-button"]');
    
    // Slow down API
    await page.route('**/api/scramble/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await route.continue();
    });
    
    await scrambleButton.click();
    
    // Button should be disabled during operation
    await expect(scrambleButton).toBeDisabled({ timeout: 100 });
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Simulate API error
    await page.route('**/api/scramble/**', (route) =>
      route.abort('failed')
    );
    
    const scrambleButton = page.locator('[data-testid="scramble-button"]');
    await scrambleButton.click();
    
    // Should display error message
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible({ timeout: 2000 });
  });

  test('should preserve scramble across page interactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get seed
    const seedDisplay = page.locator('[data-testid="seed-display"]');
    const seed = await seedDisplay.textContent();
    
    // Interact with cube (e.g., rotate camera)
    const canvas = page.locator('canvas');
    await canvas.click();
    
    // Seed should remain the same
    const newSeed = await seedDisplay.textContent();
    expect(newSeed).toBe(seed);
  });
});
