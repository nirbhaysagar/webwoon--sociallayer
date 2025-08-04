-- AI Recommendation Engine Database Schema
-- Comprehensive recommendation system with collaborative filtering, content-based filtering, and hybrid approaches

-- User Behavior Tracking Table
CREATE TABLE user_behavior (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    behavior_type VARCHAR(50) NOT NULL, -- view, click, add_to_cart, purchase, like, share, review
    session_id VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_seconds INTEGER, -- For view behaviors
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- For review behaviors
    review_text TEXT,
    metadata JSONB, -- Additional behavior data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences Table
CREATE TABLE user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(id),
    preference_score DECIMAL(5,4) DEFAULT 0, -- 0-1 score
    interaction_count INTEGER DEFAULT 0,
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category_id)
);

-- Product Similarity Matrix Table
CREATE TABLE product_similarity (
    id BIGSERIAL PRIMARY KEY,
    product_id_1 BIGINT REFERENCES products(id) ON DELETE CASCADE,
    product_id_2 BIGINT REFERENCES products(id) ON DELETE CASCADE,
    similarity_score DECIMAL(5,4) DEFAULT 0, -- 0-1 similarity score
    similarity_type VARCHAR(50) NOT NULL, -- content, collaborative, hybrid
    features_compared JSONB, -- Which features were compared
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id_1, product_id_2)
);

-- User Similarity Matrix Table
CREATE TABLE user_similarity (
    id BIGSERIAL PRIMARY KEY,
    user_id_1 BIGINT REFERENCES users(id) ON DELETE CASCADE,
    user_id_2 BIGINT REFERENCES users(id) ON DELETE CASCADE,
    similarity_score DECIMAL(5,4) DEFAULT 0, -- 0-1 similarity score
    common_interests JSONB, -- Categories/products they both like
    interaction_overlap INTEGER DEFAULT 0, -- Number of common interactions
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id_1, user_id_2)
);

-- Recommendation Cache Table
CREATE TABLE recommendation_cache (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL, -- collaborative, content, hybrid, trending
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    score DECIMAL(5,4) DEFAULT 0, -- Recommendation confidence score
    reason TEXT, -- Why this product was recommended
    context JSONB, -- Additional context (category, price range, etc.)
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, recommendation_type, product_id)
);

-- AI Model Performance Table
CREATE TABLE ai_model_performance (
    id BIGSERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50),
    metric_name VARCHAR(100) NOT NULL, -- precision, recall, f1_score, accuracy
    metric_value DECIMAL(10,4) DEFAULT 0,
    evaluation_date DATE NOT NULL,
    test_data_size INTEGER,
    training_data_size INTEGER,
    model_parameters JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendation Feedback Table
CREATE TABLE recommendation_feedback (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    recommendation_id BIGINT REFERENCES recommendation_cache(id) ON DELETE CASCADE,
    feedback_type VARCHAR(50) NOT NULL, -- click, purchase, dismiss, report
    feedback_score INTEGER CHECK (feedback_score >= 1 AND feedback_score <= 5),
    feedback_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Feature Extraction Table
CREATE TABLE ai_feature_extraction (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    feature_type VARCHAR(50) NOT NULL, -- text, image, category, price, brand
    feature_vector JSONB, -- Extracted feature vector
    feature_confidence DECIMAL(5,4) DEFAULT 0,
    extraction_method VARCHAR(100),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, feature_type)
);

-- AI Recommendation Settings Table
CREATE TABLE ai_recommendation_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_name VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(setting_name)
);

-- Recommendation Analytics Table
CREATE TABLE recommendation_analytics (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL,
    total_recommendations INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    total_purchases INTEGER DEFAULT 0,
    click_through_rate DECIMAL(5,4) DEFAULT 0,
    conversion_rate DECIMAL(5,4) DEFAULT 0,
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    avg_recommendation_score DECIMAL(5,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, recommendation_type)
);

