-- Order Management Schema
-- This schema provides comprehensive order management functionality

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id BIGSERIAL PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    
    -- Financial information
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Addresses
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    
    -- Payment information
    payment_method JSONB NOT NULL,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_intent_id TEXT,
    
    -- Shipping information
    tracking_number TEXT,
    carrier TEXT,
    estimated_delivery DATE,
    actual_delivery DATE,
    
    -- Additional information
    notes TEXT,
    customer_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id BIGINT REFERENCES public.product_variants(id) ON DELETE SET NULL,
    
    -- Item details
    product_name TEXT NOT NULL,
    product_sku TEXT,
    variant_name TEXT,
    
    -- Pricing
    unit_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Additional information
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order tracking events table
CREATE TABLE IF NOT EXISTS public.order_tracking_events (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES public.orders(id) ON DELETE CASCADE,
    
    -- Event details
    event_type TEXT NOT NULL,
    status TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    
    -- Timestamps
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order history table for status changes
CREATE TABLE IF NOT EXISTS public.order_history (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Change details
    previous_status TEXT,
    new_status TEXT NOT NULL,
    change_reason TEXT,
    
    -- Additional data
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order returns table
CREATE TABLE IF NOT EXISTS public.order_returns (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Return details
    return_reason TEXT NOT NULL,
    return_type TEXT DEFAULT 'refund' CHECK (return_type IN ('refund', 'exchange', 'store_credit')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    
    -- Items being returned
    return_items JSONB NOT NULL,
    
    -- Refund information
    refund_amount DECIMAL(10,2),
    refund_method TEXT,
    refund_reference TEXT,
    
    -- Additional information
    notes TEXT,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON public.orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_order_tracking_events_order_id ON public.order_tracking_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_events_event_timestamp ON public.order_tracking_events(event_timestamp);

CREATE INDEX IF NOT EXISTS idx_order_history_order_id ON public.order_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_history_created_at ON public.order_history(created_at);

CREATE INDEX IF NOT EXISTS idx_order_returns_order_id ON public.order_returns(order_id);
CREATE INDEX IF NOT EXISTS idx_order_returns_user_id ON public.order_returns(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_returns ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON public.orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Store owners can view orders for their stores
CREATE POLICY "Store owners can view store orders" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.stores 
            WHERE stores.id = orders.store_id 
            AND stores.user_id = auth.uid()
        )
    );

CREATE POLICY "Store owners can update store orders" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.stores 
            WHERE stores.id = orders.store_id 
            AND stores.user_id = auth.uid()
        )
    );

-- Order items policies
CREATE POLICY "Users can view their order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Store owners can view store order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            JOIN public.stores ON stores.id = orders.store_id
            WHERE orders.id = order_items.order_id 
            AND stores.user_id = auth.uid()
        )
    );

-- Order tracking events policies
CREATE POLICY "Users can view their order tracking" ON public.order_tracking_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_tracking_events.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Store owners can view store order tracking" ON public.order_tracking_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            JOIN public.stores ON stores.id = orders.store_id
            WHERE orders.id = order_tracking_events.order_id 
            AND stores.user_id = auth.uid()
        )
    );

-- Order history policies
CREATE POLICY "Users can view their order history" ON public.order_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_history.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Store owners can view store order history" ON public.order_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            JOIN public.stores ON stores.id = orders.store_id
            WHERE orders.id = order_history.order_id 
            AND stores.user_id = auth.uid()
        )
    );

-- Order returns policies
CREATE POLICY "Users can view their own returns" ON public.order_returns
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own returns" ON public.order_returns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own returns" ON public.order_returns
    FOR UPDATE USING (auth.uid() = user_id);

-- Store owners can view returns for their stores
CREATE POLICY "Store owners can view store returns" ON public.order_returns
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            JOIN public.stores ON stores.id = orders.store_id
            WHERE orders.id = order_returns.order_id 
            AND stores.user_id = auth.uid()
        )
    );

-- Functions for order management

