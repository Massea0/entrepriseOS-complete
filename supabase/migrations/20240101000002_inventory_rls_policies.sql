-- Enable RLS on all inventory tables
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_thresholds ENABLE ROW LEVEL SECURITY;

-- Create a function to get user's organization_id
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT organization_id 
        FROM user_profiles 
        WHERE user_id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Warehouses policies
CREATE POLICY "Users can view warehouses in their organization"
    ON warehouses FOR SELECT
    USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create warehouses in their organization"
    ON warehouses FOR INSERT
    WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update warehouses in their organization"
    ON warehouses FOR UPDATE
    USING (organization_id = get_user_organization_id())
    WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete warehouses in their organization"
    ON warehouses FOR DELETE
    USING (organization_id = get_user_organization_id());

-- Warehouse zones policies (inherit from warehouse)
CREATE POLICY "Users can view warehouse zones"
    ON warehouse_zones FOR SELECT
    USING (
        warehouse_id IN (
            SELECT id FROM warehouses 
            WHERE organization_id = get_user_organization_id()
        )
    );

CREATE POLICY "Users can manage warehouse zones"
    ON warehouse_zones FOR ALL
    USING (
        warehouse_id IN (
            SELECT id FROM warehouses 
            WHERE organization_id = get_user_organization_id()
        )
    );

-- Warehouse positions policies (inherit from zone)
CREATE POLICY "Users can view warehouse positions"
    ON warehouse_positions FOR SELECT
    USING (
        zone_id IN (
            SELECT z.id FROM warehouse_zones z
            JOIN warehouses w ON z.warehouse_id = w.id
            WHERE w.organization_id = get_user_organization_id()
        )
    );

CREATE POLICY "Users can manage warehouse positions"
    ON warehouse_positions FOR ALL
    USING (
        zone_id IN (
            SELECT z.id FROM warehouse_zones z
            JOIN warehouses w ON z.warehouse_id = w.id
            WHERE w.organization_id = get_user_organization_id()
        )
    );

-- Products policies
CREATE POLICY "Users can view products in their organization"
    ON products FOR SELECT
    USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create products in their organization"
    ON products FOR INSERT
    WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update products in their organization"
    ON products FOR UPDATE
    USING (organization_id = get_user_organization_id())
    WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete products in their organization"
    ON products FOR DELETE
    USING (organization_id = get_user_organization_id());

-- Suppliers policies
CREATE POLICY "Users can view suppliers in their organization"
    ON suppliers FOR SELECT
    USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create suppliers in their organization"
    ON suppliers FOR INSERT
    WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update suppliers in their organization"
    ON suppliers FOR UPDATE
    USING (organization_id = get_user_organization_id())
    WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete suppliers in their organization"
    ON suppliers FOR DELETE
    USING (organization_id = get_user_organization_id());

-- Supplier products policies (inherit from supplier and product)
CREATE POLICY "Users can view supplier products"
    ON supplier_products FOR SELECT
    USING (
        supplier_id IN (
            SELECT id FROM suppliers 
            WHERE organization_id = get_user_organization_id()
        )
        AND product_id IN (
            SELECT id FROM products 
            WHERE organization_id = get_user_organization_id()
        )
    );

CREATE POLICY "Users can manage supplier products"
    ON supplier_products FOR ALL
    USING (
        supplier_id IN (
            SELECT id FROM suppliers 
            WHERE organization_id = get_user_organization_id()
        )
        AND product_id IN (
            SELECT id FROM products 
            WHERE organization_id = get_user_organization_id()
        )
    );

-- Stock levels policies
CREATE POLICY "Users can view stock levels"
    ON stock_levels FOR SELECT
    USING (
        warehouse_id IN (
            SELECT id FROM warehouses 
            WHERE organization_id = get_user_organization_id()
        )
        AND product_id IN (
            SELECT id FROM products 
            WHERE organization_id = get_user_organization_id()
        )
    );

CREATE POLICY "Users can manage stock levels"
    ON stock_levels FOR ALL
    USING (
        warehouse_id IN (
            SELECT id FROM warehouses 
            WHERE organization_id = get_user_organization_id()
        )
        AND product_id IN (
            SELECT id FROM products 
            WHERE organization_id = get_user_organization_id()
        )
    );

-- Stock movements policies
CREATE POLICY "Users can view stock movements in their organization"
    ON stock_movements FOR SELECT
    USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create stock movements in their organization"
    ON stock_movements FOR INSERT
    WITH CHECK (
        organization_id = get_user_organization_id()
        AND (
            from_warehouse_id IS NULL 
            OR from_warehouse_id IN (
                SELECT id FROM warehouses 
                WHERE organization_id = get_user_organization_id()
            )
        )
        AND (
            to_warehouse_id IS NULL 
            OR to_warehouse_id IN (
                SELECT id FROM warehouses 
                WHERE organization_id = get_user_organization_id()
            )
        )
        AND product_id IN (
            SELECT id FROM products 
            WHERE organization_id = get_user_organization_id()
        )
    );

-- Purchase orders policies
CREATE POLICY "Users can view purchase orders in their organization"
    ON purchase_orders FOR SELECT
    USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create purchase orders in their organization"
    ON purchase_orders FOR INSERT
    WITH CHECK (
        organization_id = get_user_organization_id()
        AND supplier_id IN (
            SELECT id FROM suppliers 
            WHERE organization_id = get_user_organization_id()
        )
        AND warehouse_id IN (
            SELECT id FROM warehouses 
            WHERE organization_id = get_user_organization_id()
        )
    );

CREATE POLICY "Users can update purchase orders in their organization"
    ON purchase_orders FOR UPDATE
    USING (organization_id = get_user_organization_id())
    WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete purchase orders in their organization"
    ON purchase_orders FOR DELETE
    USING (organization_id = get_user_organization_id());

-- Purchase order items policies (inherit from purchase order)
CREATE POLICY "Users can view purchase order items"
    ON purchase_order_items FOR SELECT
    USING (
        order_id IN (
            SELECT id FROM purchase_orders 
            WHERE organization_id = get_user_organization_id()
        )
    );

CREATE POLICY "Users can manage purchase order items"
    ON purchase_order_items FOR ALL
    USING (
        order_id IN (
            SELECT id FROM purchase_orders 
            WHERE organization_id = get_user_organization_id()
        )
    );

-- Stock alerts policies
CREATE POLICY "Users can view stock alerts in their organization"
    ON stock_alerts FOR SELECT
    USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can manage stock alerts in their organization"
    ON stock_alerts FOR ALL
    USING (organization_id = get_user_organization_id())
    WITH CHECK (organization_id = get_user_organization_id());

-- Alert thresholds policies
CREATE POLICY "Users can view alert thresholds in their organization"
    ON alert_thresholds FOR SELECT
    USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can manage alert thresholds in their organization"
    ON alert_thresholds FOR ALL
    USING (organization_id = get_user_organization_id())
    WITH CHECK (organization_id = get_user_organization_id());

-- Grant permissions to authenticated users
GRANT ALL ON warehouses TO authenticated;
GRANT ALL ON warehouse_zones TO authenticated;
GRANT ALL ON warehouse_positions TO authenticated;
GRANT ALL ON products TO authenticated;
GRANT ALL ON suppliers TO authenticated;
GRANT ALL ON supplier_products TO authenticated;
GRANT ALL ON stock_levels TO authenticated;
GRANT ALL ON stock_movements TO authenticated;
GRANT ALL ON purchase_orders TO authenticated;
GRANT ALL ON purchase_order_items TO authenticated;
GRANT ALL ON stock_alerts TO authenticated;
GRANT ALL ON alert_thresholds TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;