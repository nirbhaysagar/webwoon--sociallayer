// =============================================
// PRODUCT MANAGEMENT TYPES
// =============================================

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  level: number;
  sort_order: number;
  is_active: boolean;
  image_url?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  created_at: string;
  updated_at: string;
  children?: ProductCategory[];
}

export interface ProductBrand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  slug: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'color' | 'size';
  is_required: boolean;
  is_filterable: boolean;
  is_searchable: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  values?: ProductAttributeValue[];
}

export interface ProductAttributeValue {
  id: string;
  attribute_id: string;
  value: string;
  display_value?: string;
  color_code?: string;
  sort_order: number;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku?: string;
  barcode?: string;
  name?: string;
  description?: string;
  price?: number;
  compare_price?: number;
  cost_price?: number;
  stock_quantity: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  is_active: boolean;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  created_at: string;
  updated_at: string;
  attributes?: ProductVariantAttribute[];
  images?: ProductImage[];
}

export interface ProductVariantAttribute {
  id: string;
  variant_id: string;
  attribute_id: string;
  attribute_value_id: string;
  created_at: string;
  attribute?: ProductAttribute;
  attribute_value?: ProductAttributeValue;
}

export interface ProductImage {
  id: string;
  product_id?: string;
  variant_id?: string;
  url: string;
  alt_text?: string;
  title?: string;
  type: 'main' | 'gallery' | 'thumbnail' | 'zoom';
  width?: number;
  height?: number;
  file_size?: number;
  mime_type?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  created_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  category_id?: string;
  brand_id?: string;
  
  // Basic Info
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  
  // Pricing
  base_price: number;
  compare_price?: number;
  cost_price?: number;
  tax_rate: number;
  
  // Inventory
  sku?: string;
  barcode?: string;
  stock_quantity: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  allow_backorders: boolean;
  max_order_quantity?: number;
  min_order_quantity: number;
  
  // Product Status
  status: 'draft' | 'active' | 'inactive' | 'archived';
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
  
  // SEO
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  meta_tags?: Record<string, any>;
  
  // Dimensions & Weight
  weight?: number;
  weight_unit: string;
  length?: number;
  width?: number;
  height?: number;
  dimension_unit: string;
  
  // Shipping
  requires_shipping: boolean;
  shipping_class?: string;
  free_shipping: boolean;
  
  // Ratings & Reviews
  average_rating: number;
  review_count: number;
  
  // Analytics
  view_count: number;
  purchase_count: number;
  wishlist_count: number;
  
  // Timestamps
  published_at?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  category?: ProductCategory;
  brand?: ProductBrand;
  variants?: ProductVariant[];
  images?: ProductImage[];
  tags?: ProductTag[];
  related_products?: Product[];
}

