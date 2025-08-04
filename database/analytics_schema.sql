-- Analytics Database Schema
-- This schema provides comprehensive analytics data storage and processing

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    platform VARCHAR(20) DEFAULT 'web',
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Sessions Table
CREATE TABLE IF NOT EXISTS analytics_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    page_views INTEGER DEFAULT 0,
    platform VARCHAR(20) DEFAULT 'web',
    user_agent TEXT,
    ip_address INET
);

-- Sales Analytics Table
CREATE TABLE IF NOT EXISTS sales_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    period_type VARCHAR(20) NOT NULL, -- 'day', 'week', 'month', 'year'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    unique_customers INTEGER DEFAULT 0,
    repeat_customers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(seller_id, period_type, period_start)
);

-- Product Analytics Table
CREATE TABLE IF NOT EXISTS product_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    period_type VARCHAR(20) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    views INTEGER DEFAULT 0,
    add_to_cart_count INTEGER DEFAULT 0,
    purchase_count INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, period_type, period_start)
);

-- Search Analytics Table
CREATE TABLE IF NOT EXISTS search_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    results_count INTEGER DEFAULT 0,
    clicked_result_id BIGINT,
    conversion_to_purchase BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id VARCHAR(255),
    filters JSONB
);

-- Notification Analytics Table
CREATE TABLE IF NOT EXISTS notification_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    action_taken VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page View Analytics Table
CREATE TABLE IF NOT EXISTS page_view_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    page_name VARCHAR(100) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_seconds INTEGER,
    referrer VARCHAR(255),
    user_agent TEXT
);

-- Real-time Analytics Cache Table
CREATE TABLE IF NOT EXISTS realtime_analytics_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value JSONB NOT NULL,
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

CREATE INDEX IF NOT EXISTS idx_sales_analytics_seller_id ON sales_analytics(seller_id);
CREATE INDEX IF NOT EXISTS idx_sales_analytics_period ON sales_analytics(period_type, period_start);

CREATE INDEX IF NOT EXISTS idx_product_analytics_product_id ON product_analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_seller_id ON product_analytics(seller_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_period ON product_analytics(period_type, period_start);

CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON search_analytics(query);
CREATE INDEX IF NOT EXISTS idx_search_analytics_timestamp ON search_analytics(timestamp);

CREATE INDEX IF NOT EXISTS idx_notification_analytics_user_id ON notification_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_analytics_type ON notification_analytics(notification_type);

CREATE INDEX IF NOT EXISTS idx_page_view_analytics_user_id ON page_view_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_page_view_analytics_page_name ON page_view_analytics(page_name);

-- Row Level Security (RLS) Policies

-- Analytics Events RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analytics events" ON analytics_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics events" ON analytics_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sales Analytics RLS
ALTER TABLE sales_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view their own sales analytics" ON sales_analytics
    FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert their own sales analytics" ON sales_analytics
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Product Analytics RLS
ALTER TABLE product_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view their own product analytics" ON product_analytics
    FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert their own product analytics" ON product_analytics
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Search Analytics RLS
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own search analytics" ON search_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search analytics" ON search_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notification Analytics RLS
ALTER TABLE notification_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification analytics" ON notification_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification analytics" ON notification_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Page View Analytics RLS
ALTER TABLE page_view_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own page view analytics" ON page_view_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own page view analytics" ON page_view_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for Analytics

-- Function to update sales analytics
CREATE OR REPLACE FUNCTION update_sales_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- This function would be called when orders are created/updated
    -- For now, it's a placeholder for future implementation
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get user engagement metrics
CREATE OR REPLACE FUNCTION get_user_engagement_metrics(
    p_user_id UUID,
    p_period_start TIMESTAMP WITH TIME ZONE,
    p_period_end TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    active_users INTEGER,
    session_duration_avg DECIMAL,
    page_views INTEGER,
    bounce_rate DECIMAL,
    retention_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT ae.user_id)::INTEGER as active_users,
        AVG(EXTRACT(EPOCH FROM (s.ended_at - s.started_at)))::DECIMAL as session_duration_avg,
        COUNT(pva.id)::INTEGER as page_views,
        0::DECIMAL as bounce_rate, -- Placeholder
        0::DECIMAL as retention_rate -- Placeholder
    FROM analytics_events ae
    LEFT JOIN analytics_sessions s ON ae.session_id = s.id
    LEFT JOIN page_view_analytics pva ON ae.user_id = pva.user_id
    WHERE ae.timestamp BETWEEN p_period_start AND p_period_end
    AND (p_user_id IS NULL OR ae.user_id = p_user_id);
END;
$$ LANGUAGE plpgsql;

-- Function to get popular search queries
CREATE OR REPLACE FUNCTION get_popular_search_queries(
    p_limit INTEGER DEFAULT 10,
    p_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '7 days'
)
RETURNS TABLE (
    query TEXT,
    count BIGINT,
    conversion_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sa.query,
        COUNT(*)::BIGINT as count,
        (COUNT(CASE WHEN sa.conversion_to_purchase THEN 1 END) * 100.0 / COUNT(*))::DECIMAL as conversion_rate
    FROM search_analytics sa
    WHERE sa.timestamp >= p_period_start
    GROUP BY sa.query
    ORDER BY count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic analytics updates
CREATE TRIGGER trigger_update_sales_analytics
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_sales_analytics();

-- Cleanup function for old analytics data
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data()
RETURNS VOID AS $$
BEGIN
    -- Delete events older than 1 year
    DELETE FROM analytics_events WHERE timestamp < NOW() - INTERVAL '1 year';
    
    -- Delete sessions older than 1 year
    DELETE FROM analytics_sessions WHERE started_at < NOW() - INTERVAL '1 year';
    
    -- Delete page views older than 1 year
    DELETE FROM page_view_analytics WHERE timestamp < NOW() - INTERVAL '1 year';
    
    -- Delete search analytics older than 6 months
    DELETE FROM search_analytics WHERE timestamp < NOW() - INTERVAL '6 months';
    
    -- Delete notification analytics older than 6 months
    DELETE FROM notification_analytics WHERE created_at < NOW() - INTERVAL '6 months';
    
    -- Delete expired cache entries
    DELETE FROM realtime_analytics_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup job (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-analytics', '0 2 * * *', 'SELECT cleanup_old_analytics_data();'); 