-- =============================================
-- SAFE SOCIAL FEATURES MIGRATION
-- =============================================

-- Check and create tables only if they don't exist
DO $$ 
BEGIN
    -- Create followers table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'followers') THEN
        CREATE TABLE public.followers (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
            store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, store_id)
        );
        RAISE NOTICE 'Created followers table';
    ELSE
        RAISE NOTICE 'Followers table already exists';
    END IF;

    -- Create post_likes table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'post_likes') THEN
        CREATE TABLE public.post_likes (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
            post_id BIGINT REFERENCES public.posts(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, post_id)
        );
        RAISE NOTICE 'Created post_likes table';
    ELSE
        RAISE NOTICE 'Post_likes table already exists';
    END IF;

    -- Create post_comments table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'post_comments') THEN
        CREATE TABLE public.post_comments (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
            post_id BIGINT REFERENCES public.posts(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created post_comments table';
    ELSE
        RAISE NOTICE 'Post_comments table already exists';
    END IF;

    -- Create search_analytics table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'search_analytics') THEN
        CREATE TABLE public.search_analytics (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
            query TEXT NOT NULL,
            result_count INTEGER DEFAULT 0,
            filters JSONB,
            session_id TEXT,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created search_analytics table';
    ELSE
        RAISE NOTICE 'Search_analytics table already exists';
    END IF;
END $$;

-- =============================================
-- CREATE INDEXES (SAFE)
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
-- ENABLE RLS (SAFE)
-- =============================================

ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CREATE POLICIES (SAFE - CHECK FIRST)
-- =============================================

-- Followers policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'followers' AND policyname = 'Users can view their own followers') THEN
        CREATE POLICY "Users can view their own followers" ON public.followers
            FOR SELECT USING (auth.uid() = user_id);
        RAISE NOTICE 'Created followers view policy';
    ELSE
        RAISE NOTICE 'Followers view policy already exists';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'followers' AND policyname = 'Users can follow stores') THEN
        CREATE POLICY "Users can follow stores" ON public.followers
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Created followers insert policy';
    ELSE
        RAISE NOTICE 'Followers insert policy already exists';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'followers' AND policyname = 'Users can unfollow stores') THEN
        CREATE POLICY "Users can unfollow stores" ON public.followers
            FOR DELETE USING (auth.uid() = user_id);
        RAISE NOTICE 'Created followers delete policy';
    ELSE
        RAISE NOTICE 'Followers delete policy already exists';
    END IF;
END $$;

-- Post likes policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'post_likes' AND policyname = 'Users can view all post likes') THEN
        CREATE POLICY "Users can view all post likes" ON public.post_likes
            FOR SELECT USING (true);
        RAISE NOTICE 'Created post_likes view policy';
    ELSE
        RAISE NOTICE 'Post_likes view policy already exists';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'post_likes' AND policyname = 'Users can like posts') THEN
        CREATE POLICY "Users can like posts" ON public.post_likes
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Created post_likes insert policy';
    ELSE
        RAISE NOTICE 'Post_likes insert policy already exists';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'post_likes' AND policyname = 'Users can unlike their own likes') THEN
        CREATE POLICY "Users can unlike their own likes" ON public.post_likes
            FOR DELETE USING (auth.uid() = user_id);
        RAISE NOTICE 'Created post_likes delete policy';
    ELSE
        RAISE NOTICE 'Post_likes delete policy already exists';
    END IF;
END $$;

-- Post comments policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'Users can view all comments') THEN
        CREATE POLICY "Users can view all comments" ON public.post_comments
            FOR SELECT USING (true);
        RAISE NOTICE 'Created post_comments view policy';
    ELSE
        RAISE NOTICE 'Post_comments view policy already exists';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'Users can comment on posts') THEN
        CREATE POLICY "Users can comment on posts" ON public.post_comments
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Created post_comments insert policy';
    ELSE
        RAISE NOTICE 'Post_comments insert policy already exists';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'Users can update their own comments') THEN
        CREATE POLICY "Users can update their own comments" ON public.post_comments
            FOR UPDATE USING (auth.uid() = user_id);
        RAISE NOTICE 'Created post_comments update policy';
    ELSE
        RAISE NOTICE 'Post_comments update policy already exists';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'Users can delete their own comments') THEN
        CREATE POLICY "Users can delete their own comments" ON public.post_comments
            FOR DELETE USING (auth.uid() = user_id);
        RAISE NOTICE 'Created post_comments delete policy';
    ELSE
        RAISE NOTICE 'Post_comments delete policy already exists';
    END IF;
