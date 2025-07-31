-- Function to update stock levels after a movement
CREATE OR REPLACE FUNCTION update_stock_levels_after_movement()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle outgoing stock
    IF NEW.from_warehouse_id IS NOT NULL THEN
        UPDATE stock_levels
        SET quantity = quantity - NEW.quantity
        WHERE product_id = NEW.product_id
        AND warehouse_id = NEW.from_warehouse_id
        AND (position_id = NEW.from_position_id OR (position_id IS NULL AND NEW.from_position_id IS NULL))
        AND (lot_number = NEW.lot_number OR (lot_number IS NULL AND NEW.lot_number IS NULL));
    END IF;
    
    -- Handle incoming stock
    IF NEW.to_warehouse_id IS NOT NULL THEN
        INSERT INTO stock_levels (
            product_id, warehouse_id, position_id, quantity, lot_number, serial_numbers
        ) VALUES (
            NEW.product_id, NEW.to_warehouse_id, NEW.to_position_id, NEW.quantity, NEW.lot_number, NEW.serial_numbers
        )
        ON CONFLICT (product_id, warehouse_id, position_id, lot_number)
        DO UPDATE SET 
            quantity = stock_levels.quantity + EXCLUDED.quantity,
            serial_numbers = array_cat(stock_levels.serial_numbers, EXCLUDED.serial_numbers);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for stock level updates
CREATE TRIGGER trigger_update_stock_levels_after_movement
    AFTER INSERT ON stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_levels_after_movement();

