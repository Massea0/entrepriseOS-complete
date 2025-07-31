import { test, expect } from '@playwright/test';
import { createTestUser, cleanupTestData } from '@/tests/helpers';

test.describe('Warehouse Management Workflow', () => {
  let testUserId: string;
  let testWarehouseId: string;

  test.beforeAll(async () => {
    // Create test user and authenticate
    const { userId } = await createTestUser({
      email: 'warehouse-test@example.com',
      role: 'inventory_manager'
    });
    testUserId = userId;
  });

  test.afterAll(async () => {
    // Cleanup test data
    await cleanupTestData(testUserId);
  });

  test('Complete warehouse creation and configuration workflow', async ({ page }) => {
    // Navigate to warehouse management
    await page.goto('/inventory/warehouses');
    
    // Click create warehouse button
    await page.click('button:has-text("Create Warehouse")');
    
    // Fill warehouse form
    await page.fill('input[name="name"]', 'Test Distribution Center');
    await page.fill('input[name="code"]', 'TDC-001');
    await page.selectOption('select[name="type"]', 'distribution');
    
    // Fill address
    await page.fill('input[name="address.street"]', '123 Logistics Ave');
    await page.fill('input[name="address.city"]', 'Paris');
    await page.fill('input[name="address.postalCode"]', '75001');
    await page.fill('input[name="address.country"]', 'France');
    
    // Set capacity
    await page.fill('input[name="capacity.total"]', '10000');
    await page.selectOption('select[name="capacity.unit"]', 'units');
    
    // Add features
    await page.check('input[value="climate-controlled"]');
    await page.check('input[value="security-24-7"]');
    await page.check('input[value="loading-dock"]');
    
    // Submit form
    await page.click('button:has-text("Create")');
    
    // Wait for success message
    await expect(page.locator('text=Warehouse created successfully')).toBeVisible();
    
    // Verify warehouse appears in list
    await expect(page.locator('text=Test Distribution Center')).toBeVisible();
    
    // Click on warehouse to view details
    await page.click('text=Test Distribution Center');
    
    // Add a zone
    await page.click('button:has-text("Add Zone")');
    await page.fill('input[name="zoneName"]', 'Zone A - Electronics');
    await page.fill('input[name="zoneCode"]', 'A-ELEC');
    await page.selectOption('select[name="zoneType"]', 'picking');
    await page.fill('input[name="zoneCapacity"]', '2000');
    await page.click('button:has-text("Create Zone")');
    
    // Verify zone creation
    await expect(page.locator('text=Zone A - Electronics')).toBeVisible();
    
    // Add positions to zone
    await page.click('text=Zone A - Electronics');
    await page.click('button:has-text("Add Positions")');
    
    // Bulk create positions
    await page.fill('input[name="prefix"]', 'A');
    await page.fill('input[name="startRow"]', '1');
    await page.fill('input[name="endRow"]', '10');
    await page.fill('input[name="columnsPerRow"]', '5');
    await page.click('button:has-text("Generate Positions")');
    
    // Verify positions created
    await expect(page.locator('text=50 positions created')).toBeVisible();
    
    // Test capacity indicator
    const capacityIndicator = page.locator('[data-testid="capacity-indicator"]');
    await expect(capacityIndicator).toContainText('0%');
    
    // Test search functionality
    await page.fill('input[placeholder="Search warehouses..."]', 'Test Distribution');
    await expect(page.locator('text=Test Distribution Center')).toBeVisible();
    await expect(page.locator('[data-testid="warehouse-count"]')).toContainText('1');
  });

  test('Warehouse capacity updates with stock movements', async ({ page }) => {
    // Navigate to warehouse
    await page.goto(`/inventory/warehouses/${testWarehouseId}`);
    
    // Initial capacity should be 0
    await expect(page.locator('[data-testid="capacity-used"]')).toContainText('0');
    
    // Create a stock movement (receive goods)
    await page.click('button:has-text("Receive Stock")');
    await page.selectOption('select[name="productId"]', 'test-product-1');
    await page.fill('input[name="quantity"]', '100');
    await page.selectOption('select[name="positionId"]', 'A-01-01');
    await page.click('button:has-text("Confirm Receipt")');
    
    // Wait for capacity update
    await page.waitForTimeout(1000);
    
    // Verify capacity updated
    await expect(page.locator('[data-testid="capacity-used"]')).toContainText('100');
    await expect(page.locator('[data-testid="capacity-percentage"]')).toContainText('1%');
  });

  test('Zone and position management', async ({ page }) => {
    await page.goto(`/inventory/warehouses/${testWarehouseId}`);
    
    // Test zone filtering
    await page.selectOption('select[name="zoneTypeFilter"]', 'picking');
    await expect(page.locator('[data-testid="zone-card"]')).toHaveCount(1);
    
    // Test position search
    await page.fill('input[placeholder="Search positions..."]', 'A-05');
    await expect(page.locator('[data-testid="position-item"]')).toHaveCount(5);
    
    // Test position status update
    await page.click('[data-testid="position-A-05-03"]');
    await page.click('button:has-text("Mark as Occupied")');
    await expect(page.locator('[data-testid="position-A-05-03"]')).toHaveClass(/occupied/);
    
    // Test zone capacity visualization
    const zoneCapacity = page.locator('[data-testid="zone-capacity-chart"]');
    await expect(zoneCapacity).toBeVisible();
  });

  test('Multi-warehouse view and statistics', async ({ page }) => {
    // Create second warehouse for comparison
    await page.goto('/inventory/warehouses');
    await page.click('button:has-text("Create Warehouse")');
    await page.fill('input[name="name"]', 'Secondary Warehouse');
    await page.fill('input[name="code"]', 'SW-001');
    await page.click('button:has-text("Create")');
    
    // Switch to map view
    await page.click('button:has-text("Map View")');
    await expect(page.locator('[data-testid="warehouse-map"]')).toBeVisible();
    await expect(page.locator('[data-testid="map-marker"]')).toHaveCount(2);
    
    // Check global statistics
    await expect(page.locator('[data-testid="total-warehouses"]')).toContainText('2');
    await expect(page.locator('[data-testid="total-capacity"]')).toContainText('20,000');
    await expect(page.locator('[data-testid="total-zones"]')).toContainText('1');
    await expect(page.locator('[data-testid="total-positions"]')).toContainText('50');
  });

  test('Warehouse performance under load', async ({ page }) => {
    await page.goto(`/inventory/warehouses/${testWarehouseId}`);
    
    // Measure initial load time
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="warehouse-details"]');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(2000); // Should load in under 2 seconds
    
    // Test with many positions
    await page.evaluate(() => {
      // Simulate 1000 positions
      window.dispatchEvent(new CustomEvent('simulate-positions', { detail: { count: 1000 } }));
    });
    
    // Search should still be responsive
    const searchStart = Date.now();
    await page.fill('input[placeholder="Search positions..."]', 'A-50');
    await page.waitForSelector('[data-testid="position-item"]');
    const searchTime = Date.now() - searchStart;
    
    expect(searchTime).toBeLessThan(500); // Search should complete in under 500ms
  });
});