-- Function to update order status and add to history
CREATE OR REPLACE FUNCTION update_order_status(
    order_id BIGINT,
    new_status TEXT,
    change_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    current_status TEXT;
    current_user_id UUID;
BEGIN
    -- Get current status and user
    SELECT status, user_id INTO current_status, current_user_id
    FROM public.orders
    WHERE id = order_id;
    
    -- Update order status
    UPDATE public.orders
    SET status = new_status,
        updated_at = NOW()
    WHERE id = order_id;
    
    -- Add to history
    INSERT INTO public.order_history (
        order_id,
        user_id,
        previous_status,
        new_status,
        change_reason
    ) VALUES (
        order_id,
        current_user_id,
        current_status,
        new_status,
        change_reason
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add tracking event
CREATE OR REPLACE FUNCTION add_tracking_event(
    order_id BIGINT,
    event_type TEXT,
    status TEXT,
    title TEXT,
    description TEXT DEFAULT NULL,
    location TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.order_tracking_events (
        order_id,
        event_type,
        status,
        title,
        description,
        location
    ) VALUES (
        order_id,
        event_type,
        status,
        title,
        description,
        location
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate order totals
CREATE OR REPLACE FUNCTION calculate_order_totals(order_id BIGINT)
RETURNS VOID AS $$
DECLARE
    order_subtotal DECIMAL(10,2);
    order_shipping DECIMAL(10,2);
    order_tax DECIMAL(10,2);
    order_discount DECIMAL(10,2);
    order_total DECIMAL(10,2);
BEGIN
    -- Calculate subtotal from order items
    SELECT COALESCE(SUM(total_price), 0) INTO order_subtotal
    FROM public.order_items
    WHERE order_id = order_id;
    
    -- Get shipping cost
    SELECT shipping_cost INTO order_shipping
    FROM public.orders
    WHERE id = order_id;
    
    -- Calculate tax (8% for now)
    order_tax := order_subtotal * 0.08;
    
    -- Get discount
    SELECT discount_amount INTO order_discount
    FROM public.orders
    WHERE id = order_id;
    
    -- Calculate total
    order_total := order_subtotal + order_shipping + order_tax - order_discount;
    
    -- Update order
    UPDATE public.orders
    SET subtotal = order_subtotal,
        tax_amount = order_tax,
        total_amount = order_total,
        updated_at = NOW()
    WHERE id = order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get order statistics
CREATE OR REPLACE FUNCTION get_user_order_stats(user_uuid UUID)
RETURNS TABLE (
    total_orders BIGINT,
    total_spent DECIMAL(10,2),
    average_order_value DECIMAL(10,2),
    orders_by_status JSONB
) AS $$
DECLARE
    total_count BIGINT;
    total_amount DECIMAL(10,2);
    avg_amount DECIMAL(10,2);
    status_counts JSONB;
BEGIN
    -- Get total orders and amount
    SELECT COUNT(*), COALESCE(SUM(total_amount), 0)
    INTO total_count, total_amount
    FROM public.orders
    WHERE user_id = user_uuid;
    
    -- Calculate average
    avg_amount := CASE WHEN total_count > 0 THEN total_amount / total_count ELSE 0 END;
    
    -- Get counts by status
    SELECT jsonb_object_agg(status, count)
    INTO status_counts
    FROM (
        SELECT status, COUNT(*) as count
        FROM public.orders
        WHERE user_id = user_uuid
        GROUP BY status
    ) status_counts;
    
    RETURN QUERY SELECT total_count, total_amount, avg_amount, status_counts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers

-- Trigger to update order totals when items change
CREATE OR REPLACE FUNCTION trigger_calculate_order_totals()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculate_order_totals(COALESCE(NEW.order_id, OLD.order_id));
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_order_items_totals
    AFTER INSERT OR UPDATE OR DELETE ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_calculate_order_totals();

-- Trigger to add to history when order status changes
CREATE OR REPLACE FUNCTION trigger_order_status_history()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.order_history (
            order_id,
            user_id,
            previous_status,
            new_status
        ) VALUES (
            NEW.id,
            NEW.user_id,
            OLD.status,
            NEW.status
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_order_status_history
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_order_status_history();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_updated_at();

CREATE TRIGGER trigger_order_items_updated_at
    BEFORE UPDATE ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_updated_at();

CREATE TRIGGER trigger_order_returns_updated_at
    BEFORE UPDATE ON public.order_returns
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_updated_at();

-- Insert some sample data for testing
INSERT INTO public.orders (
    order_number,
    user_id,
    store_id,
    status,
    subtotal,
    shipping_cost,
    tax_amount,
    total_amount,
    shipping_address,
    payment_method
) VALUES 
(
    'ORD-2024-001',
    (SELECT id FROM public.users LIMIT 1),
    (SELECT id FROM public.stores LIMIT 1),
    'delivered',
    299.97,
    0.00,
    23.99,
    323.96,
    '{"name": "John Doe", "address": "123 Main St", "city": "New York", "state": "NY", "zip_code": "10001", "country": "USA"}',
    '{"type": "card", "last4": "4242"}'
),
(
    'ORD-2024-002',
    (SELECT id FROM public.users LIMIT 1),
    (SELECT id FROM public.stores LIMIT 1),
    'shipped',
    149.99,
    0.00,
    12.00,
    161.99,
    '{"name": "John Doe", "address": "123 Main St", "city": "New York", "state": "NY", "zip_code": "10001", "country": "USA"}',
    '{"type": "card", "last4": "4242"}'
),
(
    'ORD-2024-003',
    (SELECT id FROM public.users LIMIT 1),
    (SELECT id FROM public.stores LIMIT 1),
    'processing',
    79.99,
    0.00,
    6.40,
    86.39,
    '{"name": "John Doe", "address": "123 Main St", "city": "New York", "state": "NY", "zip_code": "10001", "country": "USA"}',
    '{"type": "card", "last4": "4242"}'
);

-- Insert sample order items
INSERT INTO public.order_items (
    order_id,
    product_id,
    product_name,
    unit_price,
    quantity,
    total_price
) VALUES 
(
    (SELECT id FROM public.orders WHERE order_number = 'ORD-2024-001'),
    (SELECT id FROM public.products LIMIT 1),
    'Premium Wireless Headphones',
    199.99,
    1,
    199.99
),
(
    (SELECT id FROM public.orders WHERE order_number = 'ORD-2024-001'),
    (SELECT id FROM public.products LIMIT 1 OFFSET 1),
    'Bluetooth Speaker',
    99.98,
    1,
    99.98
),
(
    (SELECT id FROM public.orders WHERE order_number = 'ORD-2024-002'),
    (SELECT id FROM public.products LIMIT 1 OFFSET 2),
    'Smart Watch',
    149.99,
    1,
    149.99
),
(
    (SELECT id FROM public.orders WHERE order_number = 'ORD-2024-003'),
    (SELECT id FROM public.products LIMIT 1 OFFSET 3),
    'Wireless Earbuds',
    79.99,
    1,
    79.99
);

-- Insert sample tracking events
INSERT INTO public.order_tracking_events (
    order_id,
    event_type,
    status,
    title,
    description,
    location
) VALUES 
(
    (SELECT id FROM public.orders WHERE order_number = 'ORD-2024-001'),
    'order_placed',
    'completed',
    'Order Placed',
    'Your order has been placed successfully',
    NULL
),
(
    (SELECT id FROM public.orders WHERE order_number = 'ORD-2024-001'),
    'order_confirmed',
    'completed',
    'Order Confirmed',
    'Your order has been confirmed and is being processed',
    NULL
),
(
    (SELECT id FROM public.orders WHERE order_number = 'ORD-2024-001'),
    'shipped',
    'completed',
    'Shipped',
    'Your package has been shipped',
    'New York, NY'
),
(
    (SELECT id FROM public.orders WHERE order_number = 'ORD-2024-001'),
    'delivered',
    'completed',
    'Delivered',
    'Your package has been delivered',
    'New York, NY'
),
(
    (SELECT id FROM public.orders WHERE order_number = 'ORD-2024-002'),
    'order_placed',
    'completed',
    'Order Placed',
    'Your order has been placed successfully',
    NULL
),
(
    (SELECT id FROM public.orders WHERE order_number = 'ORD-2024-002'),
    'shipped',
    'completed',
    'Shipped',
    'Your package has been shipped',
    'New York, NY'
),
(
    (SELECT id FROM public.orders WHERE order_number = 'ORD-2024-003'),
    'order_placed',
    'completed',
    'Order Placed',
    'Your order has been placed successfully',
    NULL
),
(
    (SELECT id FROM public.orders WHERE order_number = 'ORD-2024-003'),
    'processing',
    'current',
    'Processing',
    'Your order is being prepared for shipment',
    NULL
);

-- Update tracking numbers for shipped orders
UPDATE public.orders 
SET tracking_number = '1Z999AA1234567890',
    carrier = 'UPS',
    estimated_delivery = '2024-01-15'
WHERE order_number = 'ORD-2024-001';

UPDATE public.orders 
SET tracking_number = '1Z999AA1234567891',
    carrier = 'UPS',
    estimated_delivery = '2024-01-18'
WHERE order_number = 'ORD-2024-002';

-- Success message
SELECT 'Order management schema created successfully!' as message; 