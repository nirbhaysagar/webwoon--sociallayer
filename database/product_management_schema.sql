-- Product Management Database Schema
-- Supabase PostgreSQL Schema for complete product management system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- PRODUCT MANAGEMENT
-- =============================================

-- Enhanced products table with additional fields
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS featured_image_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gallery_urls TEXT[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS condition TEXT CHECK (condition IN ('new', 'used', 'refurbished')) DEFAULT 'new';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS warranty_info TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS return_policy TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS shipping_info JSONB DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tax_info JSONB DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS favorite_count INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating_average DECIMAL(3,2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- Product categories (enhanced)
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES public.product_categories(id),
    image_url TEXT,
    icon TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product variants (enhanced) - Updated to use BIGINT for product_id
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    weight DECIMAL(8,2),
    dimensions JSONB,
    attributes JSONB DEFAULT '{}',
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product images (enhanced) - Updated to use BIGINT for product_id
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    title TEXT,
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    file_size INTEGER,
    file_type TEXT,
    dimensions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product attributes
CREATE TABLE IF NOT EXISTS public.product_attributes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT CHECK (type IN ('text', 'number', 'boolean', 'select', 'multiselect', 'color', 'size')) NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    is_filterable BOOLEAN DEFAULT FALSE,
    is_searchable BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product attribute values
CREATE TABLE IF NOT EXISTS public.product_attribute_values (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    attribute_id UUID REFERENCES public.product_attributes(id) ON DELETE CASCADE,
    value TEXT NOT NULL,
    slug TEXT NOT NULL,
    color_hex TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product attribute assignments - Updated to use BIGINT for product_id
CREATE TABLE IF NOT EXISTS public.product_attribute_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE NULL,
    attribute_id UUID REFERENCES public.product_attributes(id) ON DELETE CASCADE,
    attribute_value_id UUID REFERENCES public.product_attribute_values(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product tags
CREATE TABLE IF NOT EXISTS public.product_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product tag assignments - Updated to use BIGINT for product_id
CREATE TABLE IF NOT EXISTS public.product_tag_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.product_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, tag_id)
);

-- Product reviews - Updated to use BIGINT for product_id and order_id
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    order_id BIGINT REFERENCES public.orders(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    title TEXT,
    comment TEXT,
    images TEXT[],
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    is_helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product favorites - Updated to use BIGINT for product_id
CREATE TABLE IF NOT EXISTS public.product_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, user_id)
);

-- Product views tracking - Updated to use BIGINT for product_id
CREATE TABLE IF NOT EXISTS public.product_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product inventory history - Updated to use BIGINT for product_id
CREATE TABLE IF NOT EXISTS public.product_inventory_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    change_type TEXT CHECK (change_type IN ('purchase', 'sale', 'adjustment', 'return', 'damage', 'transfer')) NOT NULL,
    quantity_change INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    reason TEXT,
    reference_id TEXT,
    notes TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product price history - Updated to use BIGINT for product_id
CREATE TABLE IF NOT EXISTS public.product_price_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    price_type TEXT CHECK (price_type IN ('regular', 'sale', 'cost')) NOT NULL,
    old_price DECIMAL(10,2),
    new_price DECIMAL(10,2) NOT NULL,
    change_reason TEXT,
    effective_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product bulk operations
CREATE TABLE IF NOT EXISTS public.product_bulk_operations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    operation_type TEXT CHECK (operation_type IN ('update', 'delete', 'publish', 'unpublish', 'category_change', 'price_update')) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    filters JSONB,
    changes JSONB,
    total_products INTEGER DEFAULT 0,
    processed_products INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    error_log JSONB DEFAULT '[]',
    created_by UUID REFERENCES public.users(id),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_condition ON public.products(condition);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id ON public.product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_is_active ON public.product_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_product_categories_sort_order ON public.product_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON public.product_categories(slug);

-- Variants indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_is_active ON public.product_variants(is_active);
CREATE INDEX IF NOT EXISTS idx_product_variants_price ON public.product_variants(price);

-- Images indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_variant_id ON public.product_images(variant_id);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON public.product_images(is_primary);
CREATE INDEX IF NOT EXISTS idx_product_images_sort_order ON public.product_images(sort_order);

-- Attributes indexes
CREATE INDEX IF NOT EXISTS idx_product_attributes_slug ON public.product_attributes(slug);
CREATE INDEX IF NOT EXISTS idx_product_attributes_type ON public.product_attributes(type);
CREATE INDEX IF NOT EXISTS idx_product_attributes_is_filterable ON public.product_attributes(is_filterable);

-- Attribute values indexes
CREATE INDEX IF NOT EXISTS idx_product_attribute_values_attribute_id ON public.product_attribute_values(attribute_id);
CREATE INDEX IF NOT EXISTS idx_product_attribute_values_slug ON public.product_attribute_values(slug);

-- Attribute assignments indexes
CREATE INDEX IF NOT EXISTS idx_product_attribute_assignments_product_id ON public.product_attribute_assignments(product_id);
CREATE INDEX IF NOT EXISTS idx_product_attribute_assignments_variant_id ON public.product_attribute_assignments(variant_id);
CREATE INDEX IF NOT EXISTS idx_product_attribute_assignments_attribute_id ON public.product_attribute_assignments(attribute_id);

-- Tags indexes
CREATE INDEX IF NOT EXISTS idx_product_tags_slug ON public.product_tags(slug);

-- Tag assignments indexes
CREATE INDEX IF NOT EXISTS idx_product_tag_assignments_product_id ON public.product_tag_assignments(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tag_assignments_tag_id ON public.product_tag_assignments(tag_id);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON public.product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_is_approved ON public.product_reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON public.product_reviews(created_at);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_product_favorites_product_id ON public.product_favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_product_favorites_user_id ON public.product_favorites(user_id);

-- Views indexes
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON public.product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_user_id ON public.product_views(user_id);
CREATE INDEX IF NOT EXISTS idx_product_views_viewed_at ON public.product_views(viewed_at);

-- Inventory history indexes
CREATE INDEX IF NOT EXISTS idx_product_inventory_history_product_id ON public.product_inventory_history(product_id);
CREATE INDEX IF NOT EXISTS idx_product_inventory_history_variant_id ON public.product_inventory_history(variant_id);
CREATE INDEX IF NOT EXISTS idx_product_inventory_history_change_type ON public.product_inventory_history(change_type);
CREATE INDEX IF NOT EXISTS idx_product_inventory_history_created_at ON public.product_inventory_history(created_at);

-- Price history indexes
CREATE INDEX IF NOT EXISTS idx_product_price_history_product_id ON public.product_price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_product_price_history_variant_id ON public.product_price_history(variant_id);
CREATE INDEX IF NOT EXISTS idx_product_price_history_price_type ON public.product_price_history(price_type);
CREATE INDEX IF NOT EXISTS idx_product_price_history_effective_date ON public.product_price_history(effective_date);

-- Bulk operations indexes
CREATE INDEX IF NOT EXISTS idx_product_bulk_operations_status ON public.product_bulk_operations(status);
CREATE INDEX IF NOT EXISTS idx_product_bulk_operations_created_by ON public.product_bulk_operations(created_by);
CREATE INDEX IF NOT EXISTS idx_product_bulk_operations_created_at ON public.product_bulk_operations(created_at);

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
CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_product_categories_updated_at
    BEFORE UPDATE ON public.product_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_product_variants_updated_at
    BEFORE UPDATE ON public.product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_product_attributes_updated_at
    BEFORE UPDATE ON public.product_attributes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_product_tags_updated_at
    BEFORE UPDATE ON public.product_tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_product_reviews_updated_at
    BEFORE UPDATE ON public.product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to generate product slug
CREATE OR REPLACE FUNCTION generate_product_slug(product_name TEXT, product_id BIGINT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Convert name to slug
    base_slug := LOWER(REGEXP_REPLACE(product_name, '[^a-zA-Z0-9\s-]', '', 'g'));
    base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
    base_slug := TRIM(BOTH '-' FROM base_slug);
    
    final_slug := base_slug;
    
    -- Check if slug exists
    WHILE EXISTS (
        SELECT 1 FROM public.products 
        WHERE slug = final_slug 
        AND (product_id IS NULL OR id != product_id)
    ) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to update product rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update product rating when review is added/updated/deleted
    UPDATE public.products 
    SET 
        rating_average = (
            SELECT AVG(rating)::DECIMAL(3,2)
            FROM public.product_reviews 
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
            AND is_approved = TRUE
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM public.product_reviews 
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
            AND is_approved = TRUE
        )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for product rating updates
CREATE TRIGGER trigger_update_product_rating
    AFTER INSERT OR UPDATE OR DELETE ON public.product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_product_rating();

-- Function to update product view count
CREATE OR REPLACE FUNCTION update_product_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products 
    SET view_count = (
        SELECT COUNT(*)
        FROM public.product_views 
        WHERE product_id = NEW.product_id
    )
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for product view count updates
CREATE TRIGGER trigger_update_product_view_count
    AFTER INSERT ON public.product_views
    FOR EACH ROW
    EXECUTE FUNCTION update_product_view_count();

-- Function to update product favorite count
CREATE OR REPLACE FUNCTION update_product_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products 
    SET favorite_count = (
        SELECT COUNT(*)
        FROM public.product_favorites 
        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for product favorite count updates
CREATE TRIGGER trigger_update_product_favorite_count
    AFTER INSERT OR DELETE ON public.product_favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_product_favorite_count();

-- Function to log inventory changes
CREATE OR REPLACE FUNCTION log_inventory_change()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.product_inventory_history (
        product_id,
        variant_id,
        change_type,
        quantity_change,
        previous_quantity,
        new_quantity,
        reason,
        created_by
    ) VALUES (
        COALESCE(NEW.product_id, OLD.product_id),
        COALESCE(NEW.id, OLD.id),
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'purchase'
            WHEN TG_OP = 'DELETE' THEN 'sale'
            ELSE 'adjustment'
        END,
        COALESCE(NEW.stock_quantity, 0) - COALESCE(OLD.stock_quantity, 0),
        COALESCE(OLD.stock_quantity, 0),
        COALESCE(NEW.stock_quantity, 0),
        'System update',
        NULL
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for inventory logging
CREATE TRIGGER trigger_log_inventory_change
    AFTER INSERT OR UPDATE OR DELETE ON public.product_variants
    FOR EACH ROW
    EXECUTE FUNCTION log_inventory_change();

-- Function to log price changes
CREATE OR REPLACE FUNCTION log_price_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.price IS DISTINCT FROM NEW.price THEN
        INSERT INTO public.product_price_history (
            product_id,
            variant_id,
            price_type,
            old_price,
            new_price,
            change_reason,
            created_by
        ) VALUES (
            NEW.product_id,
            NEW.id,
            'regular',
            OLD.price,
            NEW.price,
            'Price update',
            NULL
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for price logging
CREATE TRIGGER trigger_log_price_change
    AFTER UPDATE ON public.product_variants
    FOR EACH ROW
    EXECUTE FUNCTION log_price_change();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attribute_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_inventory_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_bulk_operations ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Users can view active products" ON public.products
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Store owners can manage their products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.stores 
            WHERE id = products.store_id 
            AND owner_id = auth.uid()
        )
    );

-- Categories policies
CREATE POLICY "Users can view active categories" ON public.product_categories
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Store owners can manage categories" ON public.product_categories
    FOR ALL USING (auth.uid() IN (SELECT owner_id FROM public.stores));

-- Variants policies
CREATE POLICY "Users can view active variants" ON public.product_variants
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Store owners can manage variants" ON public.product_variants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.products p
            JOIN public.stores s ON p.store_id = s.id
            WHERE p.id = product_variants.product_id 
            AND s.owner_id = auth.uid()
        )
    );

-- Images policies
CREATE POLICY "Users can view product images" ON public.product_images
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Store owners can manage images" ON public.product_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.products p
            JOIN public.stores s ON p.store_id = s.id
            WHERE p.id = product_images.product_id 
            AND s.owner_id = auth.uid()
        )
    );

