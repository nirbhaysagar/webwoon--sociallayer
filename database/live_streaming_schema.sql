-- Live Streaming Database Schema
-- Supabase PostgreSQL Schema for complete live streaming system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- LIVE STREAMING SYSTEM
-- =============================================

-- Live rooms table
CREATE TABLE IF NOT EXISTS public.live_rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    host_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    stream_key TEXT UNIQUE NOT NULL,
    rtmp_url TEXT,
    playback_url TEXT,
    status TEXT CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')) DEFAULT 'scheduled',
    is_public BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    max_viewers INTEGER DEFAULT 1000,
    current_viewers INTEGER DEFAULT 0,
    peak_viewers INTEGER DEFAULT 0,
    total_viewers INTEGER DEFAULT 0,
    duration_minutes INTEGER DEFAULT 0,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live room participants (viewers)
CREATE TABLE IF NOT EXISTS public.live_room_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.live_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    watch_duration_minutes INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(room_id, user_id)
);

-- Live chat messages
CREATE TABLE IF NOT EXISTS public.live_chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.live_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'system', 'moderator', 'highlight')) DEFAULT 'text',
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_by UUID REFERENCES public.users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live chat reactions
CREATE TABLE IF NOT EXISTS public.live_chat_reactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id UUID REFERENCES public.live_chat_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    reaction_type TEXT CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id, reaction_type)
);

-- Live room moderators
CREATE TABLE IF NOT EXISTS public.live_room_moderators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.live_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '{}',
    added_by UUID REFERENCES public.users(id),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- Live room bans
CREATE TABLE IF NOT EXISTS public.live_room_bans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.live_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    banned_by UUID REFERENCES public.users(id),
    reason TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_permanent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live sales (products featured during stream)
