-- =============================================
-- AMAZON-STYLE PRODUCT MANAGEMENT SYSTEM (CLEAN VERSION)
-- =============================================

-- Stores Table (Required for products)
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    owner_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    is_verified BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Categories (Hierarchical like Amazon)
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Brands
CREATE TABLE IF NOT EXISTS product_brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Attributes (Color, Size, Material, etc.)
CREATE TABLE IF NOT EXISTS product_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'number', 'boolean', 'select', 'color', 'size')),
    is_required BOOLEAN DEFAULT false,
    is_filterable BOOLEAN DEFAULT true,
    is_searchable BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Attribute Values
CREATE TABLE IF NOT EXISTS product_attribute_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attribute_id UUID REFERENCES product_attributes(id) ON DELETE CASCADE,
    value VARCHAR(255) NOT NULL,
    display_value VARCHAR(255),
    color_code VARCHAR(7),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products (Main Product Table)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES product_categories(id),
    brand_id UUID REFERENCES product_brands(id),
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    
    -- Pricing
    base_price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    tax_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Inventory
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    track_inventory BOOLEAN DEFAULT true,
    allow_backorders BOOLEAN DEFAULT false,
    max_order_quantity INTEGER,
    min_order_quantity INTEGER DEFAULT 1,
    
    -- Product Status
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'archived')),
    is_featured BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    is_new_arrival BOOLEAN DEFAULT false,
    is_on_sale BOOLEAN DEFAULT false,
    
    -- SEO
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT[],
    meta_tags JSONB,
    
    -- Dimensions & Weight
    weight DECIMAL(8,2),
    weight_unit VARCHAR(10) DEFAULT 'kg',
    length DECIMAL(8,2),
    width DECIMAL(8,2),
    height DECIMAL(8,2),
    dimension_unit VARCHAR(10) DEFAULT 'cm',
    
    -- Shipping
    requires_shipping BOOLEAN DEFAULT true,
    shipping_class VARCHAR(50),
    free_shipping BOOLEAN DEFAULT false,
    
    -- Ratings & Reviews
    average_rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    purchase_count INTEGER DEFAULT 0,
    wishlist_count INTEGER DEFAULT 0,
    
    -- Timestamps
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(store_id, slug)
);

-- Product Variants (Size, Color, etc.)
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    
    -- Variant Info
    name VARCHAR(255),
    description TEXT,
    
    -- Pricing
    price DECIMAL(10,2),
    compare_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    
    -- Inventory
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    track_inventory BOOLEAN DEFAULT true,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Dimensions
    weight DECIMAL(8,2),
    length DECIMAL(8,2),
    width DECIMAL(8,2),
    height DECIMAL(8,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Variant Attributes (Size: Large, Color: Red, etc.)
CREATE TABLE IF NOT EXISTS product_variant_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    attribute_id UUID REFERENCES product_attributes(id) ON DELETE CASCADE,
    attribute_value_id UUID REFERENCES product_attribute_values(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(variant_id, attribute_id)
);

-- Product Images
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    
    -- Image Info
    url TEXT NOT NULL,
    alt_text VARCHAR(255),
    title VARCHAR(255),
    
    -- Image Types
    type VARCHAR(50) DEFAULT 'main' CHECK (type IN ('main', 'gallery', 'thumbnail', 'zoom')),
    
    -- Image Metadata
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    mime_type VARCHAR(100),
    
    -- Sorting
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Tags
CREATE TABLE IF NOT EXISTS product_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product-Tag Relationships
CREATE TABLE IF NOT EXISTS product_tag_relationships (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES product_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (product_id, tag_id)
);

-- Product Related Products
CREATE TABLE IF NOT EXISTS product_related_products (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    related_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) DEFAULT 'related' CHECK (relationship_type IN ('related', 'cross_sell', 'upsell', 'accessory')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (product_id, related_product_id),
    CHECK (product_id != related_product_id)
);

-- Product Inventory History
CREATE TABLE IF NOT EXISTS product_inventory_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    
    -- Change Info
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('purchase', 'return', 'adjustment', 'restock', 'damage')),
    quantity_change INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    
    -- Reference
    order_id UUID,
    reference_id UUID,
    reference_type VARCHAR(50),
    
    -- Notes
    notes TEXT,
    created_by UUID,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Price History
CREATE TABLE IF NOT EXISTS product_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    
    -- Price Change
    old_price DECIMAL(10,2),
    new_price DECIMAL(10,2),
    change_reason VARCHAR(100),
    
    -- Reference
    reference_id UUID,
    reference_type VARCHAR(50),
    
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Search Index (for full-text search)
CREATE TABLE IF NOT EXISTS product_search_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    
    -- Searchable Content
    search_vector tsvector,
    
    -- Search Metadata
    tags TEXT[],
    attributes JSONB,
    categories TEXT[],
    
    -- Search Ranking
    popularity_score DECIMAL(5,2) DEFAULT 0,
    relevance_score DECIMAL(5,2) DEFAULT 0,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Store Indexes
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status);