-- Indexes for Performance
CREATE INDEX idx_user_behavior_user_id ON user_behavior(user_id);
CREATE INDEX idx_user_behavior_product_id ON user_behavior(product_id);
CREATE INDEX idx_user_behavior_type ON user_behavior(behavior_type);
CREATE INDEX idx_user_behavior_timestamp ON user_behavior(timestamp);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_category_id ON user_preferences(category_id);
CREATE INDEX idx_product_similarity_product_1 ON product_similarity(product_id_1);
CREATE INDEX idx_product_similarity_product_2 ON product_similarity(product_id_2);
CREATE INDEX idx_user_similarity_user_1 ON user_similarity(user_id_1);
CREATE INDEX idx_user_similarity_user_2 ON user_similarity(user_id_2);
CREATE INDEX idx_recommendation_cache_user_id ON recommendation_cache(user_id);
CREATE INDEX idx_recommendation_cache_type ON recommendation_cache(recommendation_type);
CREATE INDEX idx_recommendation_cache_expires ON recommendation_cache(expires_at);
CREATE INDEX idx_ai_feature_extraction_product_id ON ai_feature_extraction(product_id);
CREATE INDEX idx_ai_feature_extraction_type ON ai_feature_extraction(feature_type);

-- Functions for AI Recommendation Engine

