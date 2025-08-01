-- =============================================
-- SAMPLE DATA FOR PRODUCT MANAGEMENT SYSTEM
-- =============================================

-- Sample Stores
INSERT INTO stores (id, name, slug, description, owner_id, store_status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'TechGadgets Store', 'tech-gadgets-store', 'Premium electronics and gadgets', '550e8400-e29b-41d4-a716-446655440010', 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'Fashion Boutique', 'fashion-boutique', 'Trendy fashion and accessories', '550e8400-e29b-41d4-a716-446655440011', 'active'),
('550e8400-e29b-41d4-a716-446655440003', 'Home & Garden', 'home-garden', 'Everything for your home and garden', '550e8400-e29b-41d4-a716-446655440012', 'active');

-- Sample Product Categories
INSERT INTO product_categories (id, name, slug, description, level, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'Electronics', 'electronics', 'Electronic devices and gadgets', 0, true),
('550e8400-e29b-41d4-a716-446655440021', 'Smartphones', 'smartphones', 'Mobile phones and accessories', 1, true),
('550e8400-e29b-41d4-a716-446655440022', 'Laptops', 'laptops', 'Portable computers and accessories', 1, true),
('550e8400-e29b-41d4-a716-446655440023', 'Fashion', 'fashion', 'Clothing and fashion accessories', 0, true),
('550e8400-e29b-41d4-a716-446655440024', 'Men''s Clothing', 'mens-clothing', 'Clothing for men', 1, true),
('550e8400-e29b-41d4-a716-446655440025', 'Women''s Clothing', 'womens-clothing', 'Clothing for women', 1, true);

-- Update parent_id for subcategories
UPDATE product_categories SET parent_id = '550e8400-e29b-41d4-a716-446655440020' WHERE id IN ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440022');
UPDATE product_categories SET parent_id = '550e8400-e29b-41d4-a716-446655440023' WHERE id IN ('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440025');