export interface ProductInventoryHistory {
  id: string;
  product_id: string;
  variant_id?: string;
  change_type: 'purchase' | 'return' | 'adjustment' | 'restock' | 'damage';
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  order_id?: string;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface ProductPriceHistory {
  id: string;
  product_id: string;
  variant_id?: string;
  old_price?: number;
  new_price?: number;
  change_reason?: string;
  reference_id?: string;
  reference_type?: string;
  created_by?: string;
  created_at: string;
}

export interface ProductSearchIndex {
  id: string;
  product_id: string;
  search_vector: string;
  tags: string[];
  attributes: Record<string, any>;
  categories: string[];
  popularity_score: number;
  relevance_score: number;
  updated_at: string;
}

// =============================================
// PRODUCT FILTERS & SEARCH
// =============================================

export interface ProductFilters {
  category_id?: string;
  brand_id?: string;
  price_min?: number;
  price_max?: number;
  attributes?: Record<string, string[]>;
  tags?: string[];
  status?: string;
  is_featured?: boolean;
  is_bestseller?: boolean;
  is_new_arrival?: boolean;
  is_on_sale?: boolean;
  in_stock?: boolean;
  rating_min?: number;
  search_query?: string;
}

export interface ProductSortOptions {
  field: 'name' | 'price' | 'created_at' | 'average_rating' | 'view_count' | 'purchase_count';
  direction: 'asc' | 'desc';
}

export interface ProductSearchParams {
  query?: string;
  filters?: ProductFilters;
  sort?: ProductSortOptions;
  page?: number;
  limit?: number;
  include_variants?: boolean;
  include_images?: boolean;
  include_category?: boolean;
  include_brand?: boolean;
  include_tags?: boolean;
}

// =============================================
// PRODUCT CRUD OPERATIONS
// =============================================

export interface CreateProductData {
  store_id: string;
  category_id?: string;
  brand_id?: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  base_price: number;
  compare_price?: number;
  cost_price?: number;
  tax_rate?: number;
  sku?: string;
  barcode?: string;
  stock_quantity?: number;
  low_stock_threshold?: number;
  track_inventory?: boolean;
  allow_backorders?: boolean;
  max_order_quantity?: number;
  min_order_quantity?: number;
  status?: string;
  is_featured?: boolean;
  is_bestseller?: boolean;
  is_new_arrival?: boolean;
  is_on_sale?: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  weight?: number;
  weight_unit?: string;
  length?: number;
  width?: number;
  height?: number;
  dimension_unit?: string;
  requires_shipping?: boolean;
  shipping_class?: string;
  free_shipping?: boolean;
  variants?: CreateProductVariantData[];
  images?: CreateProductImageData[];
  tags?: string[];
}

export interface CreateProductVariantData {
  sku?: string;
  barcode?: string;
  name?: string;
  description?: string;
  price?: number;
  compare_price?: number;
  cost_price?: number;
  stock_quantity?: number;
  low_stock_threshold?: number;
  track_inventory?: boolean;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  attributes?: Record<string, string>;
}

export interface CreateProductImageData {
  url: string;
  alt_text?: string;
  title?: string;
  type?: string;
  width?: number;
  height?: number;
  file_size?: number;
  mime_type?: string;
  sort_order?: number;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export interface ProductInventoryAdjustment {
  product_id: string;
  variant_id?: string;
  quantity_change: number;
  change_type: 'adjustment' | 'restock' | 'damage';
  notes?: string;
  reference_id?: string;
  reference_type?: string;
}

export interface ProductPriceUpdate {
  product_id: string;
  variant_id?: string;
  new_price: number;
  change_reason?: string;
  reference_id?: string;
  reference_type?: string;
}

// =============================================
// PRODUCT ANALYTICS
// =============================================

export interface ProductAnalytics {
  product_id: string;
  views: number;
  purchases: number;
  revenue: number;
  average_order_value: number;
  conversion_rate: number;
  wishlist_adds: number;
  cart_adds: number;
  reviews: number;
  average_rating: number;
  period: 'day' | 'week' | 'month' | 'year';
  date: string;
}

export interface ProductPerformanceMetrics {
  total_products: number;
  active_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
  total_revenue: number;
  total_orders: number;
  average_rating: number;
  total_reviews: number;
}

// =============================================
// PRODUCT BULK OPERATIONS
// =============================================

export interface BulkProductOperation {
  product_ids: string[];
  operation: 'activate' | 'deactivate' | 'archive' | 'delete' | 'update_category' | 'update_brand' | 'update_price' | 'update_inventory';
  data?: Record<string, any>;
}

export interface ProductImportData {
  products: CreateProductData[];
  update_existing?: boolean;
  skip_errors?: boolean;
}

export interface ProductExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  include_variants?: boolean;
  include_images?: boolean;
  include_analytics?: boolean;
  filters?: ProductFilters;
}

// =============================================
// PRODUCT VALIDATION
// =============================================

export interface ProductValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ProductValidationResult {
  isValid: boolean;
  errors: ProductValidationError[];
  warnings: ProductValidationError[];
}

// =============================================
// PRODUCT CACHE & OPTIMIZATION
// =============================================

export interface ProductCacheConfig {
  enable_cache: boolean;
  cache_duration: number; // seconds
  cache_keys: string[];
  invalidate_on_update: boolean;
}

export interface ProductOptimizationOptions {
  compress_images: boolean;
  generate_thumbnails: boolean;
  optimize_seo: boolean;
  update_search_index: boolean;
  update_related_products: boolean;
} 