-- Product Indexes
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_bestseller ON products(is_bestseller);
CREATE INDEX IF NOT EXISTS idx_products_is_on_sale ON products(is_on_sale);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(base_price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_average_rating ON products(average_rating);

-- Category Indexes
CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id ON product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_level ON product_categories(level);
CREATE INDEX IF NOT EXISTS idx_product_categories_is_active ON product_categories(is_active);

-- Variant Indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

-- Image Indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_variant_id ON product_images(variant_id);
CREATE INDEX IF NOT EXISTS idx_product_images_type ON product_images(type);

-- Search Indexes
CREATE INDEX IF NOT EXISTS idx_product_search_vector ON product_search_index USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_product_search_tags ON product_search_index USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_product_search_categories ON product_search_index USING GIN(categories);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update product search vector
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO product_search_index (product_id, search_vector, tags, attributes, categories)
    VALUES (
        NEW.id,
        to_tsvector('english', 
            COALESCE(NEW.name, '') || ' ' || 
            COALESCE(NEW.description, '') || ' ' || 
            COALESCE(NEW.short_description, '')
        ),
        ARRAY[]::TEXT[],
        '{}'::JSONB,
        ARRAY[]::TEXT[]
    )
    ON CONFLICT (product_id) DO UPDATE SET
        search_vector = EXCLUDED.search_vector,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update search vector on product changes
CREATE TRIGGER trigger_update_product_search_vector
    AFTER INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_search_vector();

-- Function to update product inventory
CREATE OR REPLACE FUNCTION update_product_inventory()
RETURNS TRIGGER AS $$
BEGIN
    -- Update main product inventory
    UPDATE products 
    SET 
        stock_quantity = (
            SELECT COALESCE(SUM(stock_quantity), 0)
            FROM product_variants 
            WHERE product_id = NEW.product_id AND is_active = true
        ),
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update product inventory when variants change
CREATE TRIGGER trigger_update_product_inventory
    AFTER INSERT OR UPDATE OR DELETE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_product_inventory();

-- =============================================
-- SAMPLE DATA (Optional)
-- =============================================

-- Insert sample store
INSERT INTO stores (name, slug, description, owner_id) VALUES
('Demo Store', 'demo-store', 'A demo store for testing', '00000000-0000-0000-0000-000000000000');

-- Insert sample categories
INSERT INTO product_categories (name, slug, description, level) VALUES
('Electronics', 'electronics', 'Electronic devices and accessories', 0),
('Clothing', 'clothing', 'Fashion and apparel', 0),
('Home & Garden', 'home-garden', 'Home improvement and garden supplies', 0);

-- Insert subcategories
INSERT INTO product_categories (name, slug, description, parent_id, level) VALUES
('Smartphones', 'smartphones', 'Mobile phones and accessories', 
 (SELECT id FROM product_categories WHERE slug = 'electronics'), 1),
('Laptops', 'laptops', 'Portable computers', 
 (SELECT id FROM product_categories WHERE slug = 'electronics'), 1),
('Men''s Clothing', 'mens-clothing', 'Clothing for men', 
 (SELECT id FROM product_categories WHERE slug = 'clothing'), 1),
('Women''s Clothing', 'womens-clothing', 'Clothing for women', 
 (SELECT id FROM product_categories WHERE slug = 'clothing'), 1);

-- Insert sample brands
INSERT INTO product_brands (name, slug, description) VALUES
('Apple', 'apple', 'Think Different'),
('Samsung', 'samsung', 'Innovation for Everyone'),
('Nike', 'nike', 'Just Do It'),
('Adidas', 'adidas', 'Impossible Is Nothing');

-- Insert sample attributes
INSERT INTO product_attributes (name, slug, type, is_filterable) VALUES
('Color', 'color', 'color', true),
('Size', 'size', 'select', true),
('Material', 'material', 'select', true),
('Brand', 'brand', 'select', true);

-- Insert sample attribute values
INSERT INTO product_attribute_values (attribute_id, value, display_value) VALUES
((SELECT id FROM product_attributes WHERE slug = 'color'), 'red', 'Red'),
((SELECT id FROM product_attributes WHERE slug = 'color'), 'blue', 'Blue'),
((SELECT id FROM product_attributes WHERE slug = 'color'), 'green', 'Green'),
((SELECT id FROM product_attributes WHERE slug = 'size'), 's', 'Small'),
((SELECT id FROM product_attributes WHERE slug = 'size'), 'm', 'Medium'),
((SELECT id FROM product_attributes WHERE slug = 'size'), 'l', 'Large'),
((SELECT id FROM product_attributes WHERE slug = 'size'), 'xl', 'Extra Large'); 