-- Advanced Search Database Schema
-- Comprehensive search system with full-text search, analytics, and ranking

-- Enable full-text search extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Search History Table
CREATE TABLE search_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    search_type VARCHAR(50) NOT NULL DEFAULT 'product', -- product, seller, content
    filters JSONB,
    results_count INTEGER,
    search_duration_ms INTEGER,
    clicked_result_id BIGINT,
    clicked_result_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Search Suggestions Table
CREATE TABLE search_suggestions (
    id BIGSERIAL PRIMARY KEY,
    query TEXT NOT NULL,
    suggestion_type VARCHAR(50) NOT NULL DEFAULT 'popular', -- popular, trending, related
    search_count INTEGER DEFAULT 1,
    last_searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(query, suggestion_type)
);

-- Search Analytics Table
CREATE TABLE search_analytics (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    search_type VARCHAR(50) NOT NULL,
    total_searches INTEGER DEFAULT 0,
    unique_searches INTEGER DEFAULT 0,
    avg_results_count DECIMAL(10,2) DEFAULT 0,
    avg_search_duration_ms INTEGER DEFAULT 0,
    top_queries JSONB,
    top_filters JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, search_type)
);

-- Saved Searches Table
CREATE TABLE saved_searches (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    search_query TEXT NOT NULL,
    search_type VARCHAR(50) NOT NULL DEFAULT 'product',
    filters JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search Ranking Weights Table
CREATE TABLE search_ranking_weights (
    id BIGSERIAL PRIMARY KEY,
    search_type VARCHAR(50) NOT NULL,
    weight_name VARCHAR(100) NOT NULL,
    weight_value DECIMAL(5,4) NOT NULL DEFAULT 1.0,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(search_type, weight_name)
);

-- Search Index Table for Full-text Search
CREATE TABLE search_index (
    id BIGSERIAL PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL, -- product, seller, category, tag
    content_id BIGINT NOT NULL,
    title TEXT,
    description TEXT,
    tags TEXT[],
    categories TEXT[],
    search_vector tsvector,
    popularity_score DECIMAL(10,4) DEFAULT 0,
    relevance_score DECIMAL(10,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_type, content_id)
);

-- Indexes for Performance
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_created_at ON search_history(created_at);
CREATE INDEX idx_search_history_query ON search_history USING gin(to_tsvector('english', search_query));
CREATE INDEX idx_search_suggestions_query ON search_suggestions USING gin(to_tsvector('english', query));
CREATE INDEX idx_search_suggestions_type_count ON search_suggestions(suggestion_type, search_count DESC);
CREATE INDEX idx_search_analytics_date_type ON search_analytics(date, search_type);
CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX idx_search_index_content_type_id ON search_index(content_type, content_id);
CREATE INDEX idx_search_index_vector ON search_index USING gin(search_vector);
CREATE INDEX idx_search_index_popularity ON search_index(popularity_score DESC);
CREATE INDEX idx_search_index_relevance ON search_index(relevance_score DESC);

-- Full-text search index
CREATE INDEX idx_search_index_fulltext ON search_index USING gin(search_vector);

-- Functions for Search Operations

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', array_to_string(COALESCE(NEW.tags, ARRAY[]::text[]), ' ')), 'C') ||
        setweight(to_tsvector('english', array_to_string(COALESCE(NEW.categories, ARRAY[]::text[]), ' ')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update search vector
CREATE TRIGGER trigger_update_search_vector
    BEFORE INSERT OR UPDATE ON search_index
    FOR EACH ROW
    EXECUTE FUNCTION update_search_vector();

-- Function to log search history
CREATE OR REPLACE FUNCTION log_search_history(
    p_user_id BIGINT,
    p_query TEXT,
    p_search_type VARCHAR(50),
    p_filters JSONB DEFAULT NULL,
    p_results_count INTEGER DEFAULT NULL,
    p_duration_ms INTEGER DEFAULT NULL,
    p_clicked_result_id BIGINT DEFAULT NULL,
    p_clicked_result_type VARCHAR(50) DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    history_id BIGINT;
BEGIN
    INSERT INTO search_history (
        user_id, search_query, search_type, filters, 
        results_count, search_duration_ms, clicked_result_id, clicked_result_type
    ) VALUES (
        p_user_id, p_query, p_search_type, p_filters,
        p_results_count, p_duration_ms, p_clicked_result_id, p_clicked_result_type
    ) RETURNING id INTO history_id;
    
    RETURN history_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get search suggestions
CREATE OR REPLACE FUNCTION get_search_suggestions(
    p_query TEXT,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    suggestion TEXT,
    suggestion_type VARCHAR(50),
    search_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.query as suggestion,
        s.suggestion_type,
        s.search_count
    FROM search_suggestions s
    WHERE s.query ILIKE p_query || '%'
    ORDER BY s.search_count DESC, s.last_searched_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to perform full-text search
CREATE OR REPLACE FUNCTION perform_search(
    p_query TEXT,
    p_search_type VARCHAR(50) DEFAULT 'product',
    p_filters JSONB DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    content_id BIGINT,
    content_type VARCHAR(50),
    title TEXT,
    description TEXT,
    relevance_score DECIMAL(10,4),
    popularity_score DECIMAL(10,4),
    final_score DECIMAL(10,4)
) AS $$
DECLARE
    search_vector tsvector;
    weight_popularity DECIMAL(5,4) := 0.3;
    weight_relevance DECIMAL(5,4) := 0.7;
BEGIN
    -- Get ranking weights
    SELECT weight_value INTO weight_popularity 
    FROM search_ranking_weights 
    WHERE search_type = p_search_type AND weight_name = 'popularity' AND is_active = TRUE;
    
    SELECT weight_value INTO weight_relevance 
    FROM search_ranking_weights 
    WHERE search_type = p_search_type AND weight_name = 'relevance' AND is_active = TRUE;
    
    -- Create search vector
    search_vector := to_tsvector('english', p_query);
    
    RETURN QUERY
    SELECT 
        si.content_id,
        si.content_type,
        si.title,
        si.description,
        ts_rank(si.search_vector, search_vector) as relevance_score,
        si.popularity_score,
        (ts_rank(si.search_vector, search_vector) * weight_relevance + 
         si.popularity_score * weight_popularity) as final_score
    FROM search_index si
    WHERE si.content_type = p_search_type
    AND si.search_vector @@ search_vector
    ORDER BY final_score DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to update search analytics
CREATE OR REPLACE FUNCTION update_search_analytics(
    p_date DATE,
    p_search_type VARCHAR(50)
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO search_analytics (
        date, search_type, total_searches, unique_searches,
        avg_results_count, avg_search_duration_ms, top_queries, top_filters
    )
    SELECT 
        p_date,
        p_search_type,
        COUNT(*) as total_searches,
        COUNT(DISTINCT search_query) as unique_searches,
        AVG(results_count) as avg_results_count,
        AVG(search_duration_ms) as avg_search_duration_ms,
        jsonb_agg(
            jsonb_build_object(
                'query', search_query,
                'count', query_count
            ) ORDER BY query_count DESC LIMIT 10
        ) as top_queries,
        jsonb_agg(
            jsonb_build_object(
                'filter', filter_key,
                'count', filter_count
            ) ORDER BY filter_count DESC LIMIT 10
        ) as top_filters
    FROM (
        SELECT 
            search_query,
            COUNT(*) as query_count
        FROM search_history 
        WHERE DATE(created_at) = p_date 
        AND search_type = p_search_type
        GROUP BY search_query
    ) query_stats
    CROSS JOIN (
        SELECT 
            jsonb_object_keys(filters) as filter_key,
            COUNT(*) as filter_count
        FROM search_history 
        WHERE DATE(created_at) = p_date 
        AND search_type = p_search_type
        AND filters IS NOT NULL
        GROUP BY jsonb_object_keys(filters)
    ) filter_stats
    ON CONFLICT (date, search_type) DO UPDATE SET
        total_searches = EXCLUDED.total_searches,
        unique_searches = EXCLUDED.unique_searches,
        avg_results_count = EXCLUDED.avg_results_count,
        avg_search_duration_ms = EXCLUDED.avg_search_duration_ms,
        top_queries = EXCLUDED.top_queries,
        top_filters = EXCLUDED.top_filters,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Insert default ranking weights
INSERT INTO search_ranking_weights (search_type, weight_name, weight_value, description) VALUES
('product', 'relevance', 0.7, 'Text relevance weight for product search'),
('product', 'popularity', 0.3, 'Popularity weight for product search'),
('seller', 'relevance', 0.6, 'Text relevance weight for seller search'),
('seller', 'popularity', 0.4, 'Popularity weight for seller search'),
('content', 'relevance', 0.8, 'Text relevance weight for content search'),
('content', 'popularity', 0.2, 'Popularity weight for content search');

-- Insert sample search suggestions
INSERT INTO search_suggestions (query, suggestion_type, search_count) VALUES
('iphone', 'popular', 150),
('samsung', 'popular', 120),
('laptop', 'popular', 95),
('headphones', 'popular', 80),
('wireless', 'trending', 45),
('gaming', 'trending', 38),
('fitness', 'trending', 32),
('kitchen', 'trending', 28);

-- Sample search index entries (these would be populated by triggers from products/sellers)
INSERT INTO search_index (content_type, content_id, title, description, tags, categories, popularity_score) VALUES
('product', 1, 'iPhone 13 Pro', 'Latest iPhone with advanced camera system', ARRAY['smartphone', 'apple', 'camera'], ARRAY['Electronics', 'Smartphones'], 0.95),
('product', 2, 'Samsung Galaxy S21', 'Premium Android smartphone', ARRAY['smartphone', 'samsung', 'android'], ARRAY['Electronics', 'Smartphones'], 0.88),
('product', 3, 'MacBook Pro M1', 'Professional laptop with Apple Silicon', ARRAY['laptop', 'apple', 'professional'], ARRAY['Electronics', 'Computers'], 0.92),
('seller', 1, 'TechStore Pro', 'Premium electronics and gadgets', ARRAY['electronics', 'premium', 'tech'], ARRAY['Electronics'], 0.85);

-- Row Level Security Policies
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_ranking_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_index ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own search history" ON search_history
    FOR SELECT USING (auth.uid()::bigint = user_id);

CREATE POLICY "Users can insert their own search history" ON search_history
    FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);

CREATE POLICY "Public read access to search suggestions" ON search_suggestions
    FOR SELECT USING (true);

CREATE POLICY "Admin access to search analytics" ON search_analytics
    FOR ALL USING (auth.uid()::bigint IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Users can manage their own saved searches" ON saved_searches
    FOR ALL USING (auth.uid()::bigint = user_id);

CREATE POLICY "Admin access to search ranking weights" ON search_ranking_weights
    FOR ALL USING (auth.uid()::bigint IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Public read access to search index" ON search_index
    FOR SELECT USING (true);

-- Grant permissions
GRANT SELECT, INSERT ON search_history TO authenticated;
GRANT SELECT ON search_suggestions TO authenticated;
GRANT SELECT ON search_analytics TO authenticated;
GRANT ALL ON saved_searches TO authenticated;
GRANT SELECT ON search_ranking_weights TO authenticated;
GRANT SELECT ON search_index TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION log_search_history TO authenticated;
GRANT EXECUTE ON FUNCTION get_search_suggestions TO authenticated;
GRANT EXECUTE ON FUNCTION perform_search TO authenticated;
GRANT EXECUTE ON FUNCTION update_search_analytics TO authenticated;

COMMENT ON TABLE search_history IS 'Stores user search history and analytics';
COMMENT ON TABLE search_suggestions IS 'Stores search suggestions and popular queries';
COMMENT ON TABLE search_analytics IS 'Daily search analytics and trends';
COMMENT ON TABLE saved_searches IS 'User saved searches and filters';
COMMENT ON TABLE search_ranking_weights IS 'Configurable weights for search ranking algorithms';
COMMENT ON TABLE search_index IS 'Full-text search index for products, sellers, and content'; 