-- Attributes policies
CREATE POLICY "Users can view attributes" ON public.product_attributes
    FOR SELECT USING (TRUE);

CREATE POLICY "Store owners can manage attributes" ON public.product_attributes
    FOR ALL USING (auth.uid() IN (SELECT owner_id FROM public.stores));

-- Attribute values policies
CREATE POLICY "Users can view attribute values" ON public.product_attribute_values
    FOR SELECT USING (TRUE);

CREATE POLICY "Store owners can manage attribute values" ON public.product_attribute_values
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.product_attributes pa
            WHERE pa.id = product_attribute_values.attribute_id
        )
    );

-- Attribute assignments policies
CREATE POLICY "Users can view attribute assignments" ON public.product_attribute_assignments
    FOR SELECT USING (TRUE);

CREATE POLICY "Store owners can manage attribute assignments" ON public.product_attribute_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.products p
            JOIN public.stores s ON p.store_id = s.id
            WHERE p.id = product_attribute_assignments.product_id 
            AND s.owner_id = auth.uid()
        )
    );

-- Tags policies
CREATE POLICY "Users can view tags" ON public.product_tags
    FOR SELECT USING (TRUE);

CREATE POLICY "Store owners can manage tags" ON public.product_tags
    FOR ALL USING (auth.uid() IN (SELECT owner_id FROM public.stores));

