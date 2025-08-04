-- Live Rooms Schema - Phase 1
-- Basic live streaming functionality

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Live rooms table
CREATE TABLE IF NOT EXISTS public.live_rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    host_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
    
    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    
    -- Stream details
    stream_url TEXT,
    stream_key TEXT,
    thumbnail_url TEXT,
    
    -- Statistics
    viewer_count INTEGER DEFAULT 0,
    max_viewers INTEGER DEFAULT 1000,
    total_viewers INTEGER DEFAULT 0,
    
    -- Settings
    is_private BOOLEAN DEFAULT FALSE,
    allow_comments BOOLEAN DEFAULT TRUE,
    allow_reactions BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live room participants (viewers)
CREATE TABLE IF NOT EXISTS public.live_room_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    live_room_id UUID REFERENCES public.live_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Participation details
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    watch_duration INTEGER DEFAULT 0, -- in seconds
    
    -- Interaction stats
    messages_sent INTEGER DEFAULT 0,
    reactions_sent INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(live_room_id, user_id)
);

-- Live chat messages
CREATE TABLE IF NOT EXISTS public.live_chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    live_room_id UUID REFERENCES public.live_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Message details
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'reaction', 'question', 'system')),
    
    -- Moderation
    is_flagged BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    moderated_by UUID REFERENCES public.users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live room products (products featured during stream)
CREATE TABLE IF NOT EXISTS public.live_room_products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    live_room_id UUID REFERENCES public.live_rooms(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    
    -- Product showcase details
    featured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    live_price DECIMAL(10,2),
    original_price DECIMAL(10,2),
    discount_percentage INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Statistics
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live room reactions
CREATE TABLE IF NOT EXISTS public.live_room_reactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    live_room_id UUID REFERENCES public.live_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Reaction details
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry', 'heart', 'fire', 'clap')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint (one reaction per user per room)
    UNIQUE(live_room_id, user_id, reaction_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_live_rooms_host_id ON public.live_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_live_rooms_status ON public.live_rooms(status);
CREATE INDEX IF NOT EXISTS idx_live_rooms_scheduled_at ON public.live_rooms(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_live_rooms_created_at ON public.live_rooms(created_at);

CREATE INDEX IF NOT EXISTS idx_live_room_participants_room_id ON public.live_room_participants(live_room_id);
CREATE INDEX IF NOT EXISTS idx_live_room_participants_user_id ON public.live_room_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_live_chat_messages_room_id ON public.live_chat_messages(live_room_id);
CREATE INDEX IF NOT EXISTS idx_live_chat_messages_created_at ON public.live_chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_live_chat_messages_user_id ON public.live_chat_messages(user_id);

CREATE INDEX IF NOT EXISTS idx_live_room_products_room_id ON public.live_room_products(live_room_id);
CREATE INDEX IF NOT EXISTS idx_live_room_products_product_id ON public.live_room_products(product_id);

CREATE INDEX IF NOT EXISTS idx_live_room_reactions_room_id ON public.live_room_reactions(live_room_id);
CREATE INDEX IF NOT EXISTS idx_live_room_reactions_type ON public.live_room_reactions(reaction_type);

-- Enable RLS
ALTER TABLE public.live_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_room_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_room_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Live rooms policies
CREATE POLICY "Users can view public live rooms" ON public.live_rooms
    FOR SELECT USING (is_private = FALSE OR host_id = auth.uid());

CREATE POLICY "Hosts can create their own live rooms" ON public.live_rooms
    FOR INSERT WITH CHECK (host_id = auth.uid());

CREATE POLICY "Hosts can update their own live rooms" ON public.live_rooms
    FOR UPDATE USING (host_id = auth.uid());

-- Participants policies
CREATE POLICY "Users can view room participants" ON public.live_room_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.live_rooms 
            WHERE live_rooms.id = live_room_participants.live_room_id
            AND (live_rooms.is_private = FALSE OR live_rooms.host_id = auth.uid())
        )
    );

CREATE POLICY "Users can join public rooms" ON public.live_room_participants
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.live_rooms 
            WHERE live_rooms.id = live_room_participants.live_room_id
            AND live_rooms.is_private = FALSE
        )
    );

CREATE POLICY "Users can update their own participation" ON public.live_room_participants
    FOR UPDATE USING (user_id = auth.uid());

-- Chat messages policies
CREATE POLICY "Users can view chat messages" ON public.live_chat_messages
    FOR SELECT USING (
        is_deleted = FALSE AND
        EXISTS (
            SELECT 1 FROM public.live_rooms 
            WHERE live_rooms.id = live_chat_messages.live_room_id
            AND (live_rooms.is_private = FALSE OR live_rooms.host_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages to public rooms" ON public.live_chat_messages
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.live_rooms 
            WHERE live_rooms.id = live_chat_messages.live_room_id
            AND live_rooms.is_private = FALSE
            AND live_rooms.allow_comments = TRUE
        )
    );

-- Products policies
CREATE POLICY "Users can view room products" ON public.live_room_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.live_rooms 
            WHERE live_rooms.id = live_room_products.live_room_id
            AND (live_rooms.is_private = FALSE OR live_rooms.host_id = auth.uid())
        )
    );

