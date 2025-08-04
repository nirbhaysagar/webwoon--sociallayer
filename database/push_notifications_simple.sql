-- Push Notifications Database Schema - SIMPLIFIED WORKING VERSION
-- Supabase PostgreSQL Schema for complete push notification system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- PUSH NOTIFICATIONS SYSTEM
-- =============================================

-- Notification templates
CREATE TABLE IF NOT EXISTS public.notification_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    title_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    category TEXT CHECK (category IN ('order', 'live_stream', 'message', 'store', 'social', 'system', 'promotion')) NOT NULL,
    notification_type TEXT CHECK (notification_type IN ('push', 'email', 'in_app', 'all')) DEFAULT 'all',
    is_active BOOLEAN DEFAULT TRUE,
    priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
    sound_enabled BOOLEAN DEFAULT TRUE,
    vibration_enabled BOOLEAN DEFAULT TRUE,
    badge_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User notifications
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.notification_templates(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT CHECK (category IN ('order', 'live_stream', 'message', 'store', 'social', 'system', 'promotion')) NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    is_delivered BOOLEAN DEFAULT FALSE,
    delivery_method TEXT CHECK (delivery_method IN ('push', 'email', 'in_app', 'all')) DEFAULT 'all',
    priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    category TEXT CHECK (category IN ('order', 'live_stream', 'message', 'store', 'social', 'system', 'promotion')) NOT NULL,
    push_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    sound_enabled BOOLEAN DEFAULT TRUE,
    vibration_enabled BOOLEAN DEFAULT TRUE,
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '08:00:00',
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category)
);

-- Device tokens for push notifications
CREATE TABLE IF NOT EXISTS public.device_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform TEXT CHECK (platform IN ('ios', 'android', 'web')) NOT NULL,
    device_name TEXT,
    device_model TEXT,
    app_version TEXT,
    os_version TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(token)
);

-- Notification analytics
CREATE TABLE IF NOT EXISTS public.notification_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    notification_id UUID REFERENCES public.user_notifications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    event_type TEXT CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'dismissed', 'failed')) NOT NULL,
    platform TEXT CHECK (platform IN ('ios', 'android', 'web', 'email')) NOT NULL,
    device_info JSONB DEFAULT '{}',
    location_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Notification templates indexes
CREATE INDEX IF NOT EXISTS idx_notification_templates_category ON public.notification_templates(category);
CREATE INDEX IF NOT EXISTS idx_notification_templates_is_active ON public.notification_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_notification_templates_priority ON public.notification_templates(priority);

