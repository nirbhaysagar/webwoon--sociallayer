-- =============================================
-- SOCIAL FEATURES SCHEMA
-- =============================================

-- Followers table
CREATE TABLE IF NOT EXISTS public.followers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, store_id)
);

-- Post likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    post_id BIGINT REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Post comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    post_id BIGINT REFERENCES public.posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search analytics table
CREATE TABLE IF NOT EXISTS public.search_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    result_count INTEGER DEFAULT 0,
    filters JSONB,
    session_id TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Followers indexes
CREATE INDEX IF NOT EXISTS idx_followers_user_id ON public.followers(user_id);
CREATE INDEX IF NOT EXISTS idx_followers_store_id ON public.followers(store_id);
CREATE INDEX IF NOT EXISTS idx_followers_created_at ON public.followers(created_at);

-- Post likes indexes
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_created_at ON public.post_likes(created_at);

-- Post comments indexes
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON public.post_comments(created_at);

-- Search analytics indexes
CREATE INDEX IF NOT EXISTS idx_search_analytics_user_id ON public.search_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON public.search_analytics(query);
CREATE INDEX IF NOT EXISTS idx_search_analytics_timestamp ON public.search_analytics(timestamp);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- Followers policies
CREATE POLICY "Users can view their own followers" ON public.followers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can follow stores" ON public.followers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow stores" ON public.followers
    FOR DELETE USING (auth.uid() = user_id);

-- Post likes policies
CREATE POLICY "Users can view all post likes" ON public.post_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON public.post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" ON public.post_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Post comments policies
CREATE POLICY "Users can view all comments" ON public.post_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can comment on posts" ON public.post_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.post_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.post_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Search analytics policies
CREATE POLICY "Users can view their own search analytics" ON public.search_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can track their own searches" ON public.search_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS FOR ANALYTICS
-- =============================================

-- Function to get follower count for a store
CREATE OR REPLACE FUNCTION get_store_follower_count(store_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.followers
        WHERE store_id = store_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get like count for a post
CREATE OR REPLACE FUNCTION get_post_like_count(post_bigint BIGINT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.post_likes
        WHERE post_id = post_bigint
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get comment count for a post
CREATE OR REPLACE FUNCTION get_post_comment_count(post_bigint BIGINT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.post_comments
        WHERE post_id = post_bigint
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get popular search queries
CREATE OR REPLACE FUNCTION get_popular_search_queries(p_limit INTEGER DEFAULT 10, p_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '7 days')
RETURNS TABLE(query TEXT, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sa.query,
        COUNT(*)::BIGINT as count
    FROM public.search_analytics sa
    WHERE sa.timestamp >= p_period_start
    GROUP BY sa.query
    ORDER BY count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Trigger to update post engagement metrics when likes change
CREATE OR REPLACE FUNCTION update_post_engagement_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update likes count
        UPDATE public.posts 
        SET engagement_metrics = jsonb_set(
            COALESCE(engagement_metrics, '{}'::jsonb),
            '{likes}',
            (get_post_like_count(NEW.post_id) + 1)::text::jsonb
        )
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update likes count
        UPDATE public.posts 
        SET engagement_metrics = jsonb_set(
            COALESCE(engagement_metrics, '{}'::jsonb),
            '{likes}',
            (get_post_like_count(OLD.post_id) - 1)::text::jsonb
        )
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for post likes
CREATE TRIGGER trigger_update_post_engagement_on_likes
    AFTER INSERT OR DELETE ON public.post_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_post_engagement_metrics();

-- Trigger to update post engagement metrics when comments change
CREATE OR REPLACE FUNCTION update_post_comment_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update comments count
        UPDATE public.posts 
        SET engagement_metrics = jsonb_set(
            COALESCE(engagement_metrics, '{}'::jsonb),
            '{comments}',
            (get_post_comment_count(NEW.post_id) + 1)::text::jsonb
        )
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update comments count
        UPDATE public.posts 
        SET engagement_metrics = jsonb_set(
            COALESCE(engagement_metrics, '{}'::jsonb),
            '{comments}',
            (get_post_comment_count(OLD.post_id) - 1)::text::jsonb
        )
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for post comments
CREATE TRIGGER trigger_update_post_engagement_on_comments
    AFTER INSERT OR DELETE ON public.post_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_comment_metrics();

-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================

-- Insert sample followers (if users and stores exist)
-- INSERT INTO public.followers (user_id, store_id) VALUES 
-- ('user-uuid-1', 'store-uuid-1'),
-- ('user-uuid-2', 'store-uuid-1'),
-- ('user-uuid-3', 'store-uuid-2');

-- Insert sample post likes (if posts exist)
-- INSERT INTO public.post_likes (user_id, post_id) VALUES 
-- ('user-uuid-1', 1),
-- ('user-uuid-2', 1),
-- ('user-uuid-3', 2);

-- Insert sample comments (if posts exist)
-- INSERT INTO public.post_comments (user_id, post_id, content) VALUES 
-- ('user-uuid-1', 1, 'Great product!'),
-- ('user-uuid-2', 1, 'Love this!'),
-- ('user-uuid-3', 2, 'Amazing quality');

-- Insert sample search analytics
-- INSERT INTO public.search_analytics (user_id, query, result_count, session_id) VALUES 
-- ('user-uuid-1', 'wireless headphones', 15, 'session-1'),
-- ('user-uuid-1', 'smart watch', 8, 'session-1'),
-- ('user-uuid-2', 'organic cotton', 12, 'session-2');

-- =============================================
-- MIGRATION NOTES
-- =============================================

/*
This schema adds social features to the existing database:

1. FOLLOWERS TABLE:
   - Tracks which users follow which stores
   - Enables social discovery and engagement

2. POST LIKES TABLE:
   - Tracks user likes on posts
   - Enables engagement metrics

3. POST COMMENTS TABLE:
   - Stores user comments on posts
   - Enables social interaction

4. SEARCH ANALYTICS TABLE:
   - Tracks user search behavior
   - Enables search optimization and recommendations

KEY FEATURES:
- Row Level Security (RLS) for data protection
- Automatic engagement metrics updates via triggers
- Analytics functions for popular searches
- Performance indexes for fast queries
- Sample data for testing

TO APPLY THIS SCHEMA:
1. Run this SQL in your Supabase SQL editor
2. The tables will be created with proper RLS policies
3. Functions and triggers will be automatically set up
4. Sample data can be inserted for testing

NOTE: Make sure you have the uuid-ossp extension enabled:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
*/ 