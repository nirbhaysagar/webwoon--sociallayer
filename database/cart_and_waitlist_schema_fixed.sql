-- Cart and Waitlist Schema for SocialSpark (FIXED VERSION)
-- Execute this in your Supabase SQL Editor

-- =============================================
-- MIGRATION: ADD MISSING COLUMNS TO EXISTING TABLES
-- =============================================

-- Add status column to existing waitlist table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'waitlist' 
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.waitlist ADD COLUMN status TEXT DEFAULT 'waiting';
    END IF;
END $$;

-- Add notified_at column to existing waitlist table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'waitlist' 
        AND column_name = 'notified_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.waitlist ADD COLUMN notified_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- =============================================
-- CART MANAGEMENT
-- =============================================

-- Cart table
CREATE TABLE IF NOT EXISTS public.cart (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, store_id)
);

-- Cart items table (simplified - no product_variants dependency)
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cart_id UUID REFERENCES public.cart(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID, -- Optional, no foreign key constraint
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cart_id, product_id, variant_id)
);

-- =============================================
-- WAITLIST MANAGEMENT
-- =============================================

-- Waitlist table (already exists, but let's ensure it's complete)
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'purchased', 'cancelled')),
    notified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- =============================================
-- POST INTERACTIONS (ENHANCED)
-- =============================================

-- Post likes table (enhanced)
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    post_id BIGINT REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Post saves table (enhanced)
CREATE TABLE IF NOT EXISTS public.post_saves (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    post_id BIGINT REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Post shares table
CREATE TABLE IF NOT EXISTS public.post_shares (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    post_id BIGINT REFERENCES public.posts(id) ON DELETE CASCADE,
    share_platform TEXT, -- 'facebook', 'twitter', 'instagram', 'copy_link', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Cart indexes
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON public.cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_store_id ON public.cart(store_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);

-- Waitlist indexes
CREATE INDEX IF NOT EXISTS idx_waitlist_user_id ON public.waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_product_id ON public.waitlist(product_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON public.waitlist(status);

-- Post interaction indexes
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_user_id ON public.post_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_post_id ON public.post_saves(post_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_user_id ON public.post_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_post_id ON public.post_shares(post_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;

-- Cart policies
CREATE POLICY "Users can view their own cart" ON public.cart
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart" ON public.cart
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart" ON public.cart
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart" ON public.cart
    FOR DELETE USING (auth.uid() = user_id);

-- Cart items policies
CREATE POLICY "Users can view their own cart items" ON public.cart_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.cart 
            WHERE cart.id = cart_items.cart_id 
            AND cart.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own cart items" ON public.cart_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.cart 
            WHERE cart.id = cart_items.cart_id 
            AND cart.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own cart items" ON public.cart_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.cart 
            WHERE cart.id = cart_items.cart_id 
            AND cart.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own cart items" ON public.cart_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.cart 
            WHERE cart.id = cart_items.cart_id 
            AND cart.user_id = auth.uid()
        )
    );

-- Waitlist policies
CREATE POLICY "Users can view their own waitlist items" ON public.waitlist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own waitlist items" ON public.waitlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own waitlist items" ON public.waitlist
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own waitlist items" ON public.waitlist
    FOR DELETE USING (auth.uid() = user_id);

-- Post interaction policies
CREATE POLICY "Users can view all post likes" ON public.post_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own post likes" ON public.post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own post likes" ON public.post_likes
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view all post saves" ON public.post_saves
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own post saves" ON public.post_saves
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own post saves" ON public.post_saves
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view all post shares" ON public.post_shares
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own post shares" ON public.post_shares
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update cart item total price
CREATE OR REPLACE FUNCTION update_cart_item_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_price = NEW.quantity * NEW.unit_price;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update cart item total price
CREATE TRIGGER trigger_update_cart_item_total
    BEFORE INSERT OR UPDATE ON public.cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_cart_item_total();

-- Function to update post interaction counts
CREATE OR REPLACE FUNCTION update_post_interaction_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'post_likes' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE public.posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'post_saves' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE public.posts SET saves_count = saves_count + 1 WHERE id = NEW.post_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE public.posts SET saves_count = GREATEST(saves_count - 1, 0) WHERE id = OLD.post_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'post_shares' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE public.posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for post interaction counts
CREATE TRIGGER trigger_update_post_likes_count
    AFTER INSERT OR DELETE ON public.post_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_post_interaction_counts();

CREATE TRIGGER trigger_update_post_saves_count
    AFTER INSERT OR DELETE ON public.post_saves
    FOR EACH ROW
    EXECUTE FUNCTION update_post_interaction_counts();

CREATE TRIGGER trigger_update_post_shares_count
    AFTER INSERT ON public.post_shares
    FOR EACH ROW
    EXECUTE FUNCTION update_post_interaction_counts();

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get user's cart with items
CREATE OR REPLACE FUNCTION get_user_cart(user_uuid UUID)
RETURNS TABLE (
    cart_id UUID,
    store_id UUID,
    store_name TEXT,
    items JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as cart_id,
        c.store_id,
        s.name as store_name,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', ci.id,
                    'product_id', ci.product_id,
                    'product_name', p.name,
                    'product_image', (SELECT image_url FROM public.product_images WHERE product_id = p.id AND is_primary = true LIMIT 1),
                    'quantity', ci.quantity,
                    'unit_price', ci.unit_price,
                    'total_price', ci.total_price,
                    'variant_id', ci.variant_id
                ) ORDER BY ci.created_at
            ) FILTER (WHERE ci.id IS NOT NULL),
            '[]'::jsonb
        ) as items
    FROM public.cart c
    LEFT JOIN public.stores s ON c.store_id = s.id
    LEFT JOIN public.cart_items ci ON c.id = ci.cart_id
    LEFT JOIN public.products p ON ci.product_id = p.id
    WHERE c.user_id = user_uuid
    GROUP BY c.id, c.store_id, s.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's waitlist
CREATE OR REPLACE FUNCTION get_user_waitlist(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    product_id BIGINT,
    product_name TEXT,
    product_image TEXT,
    store_name TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id,
        w.product_id,
        p.name as product_name,
        (SELECT image_url FROM public.product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as product_image,
        s.name as store_name,
        COALESCE(w.status, 'waiting') as status,
        w.created_at
    FROM public.waitlist w
    JOIN public.products p ON w.product_id = p.id
    JOIN public.stores s ON w.store_id = s.id
    WHERE w.user_id = user_uuid
    ORDER BY w.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 