END $$;

-- Search analytics policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'search_analytics' AND policyname = 'Users can view their own search analytics') THEN
        CREATE POLICY "Users can view their own search analytics" ON public.search_analytics
            FOR SELECT USING (auth.uid() = user_id);
        RAISE NOTICE 'Created search_analytics view policy';
    ELSE
        RAISE NOTICE 'Search_analytics view policy already exists';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'search_analytics' AND policyname = 'Users can track their own searches') THEN
        CREATE POLICY "Users can track their own searches" ON public.search_analytics
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Created search_analytics insert policy';
    ELSE
        RAISE NOTICE 'Search_analytics insert policy already exists';
    END IF;
END $$;

-- =============================================
-- CREATE FUNCTIONS (SAFE)
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
-- CREATE TRIGGERS (SAFE)
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

-- Create trigger for post likes (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'trigger_update_post_engagement_on_likes') THEN
        CREATE TRIGGER trigger_update_post_engagement_on_likes
            AFTER INSERT OR DELETE ON public.post_likes
            FOR EACH ROW
            EXECUTE FUNCTION update_post_engagement_metrics();
        RAISE NOTICE 'Created post likes trigger';
    ELSE
        RAISE NOTICE 'Post likes trigger already exists';
    END IF;
END $$;

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

-- Create trigger for post comments (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'trigger_update_post_engagement_on_comments') THEN
        CREATE TRIGGER trigger_update_post_engagement_on_comments
            AFTER INSERT OR DELETE ON public.post_comments
            FOR EACH ROW
            EXECUTE FUNCTION update_post_comment_metrics();
        RAISE NOTICE 'Created post comments trigger';
    ELSE
        RAISE NOTICE 'Post comments trigger already exists';
    END IF;
END $$;

-- =============================================
-- VERIFICATION QUERY
-- =============================================

-- Check what was created
SELECT 
    'Tables' as type,
    table_name as name,
    'Created' as status
FROM information_schema.tables 
WHERE table_name IN ('followers', 'post_likes', 'post_comments', 'search_analytics')
AND table_schema = 'public'

UNION ALL

SELECT 
    'Policies' as type,
    policyname as name,
    'Created' as status
FROM pg_policies 
WHERE tablename IN ('followers', 'post_likes', 'post_comments', 'search_analytics')
AND schemaname = 'public'

UNION ALL

SELECT 
    'Functions' as type,
    proname as name,
    'Created' as status
FROM pg_proc 
WHERE proname IN ('get_store_follower_count', 'get_post_like_count', 'get_post_comment_count', 'get_popular_search_queries')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')

UNION ALL

SELECT 
    'Triggers' as type,
    tgname as name,
    'Created' as status
FROM pg_trigger 
WHERE tgname IN ('trigger_update_post_engagement_on_likes', 'trigger_update_post_engagement_on_comments')
AND tgrelid IN (
    SELECT oid FROM pg_class 
    WHERE relname IN ('post_likes', 'post_comments')
    AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
);

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

DO $$ 
BEGIN
    RAISE NOTICE '✅ Social Features Migration Completed Successfully!';
    RAISE NOTICE '📋 Tables: followers, post_likes, post_comments, search_analytics';
    RAISE NOTICE '🔒 RLS Policies: Applied for data security';
    RAISE NOTICE '⚡ Functions: Analytics and engagement tracking';
    RAISE NOTICE '🔄 Triggers: Automatic engagement metrics updates';
    RAISE NOTICE '🚀 Ready to use with backend API routes!';
END $$; 