-- Tag assignments policies
CREATE POLICY "Users can view tag assignments" ON public.product_tag_assignments
    FOR SELECT USING (TRUE);

CREATE POLICY "Store owners can manage tag assignments" ON public.product_tag_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.products p
            JOIN public.stores s ON p.store_id = s.id
            WHERE p.id = product_tag_assignments.product_id 
            AND s.owner_id = auth.uid()
        )
    );

-- Reviews policies
CREATE POLICY "Users can view approved reviews" ON public.product_reviews
    FOR SELECT USING (is_approved = TRUE);

CREATE POLICY "Users can create reviews" ON public.product_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.product_reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Store owners can manage reviews" ON public.product_reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.products p
            JOIN public.stores s ON p.store_id = s.id
            WHERE p.id = product_reviews.product_id 
            AND s.owner_id = auth.uid()
        )
    );

-- Favorites policies
CREATE POLICY "Users can view their own favorites" ON public.product_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites" ON public.product_favorites
    FOR ALL USING (auth.uid() = user_id);

-- Views policies
CREATE POLICY "Users can create view records" ON public.product_views
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Store owners can view analytics" ON public.product_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products p
            JOIN public.stores s ON p.store_id = s.id
            WHERE p.id = product_views.product_id 
            AND s.owner_id = auth.uid()
        )
    );

