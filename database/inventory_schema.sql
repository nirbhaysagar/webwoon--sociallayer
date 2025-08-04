-- Inventory Management Database Schema
-- This schema provides comprehensive inventory tracking and management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Inventory Table (Main stock tracking)
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    quantity_available INTEGER DEFAULT 0,
    quantity_reserved INTEGER DEFAULT 0,
    quantity_on_hold INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    reorder_point INTEGER DEFAULT 5,
    reorder_quantity INTEGER DEFAULT 50,
    unit_cost DECIMAL(10,2) DEFAULT 0,
    last_restock_date TIMESTAMP WITH TIME ZONE,
    next_restock_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, seller_id)
);

-- Product Variants Table (for size, color, style variations)
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    variant_name VARCHAR(100) NOT NULL, -- e.g., "Size", "Color"
    variant_value VARCHAR(100) NOT NULL, -- e.g., "Large", "Red"
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    quantity_available INTEGER DEFAULT 0,
    quantity_reserved INTEGER DEFAULT 0,
    unit_cost DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    website VARCHAR(255),
    payment_terms VARCHAR(100),
    lead_time_days INTEGER DEFAULT 7,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product-Supplier Relationships
CREATE TABLE IF NOT EXISTS product_suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    supplier_product_code VARCHAR(100),
    unit_cost DECIMAL(10,2),
    minimum_order_quantity INTEGER DEFAULT 1,
    lead_time_days INTEGER,
    is_preferred BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, supplier_id)
);

-- Inventory History Table (Track all stock movements)
CREATE TABLE IF NOT EXISTS inventory_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- 'restock', 'sale', 'adjustment', 'reservation', 'hold'
    quantity_change INTEGER NOT NULL, -- positive for additions, negative for reductions
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    reference_type VARCHAR(50), -- 'order', 'manual', 'system', 'supplier'
    reference_id VARCHAR(100), -- order_id, user_id, etc.
    notes TEXT,
    performed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent', 'confirmed', 'received', 'cancelled'
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expected_delivery_date TIMESTAMP WITH TIME ZONE,
    actual_delivery_date TIMESTAMP WITH TIME ZONE,
    total_amount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Order Items
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity_ordered INTEGER NOT NULL,
    quantity_received INTEGER DEFAULT 0,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Alerts Table
CREATE TABLE IF NOT EXISTS stock_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'low_stock', 'out_of_stock', 'reorder_point'
    alert_level VARCHAR(50) NOT NULL, -- 'warning', 'critical', 'info'
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Settings Table
CREATE TABLE IF NOT EXISTS inventory_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    default_low_stock_threshold INTEGER DEFAULT 10,
    default_reorder_point INTEGER DEFAULT 5,
    default_reorder_quantity INTEGER DEFAULT 50,
    enable_auto_reorder BOOLEAN DEFAULT FALSE,
    enable_stock_alerts BOOLEAN DEFAULT TRUE,
    alert_email VARCHAR(255),
    alert_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(seller_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_seller_id ON inventory(seller_id);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory(quantity_available);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

CREATE INDEX IF NOT EXISTS idx_suppliers_seller_id ON suppliers(seller_id);

CREATE INDEX IF NOT EXISTS idx_product_suppliers_product_id ON product_suppliers(product_id);
CREATE INDEX IF NOT EXISTS idx_product_suppliers_supplier_id ON product_suppliers(supplier_id);

CREATE INDEX IF NOT EXISTS idx_inventory_history_inventory_id ON inventory_history(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_history_product_id ON inventory_history(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_history_action_type ON inventory_history(action_type);
CREATE INDEX IF NOT EXISTS idx_inventory_history_created_at ON inventory_history(created_at);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_seller_id ON purchase_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);

CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_id ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_product_id ON purchase_order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_stock_alerts_seller_id ON stock_alerts(seller_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_product_id ON stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_is_read ON stock_alerts(is_read);

-- Row Level Security (RLS) Policies

-- Inventory RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view their own inventory" ON inventory
    FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert their own inventory" ON inventory
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own inventory" ON inventory
    FOR UPDATE USING (auth.uid() = seller_id);

-- Product Variants RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view their own product variants" ON product_variants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products p 
            WHERE p.id = product_variants.product_id 
            AND p.seller_id = auth.uid()
        )
    );

CREATE POLICY "Sellers can insert their own product variants" ON product_variants
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM products p 
            WHERE p.id = product_variants.product_id 
            AND p.seller_id = auth.uid()
        )
    );

-- Suppliers RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view their own suppliers" ON suppliers
    FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert their own suppliers" ON suppliers
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own suppliers" ON suppliers
    FOR UPDATE USING (auth.uid() = seller_id);

-- Product Suppliers RLS
ALTER TABLE product_suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view their own product suppliers" ON product_suppliers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products p 
            WHERE p.id = product_suppliers.product_id 
            AND p.seller_id = auth.uid()
        )
    );

-- Inventory History RLS
ALTER TABLE inventory_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view their own inventory history" ON inventory_history
    FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert their own inventory history" ON inventory_history
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Purchase Orders RLS
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view their own purchase orders" ON purchase_orders
    FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert their own purchase orders" ON purchase_orders
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own purchase orders" ON purchase_orders
    FOR UPDATE USING (auth.uid() = seller_id);

-- Purchase Order Items RLS
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view their own purchase order items" ON purchase_order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM purchase_orders po 
            WHERE po.id = purchase_order_items.purchase_order_id 
            AND po.seller_id = auth.uid()
        )
    );

