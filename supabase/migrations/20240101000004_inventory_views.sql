-- View for product stock summary
CREATE OR REPLACE VIEW v_product_stock_summary AS
SELECT 
    p.id as product_id,
    p.sku,
    p.name as product_name,
    p.category,
    p.status,
    p.unit_price,
    p.currency,
    p.tracking_type,
    p.min_stock_level,
    p.reorder_point,
    p.reorder_quantity,
    COALESCE(SUM(sl.quantity), 0) as total_stock,
    COALESCE(SUM(sl.reserved_quantity), 0) as total_reserved,
    COALESCE(SUM(sl.available_quantity), 0) as total_available,
    COUNT(DISTINCT sl.warehouse_id) as warehouse_count,
    p.organization_id
FROM products p
LEFT JOIN stock_levels sl ON p.id = sl.product_id
GROUP BY p.id, p.sku, p.name, p.category, p.status, p.unit_price, 
         p.currency, p.tracking_type, p.min_stock_level, p.reorder_point, 
         p.reorder_quantity, p.organization_id;

-- View for warehouse capacity utilization
CREATE OR REPLACE VIEW v_warehouse_capacity AS
SELECT 
    w.id as warehouse_id,
    w.name as warehouse_name,
    w.code as warehouse_code,
    w.type as warehouse_type,
    (w.capacity->>'total')::INTEGER as total_capacity,
    (w.capacity->>'used')::INTEGER as used_capacity,
    w.capacity->>'unit' as capacity_unit,
    CASE 
        WHEN (w.capacity->>'total')::INTEGER > 0 
        THEN ((w.capacity->>'used')::NUMERIC / (w.capacity->>'total')::NUMERIC * 100)::DECIMAL(5,2)
        ELSE 0
    END as utilization_percentage,
    COUNT(DISTINCT z.id) as zone_count,
    COUNT(DISTINCT p.id) as position_count,
    w.is_active,
    w.organization_id
FROM warehouses w
LEFT JOIN warehouse_zones z ON w.id = z.warehouse_id
LEFT JOIN warehouse_positions p ON z.id = p.zone_id
GROUP BY w.id, w.name, w.code, w.type, w.capacity, w.is_active, w.organization_id;

-- View for recent stock movements
CREATE OR REPLACE VIEW v_recent_stock_movements AS
SELECT 
    sm.id,
    sm.type,
    sm.quantity,
    p.name as product_name,
    p.sku as product_sku,
    fw.name as from_warehouse,
    tw.name as to_warehouse,
    sm.lot_number,
    sm.reference_type,
    sm.reference_id,
    sm.reason,
    sm.cost,
    sm.created_at,
    u.email as created_by_email,
    sm.organization_id
FROM stock_movements sm
JOIN products p ON sm.product_id = p.id
LEFT JOIN warehouses fw ON sm.from_warehouse_id = fw.id
LEFT JOIN warehouses tw ON sm.to_warehouse_id = tw.id
LEFT JOIN auth.users u ON sm.created_by = u.id
WHERE sm.created_at >= NOW() - INTERVAL '30 days'
ORDER BY sm.created_at DESC;

-- View for active purchase orders
CREATE OR REPLACE VIEW v_active_purchase_orders AS
SELECT 
    po.id,
    po.order_number,
    po.status,
    s.name as supplier_name,
    s.code as supplier_code,
    w.name as warehouse_name,
    po.order_date,
    po.expected_date,
    po.total_amount,
    po.currency,
    COUNT(poi.id) as item_count,
    COALESCE(SUM(poi.quantity), 0) as total_items,
    COALESCE(SUM(poi.received_quantity), 0) as total_received,
    po.organization_id
FROM purchase_orders po
JOIN suppliers s ON po.supplier_id = s.id
JOIN warehouses w ON po.warehouse_id = w.id
LEFT JOIN purchase_order_items poi ON po.id = poi.order_id
WHERE po.status NOT IN ('received', 'cancelled')
GROUP BY po.id, po.order_number, po.status, s.name, s.code, 
         w.name, po.order_date, po.expected_date, po.total_amount, 
         po.currency, po.organization_id;