-- Inventory history policies
CREATE POLICY "Store owners can view inventory history" ON public.product_inventory_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products p
            JOIN public.stores s ON p.store_id = s.id
            WHERE p.id = product_inventory_history.product_id 
            AND s.owner_id = auth.uid()
        )
    );

-- Price history policies
CREATE POLICY "Store owners can view price history" ON public.product_price_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products p
            JOIN public.stores s ON p.store_id = s.id
            WHERE p.id = product_price_history.product_id 
            AND s.owner_id = auth.uid()
        )
    );

-- Bulk operations policies
CREATE POLICY "Store owners can manage bulk operations" ON public.product_bulk_operations
    FOR ALL USING (auth.uid() = created_by);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get product with all related data - Updated to use BIGINT
CREATE OR REPLACE FUNCTION get_product_with_details(product_uuid BIGINT)
RETURNS TABLE (
    id BIGINT,
    name TEXT,
    description TEXT,
    price DECIMAL(10,2),
    compare_price DECIMAL(10,2),
    stock_quantity INTEGER,
    images TEXT[],
    variants JSONB,
    attributes JSONB,
    tags TEXT[],
    rating_average DECIMAL(3,2),
    rating_count INTEGER,
    view_count INTEGER,
    favorite_count INTEGER,
    is_favorited BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.compare_price,
        p.stock_quantity,
        p.gallery_urls,
        COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'id', pv.id,
                    'name', pv.name,
                    'price', pv.price,
                    'stock_quantity', pv.stock_quantity,
                    'attributes', pv.attributes
                )
            ) FROM public.product_variants pv WHERE pv.product_id = p.id AND pv.is_active = TRUE),
            '[]'::json
        ) as variants,
        COALESCE(
            (SELECT json_object_agg(pa.name, pav.value)
             FROM public.product_attribute_assignments paa
             JOIN public.product_attributes pa ON paa.attribute_id = pa.id
             JOIN public.product_attribute_values pav ON paa.attribute_value_id = pav.id
             WHERE paa.product_id = p.id),
            '{}'::json
        ) as attributes,
        COALESCE(
            (SELECT array_agg(pt.name)
             FROM public.product_tag_assignments pta
             JOIN public.product_tags pt ON pta.tag_id = pt.id
             WHERE pta.product_id = p.id),
            ARRAY[]::TEXT[]
        ) as tags,
        p.rating_average,
        p.rating_count,
        p.view_count,
        p.favorite_count,
        EXISTS(
            SELECT 1 FROM public.product_favorites pf
            WHERE pf.product_id = p.id AND pf.user_id = auth.uid()
        ) as is_favorited
    FROM public.products p
    WHERE p.id = product_uuid AND p.is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to search products - Updated to use BIGINT
