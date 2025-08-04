-- Store Integration Database Schema
-- This file contains all tables needed for the store integration system

-- 1. Store Connections Table
CREATE TABLE IF NOT EXISTS store_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_type VARCHAR(50) NOT NULL, -- 'shopify', 'woocommerce', 'custom', etc.
  store_name VARCHAR(255),
  store_domain VARCHAR(255),
  connection_status VARCHAR(20) DEFAULT 'connecting', -- 'connected', 'error', 'disconnected'
  credentials JSONB, -- Encrypted API keys, tokens, etc.
  settings JSONB, -- Sync settings, field mappings, etc.
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status VARCHAR(20) DEFAULT 'idle', -- 'idle', 'syncing', 'error'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Sync History Table
CREATE TABLE IF NOT EXISTS sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_connection_id UUID REFERENCES store_connections(id) ON DELETE CASCADE,
  sync_type VARCHAR(50), -- 'products', 'orders', 'customers', 'inventory'
  status VARCHAR(20), -- 'success', 'error', 'partial'
  items_synced INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 3. Platform Configurations Table
CREATE TABLE IF NOT EXISTS platform_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_type VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  description TEXT,
  api_fields JSONB, -- Required API fields for each platform
  supported_features JSONB, -- What features this platform supports
  auth_method VARCHAR(50), -- 'oauth', 'api_key', 'custom'
  base_url VARCHAR(255),
  webhook_support BOOLEAN DEFAULT false,
  rate_limits JSONB, -- API rate limits
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Synced Products Table (to track products from external stores)
CREATE TABLE IF NOT EXISTS synced_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  store_connection_id UUID REFERENCES store_connections(id) ON DELETE CASCADE,
  platform_product_id VARCHAR(255), -- External platform's product ID
  platform_type VARCHAR(50),
  name VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2),
  sku VARCHAR(100),
  inventory_quantity INTEGER DEFAULT 0,
  images JSONB, -- Array of image URLs
  status VARCHAR(20) DEFAULT 'active',
  metadata JSONB, -- Additional platform-specific data
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Synced Orders Table
CREATE TABLE IF NOT EXISTS synced_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  store_connection_id UUID REFERENCES store_connections(id) ON DELETE CASCADE,
  platform_order_id VARCHAR(255),
  platform_type VARCHAR(50),
  order_number VARCHAR(100),
  customer_email VARCHAR(255),
  total_amount DECIMAL(10,2),
  currency VARCHAR(10),
  status VARCHAR(50),
  order_date TIMESTAMP WITH TIME ZONE,
  items JSONB, -- Order items array
  shipping_address JSONB,
  billing_address JSONB,
  metadata JSONB,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_store_connections_user_id ON store_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_store_connections_platform ON store_connections(platform_type);
CREATE INDEX IF NOT EXISTS idx_sync_history_connection ON sync_history(store_connection_id);
CREATE INDEX IF NOT EXISTS idx_synced_products_user_id ON synced_products(user_id);
CREATE INDEX IF NOT EXISTS idx_synced_products_platform_id ON synced_products(platform_product_id);
CREATE INDEX IF NOT EXISTS idx_synced_orders_user_id ON synced_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_synced_orders_platform_id ON synced_orders(platform_order_id);

-- RLS Policies
ALTER TABLE store_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE synced_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE synced_orders ENABLE ROW LEVEL SECURITY;

-- Store Connections RLS
CREATE POLICY "Users can manage their own store connections" 
  ON store_connections FOR ALL USING (auth.uid() = user_id);

-- Sync History RLS
CREATE POLICY "Users can view their own sync history" 
  ON sync_history FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM store_connections 
      WHERE store_connections.id = sync_history.store_connection_id 
      AND store_connections.user_id = auth.uid()
    )
  );

-- Synced Products RLS
CREATE POLICY "Users can manage their own synced products" 
  ON synced_products FOR ALL USING (auth.uid() = user_id);

-- Synced Orders RLS
CREATE POLICY "Users can manage their own synced orders" 
  ON synced_orders FOR ALL USING (auth.uid() = user_id);

-- Insert default platform configurations
INSERT INTO platform_configs (platform_type, display_name, description, api_fields, supported_features, auth_method, base_url, webhook_support, rate_limits) VALUES
('shopify', 'Shopify', 'Connect your Shopify store to sync products and orders', 
 '{"shop": "string", "accessToken": "string"}',
 '{"products": true, "orders": true, "customers": true, "inventory": true}',
 'oauth',
 'https://{shop}.myshopify.com',
 true,
 '{"requests_per_minute": 40}'),

('woocommerce', 'WooCommerce', 'Connect your WooCommerce store to sync products and orders',
 '{"site_url": "string", "consumer_key": "string", "consumer_secret": "string"}',
 '{"products": true, "orders": true, "customers": true, "inventory": true}',
 'api_key',
 'https://{site_url}/wp-json/wc/v3',
 true,
 '{"requests_per_minute": 30}'),

('magento', 'Magento', 'Connect your Magento store to sync products and orders',
 '{"base_url": "string", "access_token": "string"}',
 '{"products": true, "orders": true, "customers": true, "inventory": true}',
 'api_key',
 'https://{base_url}/rest/V1',
 false,
 '{"requests_per_minute": 20}'),

('custom', 'Custom Platform', 'Connect any custom e-commerce platform',
 '{"base_url": "string", "api_key": "string", "api_secret": "string"}',
 '{"products": true, "orders": true, "customers": false, "inventory": true}',
 'api_key',
 'https://{base_url}/api',
 false,
 '{"requests_per_minute": 10}')
ON CONFLICT (platform_type) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_store_connections_updated_at BEFORE UPDATE ON store_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_synced_products_updated_at BEFORE UPDATE ON synced_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_synced_orders_updated_at BEFORE UPDATE ON synced_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 