-- View for low stock products
CREATE OR REPLACE VIEW v_low_stock_products AS
SELECT 
    pss.product_id,
    pss.sku,
    pss.product_name,
    pss.category,
    pss.total_stock,
    pss.total_available,
    pss.min_stock_level,
    pss.reorder_point,
    pss.reorder_quantity,
    CASE 
        WHEN pss.total_stock < pss.min_stock_level THEN 'critical'
        WHEN pss.total_stock < pss.reorder_point THEN 'warning'
        ELSE 'ok'
    END as stock_status,
    pss.organization_id
FROM v_product_stock_summary pss
WHERE pss.status = 'active'
AND (pss.total_stock < pss.reorder_point OR pss.total_stock < pss.min_stock_level)
ORDER BY 
    CASE 
        WHEN pss.total_stock < pss.min_stock_level THEN 1
        WHEN pss.total_stock < pss.reorder_point THEN 2
        ELSE 3
    END,
    pss.total_stock ASC;

-- View for inventory valuation
CREATE OR REPLACE VIEW v_inventory_valuation AS
SELECT 
    w.id as warehouse_id,
    w.name as warehouse_name,
    p.category as product_category,
    COUNT(DISTINCT p.id) as product_count,
    COALESCE(SUM(sl.quantity), 0) as total_quantity,
    COALESCE(SUM(sl.quantity * p.unit_price), 0) as total_value,
    p.currency,
    w.organization_id
FROM warehouses w
CROSS JOIN products p
LEFT JOIN stock_levels sl ON w.id = sl.warehouse_id AND p.id = sl.product_id
WHERE sl.quantity > 0
GROUP BY w.id, w.name, p.category, p.currency, w.organization_id
ORDER BY w.name, p.category;

-- View for supplier product catalog
CREATE OR REPLACE VIEW v_supplier_catalog AS
SELECT 
    sp.id,
    s.name as supplier_name,
    s.code as supplier_code,
    p.name as product_name,
    p.sku as product_sku,
    p.category,
    sp.supplier_sku,
    sp.supplier_name as supplier_product_name,
    sp.cost,
    sp.currency,
    sp.lead_time_days,
    sp.moq,
    sp.is_preferred,
    p.organization_id
FROM supplier_products sp
JOIN suppliers s ON sp.supplier_id = s.id
JOIN products p ON sp.product_id = p.id
WHERE s.is_active = true AND p.status = 'active'
ORDER BY s.name, p.name;

-- View for stock alert dashboard
CREATE OR REPLACE VIEW v_stock_alert_dashboard AS
SELECT 
    sa.id,
    sa.severity,
    sa.status,
    p.name as product_name,
    p.sku as product_sku,
    w.name as warehouse_name,
    sa.current_stock,
    sa.min_stock_level,
    sa.reorder_point,
    sa.days_until_stockout,
    sa.suggested_order_quantity,
    sa.message,
    sa.created_at,
    sa.acknowledged_at,
    u.email as acknowledged_by_email,
    sa.organization_id
FROM stock_alerts sa
JOIN products p ON sa.product_id = p.id
JOIN warehouses w ON sa.warehouse_id = w.id
LEFT JOIN auth.users u ON sa.acknowledged_by = u.id
WHERE sa.status IN ('active', 'acknowledged')
ORDER BY 
    CASE sa.severity 
        WHEN 'critical' THEN 1
        WHEN 'warning' THEN 2
        WHEN 'info' THEN 3
    END,
    sa.days_until_stockout ASC;

-- Grant permissions on views
GRANT SELECT ON v_product_stock_summary TO authenticated;
GRANT SELECT ON v_warehouse_capacity TO authenticated;
GRANT SELECT ON v_recent_stock_movements TO authenticated;
GRANT SELECT ON v_active_purchase_orders TO authenticated;
GRANT SELECT ON v_low_stock_products TO authenticated;
GRANT SELECT ON v_inventory_valuation TO authenticated;
GRANT SELECT ON v_supplier_catalog TO authenticated;
GRANT SELECT ON v_stock_alert_dashboard TO authenticated;