CREATE OR REPLACE FUNCTION search_products(
    search_query TEXT,
    category_id UUID DEFAULT NULL,
    min_price DECIMAL DEFAULT NULL,
    max_price DECIMAL DEFAULT NULL,
    brands TEXT[] DEFAULT NULL,
    conditions TEXT[] DEFAULT NULL,
    sort_by TEXT DEFAULT 'created_at',
    sort_order TEXT DEFAULT 'DESC',
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id BIGINT,
    name TEXT,
    description TEXT,
    price DECIMAL(10,2),
    compare_price DECIMAL(10,2),
    featured_image_url TEXT,
    rating_average DECIMAL(3,2),
    rating_count INTEGER,
    store_name TEXT,
    category_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.compare_price,
        p.featured_image_url,
        p.rating_average,
        p.rating_count,
        s.name as store_name,
        pc.name as category_name
    FROM public.products p
    JOIN public.stores s ON p.store_id = s.id
    LEFT JOIN public.product_categories pc ON p.category_id = pc.id
    WHERE p.is_active = TRUE
    AND (
        search_query IS NULL 
        OR p.name ILIKE '%' || search_query || '%'
        OR p.description ILIKE '%' || search_query || '%'
        OR p.brand ILIKE '%' || search_query || '%'
    )
    AND (category_id IS NULL OR p.category_id = category_id)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
    AND (brands IS NULL OR p.brand = ANY(brands))
    AND (conditions IS NULL OR p.condition = ANY(conditions))
    ORDER BY 
        CASE WHEN sort_by = 'price' AND sort_order = 'ASC' THEN p.price END ASC,
        CASE WHEN sort_by = 'price' AND sort_order = 'DESC' THEN p.price END DESC,
        CASE WHEN sort_by = 'rating' AND sort_order = 'ASC' THEN p.rating_average END ASC,
        CASE WHEN sort_by = 'rating' AND sort_order = 'DESC' THEN p.rating_average END DESC,
        CASE WHEN sort_by = 'created_at' AND sort_order = 'ASC' THEN p.created_at END ASC,
        CASE WHEN sort_by = 'created_at' AND sort_order = 'DESC' THEN p.created_at END DESC
    LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get product analytics - Updated to use BIGINT
CREATE OR REPLACE FUNCTION get_product_analytics(product_uuid BIGINT)
RETURNS TABLE (
    total_views INTEGER,
    total_favorites INTEGER,
    total_reviews INTEGER,
    average_rating DECIMAL(3,2),
    sales_count INTEGER,
    revenue DECIMAL(10,2),
    low_stock_variants INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE((SELECT COUNT(*) FROM public.product_views WHERE product_id = product_uuid), 0) as total_views,
        COALESCE((SELECT COUNT(*) FROM public.product_favorites WHERE product_id = product_uuid), 0) as total_favorites,
        COALESCE((SELECT COUNT(*) FROM public.product_reviews WHERE product_id = product_uuid AND is_approved = TRUE), 0) as total_reviews,
        COALESCE((SELECT AVG(rating) FROM public.product_reviews WHERE product_id = product_uuid AND is_approved = TRUE), 0) as average_rating,
        COALESCE((SELECT COUNT(*) FROM public.order_items oi JOIN public.orders o ON oi.order_id = o.id WHERE oi.product_id = product_uuid AND o.status = 'completed'), 0) as sales_count,
        COALESCE((SELECT SUM(oi.price * oi.quantity) FROM public.order_items oi JOIN public.orders o ON oi.order_id = o.id WHERE oi.product_id = product_uuid AND o.status = 'completed'), 0) as revenue,
        COALESCE((SELECT COUNT(*) FROM public.product_variants WHERE product_id = product_uuid AND stock_quantity <= low_stock_threshold), 0) as low_stock_variants;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

GRANT SELECT ON public.products TO authenticated;
GRANT SELECT ON public.product_categories TO authenticated;
GRANT SELECT ON public.product_variants TO authenticated;
GRANT SELECT ON public.product_images TO authenticated;
GRANT SELECT ON public.product_attributes TO authenticated;
GRANT SELECT ON public.product_attribute_values TO authenticated;
GRANT SELECT ON public.product_attribute_assignments TO authenticated;
GRANT SELECT ON public.product_tags TO authenticated;
GRANT SELECT ON public.product_tag_assignments TO authenticated;
GRANT SELECT ON public.product_reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_favorites TO authenticated;
GRANT INSERT ON public.product_views TO authenticated;

GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.product_categories TO authenticated;
GRANT ALL ON public.product_variants TO authenticated;
GRANT ALL ON public.product_images TO authenticated;
GRANT ALL ON public.product_attributes TO authenticated;
GRANT ALL ON public.product_attribute_values TO authenticated;
GRANT ALL ON public.product_attribute_assignments TO authenticated;
GRANT ALL ON public.product_tags TO authenticated;
GRANT ALL ON public.product_tag_assignments TO authenticated;
GRANT ALL ON public.product_reviews TO authenticated;
GRANT ALL ON public.product_inventory_history TO authenticated;
GRANT ALL ON public.product_price_history TO authenticated;
GRANT ALL ON public.product_bulk_operations TO authenticated;

GRANT EXECUTE ON FUNCTION get_product_with_details(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION search_products(TEXT, UUID, DECIMAL, DECIMAL, TEXT[], TEXT[], TEXT, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_product_analytics(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_product_slug(TEXT, BIGINT) TO authenticated;

-- =============================================
-- SAMPLE DATA (for testing)
-- =============================================

-- Insert sample categories
INSERT INTO public.product_categories (name, slug, description, icon, color, sort_order) VALUES
    ('Electronics', 'electronics', 'Electronic devices and gadgets', 'phone-portrait', '#3B82F6', 1),
    ('Fashion', 'fashion', 'Clothing and accessories', 'shirt', '#EF4444', 2),
    ('Home & Garden', 'home-garden', 'Home decor and garden supplies', 'home', '#10B981', 3),
    ('Sports', 'sports', 'Sports equipment and gear', 'fitness', '#F59E0B', 4),
    ('Books', 'books', 'Books and publications', 'library', '#8B5CF6', 5)
ON CONFLICT DO NOTHING;

-- Insert sample attributes
INSERT INTO public.product_attributes (name, slug, type, description, is_filterable, is_searchable) VALUES
    ('Color', 'color', 'select', 'Product color', TRUE, FALSE),
    ('Size', 'size', 'select', 'Product size', TRUE, FALSE),
    ('Material', 'material', 'select', 'Product material', TRUE, TRUE),
    ('Brand', 'brand', 'text', 'Product brand', TRUE, TRUE),
    ('Weight', 'weight', 'number', 'Product weight', FALSE, FALSE)
ON CONFLICT DO NOTHING;

-- Insert sample attribute values
INSERT INTO public.product_attribute_values (attribute_id, value, slug, color_hex) VALUES
    ((SELECT id FROM public.product_attributes WHERE slug = 'color'), 'Red', 'red', '#EF4444'),
    ((SELECT id FROM public.product_attributes WHERE slug = 'color'), 'Blue', 'blue', '#3B82F6'),
    ((SELECT id FROM public.product_attributes WHERE slug = 'color'), 'Green', 'green', '#10B981'),
    ((SELECT id FROM public.product_attributes WHERE slug = 'size'), 'Small', 'small', NULL),
    ((SELECT id FROM public.product_attributes WHERE slug = 'size'), 'Medium', 'medium', NULL),
    ((SELECT id FROM public.product_attributes WHERE slug = 'size'), 'Large', 'large', NULL),
    ((SELECT id FROM public.product_attributes WHERE slug = 'material'), 'Cotton', 'cotton', NULL),
    ((SELECT id FROM public.product_attributes WHERE slug = 'material'), 'Polyester', 'polyester', NULL),
    ((SELECT id FROM public.product_attributes WHERE slug = 'material'), 'Leather', 'leather', NULL)
ON CONFLICT DO NOTHING;

-- Insert sample tags
INSERT INTO public.product_tags (name, slug, description, color) VALUES
    ('Featured', 'featured', 'Featured products', '#EF4444'),
    ('New Arrival', 'new-arrival', 'Newly added products', '#10B981'),
    ('Best Seller', 'best-seller', 'Best selling products', '#F59E0B'),
    ('Sale', 'sale', 'Products on sale', '#EF4444'),
    ('Limited Edition', 'limited-edition', 'Limited edition products', '#8B5CF6')
ON CONFLICT DO NOTHING; 