-- Stock Alerts RLS
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view their own stock alerts" ON stock_alerts
    FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert their own stock alerts" ON stock_alerts
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own stock alerts" ON stock_alerts
    FOR UPDATE USING (auth.uid() = seller_id);

-- Inventory Settings RLS
ALTER TABLE inventory_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view their own inventory settings" ON inventory_settings
    FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert their own inventory settings" ON inventory_settings
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own inventory settings" ON inventory_settings
    FOR UPDATE USING (auth.uid() = seller_id);

-- Functions for Inventory Management

-- Function to update inventory quantity
CREATE OR REPLACE FUNCTION update_inventory_quantity(
    p_product_id BIGINT,
    p_seller_id UUID,
    p_quantity_change INTEGER,
    p_action_type VARCHAR(50),
    p_reference_type VARCHAR(50) DEFAULT NULL,
    p_reference_id VARCHAR(100) DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_inventory_id UUID;
    v_quantity_before INTEGER;
    v_quantity_after INTEGER;
    v_low_stock_threshold INTEGER;
    v_reorder_point INTEGER;
BEGIN
    -- Get or create inventory record
    SELECT id, quantity_available, low_stock_threshold, reorder_point
    INTO v_inventory_id, v_quantity_before, v_low_stock_threshold, v_reorder_point
    FROM inventory
    WHERE product_id = p_product_id AND seller_id = p_seller_id;

    -- Create inventory record if it doesn't exist
    IF v_inventory_id IS NULL THEN
        INSERT INTO inventory (product_id, seller_id, quantity_available)
        VALUES (p_product_id, p_seller_id, GREATEST(0, p_quantity_change))
        RETURNING id, quantity_available INTO v_inventory_id, v_quantity_after;
        
        v_quantity_before := 0;
    ELSE
        -- Update existing inventory
        UPDATE inventory
        SET 
            quantity_available = GREATEST(0, quantity_available + p_quantity_change),
            updated_at = NOW()
        WHERE id = v_inventory_id
        RETURNING quantity_available INTO v_quantity_after;
    END IF;

    -- Record inventory history
    INSERT INTO inventory_history (
        inventory_id,
        product_id,
        seller_id,
        action_type,
        quantity_change,
        quantity_before,
        quantity_after,
        reference_type,
        reference_id,
        notes,
        performed_by
    ) VALUES (
        v_inventory_id,
        p_product_id,
        p_seller_id,
        p_action_type,
        p_quantity_change,
        v_quantity_before,
        v_quantity_after,
        p_reference_type,
        p_reference_id,
        p_notes,
        auth.uid()
    );

    -- Check for low stock alerts
    IF v_quantity_after <= v_low_stock_threshold AND v_quantity_after > 0 THEN
        INSERT INTO stock_alerts (seller_id, product_id, alert_type, alert_level, message)
        VALUES (p_seller_id, p_product_id, 'low_stock', 'warning', 
                'Product is running low on stock. Current quantity: ' || v_quantity_after);
    END IF;

    -- Check for out of stock alerts
    IF v_quantity_after = 0 THEN
        INSERT INTO stock_alerts (seller_id, product_id, alert_type, alert_level, message)
        VALUES (p_seller_id, p_product_id, 'out_of_stock', 'critical', 
                'Product is out of stock!');
    END IF;

    -- Check for reorder point alerts
    IF v_quantity_after <= v_reorder_point AND v_quantity_after > 0 THEN
        INSERT INTO stock_alerts (seller_id, product_id, alert_type, alert_level, message)
        VALUES (p_seller_id, p_product_id, 'reorder_point', 'info', 
                'Product has reached reorder point. Consider restocking.');
    END IF;

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to generate purchase order number
CREATE OR REPLACE FUNCTION generate_purchase_order_number()
RETURNS VARCHAR(100) AS $$
DECLARE
    v_next_number INTEGER;
    v_order_number VARCHAR(100);
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 4) AS INTEGER)), 0) + 1
    INTO v_next_number
    FROM purchase_orders;
    
    v_order_number := 'PO-' || LPAD(v_next_number::TEXT, 6, '0');
    RETURN v_order_number;
END;
$$ LANGUAGE plpgsql;

-- Function to get inventory summary for seller
CREATE OR REPLACE FUNCTION get_inventory_summary(p_seller_id UUID)
RETURNS TABLE (
    total_products INTEGER,
    low_stock_count INTEGER,
    out_of_stock_count INTEGER,
    total_value DECIMAL,
    alerts_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT i.product_id)::INTEGER as total_products,
        COUNT(CASE WHEN i.quantity_available <= i.low_stock_threshold AND i.quantity_available > 0 THEN 1 END)::INTEGER as low_stock_count,
        COUNT(CASE WHEN i.quantity_available = 0 THEN 1 END)::INTEGER as out_of_stock_count,
        COALESCE(SUM(i.quantity_available * i.unit_cost), 0)::DECIMAL as total_value,
        COUNT(CASE WHEN sa.is_read = FALSE THEN 1 END)::INTEGER as alerts_count
    FROM inventory i
    LEFT JOIN stock_alerts sa ON i.product_id = sa.product_id AND sa.seller_id = p_seller_id
    WHERE i.seller_id = p_seller_id AND i.is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic updates

-- Trigger to update inventory when orders are placed
CREATE OR REPLACE FUNCTION trigger_update_inventory_on_order()
RETURNS TRIGGER AS $$
BEGIN
    -- This would be called when orders are created
    -- For now, it's a placeholder for future implementation
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_inventory_updated_at
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_product_variants_updated_at
    BEFORE UPDATE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_purchase_orders_updated_at
    BEFORE UPDATE ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 