-- Function to track user behavior
CREATE OR REPLACE FUNCTION track_user_behavior(
    p_user_id BIGINT,
    p_product_id BIGINT,
    p_behavior_type VARCHAR(50),
    p_session_id VARCHAR(255) DEFAULT NULL,
    p_duration_seconds INTEGER DEFAULT NULL,
    p_rating INTEGER DEFAULT NULL,
    p_review_text TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    behavior_id BIGINT;
BEGIN
    INSERT INTO user_behavior (
        user_id, product_id, behavior_type, session_id, 
        duration_seconds, rating, review_text, metadata
    ) VALUES (
        p_user_id, p_product_id, p_behavior_type, p_session_id,
        p_duration_seconds, p_rating, p_review_text, p_metadata
    ) RETURNING id INTO behavior_id;
    
    -- Update user preferences based on behavior
    PERFORM update_user_preferences(p_user_id, p_product_id, p_behavior_type);
    
    RETURN behavior_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update user preferences
CREATE OR REPLACE FUNCTION update_user_preferences(
    p_user_id BIGINT,
    p_product_id BIGINT,
    p_behavior_type VARCHAR(50)
)
RETURNS VOID AS $$
DECLARE
    category_id BIGINT;
    preference_score DECIMAL(5,4);
    interaction_weight INTEGER;
BEGIN
    -- Get product category
    SELECT category_id INTO category_id FROM products WHERE id = p_product_id;
    
    IF category_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Calculate preference score based on behavior type
    CASE p_behavior_type
        WHEN 'purchase' THEN interaction_weight := 10;
        WHEN 'add_to_cart' THEN interaction_weight := 5;
        WHEN 'like' THEN interaction_weight := 3;
        WHEN 'view' THEN interaction_weight := 1;
        WHEN 'click' THEN interaction_weight := 2;
        ELSE interaction_weight := 1;
    END CASE;
    
    preference_score := LEAST(1.0, interaction_weight::DECIMAL / 10.0);
    
    -- Insert or update user preference
    INSERT INTO user_preferences (
        user_id, category_id, preference_score, interaction_count
    ) VALUES (
        p_user_id, category_id, preference_score, 1
    ) ON CONFLICT (user_id, category_id) DO UPDATE SET
        preference_score = user_preferences.preference_score + preference_score,
        interaction_count = user_preferences.interaction_count + 1,
        last_interaction = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to calculate product similarity
CREATE OR REPLACE FUNCTION calculate_product_similarity(
    p_product_id_1 BIGINT,
    p_product_id_2 BIGINT
)
RETURNS DECIMAL(5,4) AS $$
DECLARE
    similarity_score DECIMAL(5,4) := 0;
    category_match BOOLEAN;
    price_diff DECIMAL(10,2);
    brand_match BOOLEAN;
BEGIN
    -- Check if products are in same category
    SELECT 
        p1.category_id = p2.category_id,
        ABS(p1.price - p2.price),
        p1.brand = p2.brand
    INTO category_match, price_diff, brand_match
    FROM products p1, products p2
    WHERE p1.id = p_product_id_1 AND p2.id = p_product_id_2;
    
    -- Calculate similarity score
    similarity_score := 0.0;
    
    -- Category similarity (40% weight)
    IF category_match THEN
        similarity_score := similarity_score + 0.4;
    END IF;
    
    -- Price similarity (30% weight)
    IF price_diff < 10 THEN
        similarity_score := similarity_score + 0.3;
    ELSIF price_diff < 50 THEN
        similarity_score := similarity_score + 0.15;
    END IF;
    
    -- Brand similarity (20% weight)
    IF brand_match THEN
        similarity_score := similarity_score + 0.2;
    END IF;
    
    -- Description similarity (10% weight) - simplified
    similarity_score := similarity_score + 0.1;
    
    RETURN LEAST(1.0, similarity_score);
END;
$$ LANGUAGE plpgsql;

-- Function to get collaborative filtering recommendations
CREATE OR REPLACE FUNCTION get_collaborative_recommendations(
    p_user_id BIGINT,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    product_id BIGINT,
    score DECIMAL(5,4),
    reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as product_id,
        AVG(ub.rating) as score,
        'Recommended by similar users' as reason
    FROM products p
    JOIN user_behavior ub ON p.id = ub.product_id
    JOIN user_similarity us ON ub.user_id = us.user_id_2
    WHERE us.user_id_1 = p_user_id
    AND us.similarity_score > 0.5
    AND ub.behavior_type = 'purchase'
    AND ub.rating IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM user_behavior ub2 
        WHERE ub2.user_id = p_user_id 
        AND ub2.product_id = p.id
    )
    GROUP BY p.id
    ORDER BY score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get content-based recommendations
CREATE OR REPLACE FUNCTION get_content_based_recommendations(
    p_user_id BIGINT,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    product_id BIGINT,
    score DECIMAL(5,4),
    reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as product_id,
        AVG(ps.similarity_score) as score,
        'Similar to products you liked' as reason
    FROM products p
    JOIN product_similarity ps ON p.id = ps.product_id_2
    JOIN user_behavior ub ON ps.product_id_1 = ub.product_id
    WHERE ub.user_id = p_user_id
    AND ub.behavior_type IN ('purchase', 'like', 'add_to_cart')
    AND ps.similarity_score > 0.3
    AND NOT EXISTS (
        SELECT 1 FROM user_behavior ub2 
        WHERE ub2.user_id = p_user_id 
        AND ub2.product_id = p.id
    )
    GROUP BY p.id
    ORDER BY score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get hybrid recommendations
CREATE OR REPLACE FUNCTION get_hybrid_recommendations(
    p_user_id BIGINT,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    product_id BIGINT,
    score DECIMAL(5,4),
    reason TEXT
) AS $$
DECLARE
    collaborative_weight DECIMAL(3,2) := 0.6;
    content_weight DECIMAL(3,2) := 0.4;
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(cf.product_id, cb.product_id) as product_id,
        (COALESCE(cf.score, 0) * collaborative_weight + 
         COALESCE(cb.score, 0) * content_weight) as score,
        'Hybrid recommendation' as reason
    FROM get_collaborative_recommendations(p_user_id, p_limit) cf
    FULL OUTER JOIN get_content_based_recommendations(p_user_id, p_limit) cb
    ON cf.product_id = cb.product_id
    ORDER BY score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to cache recommendations
CREATE OR REPLACE FUNCTION cache_recommendations(
    p_user_id BIGINT,
    p_recommendation_type VARCHAR(50),
    p_expires_hours INTEGER DEFAULT 24
)
RETURNS INTEGER AS $$
DECLARE
    cached_count INTEGER := 0;
    rec_record RECORD;
BEGIN
    -- Clear existing cache for this user and type
    DELETE FROM recommendation_cache 
    WHERE user_id = p_user_id AND recommendation_type = p_recommendation_type;
    
    -- Cache new recommendations based on type
    CASE p_recommendation_type
        WHEN 'collaborative' THEN
            FOR rec_record IN SELECT * FROM get_collaborative_recommendations(p_user_id, 20)
            LOOP
                INSERT INTO recommendation_cache (
                    user_id, recommendation_type, product_id, score, reason, expires_at
                ) VALUES (
                    p_user_id, p_recommendation_type, rec_record.product_id, 
                    rec_record.score, rec_record.reason, 
                    NOW() + (p_expires_hours || ' hours')::INTERVAL
                );
                cached_count := cached_count + 1;
            END LOOP;
            
        WHEN 'content' THEN
            FOR rec_record IN SELECT * FROM get_content_based_recommendations(p_user_id, 20)
            LOOP
                INSERT INTO recommendation_cache (
                    user_id, recommendation_type, product_id, score, reason, expires_at
                ) VALUES (
                    p_user_id, p_recommendation_type, rec_record.product_id, 
                    rec_record.score, rec_record.reason, 
                    NOW() + (p_expires_hours || ' hours')::INTERVAL
                );
                cached_count := cached_count + 1;
            END LOOP;
            
        WHEN 'hybrid' THEN
            FOR rec_record IN SELECT * FROM get_hybrid_recommendations(p_user_id, 20)
            LOOP
                INSERT INTO recommendation_cache (
                    user_id, recommendation_type, product_id, score, reason, expires_at
                ) VALUES (
                    p_user_id, p_recommendation_type, rec_record.product_id, 
                    rec_record.score, rec_record.reason, 
                    NOW() + (p_expires_hours || ' hours')::INTERVAL
                );
                cached_count := cached_count + 1;
            END LOOP;
    END CASE;
    
    RETURN cached_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get cached recommendations
CREATE OR REPLACE FUNCTION get_cached_recommendations(
    p_user_id BIGINT,
    p_recommendation_type VARCHAR(50),
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    product_id BIGINT,
    score DECIMAL(5,4),
    reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rc.product_id,
        rc.score,
        rc.reason
    FROM recommendation_cache rc
    WHERE rc.user_id = p_user_id
    AND rc.recommendation_type = p_recommendation_type
    AND (rc.expires_at IS NULL OR rc.expires_at > NOW())
    ORDER BY rc.score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to update recommendation analytics
CREATE OR REPLACE FUNCTION update_recommendation_analytics(
    p_date DATE,
    p_recommendation_type VARCHAR(50)
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO recommendation_analytics (
        date, recommendation_type, total_recommendations, total_clicks,
        total_purchases, click_through_rate, conversion_rate, revenue_generated
    )
    SELECT 
        p_date,
        p_recommendation_type,
        COUNT(DISTINCT rc.id) as total_recommendations,
        COUNT(DISTINCT CASE WHEN rf.feedback_type = 'click' THEN rf.id END) as total_clicks,
        COUNT(DISTINCT CASE WHEN rf.feedback_type = 'purchase' THEN rf.id END) as total_purchases,
        CASE 
            WHEN COUNT(DISTINCT rc.id) > 0 THEN 
                COUNT(DISTINCT CASE WHEN rf.feedback_type = 'click' THEN rf.id END)::DECIMAL / COUNT(DISTINCT rc.id)
            ELSE 0 
        END as click_through_rate,
        CASE 
            WHEN COUNT(DISTINCT CASE WHEN rf.feedback_type = 'click' THEN rf.id END) > 0 THEN 
                COUNT(DISTINCT CASE WHEN rf.feedback_type = 'purchase' THEN rf.id END)::DECIMAL / COUNT(DISTINCT CASE WHEN rf.feedback_type = 'click' THEN rf.id END)
            ELSE 0 
        END as conversion_rate,
        COALESCE(SUM(CASE WHEN rf.feedback_type = 'purchase' THEN p.price ELSE 0 END), 0) as revenue_generated
    FROM recommendation_cache rc
    LEFT JOIN recommendation_feedback rf ON rc.id = rf.recommendation_id
    LEFT JOIN products p ON rc.product_id = p.id
    WHERE DATE(rc.created_at) = p_date
    AND rc.recommendation_type = p_recommendation_type
    ON CONFLICT (date, recommendation_type) DO UPDATE SET
        total_recommendations = EXCLUDED.total_recommendations,
        total_clicks = EXCLUDED.total_clicks,
        total_purchases = EXCLUDED.total_purchases,
        click_through_rate = EXCLUDED.click_through_rate,
        conversion_rate = EXCLUDED.conversion_rate,
        revenue_generated = EXCLUDED.revenue_generated;
END;
$$ LANGUAGE plpgsql;

-- Insert default AI recommendation settings
INSERT INTO ai_recommendation_settings (setting_name, setting_value, description) VALUES
('collaborative_filtering', '{"enabled": true, "min_similarity": 0.5, "max_recommendations": 20}', 'Collaborative filtering settings'),
('content_based_filtering', '{"enabled": true, "min_similarity": 0.3, "max_recommendations": 20}', 'Content-based filtering settings'),
('hybrid_recommendations', '{"enabled": true, "collaborative_weight": 0.6, "content_weight": 0.4}', 'Hybrid recommendation settings'),
('cache_settings', '{"enabled": true, "expires_hours": 24, "max_cache_size": 1000}', 'Recommendation cache settings'),
('analytics_settings', '{"enabled": true, "track_feedback": true, "track_revenue": true}', 'Analytics tracking settings');

-- Row Level Security Policies
ALTER TABLE user_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_similarity ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_similarity ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feature_extraction ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own behavior" ON user_behavior
    FOR SELECT USING (auth.uid()::bigint = user_id);

CREATE POLICY "Users can insert their own behavior" ON user_behavior
    FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);

CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (auth.uid()::bigint = user_id);

CREATE POLICY "Public read access to product similarity" ON product_similarity
    FOR SELECT USING (true);

CREATE POLICY "Public read access to user similarity" ON user_similarity
    FOR SELECT USING (true);

CREATE POLICY "Users can view their own recommendations" ON recommendation_cache
    FOR SELECT USING (auth.uid()::bigint = user_id);

CREATE POLICY "Admin access to model performance" ON ai_model_performance
    FOR ALL USING (auth.uid()::bigint IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Users can provide feedback on recommendations" ON recommendation_feedback
    FOR ALL USING (auth.uid()::bigint = user_id);

CREATE POLICY "Admin access to feature extraction" ON ai_feature_extraction
    FOR ALL USING (auth.uid()::bigint IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Admin access to recommendation settings" ON ai_recommendation_settings
    FOR ALL USING (auth.uid()::bigint IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Admin access to recommendation analytics" ON recommendation_analytics
    FOR ALL USING (auth.uid()::bigint IN (SELECT id FROM users WHERE role = 'admin'));

-- Grant permissions
GRANT SELECT, INSERT ON user_behavior TO authenticated;
GRANT SELECT ON user_preferences TO authenticated;
GRANT SELECT ON product_similarity TO authenticated;
GRANT SELECT ON user_similarity TO authenticated;
GRANT SELECT ON recommendation_cache TO authenticated;
GRANT SELECT ON ai_model_performance TO authenticated;
GRANT ALL ON recommendation_feedback TO authenticated;
GRANT SELECT ON ai_feature_extraction TO authenticated;
GRANT SELECT ON ai_recommendation_settings TO authenticated;
GRANT SELECT ON recommendation_analytics TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION track_user_behavior TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_preferences TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_product_similarity TO authenticated;
GRANT EXECUTE ON FUNCTION get_collaborative_recommendations TO authenticated;
GRANT EXECUTE ON FUNCTION get_content_based_recommendations TO authenticated;
GRANT EXECUTE ON FUNCTION get_hybrid_recommendations TO authenticated;
GRANT EXECUTE ON FUNCTION cache_recommendations TO authenticated;
GRANT EXECUTE ON FUNCTION get_cached_recommendations TO authenticated;
GRANT EXECUTE ON FUNCTION update_recommendation_analytics TO authenticated;

COMMENT ON TABLE user_behavior IS 'Tracks user interactions with products for recommendation engine';
COMMENT ON TABLE user_preferences IS 'User category preferences for content-based recommendations';
COMMENT ON TABLE product_similarity IS 'Product similarity matrix for content-based filtering';
COMMENT ON TABLE user_similarity IS 'User similarity matrix for collaborative filtering';
COMMENT ON TABLE recommendation_cache IS 'Cached recommendations for performance optimization';
COMMENT ON TABLE ai_model_performance IS 'AI model performance metrics and evaluation';
COMMENT ON TABLE recommendation_feedback IS 'User feedback on recommendations for model improvement';
COMMENT ON TABLE ai_feature_extraction IS 'AI-extracted features from products for recommendations';
COMMENT ON TABLE ai_recommendation_settings IS 'Configuration settings for AI recommendation engine';
COMMENT ON TABLE recommendation_analytics IS 'Analytics and performance metrics for recommendations'; 