CREATE TABLE IF NOT EXISTS public.live_sales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.live_rooms(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    featured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    featured_by UUID REFERENCES public.users(id),
    is_active BOOLEAN DEFAULT TRUE,
    sales_count INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live room analytics
CREATE TABLE IF NOT EXISTS public.live_room_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.live_rooms(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live room highlights (clips)
CREATE TABLE IF NOT EXISTS public.live_room_highlights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.live_rooms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    clip_url TEXT NOT NULL,
    thumbnail_url TEXT,
    start_time_seconds INTEGER NOT NULL,
    end_time_seconds INTEGER NOT NULL,
    duration_seconds INTEGER NOT NULL,
    created_by UUID REFERENCES public.users(id),
    view_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live room polls
CREATE TABLE IF NOT EXISTS public.live_room_polls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.live_rooms(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    ends_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live room poll votes
CREATE TABLE IF NOT EXISTS public.live_room_poll_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES public.live_room_polls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    selected_option INTEGER NOT NULL,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(poll_id, user_id)
);

-- Live room gifts/tips
CREATE TABLE IF NOT EXISTS public.live_room_gifts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.live_rooms(id) ON DELETE CASCADE,
    from_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    gift_type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    message TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live room notifications
CREATE TABLE IF NOT EXISTS public.live_room_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.live_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    notification_type TEXT CHECK (notification_type IN ('follow', 'gift', 'purchase', 'highlight', 'system')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Live rooms indexes
CREATE INDEX IF NOT EXISTS idx_live_rooms_host_id ON public.live_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_live_rooms_store_id ON public.live_rooms(store_id);
CREATE INDEX IF NOT EXISTS idx_live_rooms_status ON public.live_rooms(status);
CREATE INDEX IF NOT EXISTS idx_live_rooms_is_public ON public.live_rooms(is_public);
CREATE INDEX IF NOT EXISTS idx_live_rooms_is_featured ON public.live_rooms(is_featured);
CREATE INDEX IF NOT EXISTS idx_live_rooms_scheduled_at ON public.live_rooms(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_live_rooms_started_at ON public.live_rooms(started_at);
CREATE INDEX IF NOT EXISTS idx_live_rooms_stream_key ON public.live_rooms(stream_key);

-- Participants indexes
CREATE INDEX IF NOT EXISTS idx_live_room_participants_room_id ON public.live_room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_live_room_participants_user_id ON public.live_room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_live_room_participants_is_active ON public.live_room_participants(is_active);
CREATE INDEX IF NOT EXISTS idx_live_room_participants_joined_at ON public.live_room_participants(joined_at);

-- Chat messages indexes
CREATE INDEX IF NOT EXISTS idx_live_chat_messages_room_id ON public.live_chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_live_chat_messages_user_id ON public.live_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_live_chat_messages_created_at ON public.live_chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_live_chat_messages_is_deleted ON public.live_chat_messages(is_deleted);

-- Chat reactions indexes
CREATE INDEX IF NOT EXISTS idx_live_chat_reactions_message_id ON public.live_chat_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_live_chat_reactions_user_id ON public.live_chat_reactions(user_id);

-- Moderators indexes
CREATE INDEX IF NOT EXISTS idx_live_room_moderators_room_id ON public.live_room_moderators(room_id);
CREATE INDEX IF NOT EXISTS idx_live_room_moderators_user_id ON public.live_room_moderators(user_id);

-- Bans indexes
CREATE INDEX IF NOT EXISTS idx_live_room_bans_room_id ON public.live_room_bans(room_id);
CREATE INDEX IF NOT EXISTS idx_live_room_bans_user_id ON public.live_room_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_live_room_bans_expires_at ON public.live_room_bans(expires_at);

-- Sales indexes
CREATE INDEX IF NOT EXISTS idx_live_sales_room_id ON public.live_sales(room_id);
CREATE INDEX IF NOT EXISTS idx_live_sales_product_id ON public.live_sales(product_id);
CREATE INDEX IF NOT EXISTS idx_live_sales_is_active ON public.live_sales(is_active);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_live_room_analytics_room_id ON public.live_room_analytics(room_id);
CREATE INDEX IF NOT EXISTS idx_live_room_analytics_metric_name ON public.live_room_analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_live_room_analytics_recorded_at ON public.live_room_analytics(recorded_at);

-- Highlights indexes
CREATE INDEX IF NOT EXISTS idx_live_room_highlights_room_id ON public.live_room_highlights(room_id);
CREATE INDEX IF NOT EXISTS idx_live_room_highlights_is_public ON public.live_room_highlights(is_public);

-- Polls indexes
CREATE INDEX IF NOT EXISTS idx_live_room_polls_room_id ON public.live_room_polls(room_id);
CREATE INDEX IF NOT EXISTS idx_live_room_polls_is_active ON public.live_room_polls(is_active);

-- Poll votes indexes
CREATE INDEX IF NOT EXISTS idx_live_room_poll_votes_poll_id ON public.live_room_poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_live_room_poll_votes_user_id ON public.live_room_poll_votes(user_id);

-- Gifts indexes
CREATE INDEX IF NOT EXISTS idx_live_room_gifts_room_id ON public.live_room_gifts(room_id);
CREATE INDEX IF NOT EXISTS idx_live_room_gifts_from_user_id ON public.live_room_gifts(from_user_id);
CREATE INDEX IF NOT EXISTS idx_live_room_gifts_to_user_id ON public.live_room_gifts(to_user_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_live_room_notifications_room_id ON public.live_room_notifications(room_id);
CREATE INDEX IF NOT EXISTS idx_live_room_notifications_user_id ON public.live_room_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_live_room_notifications_is_read ON public.live_room_notifications(is_read);

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

-- Trigger for live_rooms updated_at
CREATE TRIGGER trigger_live_rooms_updated_at
    BEFORE UPDATE ON public.live_rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to generate stream key
CREATE OR REPLACE FUNCTION generate_stream_key()
RETURNS TEXT AS $$
DECLARE
    stream_key TEXT;
    counter INTEGER := 0;
BEGIN
    LOOP
        stream_key := 'live_' || LOWER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 16));
        
        EXIT WHEN NOT EXISTS (
            SELECT 1 FROM public.live_rooms WHERE stream_key = stream_key
        );
        
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Unable to generate unique stream key';
        END IF;
    END LOOP;
    
    RETURN stream_key;
END;
$$ LANGUAGE plpgsql;

-- Function to update viewer count
CREATE OR REPLACE FUNCTION update_viewer_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.live_rooms 
        SET current_viewers = current_viewers + 1,
            total_viewers = total_viewers + 1,
            peak_viewers = GREATEST(peak_viewers, current_viewers + 1)
        WHERE id = NEW.room_id;
    ELSIF TG_OP = 'UPDATE' AND NEW.is_active = FALSE AND OLD.is_active = TRUE THEN
        UPDATE public.live_rooms 
        SET current_viewers = GREATEST(0, current_viewers - 1)
        WHERE id = NEW.room_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for viewer count updates
CREATE TRIGGER trigger_update_viewer_count
    AFTER INSERT OR UPDATE ON public.live_room_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_viewer_count();

-- Function to log stream analytics
CREATE OR REPLACE FUNCTION log_stream_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Log viewer count every minute
    INSERT INTO public.live_room_analytics (room_id, metric_name, metric_value)
    VALUES (NEW.id, 'viewer_count', NEW.current_viewers::DECIMAL);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for stream analytics logging
CREATE TRIGGER trigger_log_stream_analytics
    AFTER UPDATE OF current_viewers ON public.live_rooms
    FOR EACH ROW
    EXECUTE FUNCTION log_stream_analytics();

-- Function to calculate watch duration
CREATE OR REPLACE FUNCTION calculate_watch_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.left_at IS NOT NULL AND OLD.left_at IS NULL THEN
        NEW.watch_duration_minutes := EXTRACT(EPOCH FROM (NEW.left_at - NEW.joined_at)) / 60;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for watch duration calculation
CREATE TRIGGER trigger_calculate_watch_duration
    BEFORE UPDATE ON public.live_room_participants
    FOR EACH ROW
    EXECUTE FUNCTION calculate_watch_duration();

-- Function to check if user is banned
CREATE OR REPLACE FUNCTION is_user_banned(room_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.live_room_bans 
        WHERE room_id = room_uuid 
        AND user_id = user_uuid 
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get room statistics
CREATE OR REPLACE FUNCTION get_room_statistics(room_uuid UUID)
RETURNS TABLE (
    total_viewers INTEGER,
    peak_viewers INTEGER,
    average_watch_time DECIMAL,
    total_messages INTEGER,
    total_gifts DECIMAL,
    total_sales INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lr.total_viewers,
        lr.peak_viewers,
        COALESCE(AVG(lrp.watch_duration_minutes), 0) as average_watch_time,
        COALESCE((SELECT COUNT(*) FROM public.live_chat_messages WHERE room_id = room_uuid), 0) as total_messages,
        COALESCE((SELECT SUM(amount) FROM public.live_room_gifts WHERE room_id = room_uuid), 0) as total_gifts,
        COALESCE((SELECT SUM(sales_count) FROM public.live_sales WHERE room_id = room_uuid), 0) as total_sales
    FROM public.live_rooms lr
    LEFT JOIN public.live_room_participants lrp ON lr.id = lrp.room_id
    WHERE lr.id = room_uuid
    GROUP BY lr.id, lr.total_viewers, lr.peak_viewers;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.live_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_chat_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_room_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_room_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_room_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_room_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_room_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_room_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_room_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_room_notifications ENABLE ROW LEVEL SECURITY;

-- Live rooms policies
CREATE POLICY "Users can view public live rooms" ON public.live_rooms
    FOR SELECT USING (is_public = TRUE OR host_id = auth.uid());

CREATE POLICY "Hosts can manage their live rooms" ON public.live_rooms
    FOR ALL USING (host_id = auth.uid());

-- Participants policies
CREATE POLICY "Users can view room participants" ON public.live_room_participants
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can join/leave rooms" ON public.live_room_participants
    FOR ALL USING (user_id = auth.uid());

-- Chat messages policies
CREATE POLICY "Users can view chat messages" ON public.live_chat_messages
    FOR SELECT USING (is_deleted = FALSE);

CREATE POLICY "Users can send chat messages" ON public.live_chat_messages
    FOR INSERT WITH CHECK (
        user_id = auth.uid() 
        AND NOT is_user_banned(room_id, auth.uid())
    );

CREATE POLICY "Users can delete their own messages" ON public.live_chat_messages
    FOR UPDATE USING (user_id = auth.uid());

-- Chat reactions policies
CREATE POLICY "Users can view chat reactions" ON public.live_chat_reactions
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can manage their own reactions" ON public.live_chat_reactions
    FOR ALL USING (user_id = auth.uid());

-- Moderators policies
CREATE POLICY "Users can view moderators" ON public.live_room_moderators
    FOR SELECT USING (TRUE);

CREATE POLICY "Hosts can manage moderators" ON public.live_room_moderators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.live_rooms 
            WHERE id = live_room_moderators.room_id 
            AND host_id = auth.uid()
        )
    );

-- Bans policies
CREATE POLICY "Users can view bans" ON public.live_room_bans
    FOR SELECT USING (TRUE);

CREATE POLICY "Hosts and moderators can manage bans" ON public.live_room_bans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.live_rooms lr
            LEFT JOIN public.live_room_moderators lrm ON lr.id = lrm.room_id
            WHERE lr.id = live_room_bans.room_id 
            AND (lr.host_id = auth.uid() OR lrm.user_id = auth.uid())
        )
    );

-- Sales policies
CREATE POLICY "Users can view live sales" ON public.live_sales
    FOR SELECT USING (TRUE);

CREATE POLICY "Hosts can manage live sales" ON public.live_sales
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.live_rooms 
            WHERE id = live_sales.room_id 
            AND host_id = auth.uid()
        )
    );

