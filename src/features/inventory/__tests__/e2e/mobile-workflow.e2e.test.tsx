import { test, expect, devices } from '@playwright/test';
import { createTestUser, setupTestInventory } from '@/tests/helpers';

// Use mobile viewport
test.use({ ...devices['iPhone 13'] });

test.describe('Mobile Inventory Workflows', () => {
  let testUserId: string;
  let testData: any;

  test.beforeAll(async () => {
    const { userId } = await createTestUser({
      email: 'mobile-test@example.com',
      role: 'warehouse_operator'
    });
    testUserId = userId;
    testData = await setupTestInventory(userId);
  });

  test('Mobile barcode scanning workflow', async ({ page }) => {
    // Navigate to mobile scanner
    await page.goto('/inventory/mobile/scan');
    
    // Grant camera permissions (mocked in test environment)
    await page.evaluate(() => {
      // @ts-ignore
      navigator.permissions.query = () => Promise.resolve({ state: 'granted' });
    });
    
    // Start scanning
    await page.click('button:has-text("Start Scanning")');
    
    // Wait for camera to initialize
    await expect(page.locator('video')).toBeVisible({ timeout: 5000 });
    
    // Simulate barcode scan
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('barcode-scanned', {
        detail: {
          type: 'barcode',
          format: 'code128',
          value: '1234567890123'
        }
      }));
    });
    
    // Verify product lookup
    await expect(page.locator('[data-testid="scanned-product"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-name"]')).toContainText('Wireless Mouse');
    await expect(page.locator('[data-testid="product-sku"]')).toContainText('WM-001');
    
    // Add to session
    await page.fill('input[name="quantity"]', '5');
    await page.click('button:has-text("Add Item")');
    
    // Verify item added
    await expect(page.locator('[data-testid="session-items"]')).toContainText('Wireless Mouse');
    await expect(page.locator('[data-testid="session-items"]')).toContainText('Qty: 5');
    
    // Continue scanning
    await page.click('button:has-text("Scan Next")');
    
    // Simulate another scan
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('barcode-scanned', {
        detail: {
          type: 'qrcode',
          format: 'qr_code',
          value: 'LOT-2024-001'
        }
      }));
    });
    
    // Verify lot number detected
    await expect(page.locator('[data-testid="lot-number"]')).toContainText('LOT-2024-001');
  });

  test('Mobile stock receiving workflow', async ({ page }) => {
    await page.goto('/inventory/mobile/receiving');
    
    // Select purchase order
    await page.click('[data-testid="po-select"]');
    await page.click(`[data-testid="po-${testData.purchaseOrderId}"]`);
    
    // Verify PO details loaded
    await expect(page.locator('[data-testid="po-number"]')).toContainText('PO-2024-001');
    await expect(page.locator('[data-testid="po-items-count"]')).toContainText('3 items');
    
    // Start receiving
    await page.click('button:has-text("Start Receiving")');
    
    // Scan first item
    await page.click('button:has-text("Scan Item")');
    
    // Simulate scan
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('barcode-scanned', {
        detail: { value: 'SKU-001' }
      }));
    });
    
    // Verify item matched
    await expect(page.locator('[data-testid="matched-item"]')).toContainText('Laptop Pro 15"');
    await expect(page.locator('[data-testid="expected-qty"]')).toContainText('10');
    
    // Enter received quantity
    await page.fill('input[name="receivedQty"]', '10');
    
    // Select location
    await page.click('[data-testid="location-select"]');
    await page.fill('input[placeholder="Scan or enter location"]', 'A-01-01');
    await page.click('[data-testid="location-A-01-01"]');
    
    // Add notes
    await page.fill('textarea[name="notes"]', 'All items in good condition');
    
    // Confirm item
    await page.click('button:has-text("Confirm Item")');
    
    // Verify progress
    await expect(page.locator('[data-testid="receiving-progress"]')).toContainText('1 / 3');
    await expect(page.locator('[data-testid="progress-bar"]')).toHaveAttribute('aria-valuenow', '33');
    
    // Complete remaining items (simplified for test)
    await page.click('button:has-text("Quick Receive All")');
    
    // Confirm completion
    await page.click('button:has-text("Complete Receiving")');
    
    // Verify summary
    await expect(page.locator('[data-testid="receiving-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-received"]')).toContainText('30 items');
    await expect(page.locator('[data-testid="receiving-status"]')).toContainText('Completed');
  });

  test('Mobile picking workflow', async ({ page }) => {
    await page.goto('/inventory/mobile/picking');
    
    // View available tasks
    await expect(page.locator('[data-testid="picking-tasks"]')).toBeVisible();
    
    // Select a picking task
    await page.click(`[data-testid="task-${testData.pickingTaskId}"]`);
    
    // Verify task details
    await expect(page.locator('[data-testid="order-number"]')).toContainText('ORD-2024-001');
    await expect(page.locator('[data-testid="priority"]')).toContainText('High');
    await expect(page.locator('[data-testid="items-count"]')).toContainText('5 items');
    
    // Start picking
    await page.click('button:has-text("Start Picking")');
    
    // Verify route optimization
    await expect(page.locator('[data-testid="optimized-route"]')).toBeVisible();
    await expect(page.locator('[data-testid="next-location"]')).toContainText('A-01-02');
    
    // Navigate to location
    await page.click('button:has-text("I\'m at location")');
    
    // Verify item to pick
    await expect(page.locator('[data-testid="pick-item"]')).toContainText('Wireless Mouse');
    await expect(page.locator('[data-testid="pick-quantity"]')).toContainText('Pick 2');
    
    // Scan item
    await page.click('button:has-text("Scan to Confirm")');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('barcode-scanned', {
        detail: { value: 'WM-001' }
      }));
    });
    
    // Confirm pick
    await page.fill('input[name="pickedQty"]', '2');
    await page.click('button:has-text("Confirm Pick")');
    
    // Verify progress
    await expect(page.locator('[data-testid="picking-progress"]')).toContainText('1 / 5');
    
    // Navigate to next location
    await expect(page.locator('[data-testid="next-location"]')).toContainText('A-02-05');
    await page.click('button:has-text("Next Location")');
    
    // Skip an item (out of stock scenario)
    await page.click('button:has-text("Skip Item")');
    await page.fill('textarea[name="skipReason"]', 'Out of stock at location');
    await page.click('button:has-text("Confirm Skip")');
    
    // Fast-forward to completion
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('complete-all-picks'));
    });
    
    // Review picked items
    await expect(page.locator('[data-testid="picking-review"]')).toBeVisible();
    await expect(page.locator('[data-testid="picked-count"]')).toContainText('4 / 5');
    await expect(page.locator('[data-testid="skipped-count"]')).toContainText('1 skipped');
    
    // Complete picking
    await page.click('button:has-text("Complete Picking")');
    
    // Verify completion
    await expect(page.locator('[data-testid="task-completed"]')).toBeVisible();
    await expect(page.locator('[data-testid="completion-time"]')).toBeVisible();
  });

  test('Mobile stock count workflow', async ({ page }) => {
    await page.goto('/inventory/mobile/count');
    
    // Select count session
    await page.click('[data-testid="count-session-select"]');
    await page.click(`[data-testid="session-${testData.countSessionId}"]`);
    
    // Verify session details
    await expect(page.locator('[data-testid="count-type"]')).toContainText('Cycle Count');
    await expect(page.locator('[data-testid="assigned-zones"]')).toContainText('Zone A, Zone B');
    
    // Start counting
    await page.click('button:has-text("Start Counting")');
    
    // First location
    await expect(page.locator('[data-testid="current-location"]')).toContainText('A-01-01');
    await expect(page.locator('[data-testid="expected-items"]')).toContainText('2 items expected');
    
    // Scan location barcode
    await page.click('button:has-text("Scan Location")');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('barcode-scanned', {
        detail: { value: 'LOC-A-01-01' }
      }));
    });
    
    // Count first item
    await page.click('[data-testid="item-1"]');
    await page.fill('input[name="countedQty"]', '48');
    await page.click('button:has-text("Next Item")');
    
    // Count second item with discrepancy
    await page.click('[data-testid="item-2"]');
    await page.fill('input[name="countedQty"]', '23'); // Expected: 25
    
    // Verify discrepancy warning
    await expect(page.locator('[data-testid="discrepancy-alert"]')).toBeVisible();
    await expect(page.locator('[data-testid="discrepancy-alert"]')).toContainText('-2 variance');
    
    // Add note for discrepancy
    await page.fill('textarea[name="discrepancyNote"]', 'Damaged items removed');
    await page.click('button:has-text("Confirm Count")');
    
    // Move to next location
    await page.click('button:has-text("Next Location")');
    
    // Blind count mode
    await page.click('button:has-text("Enable Blind Count")');
    await expect(page.locator('[data-testid="expected-qty"]')).not.toBeVisible();
    
    // Complete count session
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('complete-all-counts'));
    });
    
    // Review discrepancies
    await page.click('button:has-text("Review Discrepancies")');
    await expect(page.locator('[data-testid="discrepancy-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-discrepancies"]')).toContainText('3 discrepancies');
    
    // Submit count
    await page.click('button:has-text("Submit Count")');
    
    // Verify completion
    await expect(page.locator('[data-testid="count-completed"]')).toBeVisible();
    await expect(page.locator('[data-testid="accuracy-rate"]')).toContainText('94%');
  });

  test('Mobile offline mode', async ({ page, context }) => {
    await page.goto('/inventory/mobile/scan');
    
    // Start a scanning session
    await page.click('button:has-text("Start Scanning")');
    
    // Scan some items
    for (let i = 0; i < 3; i++) {
      await page.evaluate((sku) => {
        window.dispatchEvent(new CustomEvent('barcode-scanned', {
          detail: { value: sku }
        }));
      }, `SKU-00${i + 1}`);
      
      await page.fill('input[name="quantity"]', '10');
      await page.click('button:has-text("Add Item")');
    }
    
    // Go offline
    await context.setOffline(true);
    
    // Verify offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="offline-indicator"]')).toContainText('Offline Mode');
    
    // Continue scanning offline
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('barcode-scanned', {
        detail: { value: 'SKU-004' }
      }));
    });
    
    await page.fill('input[name="quantity"]', '5');
    await page.click('button:has-text("Add Item")');
    
    // Verify item queued
    await expect(page.locator('[data-testid="offline-queue"]')).toContainText('1 item pending sync');
    
    // Go back online
    await context.setOffline(false);
    
    // Verify sync starts
    await expect(page.locator('[data-testid="syncing-indicator"]')).toBeVisible({ timeout: 5000 });
    
    // Verify sync completes
    await expect(page.locator('[data-testid="sync-complete"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="offline-queue"]')).not.toBeVisible();
  });

  test('Mobile performance and responsiveness', async ({ page }) => {
    await page.goto('/inventory/mobile/products');
    
    // Test infinite scroll performance
    const scrollStart = Date.now();
    
    // Scroll to load more items
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(100);
    }
    
    const scrollTime = Date.now() - scrollStart;
    expect(scrollTime).toBeLessThan(2000); // Should handle scrolling smoothly
    
    // Test search responsiveness
    const searchStart = Date.now();
    await page.fill('input[placeholder="Search products..."]', 'Laptop');
    await page.waitForSelector('[data-testid="search-results"]');
    const searchTime = Date.now() - searchStart;
    
    expect(searchTime).toBeLessThan(300); // Search should be instant
    
    // Test touch gestures
    const productCard = page.locator('[data-testid="product-card"]').first();
    
    // Swipe to reveal actions
    await productCard.dispatchEvent('touchstart', { touches: [{ clientX: 300, clientY: 100 }] });
    await productCard.dispatchEvent('touchmove', { touches: [{ clientX: 100, clientY: 100 }] });
    await productCard.dispatchEvent('touchend');
    
    // Verify swipe actions visible
    await expect(page.locator('[data-testid="swipe-actions"]')).toBeVisible();
    
    // Test orientation change
    await page.setViewportSize({ width: 844, height: 390 }); // Landscape
    await expect(page.locator('[data-testid="landscape-layout"]')).toBeVisible();
    
    await page.setViewportSize({ width: 390, height: 844 }); // Portrait
    await expect(page.locator('[data-testid="portrait-layout"]')).toBeVisible();
  });
});