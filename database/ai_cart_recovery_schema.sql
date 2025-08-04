-- AI Cart Recovery Database Schema
-- Comprehensive abandoned cart recovery system with AI-powered optimization

-- Abandoned Carts Table
CREATE TABLE abandoned_carts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    cart_data JSONB NOT NULL,
    total_amount DECIMAL(10,2),
    item_count INTEGER DEFAULT 0,
    abandoned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recovery_status VARCHAR(50) DEFAULT 'pending', -- pending, recovered, failed, expired
    recovery_revenue DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart Recovery Campaigns Table
CREATE TABLE cart_recovery_campaigns (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) NOT NULL, -- email, sms, push, multi_channel
    is_active BOOLEAN DEFAULT TRUE,
    ai_optimization_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recovery Attempts Table
CREATE TABLE recovery_attempts (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT REFERENCES abandoned_carts(id) ON DELETE CASCADE,
    campaign_id BIGINT REFERENCES cart_recovery_campaigns(id) ON DELETE CASCADE,
    attempt_number INTEGER DEFAULT 1,
    channel VARCHAR(50) NOT NULL, -- email, sms, push, webhook
    message_template_id BIGINT,
    personalized_content JSONB,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    conversion_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'sent', -- sent, delivered, opened, clicked, converted, failed
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recovery Templates Table
CREATE TABLE recovery_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    template_type VARCHAR(50) NOT NULL, -- email, sms, push
    subject_line VARCHAR(255),
    content TEXT NOT NULL,
    variables JSONB, -- Available template variables
    is_active BOOLEAN DEFAULT TRUE,
    ai_optimized BOOLEAN DEFAULT FALSE,
    performance_score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Recovery Settings Table
CREATE TABLE ai_recovery_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_name VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(setting_name)
);

-- Recovery Analytics Table
CREATE TABLE recovery_analytics (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    campaign_id BIGINT REFERENCES cart_recovery_campaigns(id),
    total_attempts INTEGER DEFAULT 0,
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_converted INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    avg_recovery_rate DECIMAL(5,2) DEFAULT 0,
    avg_revenue_per_recovery DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, campaign_id)
);