-- Analytics policies
CREATE POLICY "Hosts can view their analytics" ON public.live_room_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.live_rooms 
            WHERE id = live_room_analytics.room_id 
            AND host_id = auth.uid()
        )
    );

-- Highlights policies
CREATE POLICY "Users can view public highlights" ON public.live_room_highlights
    FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Hosts can manage highlights" ON public.live_room_highlights
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.live_rooms 
            WHERE id = live_room_highlights.room_id 
            AND host_id = auth.uid()
        )
    );

-- Polls policies
CREATE POLICY "Users can view active polls" ON public.live_room_polls
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Hosts can manage polls" ON public.live_room_polls
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.live_rooms 
            WHERE id = live_room_polls.room_id 
            AND host_id = auth.uid()
        )
    );

-- Poll votes policies
CREATE POLICY "Users can view poll votes" ON public.live_room_poll_votes
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can vote in polls" ON public.live_room_poll_votes
    FOR ALL USING (user_id = auth.uid());

-- Gifts policies
CREATE POLICY "Users can view gifts" ON public.live_room_gifts
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can send gifts" ON public.live_room_gifts
    FOR INSERT WITH CHECK (from_user_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON public.live_room_notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.live_room_notifications
    FOR UPDATE USING (user_id = auth.uid());

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

GRANT SELECT ON public.live_rooms TO authenticated;
GRANT SELECT ON public.live_room_participants TO authenticated;
GRANT SELECT ON public.live_chat_messages TO authenticated;
GRANT SELECT ON public.live_chat_reactions TO authenticated;
GRANT SELECT ON public.live_room_moderators TO authenticated;
GRANT SELECT ON public.live_room_bans TO authenticated;
GRANT SELECT ON public.live_sales TO authenticated;
GRANT SELECT ON public.live_room_highlights TO authenticated;
GRANT SELECT ON public.live_room_polls TO authenticated;
GRANT SELECT ON public.live_room_poll_votes TO authenticated;
GRANT SELECT ON public.live_room_gifts TO authenticated;
GRANT SELECT ON public.live_room_notifications TO authenticated;

GRANT ALL ON public.live_rooms TO authenticated;
GRANT ALL ON public.live_room_participants TO authenticated;
GRANT ALL ON public.live_chat_messages TO authenticated;
GRANT ALL ON public.live_chat_reactions TO authenticated;
GRANT ALL ON public.live_room_moderators TO authenticated;
GRANT ALL ON public.live_room_bans TO authenticated;
GRANT ALL ON public.live_sales TO authenticated;
GRANT ALL ON public.live_room_analytics TO authenticated;
GRANT ALL ON public.live_room_highlights TO authenticated;
GRANT ALL ON public.live_room_polls TO authenticated;
GRANT ALL ON public.live_room_poll_votes TO authenticated;
GRANT ALL ON public.live_room_gifts TO authenticated;
GRANT ALL ON public.live_room_notifications TO authenticated;

GRANT EXECUTE ON FUNCTION generate_stream_key() TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_banned(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_room_statistics(UUID) TO authenticated;

-- =============================================
-- SAMPLE DATA (for testing)
-- =============================================

-- Insert sample live rooms
INSERT INTO public.live_rooms (host_id, store_id, title, description, status, is_public, scheduled_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Live Product Launch', 'Join us for an exciting product launch!', 'scheduled', TRUE, NOW() + INTERVAL '1 hour'),
    ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Q&A Session', 'Ask me anything about our products!', 'scheduled', TRUE, NOW() + INTERVAL '2 hours')
ON CONFLICT DO NOTHING; 