CREATE POLICY "Hosts can manage room products" ON public.live_room_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.live_rooms 
            WHERE live_rooms.id = live_room_products.live_room_id
            AND live_rooms.host_id = auth.uid()
        )
    );

-- Reactions policies
CREATE POLICY "Users can view reactions" ON public.live_room_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.live_rooms 
            WHERE live_rooms.id = live_room_reactions.live_room_id
            AND (live_rooms.is_private = FALSE OR live_rooms.host_id = auth.uid())
        )
    );

CREATE POLICY "Users can react in public rooms" ON public.live_room_reactions
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.live_rooms 
            WHERE live_rooms.id = live_room_reactions.live_room_id
            AND live_rooms.is_private = FALSE
            AND live_rooms.allow_reactions = TRUE
        )
    );

-- Functions
CREATE OR REPLACE FUNCTION update_live_room_viewer_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.live_rooms
        SET viewer_count = viewer_count + 1,
            total_viewers = total_viewers + 1,
            updated_at = NOW()
        WHERE id = NEW.live_room_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' AND NEW.left_at IS NOT NULL AND OLD.left_at IS NULL THEN
        UPDATE public.live_rooms
        SET viewer_count = viewer_count - 1,
            updated_at = NOW()
        WHERE id = NEW.live_room_id;
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_update_viewer_count
    AFTER INSERT OR UPDATE ON public.live_room_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_live_room_viewer_count();

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION trigger_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_live_rooms_updated_at
    BEFORE UPDATE ON public.live_rooms
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_updated_at();

CREATE TRIGGER trigger_live_room_participants_updated_at
    BEFORE UPDATE ON public.live_room_participants
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_updated_at();

CREATE TRIGGER trigger_live_chat_messages_updated_at
    BEFORE UPDATE ON public.live_chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_updated_at();

CREATE TRIGGER trigger_live_room_products_updated_at
    BEFORE UPDATE ON public.live_room_products
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_updated_at();

-- Sample data for testing
INSERT INTO public.live_rooms (
    host_id,
    title,
    description,
    status,
    scheduled_at,
    stream_url,
    thumbnail_url
) VALUES 
(
    (SELECT id FROM public.users LIMIT 1),
    'Tech Product Showcase',
    'Join us for an exciting showcase of the latest tech products!',
    'live',
    NOW() - INTERVAL '1 hour',
    'https://stream.example.com/room1',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=400&q=80'
),
(
    (SELECT id FROM public.users LIMIT 1),
    'Fashion Live Shopping',
    'Discover the latest fashion trends and shop live!',
    'scheduled',
    NOW() + INTERVAL '2 hours',
    NULL,
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80'
),
(
    (SELECT id FROM public.users LIMIT 1),
    'Home & Lifestyle Products',
    'Transform your home with our amazing lifestyle products!',
    'ended',
    NOW() - INTERVAL '3 hours',
    'https://stream.example.com/room3',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80'
);

-- Sample participants
INSERT INTO public.live_room_participants (
    live_room_id,
    user_id
) VALUES 
(
    (SELECT id FROM public.live_rooms WHERE title = 'Tech Product Showcase'),
    (SELECT id FROM public.users LIMIT 1 OFFSET 1)
),
(
    (SELECT id FROM public.live_rooms WHERE title = 'Tech Product Showcase'),
    (SELECT id FROM public.users LIMIT 1 OFFSET 2)
);

-- Sample chat messages
INSERT INTO public.live_chat_messages (
    live_room_id,
    user_id,
    message,
    message_type
) VALUES 
(
    (SELECT id FROM public.live_rooms WHERE title = 'Tech Product Showcase'),
    (SELECT id FROM public.users LIMIT 1 OFFSET 1),
    'This looks amazing!',
    'text'
),
(
    (SELECT id FROM public.live_rooms WHERE title = 'Tech Product Showcase'),
    (SELECT id FROM public.users LIMIT 1 OFFSET 2),
    'How much does it cost?',
    'question'
);

-- Sample reactions
INSERT INTO public.live_room_reactions (
    live_room_id,
    user_id,
    reaction_type
) VALUES 
(
    (SELECT id FROM public.live_rooms WHERE title = 'Tech Product Showcase'),
    (SELECT id FROM public.users LIMIT 1 OFFSET 1),
    'heart'
),
(
    (SELECT id FROM public.live_rooms WHERE title = 'Tech Product Showcase'),
    (SELECT id FROM public.users LIMIT 1 OFFSET 2),
    'fire'
);

SELECT 'Live rooms schema created successfully!' as message; 