-- AI Timing Optimization Table
CREATE TABLE ai_timing_optimization (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    user_segment VARCHAR(100),
    optimal_send_time TIME,
    timezone VARCHAR(50),
    day_of_week INTEGER, -- 1-7 (Monday-Sunday)
    success_rate DECIMAL(5,2) DEFAULT 0,
    sample_size INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personalized Offers Table
CREATE TABLE personalized_offers (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT REFERENCES abandoned_carts(id) ON DELETE CASCADE,
    offer_type VARCHAR(50) NOT NULL, -- discount, free_shipping, gift_card, bundle
    offer_value DECIMAL(10,2),
    offer_percentage INTEGER,
    offer_code VARCHAR(100),
    offer_description TEXT,
    ai_generated BOOLEAN DEFAULT TRUE,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    revenue_impact DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recovery Performance Table
CREATE TABLE recovery_performance (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT REFERENCES abandoned_carts(id) ON DELETE CASCADE,
    attempt_id BIGINT REFERENCES recovery_attempts(id) ON DELETE CASCADE,
    performance_metrics JSONB,
    ai_score DECIMAL(5,2) DEFAULT 0,
    predicted_conversion BOOLEAN DEFAULT FALSE,
    actual_conversion BOOLEAN DEFAULT FALSE,
    revenue_prediction DECIMAL(10,2) DEFAULT 0,
    actual_revenue DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_abandoned_carts_user_id ON abandoned_carts(user_id);
CREATE INDEX idx_abandoned_carts_status ON abandoned_carts(recovery_status);
CREATE INDEX idx_abandoned_carts_abandoned_at ON abandoned_carts(abandoned_at);
CREATE INDEX idx_recovery_attempts_cart_id ON recovery_attempts(cart_id);
CREATE INDEX idx_recovery_attempts_campaign_id ON recovery_attempts(campaign_id);
CREATE INDEX idx_recovery_attempts_status ON recovery_attempts(status);
CREATE INDEX idx_recovery_attempts_sent_at ON recovery_attempts(sent_at);
CREATE INDEX idx_ai_timing_user_id ON ai_timing_optimization(user_id);
CREATE INDEX idx_personalized_offers_cart_id ON personalized_offers(cart_id);
CREATE INDEX idx_recovery_analytics_date ON recovery_analytics(date);

-- Functions for AI Cart Recovery

-- Function to detect abandoned carts
CREATE OR REPLACE FUNCTION detect_abandoned_carts()
RETURNS INTEGER AS $$
DECLARE
    abandoned_count INTEGER := 0;
    cart_record RECORD;
BEGIN
    -- Find carts abandoned more than 1 hour ago
    FOR cart_record IN 
        SELECT 
            c.id,
            c.user_id,
            c.session_id,
            c.cart_data,
            c.total_amount,
            jsonb_array_length(c.cart_data->'items') as item_count
        FROM shopping_carts c
        WHERE c.updated_at < NOW() - INTERVAL '1 hour'
        AND c.status = 'active'
        AND NOT EXISTS (
            SELECT 1 FROM abandoned_carts ac 
            WHERE ac.session_id = c.session_id
        )
    LOOP
        INSERT INTO abandoned_carts (
            user_id, session_id, cart_data, total_amount, item_count
        ) VALUES (
            cart_record.user_id,
            cart_record.session_id,
            cart_record.cart_data,
            cart_record.total_amount,
            cart_record.item_count
        );
        abandoned_count := abandoned_count + 1;
    END LOOP;
    
    RETURN abandoned_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get optimal send time for user
CREATE OR REPLACE FUNCTION get_optimal_send_time(p_user_id BIGINT)
RETURNS TIME AS $$
DECLARE
    optimal_time TIME;
BEGIN
    SELECT ato.optimal_send_time INTO optimal_time
    FROM ai_timing_optimization ato
    WHERE ato.user_id = p_user_id
    ORDER BY ato.success_rate DESC, ato.sample_size DESC
    LIMIT 1;
    
    -- Return default time if no optimization found
    IF optimal_time IS NULL THEN
        optimal_time := '10:00:00';
    END IF;
    
    RETURN optimal_time;
END;
$$ LANGUAGE plpgsql;

-- Function to generate personalized offer
CREATE OR REPLACE FUNCTION generate_personalized_offer(p_cart_id BIGINT)
RETURNS JSONB AS $$
DECLARE
    cart_record RECORD;
    offer_data JSONB;
    cart_total DECIMAL(10,2);
    offer_type VARCHAR(50);
    offer_value DECIMAL(10,2);
BEGIN
    -- Get cart information
    SELECT total_amount, cart_data INTO cart_record
    FROM abandoned_carts
    WHERE id = p_cart_id;
    
    cart_total := cart_record.total_amount;
    
    -- AI logic to determine best offer type and value
    IF cart_total > 100 THEN
        offer_type := 'discount';
        offer_value := cart_total * 0.15; -- 15% discount
    ELSIF cart_total > 50 THEN
        offer_type := 'free_shipping';
        offer_value := 0;
    ELSE
        offer_type := 'discount';
        offer_value := cart_total * 0.10; -- 10% discount
    END IF;
    
    offer_data := jsonb_build_object(
        'offer_type', offer_type,
        'offer_value', offer_value,
        'offer_percentage', CASE WHEN offer_type = 'discount' THEN 
            CASE WHEN cart_total > 100 THEN 15 ELSE 10 END ELSE NULL END,
        'offer_code', 'RECOVER' || p_cart_id,
        'offer_description', CASE 
            WHEN offer_type = 'discount' THEN 'Special discount on your cart!'
            WHEN offer_type = 'free_shipping' THEN 'Free shipping on your order!'
            ELSE 'Special offer for you!'
        END
    );
    
    RETURN offer_data;
END;
$$ LANGUAGE plpgsql;

-- Function to send recovery attempt
CREATE OR REPLACE FUNCTION send_recovery_attempt(
    p_cart_id BIGINT,
    p_campaign_id BIGINT,
    p_channel VARCHAR(50),
    p_template_id BIGINT
)
RETURNS BIGINT AS $$
DECLARE
    attempt_id BIGINT;
    personalized_content JSONB;
    offer_data JSONB;
BEGIN
    -- Generate personalized offer
    offer_data := generate_personalized_offer(p_cart_id);
    
    -- Create personalized content
    personalized_content := jsonb_build_object(
        'offer', offer_data,
        'cart_items', (SELECT cart_data FROM abandoned_carts WHERE id = p_cart_id),
        'user_name', (SELECT name FROM users WHERE id = (SELECT user_id FROM abandoned_carts WHERE id = p_cart_id))
    );
    
    -- Insert recovery attempt
    INSERT INTO recovery_attempts (
        cart_id, campaign_id, channel, message_template_id, personalized_content
    ) VALUES (
        p_cart_id, p_campaign_id, p_channel, p_template_id, personalized_content
    ) RETURNING id INTO attempt_id;
    
    -- Insert personalized offer
    INSERT INTO personalized_offers (
        cart_id, offer_type, offer_value, offer_percentage, offer_code, offer_description
    ) VALUES (
        p_cart_id,
        offer_data->>'offer_type',
        (offer_data->>'offer_value')::DECIMAL,
        (offer_data->>'offer_percentage')::INTEGER,
        offer_data->>'offer_code',
        offer_data->>'offer_description'
    );
    
    RETURN attempt_id;
END;
$$ LANGUAGE plpgsql;

-- Function to track recovery conversion
CREATE OR REPLACE FUNCTION track_recovery_conversion(
    p_attempt_id BIGINT,
    p_revenue DECIMAL(10,2)
)
RETURNS VOID AS $$
DECLARE
    cart_id BIGINT;
BEGIN
    -- Get cart ID from attempt
    SELECT cart_id INTO cart_id FROM recovery_attempts WHERE id = p_attempt_id;
    
    -- Update attempt status
    UPDATE recovery_attempts 
    SET status = 'converted', conversion_at = NOW(), revenue_generated = p_revenue
    WHERE id = p_attempt_id;
    
    -- Update abandoned cart status
    UPDATE abandoned_carts 
    SET recovery_status = 'recovered', recovery_revenue = p_revenue
    WHERE id = cart_id;
    
    -- Update analytics
    INSERT INTO recovery_analytics (
        date, campaign_id, total_converted, total_revenue
    ) VALUES (
        CURRENT_DATE,
        (SELECT campaign_id FROM recovery_attempts WHERE id = p_attempt_id),
        1,
        p_revenue
    ) ON CONFLICT (date, campaign_id) DO UPDATE SET
        total_converted = recovery_analytics.total_converted + 1,
        total_revenue = recovery_analytics.total_revenue + p_revenue;
END;
$$ LANGUAGE plpgsql;

-- Function to get recovery analytics
CREATE OR REPLACE FUNCTION get_recovery_analytics(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    date DATE,
    total_attempts BIGINT,
    total_converted BIGINT,
    conversion_rate DECIMAL(5,2),
    total_revenue DECIMAL(10,2),
    avg_revenue_per_conversion DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ra.date,
        ra.total_attempts,
        ra.total_converted,
        CASE 
            WHEN ra.total_attempts > 0 THEN 
                (ra.total_converted::DECIMAL / ra.total_attempts) * 100
            ELSE 0 
        END as conversion_rate,
        ra.total_revenue,
        CASE 
            WHEN ra.total_converted > 0 THEN 
                ra.total_revenue / ra.total_converted
            ELSE 0 
        END as avg_revenue_per_conversion
    FROM recovery_analytics ra
    WHERE ra.date BETWEEN p_start_date AND p_end_date
    ORDER BY ra.date;
END;
$$ LANGUAGE plpgsql;

-- Insert default AI recovery settings
INSERT INTO ai_recovery_settings (setting_name, setting_value, description) VALUES
('timing_optimization', '{"enabled": true, "min_interval_hours": 2, "max_attempts": 3}', 'AI timing optimization settings'),
('offer_generation', '{"enabled": true, "min_discount": 5, "max_discount": 25}', 'AI offer generation settings'),
('channel_priority', '{"email": 1, "sms": 2, "push": 3}', 'Channel priority for recovery attempts'),
('conversion_tracking', '{"enabled": true, "tracking_window_hours": 72}', 'Conversion tracking settings');

-- Insert default recovery templates
INSERT INTO recovery_templates (name, template_type, subject_line, content, variables) VALUES
('First Reminder Email', 'email', 'Complete your purchase - items waiting for you!', 
'Hi {{user_name}}, we noticed you left some items in your cart. Don''t miss out on {{offer_description}}! 
Your cart total: ${{cart_total}}. {{offer_code}}', 
'{"user_name": "string", "offer_description": "string", "cart_total": "decimal", "offer_code": "string"}'),
('SMS Reminder', 'sms', NULL, 
'Hi {{user_name}}! Your cart is waiting. Use {{offer_code}} for {{offer_description}}. 
Shop now: {{recovery_url}}', 
'{"user_name": "string", "offer_code": "string", "offer_description": "string", "recovery_url": "string"}'),
('Push Notification', 'push', 'Cart Recovery', 
'Don''t forget your cart! {{offer_description}} - {{offer_code}}', 
'{"offer_description": "string", "offer_code": "string"}');

-- Insert default campaigns
INSERT INTO cart_recovery_campaigns (name, description, campaign_type) VALUES
('Standard Email Recovery', 'Standard email-based cart recovery campaign', 'email'),
('Multi-Channel Recovery', 'Multi-channel recovery with email, SMS, and push', 'multi_channel'),
('AI-Optimized Recovery', 'AI-optimized recovery with personalized timing and offers', 'multi_channel');

-- Row Level Security Policies
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_recovery_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recovery_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_timing_optimization ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own abandoned carts" ON abandoned_carts
    FOR SELECT USING (auth.uid()::bigint = user_id);

CREATE POLICY "Admin access to recovery campaigns" ON cart_recovery_campaigns
    FOR ALL USING (auth.uid()::bigint IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Admin access to recovery attempts" ON recovery_attempts
    FOR ALL USING (auth.uid()::bigint IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Admin access to recovery templates" ON recovery_templates
    FOR ALL USING (auth.uid()::bigint IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Admin access to AI settings" ON ai_recovery_settings
    FOR ALL USING (auth.uid()::bigint IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Admin access to recovery analytics" ON recovery_analytics
    FOR ALL USING (auth.uid()::bigint IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Users can view their own timing optimization" ON ai_timing_optimization
    FOR SELECT USING (auth.uid()::bigint = user_id);

CREATE POLICY "Users can view their own personalized offers" ON personalized_offers
    FOR SELECT USING (auth.uid()::bigint = (SELECT user_id FROM abandoned_carts WHERE id = cart_id));

CREATE POLICY "Admin access to recovery performance" ON recovery_performance
    FOR ALL USING (auth.uid()::bigint IN (SELECT id FROM users WHERE role = 'admin'));

-- Grant permissions
GRANT SELECT ON abandoned_carts TO authenticated;
GRANT ALL ON cart_recovery_campaigns TO authenticated;
GRANT ALL ON recovery_attempts TO authenticated;
GRANT ALL ON recovery_templates TO authenticated;
GRANT ALL ON ai_recovery_settings TO authenticated;
GRANT SELECT ON recovery_analytics TO authenticated;
GRANT SELECT ON ai_timing_optimization TO authenticated;
GRANT SELECT ON personalized_offers TO authenticated;
GRANT ALL ON recovery_performance TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION detect_abandoned_carts TO authenticated;
GRANT EXECUTE ON FUNCTION get_optimal_send_time TO authenticated;
GRANT EXECUTE ON FUNCTION generate_personalized_offer TO authenticated;
GRANT EXECUTE ON FUNCTION send_recovery_attempt TO authenticated;
GRANT EXECUTE ON FUNCTION track_recovery_conversion TO authenticated;
GRANT EXECUTE ON FUNCTION get_recovery_analytics TO authenticated;

COMMENT ON TABLE abandoned_carts IS 'Stores abandoned shopping carts for recovery';
COMMENT ON TABLE cart_recovery_campaigns IS 'Recovery campaign configurations';
COMMENT ON TABLE recovery_attempts IS 'Individual recovery attempt tracking';
COMMENT ON TABLE recovery_templates IS 'Message templates for recovery campaigns';
COMMENT ON TABLE ai_recovery_settings IS 'AI optimization settings for cart recovery';
COMMENT ON TABLE recovery_analytics IS 'Daily recovery analytics and performance';
COMMENT ON TABLE ai_timing_optimization IS 'AI-optimized send timing per user';
COMMENT ON TABLE personalized_offers IS 'AI-generated personalized offers';
COMMENT ON TABLE recovery_performance IS 'AI performance tracking and predictions'; 