-- User notifications indexes
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_template_id ON public.user_notifications(template_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_category ON public.user_notifications(category);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON public.user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_delivered ON public.user_notifications(is_delivered);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON public.user_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_user_notifications_scheduled_at ON public.user_notifications(scheduled_at);

-- Notification preferences indexes
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_category ON public.notification_preferences(category);

-- Device tokens indexes
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON public.device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_platform ON public.device_tokens(platform);
CREATE INDEX IF NOT EXISTS idx_device_tokens_is_active ON public.device_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_device_tokens_token ON public.device_tokens(token);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_notification_analytics_notification_id ON public.notification_analytics(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_analytics_user_id ON public.notification_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_analytics_event_type ON public.notification_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_notification_analytics_created_at ON public.notification_analytics(created_at);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_notification_templates_updated_at
    BEFORE UPDATE ON public.notification_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_device_tokens_updated_at
    BEFORE UPDATE ON public.device_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.user_notifications
        WHERE user_id = user_uuid
        AND is_read = FALSE
    );
END;
$$ LANGUAGE plpgsql;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_as_read(user_uuid UUID, notification_ids UUID[] DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    IF notification_ids IS NULL THEN
        -- Mark all notifications as read
        UPDATE public.user_notifications
        SET is_read = TRUE, read_at = NOW()
        WHERE user_id = user_uuid
        AND is_read = FALSE;
    ELSE
        -- Mark specific notifications as read
        UPDATE public.user_notifications
        SET is_read = TRUE, read_at = NOW()
        WHERE user_id = user_uuid
        AND id = ANY(notification_ids)
        AND is_read = FALSE;
    END IF;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to log notification analytics
CREATE OR REPLACE FUNCTION log_notification_analytics(
    notification_uuid UUID,
    user_uuid UUID,
    event_type TEXT,
    platform TEXT
)
RETURNS UUID AS $$
DECLARE
    analytics_id UUID;
BEGIN
    INSERT INTO public.notification_analytics (
        notification_id,
        user_id,
        event_type,
        platform
    ) VALUES (
        notification_uuid,
        user_uuid,
        event_type,
        platform
    ) RETURNING id INTO analytics_id;
    
    RETURN analytics_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

GRANT SELECT ON public.notification_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_notifications TO authenticated;
GRANT ALL ON public.notification_preferences TO authenticated;
GRANT ALL ON public.device_tokens TO authenticated;
GRANT SELECT ON public.notification_analytics TO authenticated;

GRANT ALL ON public.notification_templates TO authenticated;
GRANT ALL ON public.user_notifications TO authenticated;
GRANT ALL ON public.notification_preferences TO authenticated;
GRANT ALL ON public.device_tokens TO authenticated;
GRANT ALL ON public.notification_analytics TO authenticated;

GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notifications_as_read(UUID, UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION log_notification_analytics(UUID, UUID, TEXT, TEXT) TO authenticated;

-- =============================================
-- SAMPLE DATA (for testing) - FIXED VERSION
-- =============================================

-- Insert sample notification templates
INSERT INTO public.notification_templates (name, title_template, body_template, category, priority) VALUES
    ('Order Confirmed', 'Order #{order_number} Confirmed', 'Your order has been confirmed and is being processed.', 'order', 'normal'),
    ('Order Shipped', 'Order #{order_number} Shipped', 'Your order has been shipped! Track your package here.', 'order', 'normal'),
    ('Order Delivered', 'Order #{order_number} Delivered', 'Your order has been delivered. Enjoy your purchase!', 'order', 'normal'),
    ('Live Stream Starting', 'Live Stream: {title}', 'Join us for a live stream starting in 5 minutes!', 'live_stream', 'high'),
    ('New Message', 'New message from {sender_name}', 'You have a new message waiting for you.', 'message', 'normal'),
    ('Product Back in Stock', '{product_name} is back in stock!', 'The item you were waiting for is now available.', 'store', 'normal'),
    ('Price Drop Alert', 'Price drop on {product_name}', 'The price has dropped on an item you were watching!', 'store', 'high'),
    ('New Follower', 'New follower: {follower_name}', 'Someone new is following your store!', 'social', 'low'),
    ('App Update', 'App Update Available', 'A new version of the app is available with exciting features!', 'system', 'normal'),
    ('Flash Sale', 'Flash Sale Alert!', 'Limited time offer - don''t miss out on amazing deals!', 'promotion', 'urgent')
ON CONFLICT DO NOTHING;

-- Insert sample notification preferences for testing
INSERT INTO public.notification_preferences (user_id, category, push_enabled, email_enabled, in_app_enabled) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'order', TRUE, TRUE, TRUE),
    ('550e8400-e29b-41d4-a716-446655440000', 'live_stream', TRUE, FALSE, TRUE),
    ('550e8400-e29b-41d4-a716-446655440000', 'message', TRUE, TRUE, TRUE),
    ('550e8400-e29b-41d4-a716-446655440000', 'store', TRUE, FALSE, TRUE),
    ('550e8400-e29b-41d4-a716-446655440000', 'social', FALSE, FALSE, TRUE),
    ('550e8400-e29b-41d4-a716-446655440000', 'system', TRUE, TRUE, TRUE),
    ('550e8400-e29b-41d4-a716-446655440000', 'promotion', FALSE, FALSE, FALSE)
ON CONFLICT (user_id, category) DO NOTHING; 