-- Sample Product Brands
INSERT INTO product_brands (id, name, slug, description, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440030', 'Apple', 'apple', 'Premium technology products', true),
('550e8400-e29b-41d4-a716-446655440031', 'Samsung', 'samsung', 'Innovative electronics and mobile devices', true),
('550e8400-e29b-41d4-a716-446655440032', 'Nike', 'nike', 'Athletic footwear and apparel', true),
('550e8400-e29b-41d4-a716-446655440033', 'Adidas', 'adidas', 'Sports clothing and footwear', true);

-- Sample Product Attributes
INSERT INTO product_attributes (id, name, slug, type, is_filterable, is_searchable) VALUES
('550e8400-e29b-41d4-a716-446655440040', 'Color', 'color', 'select', true, true),
('550e8400-e29b-41d4-a716-446655440041', 'Size', 'size', 'select', true, true),
('550e8400-e29b-41d4-a716-446655440042', 'Storage', 'storage', 'select', true, true),
('550e8400-e29b-41d4-a716-446655440043', 'Material', 'material', 'select', true, true);

-- Sample Attribute Values
INSERT INTO product_attribute_values (id, attribute_id, value, display_value, color_code) VALUES
-- Colors
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440040', 'black', 'Black', '#000000'),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440040', 'white', 'White', '#FFFFFF'),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440040', 'blue', 'Blue', '#0000FF'),
('550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440040', 'red', 'Red', '#FF0000'),
-- Sizes
('550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440041', 's', 'Small', NULL),
('550e8400-e29b-41d4-a716-446655440055', '550e8400-e29b-41d4-a716-446655440041', 'm', 'Medium', NULL),
('550e8400-e29b-41d4-a716-446655440056', '550e8400-e29b-41d4-a716-446655440041', 'l', 'Large', NULL),
('550e8400-e29b-41d4-a716-446655440057', '550e8400-e29b-41d4-a716-446655440041', 'xl', 'Extra Large', NULL),
-- Storage
('550e8400-e29b-41d4-a716-446655440058', '550e8400-e29b-41d4-a716-446655440042', '64gb', '64GB', NULL),
('550e8400-e29b-41d4-a716-446655440059', '550e8400-e29b-41d4-a716-446655440042', '128gb', '128GB', NULL),
('550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440042', '256gb', '256GB', NULL),
('550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440042', '512gb', '512GB', NULL);

-- Sample Products
INSERT INTO products (id, store_id, category_id, brand_id, name, slug, description, short_description, base_price, compare_price, stock_quantity, product_status, is_featured, is_bestseller) VALUES
-- Electronics
('550e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440030', 'iPhone 15 Pro', 'iphone-15-pro', 'The latest iPhone with advanced features and premium design', 'Premium smartphone with cutting-edge technology', 999.99, 1099.99, 50, 'active', true, true),
('550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440031', 'Samsung Galaxy S24', 'samsung-galaxy-s24', 'Flagship Android smartphone with exceptional performance', 'Powerful Android device with amazing camera', 899.99, 999.99, 45, 'active', true, false),
('550e8400-e29b-41d4-a716-446655440072', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440030', 'MacBook Pro 16"', 'macbook-pro-16', 'Professional laptop for creative work and development', 'High-performance laptop for professionals', 2499.99, 2699.99, 25, 'active', true, true),
-- Fashion
('550e8400-e29b-41d4-a716-446655440073', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440032', 'Nike Air Max 270', 'nike-air-max-270', 'Comfortable running shoes with excellent cushioning', 'Premium running shoes for maximum comfort', 129.99, 149.99, 100, 'active', false, true),
('550e8400-e29b-41d4-a716-446655440074', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440033', 'Adidas Ultraboost 22', 'adidas-ultraboost-22', 'High-performance running shoes with energy return', 'Elite running shoes with responsive cushioning', 179.99, 199.99, 75, 'active', true, false);

-- Sample Product Images
INSERT INTO product_images (id, product_id, url, alt_text, type, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440070', 'https://example.com/images/iphone-15-pro-main.jpg', 'iPhone 15 Pro - Main Image', 'main', 0),
('550e8400-e29b-41d4-a716-446655440081', '550e8400-e29b-41d4-a716-446655440070', 'https://example.com/images/iphone-15-pro-gallery-1.jpg', 'iPhone 15 Pro - Gallery Image 1', 'gallery', 1),
('550e8400-e29b-41d4-a716-446655440082', '550e8400-e29b-41d4-a716-446655440071', 'https://example.com/images/samsung-galaxy-s24-main.jpg', 'Samsung Galaxy S24 - Main Image', 'main', 0),
('550e8400-e29b-41d4-a716-446655440083', '550e8400-e29b-41d4-a716-446655440072', 'https://example.com/images/macbook-pro-16-main.jpg', 'MacBook Pro 16" - Main Image', 'main', 0),
('550e8400-e29b-41d4-a716-446655440084', '550e8400-e29b-41d4-a716-446655440073', 'https://example.com/images/nike-air-max-270-main.jpg', 'Nike Air Max 270 - Main Image', 'main', 0),
('550e8400-e29b-41d4-a716-446655440085', '550e8400-e29b-41d4-a716-446655440074', 'https://example.com/images/adidas-ultraboost-22-main.jpg', 'Adidas Ultraboost 22 - Main Image', 'main', 0);

-- Sample Product Tags
INSERT INTO product_tags (id, name, slug, color) VALUES
('550e8400-e29b-41d4-a716-446655440090', 'New Arrival', 'new-arrival', '#00FF00'),
('550e8400-e29b-41d4-a716-446655440091', 'Best Seller', 'best-seller', '#FFD700'),
('550e8400-e29b-41d4-a716-446655440092', 'On Sale', 'on-sale', '#FF0000'),
('550e8400-e29b-41d4-a716-446655440093', 'Premium', 'premium', '#800080'),
('550e8400-e29b-41d4-a716-446655440094', 'Limited Edition', 'limited-edition', '#FF4500');

-- Sample Product-Tag Relationships
INSERT INTO product_tag_relationships (product_id, tag_id) VALUES
('550e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440090'), -- iPhone 15 Pro - New Arrival
('550e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440091'), -- iPhone 15 Pro - Best Seller
('550e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440093'), -- iPhone 15 Pro - Premium
('550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440090'), -- Samsung Galaxy S24 - New Arrival
('550e8400-e29b-41d4-a716-446655440072', '550e8400-e29b-41d4-a716-446655440091'), -- MacBook Pro - Best Seller
('550e8400-e29b-41d4-a716-446655440072', '550e8400-e29b-41d4-a716-446655440093'), -- MacBook Pro - Premium
('550e8400-e29b-41d4-a716-446655440073', '550e8400-e29b-41d4-a716-446655440091'), -- Nike Air Max - Best Seller
('550e8400-e29b-41d4-a716-446655440074', '550e8400-e29b-41d4-a716-446655440090'), -- Adidas Ultraboost - New Arrival
('550e8400-e29b-41d4-a716-446655440074', '550e8400-e29b-41d4-a716-446655440093'); -- Adidas Ultraboost - Premium 