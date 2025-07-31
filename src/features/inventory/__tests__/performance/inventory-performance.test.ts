import { test, expect } from '@playwright/test';
import { measurePerformance, generateLargeDataset } from '@/tests/performance-helpers';

test.describe('Inventory Performance Tests', () => {
  test.beforeAll(async () => {
    // Setup large dataset for performance testing
    await generateLargeDataset({
      products: 10000,
      warehouses: 50,
      movements: 50000,
      orders: 5000
    });
  });

  test('Product catalog performance with 10k products', async ({ page }) => {
    const metrics = await measurePerformance(page, async () => {
      await page.goto('/inventory/products');
      await page.waitForSelector('[data-testid="product-grid"]');
    });

    // Initial load metrics
    expect(metrics.firstContentfulPaint).toBeLessThan(1500);
    expect(metrics.largestContentfulPaint).toBeLessThan(2500);
    expect(metrics.timeToInteractive).toBeLessThan(3000);
    expect(metrics.totalBlockingTime).toBeLessThan(300);

    // Test search performance
    const searchMetrics = await measurePerformance(page, async () => {
      await page.fill('input[placeholder="Search products..."]', 'laptop');
      await page.waitForSelector('[data-testid="search-results"]');
    });

    expect(searchMetrics.duration).toBeLessThan(200);

    // Test filter performance
    const filterMetrics = await measurePerformance(page, async () => {
      await page.click('[data-testid="filter-button"]');
      await page.check('input[value="Electronics"]');
      await page.click('button:has-text("Apply")');
      await page.waitForSelector('[data-testid="product-grid"]');
    });

    expect(filterMetrics.duration).toBeLessThan(500);

    // Test pagination performance
    const paginationMetrics = await measurePerformance(page, async () => {
      await page.click('button[aria-label="Go to page 10"]');
      await page.waitForSelector('[data-testid="product-grid"]');
    });

    expect(paginationMetrics.duration).toBeLessThan(300);
  });

  test('Stock movements performance with 50k records', async ({ page }) => {
    const metrics = await measurePerformance(page, async () => {
      await page.goto('/inventory/stock-movements');
      await page.waitForSelector('[data-testid="movement-list"]');
    });

    // Should use virtual scrolling for large datasets
    expect(metrics.memoryUsage).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
    expect(metrics.timeToInteractive).toBeLessThan(2000);

    // Test timeline view performance
    const timelineMetrics = await measurePerformance(page, async () => {
      await page.click('button:has-text("Timeline View")');
      await page.waitForSelector('[data-testid="movement-timeline"]');
    });

    expect(timelineMetrics.duration).toBeLessThan(1000);
    expect(timelineMetrics.layoutShifts).toBeLessThan(0.1);
  });

  test('Warehouse map performance with 50 locations', async ({ page }) => {
    const metrics = await measurePerformance(page, async () => {
      await page.goto('/inventory/warehouses');
      await page.click('button:has-text("Map View")');
      await page.waitForSelector('[data-testid="warehouse-map"]');
    });

    // Map should load efficiently
    expect(metrics.duration).toBeLessThan(2000);
    
    // Test pan and zoom performance
    const interactionMetrics = await measurePerformance(page, async () => {
      // Simulate map interactions
      await page.mouse.move(400, 300);
      await page.mouse.down();
      await page.mouse.move(600, 400);
      await page.mouse.up();
      
      // Zoom
      await page.mouse.wheel(0, -100);
      await page.waitForTimeout(100);
    });

    expect(interactionMetrics.fps).toBeGreaterThan(30);
  });

  test('Analytics dashboard performance', async ({ page }) => {
    const metrics = await measurePerformance(page, async () => {
      await page.goto('/inventory/analytics');
      await page.waitForSelector('[data-testid="analytics-dashboard"]');
    });

    // Dashboard with multiple charts should load efficiently
    expect(metrics.timeToInteractive).toBeLessThan(3500);
    
    // Test chart rendering performance
    const chartMetrics = await measurePerformance(page, async () => {
      await page.click('button:has-text("ABC Analysis")');
      await page.waitForSelector('[data-testid="abc-chart"]');
    });

    expect(chartMetrics.duration).toBeLessThan(1000);
    expect(chartMetrics.scriptDuration).toBeLessThan(500);
  });

  test('Bulk operations performance', async ({ page }) => {
    await page.goto('/inventory/products');
    
    // Select 100 products
    const selectionMetrics = await measurePerformance(page, async () => {
      await page.click('input[data-testid="select-all"]');
      await page.waitForSelector('[data-testid="bulk-actions"]');
    });

    expect(selectionMetrics.duration).toBeLessThan(500);

    // Test bulk update performance
    const updateMetrics = await measurePerformance(page, async () => {
      await page.click('button:has-text("Bulk Actions")');
      await page.click('button:has-text("Update Prices")');
      await page.fill('input[name="priceAdjustment"]', '10');
      await page.click('button:has-text("Apply")');
      await page.waitForSelector('text=100 products updated');
    });

    expect(updateMetrics.duration).toBeLessThan(3000);
  });

  test('Real-time updates performance', async ({ page, context }) => {
    // Open multiple tabs
    const pages = [page];
    for (let i = 0; i < 4; i++) {
      pages.push(await context.newPage());
    }

    // Navigate all to stock alerts
    await Promise.all(pages.map(p => p.goto('/inventory/alerts')));

    // Measure update propagation time
    const updateMetrics = await measurePerformance(page, async () => {
      // Trigger alert on first page
      await pages[0].evaluate(() => {
        window.dispatchEvent(new CustomEvent('simulate-stock-alert', {
          detail: { productId: 'test-product', severity: 'critical' }
        }));
      });

      // Wait for update on all pages
      await Promise.all(pages.slice(1).map(p => 
        p.waitForSelector('[data-testid="new-alert"]', { timeout: 2000 })
      ));
    });

    expect(updateMetrics.duration).toBeLessThan(1000);

    // Cleanup
    await Promise.all(pages.slice(1).map(p => p.close()));
  });

  test('Memory leak detection', async ({ page }) => {
    await page.goto('/inventory/products');
    
    // Take initial memory snapshot
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    // Perform repeated operations
    for (let i = 0; i < 10; i++) {
      // Navigate between views
      await page.click('button:has-text("Grid View")');
      await page.waitForSelector('[data-testid="product-grid"]');
      await page.click('button:has-text("List View")');
      await page.waitForSelector('[data-testid="product-list"]');
      
      // Open and close modals
      await page.click('button:has-text("Add Product")');
      await page.waitForSelector('[data-testid="product-form"]');
      await page.click('button:has-text("Cancel")');
      
      // Apply and clear filters
      await page.click('[data-testid="filter-button"]');
      await page.check('input[value="Electronics"]');
      await page.click('button:has-text("Apply")');
      await page.click('button:has-text("Clear Filters")');
    }

    // Force garbage collection
    await page.evaluate(() => {
      if ('gc' in window) {
        (window as any).gc();
      }
    });

    // Check final memory
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    // Memory should not increase significantly (allow 20% increase)
    expect(finalMemory).toBeLessThan(initialMemory * 1.2);
  });

  test('API response time under load', async ({ page }) => {
    // Simulate concurrent API requests
    const apiMetrics = await measurePerformance(page, async () => {
      await page.evaluate(async () => {
        const requests = [];
        
        // Simulate 50 concurrent requests
        for (let i = 0; i < 50; i++) {
          requests.push(
            fetch('/api/inventory/products?page=' + i)
              .then(r => r.json())
          );
        }
        
        await Promise.all(requests);
      });
    });

    // All requests should complete within reasonable time
    expect(apiMetrics.duration).toBeLessThan(5000);
    
    // Check individual request times
    const requestTimes = await page.evaluate(() => 
      performance.getEntriesByType('resource')
        .filter(e => e.name.includes('/api/inventory'))
        .map(e => e.duration)
    );

    // 95th percentile should be under 500ms
    requestTimes.sort((a, b) => a - b);
    const p95 = requestTimes[Math.floor(requestTimes.length * 0.95)];
    expect(p95).toBeLessThan(500);
  });

  test('Mobile performance on 3G network', async ({ page, context }) => {
    // Simulate 3G network
    await context.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
      await route.continue();
    });

    const metrics = await measurePerformance(page, async () => {
      await page.goto('/inventory/mobile/products');
      await page.waitForSelector('[data-testid="product-list"]');
    });

    // Should still be usable on slow network
    expect(metrics.timeToInteractive).toBeLessThan(10000);
    
    // Test offline-first features
    await context.setOffline(true);
    
    // Should show cached data
    await page.reload();
    await expect(page.locator('[data-testid="offline-mode"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
  });

  test('Export performance with large datasets', async ({ page }) => {
    await page.goto('/inventory/stock-movements');
    
    // Test CSV export of 10k records
    const exportMetrics = await measurePerformance(page, async () => {
      await page.click('button:has-text("Export")');
      await page.click('button:has-text("Export All as CSV")');
      
      // Wait for download to start
      const download = await page.waitForEvent('download');
      await download.path();
    });

    // Export should complete in reasonable time
    expect(exportMetrics.duration).toBeLessThan(5000);
    
    // UI should remain responsive during export
    expect(exportMetrics.totalBlockingTime).toBeLessThan(50);
  });
});