-- Function to calculate available stock
CREATE OR REPLACE FUNCTION calculate_available_stock(
    p_product_id UUID,
    p_warehouse_id UUID DEFAULT NULL
)
RETURNS TABLE (
    warehouse_id UUID,
    warehouse_name VARCHAR,
    total_quantity INTEGER,
    reserved_quantity INTEGER,
    available_quantity INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sl.warehouse_id,
        w.name as warehouse_name,
        COALESCE(SUM(sl.quantity), 0)::INTEGER as total_quantity,
        COALESCE(SUM(sl.reserved_quantity), 0)::INTEGER as reserved_quantity,
        COALESCE(SUM(sl.available_quantity), 0)::INTEGER as available_quantity
    FROM stock_levels sl
    JOIN warehouses w ON sl.warehouse_id = w.id
    WHERE sl.product_id = p_product_id
    AND (p_warehouse_id IS NULL OR sl.warehouse_id = p_warehouse_id)
    GROUP BY sl.warehouse_id, w.name;
END;
$$ LANGUAGE plpgsql;

-- Function to check and create stock alerts
CREATE OR REPLACE FUNCTION check_and_create_stock_alerts()
RETURNS void AS $$
DECLARE
    v_record RECORD;
    v_days_until_stockout INTEGER;
    v_severity alert_severity;
    v_message TEXT;
BEGIN
    -- Check each product-warehouse combination
    FOR v_record IN
        SELECT 
            p.id as product_id,
            p.name as product_name,
            p.min_stock_level,
            p.reorder_point,
            p.reorder_quantity,
            sl.warehouse_id,
            w.name as warehouse_name,
            COALESCE(SUM(sl.quantity), 0) as current_stock,
            w.organization_id
        FROM products p
        CROSS JOIN warehouses w
        LEFT JOIN stock_levels sl ON p.id = sl.product_id AND w.id = sl.warehouse_id
        WHERE p.status = 'active'
        GROUP BY p.id, p.name, p.min_stock_level, p.reorder_point, p.reorder_quantity, 
                 sl.warehouse_id, w.id, w.name, w.organization_id
    LOOP
        -- Calculate days until stockout (simplified - should consider usage rate)
        v_days_until_stockout := CASE 
            WHEN v_record.current_stock <= 0 THEN 0
            ELSE v_record.current_stock / GREATEST(1, (v_record.reorder_quantity / 30))
        END;
        
        -- Determine severity
        IF v_record.current_stock < v_record.min_stock_level THEN
            v_severity := 'critical';
            v_message := format('Critical: %s stock at %s units, below minimum level of %s',
                v_record.product_name, v_record.current_stock, v_record.min_stock_level);
        ELSIF v_record.current_stock < v_record.reorder_point THEN
            v_severity := 'warning';
            v_message := format('Warning: %s stock at %s units, below reorder point of %s',
                v_record.product_name, v_record.current_stock, v_record.reorder_point);
        ELSE
            CONTINUE; -- No alert needed
        END IF;
        
        -- Create or update alert
        INSERT INTO stock_alerts (
            product_id,
            warehouse_id,
            severity,
            current_stock,
            min_stock_level,
            reorder_point,
            days_until_stockout,
            suggested_order_quantity,
            message,
            organization_id
        ) VALUES (
            v_record.product_id,
            v_record.warehouse_id,
            v_severity,
            v_record.current_stock,
            v_record.min_stock_level,
            v_record.reorder_point,
            v_days_until_stockout,
            v_record.reorder_quantity,
            v_message,
            v_record.organization_id
        )
        ON CONFLICT (product_id, warehouse_id) 
        WHERE status = 'active'
        DO UPDATE SET
            severity = EXCLUDED.severity,
            current_stock = EXCLUDED.current_stock,
            days_until_stockout = EXCLUDED.days_until_stockout,
            message = EXCLUDED.message,
            updated_at = NOW();
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get inventory value
CREATE OR REPLACE FUNCTION get_inventory_value(
    p_warehouse_id UUID DEFAULT NULL,
    p_category VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    total_value DECIMAL,
    total_items INTEGER,
    product_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(sl.quantity * p.unit_price), 0) as total_value,
        COALESCE(SUM(sl.quantity), 0)::INTEGER as total_items,
        COUNT(DISTINCT p.id)::INTEGER as product_count
    FROM stock_levels sl
    JOIN products p ON sl.product_id = p.id
    WHERE (p_warehouse_id IS NULL OR sl.warehouse_id = p_warehouse_id)
    AND (p_category IS NULL OR p.category = p_category)
    AND sl.quantity > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to perform ABC analysis
CREATE OR REPLACE FUNCTION perform_abc_analysis(
    p_organization_id UUID,
    p_period_days INTEGER DEFAULT 90
)
RETURNS TABLE (
    product_id UUID,
    product_name VARCHAR,
    product_sku VARCHAR,
    revenue DECIMAL,
    quantity INTEGER,
    percentage DECIMAL,
    cumulative_percentage DECIMAL,
    category CHAR(1)
) AS $$
WITH product_revenue AS (
    SELECT 
        p.id,
        p.name,
        p.sku,
        COALESCE(SUM(ABS(sm.quantity) * p.unit_price), 0) as revenue,
        COALESCE(SUM(ABS(sm.quantity)), 0)::INTEGER as quantity
    FROM products p
    LEFT JOIN stock_movements sm ON p.id = sm.product_id
        AND sm.type IN ('out', 'transfer')
        AND sm.created_at >= NOW() - INTERVAL '1 day' * p_period_days
    WHERE p.organization_id = p_organization_id
    GROUP BY p.id, p.name, p.sku
),
ranked_products AS (
    SELECT 
        *,
        revenue / NULLIF(SUM(revenue) OVER (), 0) * 100 as percentage,
        SUM(revenue / NULLIF(SUM(revenue) OVER (), 0) * 100) OVER (ORDER BY revenue DESC) as cumulative_percentage
    FROM product_revenue
    WHERE revenue > 0
)
SELECT 
    id as product_id,
    name as product_name,
    sku as product_sku,
    revenue,
    quantity,
    percentage,
    cumulative_percentage,
    CASE 
        WHEN cumulative_percentage <= 70 THEN 'A'
        WHEN cumulative_percentage <= 90 THEN 'B'
        ELSE 'C'
    END as category
FROM ranked_products
ORDER BY revenue DESC;
$$ LANGUAGE sql;

-- Function to calculate inventory turnover
CREATE OR REPLACE FUNCTION calculate_inventory_turnover(
    p_product_id UUID,
    p_warehouse_id UUID DEFAULT NULL,
    p_period_days INTEGER DEFAULT 365
)
RETURNS TABLE (
    turnover_rate DECIMAL,
    average_stock_value DECIMAL,
    cost_of_goods_sold DECIMAL,
    days_in_inventory INTEGER
) AS $$
DECLARE
    v_cogs DECIMAL;
    v_avg_stock DECIMAL;
    v_turnover DECIMAL;
BEGIN
    -- Calculate COGS (simplified - uses outgoing movements)
    SELECT COALESCE(SUM(ABS(quantity) * cost), 0)
    INTO v_cogs
    FROM stock_movements
    WHERE product_id = p_product_id
    AND type IN ('out', 'transfer')
    AND (p_warehouse_id IS NULL OR from_warehouse_id = p_warehouse_id)
    AND created_at >= NOW() - INTERVAL '1 day' * p_period_days;
    
    -- Calculate average stock value
    SELECT COALESCE(AVG(sl.quantity * p.unit_price), 0)
    INTO v_avg_stock
    FROM stock_levels sl
    JOIN products p ON sl.product_id = p.id
    WHERE sl.product_id = p_product_id
    AND (p_warehouse_id IS NULL OR sl.warehouse_id = p_warehouse_id);
    
    -- Calculate turnover rate
    v_turnover := CASE 
        WHEN v_avg_stock > 0 THEN v_cogs / v_avg_stock
        ELSE 0
    END;
    
    RETURN QUERY
    SELECT 
        v_turnover as turnover_rate,
        v_avg_stock as average_stock_value,
        v_cogs as cost_of_goods_sold,
        CASE 
            WHEN v_turnover > 0 THEN (p_period_days / v_turnover)::INTEGER
            ELSE 0
        END as days_in_inventory;
END;
$$ LANGUAGE plpgsql;

-- Function to generate purchase order number
CREATE OR REPLACE FUNCTION generate_purchase_order_number()
RETURNS VARCHAR AS $$
DECLARE
    v_year VARCHAR;
    v_sequence INTEGER;
    v_order_number VARCHAR;
BEGIN
    v_year := TO_CHAR(NOW(), 'YYYY');
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 8) AS INTEGER)), 0) + 1
    INTO v_sequence
    FROM purchase_orders
    WHERE order_number LIKE 'PO-' || v_year || '-%';
    
    v_order_number := 'PO-' || v_year || '-' || LPAD(v_sequence::TEXT, 5, '0');
    
    RETURN v_order_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate purchase order number
CREATE OR REPLACE FUNCTION set_purchase_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_purchase_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_purchase_order_number
    BEFORE INSERT ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION set_purchase_order_number();

-- Function to update purchase order totals
CREATE OR REPLACE FUNCTION update_purchase_order_totals()
RETURNS TRIGGER AS $$
DECLARE
    v_subtotal DECIMAL;
    v_tax_total DECIMAL;
BEGIN
    -- Calculate new totals
    SELECT 
        COALESCE(SUM(total_amount), 0),
        COALESCE(SUM(total_amount * tax_rate / 100), 0)
    INTO v_subtotal, v_tax_total
    FROM purchase_order_items
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);
    
    -- Update purchase order
    UPDATE purchase_orders
    SET 
        subtotal = v_subtotal,
        tax_amount = v_tax_total,
        total_amount = v_subtotal + v_tax_total + COALESCE(shipping_cost, 0)
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for purchase order items changes
CREATE TRIGGER trigger_update_purchase_order_totals
    AFTER INSERT OR UPDATE OR DELETE ON purchase_order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_purchase_order_totals();