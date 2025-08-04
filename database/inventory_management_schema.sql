-- Inventory Management Database Schema
-- Critical for e-commerce operations

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Inventory Management Tables

-- Main inventory table
CREATE TABLE inventory (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100),
    quantity_available INTEGER NOT NULL DEFAULT 0,
    quantity_reserved INTEGER NOT NULL DEFAULT 0,
    quantity_on_order INTEGER NOT NULL DEFAULT 0,
    quantity_damaged INTEGER NOT NULL DEFAULT 0,
    quantity_lost INTEGER NOT NULL DEFAULT 0,
    minimum_stock_level INTEGER NOT NULL DEFAULT 10,
    maximum_stock_level INTEGER NOT NULL DEFAULT 1000,
    reorder_point INTEGER NOT NULL DEFAULT 20,
    reorder_quantity INTEGER NOT NULL DEFAULT 50,
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    supplier_id BIGINT,
    supplier_name VARCHAR(255),
    supplier_sku VARCHAR(100),
    location_id BIGINT,
    location_name VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory locations (warehouses, stores, etc.)
CREATE TABLE inventory_locations (
    id BIGSERIAL PRIMARY KEY,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    is_primary BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory transactions (movements, adjustments, etc.)
CREATE TABLE inventory_transactions (
    id BIGSERIAL PRIMARY KEY,
    inventory_id BIGINT REFERENCES inventory(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- 'purchase', 'sale', 'adjustment', 'transfer', 'damage', 'loss'
    quantity_change INTEGER NOT NULL,
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    reference_type VARCHAR(50), -- 'order', 'purchase_order', 'adjustment', 'transfer'
    reference_id BIGINT,
    notes TEXT,
    performed_by UUID REFERENCES auth.users(id),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory adjustments (manual corrections)
CREATE TABLE inventory_adjustments (
    id BIGSERIAL PRIMARY KEY,
    inventory_id BIGINT REFERENCES inventory(id) ON DELETE CASCADE,
    adjustment_type VARCHAR(50) NOT NULL, -- 'correction', 'damage', 'loss', 'found'
    quantity_adjusted INTEGER NOT NULL,
    reason TEXT NOT NULL,
    adjusted_by UUID REFERENCES auth.users(id),
    adjustment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase orders for inventory
CREATE TABLE purchase_orders (
    id BIGSERIAL PRIMARY KEY,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    supplier_id BIGINT,
    supplier_name VARCHAR(255),
    po_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'confirmed', 'received', 'cancelled'
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase order items
CREATE TABLE purchase_order_items (
    id BIGSERIAL PRIMARY KEY,
    purchase_order_id BIGINT REFERENCES purchase_orders(id) ON DELETE CASCADE,
    inventory_id BIGINT REFERENCES inventory(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    quantity_ordered INTEGER NOT NULL,
    quantity_received INTEGER NOT NULL DEFAULT 0,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(12,2) NOT NULL,
    supplier_sku VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory alerts and notifications
CREATE TABLE inventory_alerts (
    id BIGSERIAL PRIMARY KEY,
    inventory_id BIGINT REFERENCES inventory(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'low_stock', 'out_of_stock', 'overstock', 'expiring', 'damaged'
    alert_level VARCHAR(20) NOT NULL, -- 'info', 'warning', 'critical'
    message TEXT NOT NULL,
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory analytics and reporting
CREATE TABLE inventory_analytics (
    id BIGSERIAL PRIMARY KEY,
    inventory_id BIGINT REFERENCES inventory(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    beginning_quantity INTEGER NOT NULL,
    ending_quantity INTEGER NOT NULL,
    quantity_sold INTEGER NOT NULL DEFAULT 0,
    quantity_received INTEGER NOT NULL DEFAULT 0,
    quantity_adjusted INTEGER NOT NULL DEFAULT 0,
    revenue DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    cost_of_goods DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    gross_profit DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    turnover_rate DECIMAL(5,2),
    days_of_inventory INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory settings and preferences
CREATE TABLE inventory_settings (
    id BIGSERIAL PRIMARY KEY,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) NOT NULL DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(seller_id, setting_key)
);

-- Indexes for performance
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_seller_id ON inventory(seller_id);
CREATE INDEX idx_inventory_sku ON inventory(sku);
CREATE INDEX idx_inventory_quantity_available ON inventory(quantity_available);
CREATE INDEX idx_inventory_transactions_inventory_id ON inventory_transactions(inventory_id);
CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_inventory_transactions_date ON inventory_transactions(transaction_date);
CREATE INDEX idx_purchase_orders_seller_id ON purchase_orders(seller_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_inventory_alerts_inventory_id ON inventory_alerts(inventory_id);
CREATE INDEX idx_inventory_alerts_type ON inventory_alerts(alert_type);
CREATE INDEX idx_inventory_alerts_resolved ON inventory_alerts(is_resolved);
CREATE INDEX idx_inventory_analytics_inventory_id ON inventory_analytics(inventory_id);
CREATE INDEX idx_inventory_analytics_date ON inventory_analytics(date);

-- Functions for inventory management

-- Function to update inventory quantities
CREATE OR REPLACE FUNCTION update_inventory_quantity(
    p_inventory_id BIGINT,
    p_quantity_change INTEGER,
    p_transaction_type VARCHAR(50),
    p_reference_type VARCHAR(50) DEFAULT NULL,
    p_reference_id BIGINT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_performed_by UUID DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    v_transaction_id BIGINT;
    v_quantity_before INTEGER;
    v_quantity_after INTEGER;
    v_current_quantity INTEGER;
BEGIN
    -- Get current quantity
    SELECT quantity_available INTO v_current_quantity
    FROM inventory WHERE id = p_inventory_id;
    
    IF v_current_quantity IS NULL THEN
        RAISE EXCEPTION 'Inventory record not found';
    END IF;
    
    v_quantity_before := v_current_quantity;
    v_quantity_after := v_current_quantity + p_quantity_change;
    
    -- Update inventory quantity
    UPDATE inventory 
    SET quantity_available = v_quantity_after,
        last_updated = NOW(),
        updated_at = NOW()
    WHERE id = p_inventory_id;
    
    -- Create transaction record
    INSERT INTO inventory_transactions (
        inventory_id, transaction_type, quantity_change,
        quantity_before, quantity_after, reference_type,
        reference_id, notes, performed_by
    ) VALUES (
        p_inventory_id, p_transaction_type, p_quantity_change,
        v_quantity_before, v_quantity_after, p_reference_type,
        p_reference_id, p_notes, p_performed_by
    ) RETURNING id INTO v_transaction_id;
    
    -- Check for low stock alerts
    PERFORM check_inventory_alerts(p_inventory_id);
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check and create inventory alerts
CREATE OR REPLACE FUNCTION check_inventory_alerts(p_inventory_id BIGINT)
RETURNS VOID AS $$
DECLARE
    v_inventory RECORD;
    v_alert_message TEXT;
BEGIN
    SELECT * INTO v_inventory FROM inventory WHERE id = p_inventory_id;
    
    -- Check for out of stock
    IF v_inventory.quantity_available <= 0 THEN
        v_alert_message := 'Product is out of stock. SKU: ' || v_inventory.sku;
        
        INSERT INTO inventory_alerts (inventory_id, alert_type, alert_level, message)
        VALUES (p_inventory_id, 'out_of_stock', 'critical', v_alert_message)
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Check for low stock
    IF v_inventory.quantity_available <= v_inventory.reorder_point AND v_inventory.quantity_available > 0 THEN
        v_alert_message := 'Low stock alert. Current quantity: ' || v_inventory.quantity_available || 
                          ', Reorder point: ' || v_inventory.reorder_point || ', SKU: ' || v_inventory.sku;
        
        INSERT INTO inventory_alerts (inventory_id, alert_type, alert_level, message)
        VALUES (p_inventory_id, 'low_stock', 'warning', v_alert_message)
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Check for overstock
    IF v_inventory.quantity_available > v_inventory.maximum_stock_level THEN
        v_alert_message := 'Overstock alert. Current quantity: ' || v_inventory.quantity_available || 
                          ', Max level: ' || v_inventory.maximum_stock_level || ', SKU: ' || v_inventory.sku;
        
        INSERT INTO inventory_alerts (inventory_id, alert_type, alert_level, message)
        VALUES (p_inventory_id, 'overstock', 'warning', v_alert_message)
        ON CONFLICT DO NOTHING;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate inventory turnover
CREATE OR REPLACE FUNCTION calculate_inventory_turnover(p_inventory_id BIGINT, p_days INTEGER DEFAULT 30)
RETURNS DECIMAL AS $$
DECLARE
    v_avg_inventory DECIMAL;
    v_total_sold INTEGER;
    v_turnover DECIMAL;
BEGIN
    -- Calculate average inventory
    SELECT AVG(ending_quantity) INTO v_avg_inventory
    FROM inventory_analytics 
    WHERE inventory_id = p_inventory_id 
    AND date >= CURRENT_DATE - p_days;
    
    -- Calculate total sold
    SELECT COALESCE(SUM(quantity_sold), 0) INTO v_total_sold
    FROM inventory_analytics 
    WHERE inventory_id = p_inventory_id 
    AND date >= CURRENT_DATE - p_days;
    
    IF v_avg_inventory > 0 THEN
        v_turnover := v_total_sold / v_avg_inventory;
    ELSE
        v_turnover := 0;
    END IF;
    
    RETURN v_turnover;
END;
$$ LANGUAGE plpgsql;

-- Function to get inventory summary
CREATE OR REPLACE FUNCTION get_inventory_summary(p_seller_id UUID)
RETURNS TABLE (
    total_products INTEGER,
    total_quantity INTEGER,
    total_value DECIMAL,
    low_stock_count INTEGER,
    out_of_stock_count INTEGER,
    total_alerts INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_products,
        COALESCE(SUM(quantity_available), 0)::INTEGER as total_quantity,
        COALESCE(SUM(quantity_available * unit_cost), 0.00) as total_value,
        COUNT(CASE WHEN quantity_available <= reorder_point AND quantity_available > 0 THEN 1 END)::INTEGER as low_stock_count,
        COUNT(CASE WHEN quantity_available <= 0 THEN 1 END)::INTEGER as out_of_stock_count,
        (SELECT COUNT(*) FROM inventory_alerts ia 
         JOIN inventory i ON ia.inventory_id = i.id 
         WHERE i.seller_id = p_seller_id AND ia.is_resolved = false)::INTEGER as total_alerts
    FROM inventory 
    WHERE seller_id = p_seller_id AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Views for easy querying

-- Inventory overview view
CREATE VIEW inventory_overview AS
SELECT 
    i.id,
    i.sku,
    p.name as product_name,
    p.description as product_description,
    i.quantity_available,
    i.quantity_reserved,
    i.quantity_on_order,
    i.minimum_stock_level,
    i.reorder_point,
    i.unit_cost,
    i.unit_price,
    i.supplier_name,
    i.location_name,
    CASE 
        WHEN i.quantity_available <= 0 THEN 'Out of Stock'
        WHEN i.quantity_available <= i.reorder_point THEN 'Low Stock'
        WHEN i.quantity_available > i.maximum_stock_level THEN 'Overstock'
        ELSE 'Normal'
    END as stock_status,
    i.last_updated,
    i.created_at
FROM inventory i
JOIN products p ON i.product_id = p.id
WHERE i.is_active = true;

-- Low stock alerts view
CREATE VIEW low_stock_alerts AS
SELECT 
    i.id,
    i.sku,
    p.name as product_name,
    i.quantity_available,
    i.reorder_point,
    i.reorder_quantity,
    i.supplier_name,
    (i.reorder_point - i.quantity_available) as quantity_needed
FROM inventory i
JOIN products p ON i.product_id = p.id
WHERE i.quantity_available <= i.reorder_point 
AND i.quantity_available > 0
AND i.is_active = true;

-- Inventory transactions view
CREATE VIEW inventory_transactions_view AS
SELECT 
    it.id,
    i.sku,
    p.name as product_name,
    it.transaction_type,
    it.quantity_change,
    it.quantity_before,
    it.quantity_after,
    it.reference_type,
    it.reference_id,
    it.notes,
    u.name as performed_by_name,
    it.transaction_date
FROM inventory_transactions it
JOIN inventory i ON it.inventory_id = i.id
JOIN products p ON i.product_id = p.id
LEFT JOIN auth.users u ON it.performed_by = u.id
ORDER BY it.transaction_date DESC;

-- RLS Policies
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_settings ENABLE ROW LEVEL SECURITY;

-- Inventory policies
CREATE POLICY "Users can view their own inventory" ON inventory
    FOR SELECT USING (seller_id = auth.uid());

CREATE POLICY "Users can insert their own inventory" ON inventory
    FOR INSERT WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Users can update their own inventory" ON inventory
    FOR UPDATE USING (seller_id = auth.uid());

-- Sample data (commented out for production)
/*
INSERT INTO inventory_locations (seller_id, name, address, city, state, country, is_primary) VALUES
('your-user-uuid-here', 'Main Warehouse', '123 Commerce St', 'New York', 'NY', 'USA', true),
('your-user-uuid-here', 'Secondary Warehouse', '456 Industrial Ave', 'Los Angeles', 'CA', 'USA', false);

INSERT INTO inventory (product_id, seller_id, sku, quantity_available, minimum_stock_level, reorder_point, unit_cost, unit_price, supplier_name, location_name) VALUES
(1, 'your-user-uuid-here', 'PROD-001', 50, 10, 20, 15.00, 29.99, 'Supplier A', 'Main Warehouse'),
(2, 'your-user-uuid-here', 'PROD-002', 25, 5, 15, 8.50, 19.99, 'Supplier B', 'Main Warehouse'),
(3, 'your-user-uuid-here', 'PROD-003', 0, 10, 20, 12.00, 24.99, 'Supplier C', 'Secondary Warehouse');
*/ 