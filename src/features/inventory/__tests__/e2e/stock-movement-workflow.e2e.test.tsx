import { test, expect } from '@playwright/test';
import { createTestUser, setupTestInventory } from '@/tests/helpers';

test.describe('Stock Movement Workflow', () => {
  let testUserId: string;
  let testData: any;

  test.beforeAll(async () => {
    // Create test user and setup inventory
    const { userId } = await createTestUser({
      email: 'stock-test@example.com',
      role: 'inventory_manager'
    });
    testUserId = userId;
    
    // Setup test inventory data
    testData = await setupTestInventory(userId);
  });

  test('Complete stock receiving workflow', async ({ page }) => {
    // Navigate to stock movements
    await page.goto('/inventory/stock-movements');
    
    // Click receive stock button
    await page.click('button:has-text("Receive Stock")');
    
    // Select product
    await page.click('[data-testid="product-select"]');
    await page.fill('input[placeholder="Search products..."]', 'Laptop');
    await page.click('text=Laptop Pro 15"');
    
    // Enter quantity
    await page.fill('input[name="quantity"]', '50');
    
    // Select warehouse and position
    await page.selectOption('select[name="warehouseId"]', testData.warehouseId);
    await page.selectOption('select[name="positionId"]', testData.positionId);
    
    // Add lot information
    await page.fill('input[name="lotNumber"]', 'LOT-2024-001');
    await page.fill('input[name="cost"]', '850.00');
    
    // Add reason
    await page.fill('textarea[name="reason"]', 'New shipment from supplier');
    
    // Submit
    await page.click('button:has-text("Confirm Receipt")');
    
    // Verify success
    await expect(page.locator('text=Stock received successfully')).toBeVisible();
    
    // Verify movement appears in list
    await expect(page.locator('[data-testid="movement-list"]')).toContainText('Laptop Pro 15"');
    await expect(page.locator('[data-testid="movement-list"]')).toContainText('+50');
    await expect(page.locator('[data-testid="movement-type-in"]')).toBeVisible();
  });

  test('Stock transfer between warehouses', async ({ page }) => {
    await page.goto('/inventory/stock-movements');
    
    // Click transfer button
    await page.click('button:has-text("Transfer Stock")');
    
    // Select product
    await page.selectOption('select[name="productId"]', testData.productId);
    
    // Enter transfer details
    await page.fill('input[name="quantity"]', '20');
    await page.selectOption('select[name="fromWarehouseId"]', testData.warehouseId);
    await page.selectOption('select[name="toWarehouseId"]', testData.secondaryWarehouseId);
    
    // Select positions
    await page.selectOption('select[name="fromPositionId"]', testData.positionId);
    await page.selectOption('select[name="toPositionId"]', testData.secondaryPositionId);
    
    // Add transfer reason
    await page.fill('textarea[name="reason"]', 'Balancing stock levels between warehouses');
    
    // Preview transfer
    await page.click('button:has-text("Preview Transfer")');
    
    // Verify preview
    await expect(page.locator('[data-testid="transfer-preview"]')).toContainText('From: Main Warehouse');
    await expect(page.locator('[data-testid="transfer-preview"]')).toContainText('To: Secondary Warehouse');
    await expect(page.locator('[data-testid="transfer-preview"]')).toContainText('Quantity: 20');
    
    // Confirm transfer
    await page.click('button:has-text("Confirm Transfer")');
    
    // Verify success and stock levels updated
    await expect(page.locator('text=Transfer completed successfully')).toBeVisible();
    
    // Check stock levels
    await page.goto('/inventory/products');
    await page.click(`[data-testid="product-${testData.productId}"]`);
    
    // Verify stock by warehouse
    await expect(page.locator('[data-testid="stock-main-warehouse"]')).toContainText('30'); // 50 - 20
    await expect(page.locator('[data-testid="stock-secondary-warehouse"]')).toContainText('20');
  });

  test('Bulk stock adjustment workflow', async ({ page }) => {
    await page.goto('/inventory/stock-movements');
    
    // Click bulk adjustment
    await page.click('button:has-text("Bulk Adjustment")');
    
    // Upload CSV file
    const csvContent = `SKU,Warehouse,Quantity,Type,Reason
SKU-001,MW-001,-5,damage,Water damage
SKU-002,MW-001,10,correction,Count correction
SKU-003,MW-001,-2,theft,Reported theft`;
    
    const buffer = Buffer.from(csvContent);
    await page.setInputFiles('input[type="file"]', {
      name: 'adjustments.csv',
      mimeType: 'text/csv',
      buffer
    });
    
    // Preview adjustments
    await expect(page.locator('[data-testid="adjustment-preview"]')).toContainText('3 adjustments');
    await expect(page.locator('[data-testid="adjustment-damage"]')).toContainText('-5');
    await expect(page.locator('[data-testid="adjustment-correction"]')).toContainText('+10');
    await expect(page.locator('[data-testid="adjustment-theft"]')).toContainText('-2');
    
    // Confirm adjustments
    await page.click('button:has-text("Apply Adjustments")');
    
    // Verify processing
    await expect(page.locator('[data-testid="processing-progress"]')).toBeVisible();
    await expect(page.locator('text=3/3 adjustments processed')).toBeVisible({ timeout: 10000 });
    
    // Verify movements created
    await expect(page.locator('[data-testid="movement-list"] [data-testid="movement-type-damage"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="movement-list"] [data-testid="movement-type-correction"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="movement-list"] [data-testid="movement-type-theft"]')).toHaveCount(1);
  });

  test('Movement history and filtering', async ({ page }) => {
    await page.goto('/inventory/stock-movements');
    
    // Test date range filter
    await page.click('[data-testid="date-range-picker"]');
    await page.click('button:has-text("Last 7 days")');
    
    // Test type filter
    await page.click('[data-testid="filter-button"]');
    await page.check('input[value="in"]');
    await page.check('input[value="transfer"]');
    await page.click('button:has-text("Apply Filters")');
    
    // Verify filtered results
    await expect(page.locator('[data-testid="movement-type-out"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="movement-type-adjustment"]')).toHaveCount(0);
    
    // Test warehouse filter
    await page.selectOption('select[name="warehouseFilter"]', testData.warehouseId);
    
    // Test search
    await page.fill('input[placeholder="Search movements..."]', 'Laptop');
    await expect(page.locator('[data-testid="movement-list"] > div')).toHaveCount(1);
    
    // Export movements
    await page.click('button:has-text("Export")');
    await page.click('button:has-text("Export as CSV")');
    
    // Verify download started
    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toContain('stock-movements');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('Movement timeline view', async ({ page }) => {
    await page.goto('/inventory/stock-movements');
    
    // Switch to timeline view
    await page.click('button:has-text("Timeline View")');
    
    // Verify timeline is visible
    await expect(page.locator('[data-testid="movement-timeline"]')).toBeVisible();
    
    // Check timeline items
    const timelineItems = page.locator('[data-testid="timeline-item"]');
    await expect(timelineItems).toHaveCount(await timelineItems.count());
    
    // Click on a timeline item for details
    await timelineItems.first().click();
    
    // Verify movement details modal
    await expect(page.locator('[data-testid="movement-details-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="movement-details-modal"]')).toContainText('Movement Details');
    
    // Check details content
    await expect(page.locator('[data-testid="detail-product"]')).toBeVisible();
    await expect(page.locator('[data-testid="detail-quantity"]')).toBeVisible();
    await expect(page.locator('[data-testid="detail-warehouse"]')).toBeVisible();
    await expect(page.locator('[data-testid="detail-user"]')).toBeVisible();
    await expect(page.locator('[data-testid="detail-timestamp"]')).toBeVisible();
  });

  test('Real-time stock updates', async ({ page, context }) => {
    // Open two tabs
    const page1 = page;
    const page2 = await context.newPage();
    
    // Navigate both to product details
    await page1.goto(`/inventory/products/${testData.productId}`);
    await page2.goto(`/inventory/products/${testData.productId}`);
    
    // Check initial stock on both pages
    const initialStock = await page1.locator('[data-testid="current-stock"]').textContent();
    await expect(page2.locator('[data-testid="current-stock"]')).toContainText(initialStock!);
    
    // Create movement on page1
    await page1.click('button:has-text("Adjust Stock")');
    await page1.fill('input[name="adjustment"]', '25');
    await page1.fill('textarea[name="reason"]', 'Found additional units');
    await page1.click('button:has-text("Confirm Adjustment")');
    
    // Wait for real-time update on page2
    await expect(page2.locator('[data-testid="current-stock"]')).not.toContainText(initialStock!, { timeout: 5000 });
    
    // Verify stock alert if applicable
    const newStock = parseInt(await page2.locator('[data-testid="current-stock"]').textContent() || '0');
    if (newStock < 50) {
      await expect(page2.locator('[data-testid="low-stock-alert"]')).toBeVisible();
    }
    
    await page2.close();
  });

  test('Movement performance with large dataset', async ({ page }) => {
    await page.goto('/inventory/stock-movements');
    
    // Simulate large dataset
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('simulate-movements', { detail: { count: 5000 } }));
    });
    
    // Wait for list to load
    await page.waitForSelector('[data-testid="movement-list"]');
    
    // Test pagination performance
    const paginationStart = Date.now();
    await page.click('button[aria-label="Go to page 2"]');
    await page.waitForSelector('[data-testid="movement-list"] > div:first-child');
    const paginationTime = Date.now() - paginationStart;
    
    expect(paginationTime).toBeLessThan(1000); // Should paginate in under 1 second
    
    // Test filtering performance
    const filterStart = Date.now();
    await page.selectOption('select[name="typeFilter"]', 'transfer');
    await page.waitForSelector('[data-testid="movement-list"]');
    const filterTime = Date.now() - filterStart;
    
    expect(filterTime).toBeLessThan(500); // Should filter in under 500ms
    
    // Test search performance
    const searchStart = Date.now();
    await page.fill('input[placeholder="Search movements..."]', 'Product-2500');
    await page.waitForSelector('[data-testid="movement-list"]');
    const searchTime = Date.now() - searchStart;
    
    expect(searchTime).toBeLessThan(300); // Should search in under 300ms
  });
});