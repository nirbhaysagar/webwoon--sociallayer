import { supabase } from '../config/supabase';
import { Platform } from 'react-native';

export interface Product {
  id: string;
  store_id: string;
  category_id?: string;
  name: string;
  description?: string;
  short_description?: string;
  sku?: string;
  slug?: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  stock_quantity: number;
  low_stock_threshold: number;
  weight?: number;
  dimensions?: any;
  tags?: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  featured_image_url?: string;
  gallery_urls?: string[];
  video_url?: string;
  brand?: string;
  model?: string;
  condition?: 'new' | 'used' | 'refurbished';
  warranty_info?: string;
  return_policy?: string;
  shipping_info?: any;
  tax_info?: any;
  custom_fields?: any;
  view_count: number;
  favorite_count: number;
  rating_average: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku?: string;
  name: string;
  description?: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  stock_quantity: number;
  low_stock_threshold: number;
  weight?: number;
  dimensions?: any;
  attributes?: any;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  variant_id?: string;
  image_url: string;
  alt_text?: string;
  title?: string;
  sort_order: number;
  is_primary: boolean;
  is_active: boolean;
  file_size?: number;
  file_type?: string;
  dimensions?: any;
  created_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  image_url?: string;
  icon?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  slug: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'color' | 'size';
  description?: string;
  is_required: boolean;
  is_filterable: boolean;
  is_searchable: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductAttributeValue {
  id: string;
  attribute_id: string;
  value: string;
  slug: string;
  color_hex?: string;
  sort_order: number;
  created_at: string;
}

export interface ProductTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  order_id?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  is_verified_purchase: boolean;
  is_approved: boolean;
  is_helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  search?: string;
  category_id?: string;
  min_price?: number;
  max_price?: number;
  brands?: string[];
  conditions?: string[];
  tags?: string[];
  attributes?: Record<string, any>;
  sort_by?: 'created_at' | 'price' | 'rating' | 'name';
  sort_order?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}

export interface ProductCreateData {
  name: string;
  description?: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  stock_quantity: number;
  category_id?: string;
  brand?: string;
  condition?: 'new' | 'used' | 'refurbished';
  tags?: string[];
  attributes?: Record<string, any>;
  images?: string[];
  variants?: Partial<ProductVariant>[];
}

export interface ProductUpdateData {
  name?: string;
  description?: string;
  price?: number;
  compare_price?: number;
  cost_price?: number;
  stock_quantity?: number;
  category_id?: string;
  brand?: string;
  condition?: 'new' | 'used' | 'refurbished';
  tags?: string[];
  attributes?: Record<string, any>;
  images?: string[];
  is_active?: boolean;
  is_featured?: boolean;
}

class ProductManagementService {
  private static instance: ProductManagementService;

  private constructor() {}

  public static getInstance(): ProductManagementService {
    if (!ProductManagementService.instance) {
      ProductManagementService.instance = new ProductManagementService();
    }
    return ProductManagementService.instance;
  }

  // =============================================
  // PRODUCT CRUD OPERATIONS
  // =============================================

  // Get all products for a store
  async getProducts(storeId: string, filters?: ProductFilters): Promise<Product[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true);

      // Apply filters
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters?.min_price) {
        query = query.gte('price', filters.min_price);
      }

      if (filters?.max_price) {
        query = query.lte('price', filters.max_price);
      }

      if (filters?.brands && filters.brands.length > 0) {
        query = query.in('brand', filters.brands);
      }

      if (filters?.conditions && filters.conditions.length > 0) {
        query = query.in('condition', filters.conditions);
      }

      // Apply sorting
      if (filters?.sort_by) {
        query = query.order(filters.sort_by, { ascending: filters.sort_order === 'ASC' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  // Get single product with details
  async getProduct(productId: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting product:', error);
      return null;
    }
  }

  // Create new product
  async createProduct(storeId: string, productData: ProductCreateData): Promise<Product | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Generate slug if not provided
      if (!productData.name) {
        throw new Error('Product name is required');
      }

      // Create product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          store_id: storeId,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          compare_price: productData.compare_price,
          cost_price: productData.cost_price,
          stock_quantity: productData.stock_quantity,
          category_id: productData.category_id,
          brand: productData.brand,
          condition: productData.condition || 'new',
          slug: await this.generateProductSlug(productData.name),
          featured_image_url: productData.images?.[0],
          gallery_urls: productData.images,
          is_active: true,
        })
        .select()
        .single();

      if (productError) throw productError;

      // Add tags if provided
      if (productData.tags && productData.tags.length > 0) {
        await this.addProductTags(product.id, productData.tags);
      }

      // Add variants if provided
      if (productData.variants && productData.variants.length > 0) {
        for (const variantData of productData.variants) {
          await this.createProductVariant(product.id, variantData);
        }
      }

      return product;
    } catch (error) {
      console.error('Error creating product:', error);
      return null;
    }
  }

  // Update product
  async updateProduct(productId: string, productData: ProductUpdateData): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const updateData: any = {};

      if (productData.name) {
        updateData.name = productData.name;
        updateData.slug = await this.generateProductSlug(productData.name, productId);
      }

      if (productData.description !== undefined) updateData.description = productData.description;
      if (productData.price !== undefined) updateData.price = productData.price;
      if (productData.compare_price !== undefined) updateData.compare_price = productData.compare_price;
      if (productData.cost_price !== undefined) updateData.cost_price = productData.cost_price;
      if (productData.stock_quantity !== undefined) updateData.stock_quantity = productData.stock_quantity;
      if (productData.category_id !== undefined) updateData.category_id = productData.category_id;
      if (productData.brand !== undefined) updateData.brand = productData.brand;
      if (productData.condition !== undefined) updateData.condition = productData.condition;
      if (productData.is_active !== undefined) updateData.is_active = productData.is_active;
      if (productData.is_featured !== undefined) updateData.is_featured = productData.is_featured;
      if (productData.images) {
        updateData.featured_image_url = productData.images[0];
        updateData.gallery_urls = productData.images;
      }

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId);

      if (error) throw error;

      // Update tags if provided
      if (productData.tags) {
        await this.updateProductTags(productId, productData.tags);
      }

      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      return false;
    }
  }

  // Delete product
  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  // =============================================
  // PRODUCT VARIANTS
  // =============================================

  // Get product variants
  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting product variants:', error);
      return [];
    }
  }

  // Create product variant
  async createProductVariant(productId: string, variantData: Partial<ProductVariant>): Promise<ProductVariant | null> {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .insert({
          product_id: productId,
          name: variantData.name || 'Default Variant',
          price: variantData.price || 0,
          compare_price: variantData.compare_price,
          cost_price: variantData.cost_price,
          stock_quantity: variantData.stock_quantity || 0,
          low_stock_threshold: variantData.low_stock_threshold || 5,
          weight: variantData.weight,
          dimensions: variantData.dimensions,
          attributes: variantData.attributes,
          image_url: variantData.image_url,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating product variant:', error);
      return null;
    }
  }

  // Update product variant
  async updateProductVariant(variantId: string, variantData: Partial<ProductVariant>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('product_variants')
        .update(variantData)
        .eq('id', variantId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating product variant:', error);
      return false;
    }
  }

  // Delete product variant
  async deleteProductVariant(variantId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting product variant:', error);
      return false;
    }
  }

  // =============================================
  // PRODUCT IMAGES
  // =============================================

  // Get product images
  async getProductImages(productId: string): Promise<ProductImage[]> {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting product images:', error);
      return [];
    }
  }

  // Upload product image
  async uploadProductImage(productId: string, imageUri: string, isPrimary: boolean = false): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Convert image to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Generate unique filename
      const fileExt = imageUri.split('.').pop();
      const fileName = `products/${productId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      // Save image record
      const { error: saveError } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          image_url: urlData.publicUrl,
          is_primary: isPrimary,
          is_active: true,
        });

      if (saveError) throw saveError;

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading product image:', error);
      return null;
    }
  }

  // Delete product image
  async deleteProductImage(imageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting product image:', error);
      return false;
    }
  }

  // =============================================
  // PRODUCT CATEGORIES
  // =============================================

  // Get categories
  async getCategories(): Promise<ProductCategory[]> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  // Create category
  async createCategory(categoryData: Partial<ProductCategory>): Promise<ProductCategory | null> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .insert({
          name: categoryData.name || '',
          slug: categoryData.slug || this.generateSlug(categoryData.name || ''),
          description: categoryData.description,
          parent_id: categoryData.parent_id,
          image_url: categoryData.image_url,
          icon: categoryData.icon,
          color: categoryData.color,
          sort_order: categoryData.sort_order || 0,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      return null;
    }
  }

  // =============================================
  // PRODUCT TAGS
  // =============================================

  // Get tags
  async getTags(): Promise<ProductTag[]> {
    try {
      const { data, error } = await supabase
        .from('product_tags')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting tags:', error);
      return [];
    }
  }

  // Add tags to product
  async addProductTags(productId: string, tagNames: string[]): Promise<boolean> {
    try {
      for (const tagName of tagNames) {
        // Create tag if it doesn't exist
        let tag = await this.getOrCreateTag(tagName);
        if (!tag) continue;

        // Add tag assignment
        const { error } = await supabase
          .from('product_tag_assignments')
          .insert({
            product_id: productId,
            tag_id: tag.id,
          })
          .single();

        if (error && error.code !== '23505') { // Ignore duplicate key errors
          console.error('Error adding tag assignment:', error);
        }
      }

      return true;
    } catch (error) {
      console.error('Error adding product tags:', error);
      return false;
    }
  }

  // Update product tags
  async updateProductTags(productId: string, tagNames: string[]): Promise<boolean> {
    try {
      // Remove existing tags
      const { error: deleteError } = await supabase
        .from('product_tag_assignments')
        .delete()
        .eq('product_id', productId);

      if (deleteError) throw deleteError;

      // Add new tags
      return await this.addProductTags(productId, tagNames);
    } catch (error) {
      console.error('Error updating product tags:', error);
      return false;
    }
  }

  // =============================================
  // PRODUCT SEARCH
  // =============================================

  // Search products
  async searchProducts(filters: ProductFilters): Promise<Product[]> {
    try {
      const { data, error } = await supabase.rpc('search_products', {
        search_query: filters.search || null,
        category_id: filters.category_id || null,
        min_price: filters.min_price || null,
        max_price: filters.max_price || null,
        brands: filters.brands || null,
        conditions: filters.conditions || null,
        sort_by: filters.sort_by || 'created_at',
        sort_order: filters.sort_order || 'DESC',
        limit_count: filters.limit || 20,
        offset_count: filters.offset || 0,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  // =============================================
  // PRODUCT ANALYTICS
  // =============================================

  // Get product analytics
  async getProductAnalytics(productId: string): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('get_product_analytics', {
        product_uuid: productId,
      });

      if (error) throw error;
      return data?.[0] || {};
    } catch (error) {
      console.error('Error getting product analytics:', error);
      return {};
    }
  }

  // Track product view
  async trackProductView(productId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('product_views')
        .insert({
          product_id: productId,
          user_id: user?.id || null,
          session_id: 'web-session', // In a real app, generate proper session ID
          ip_address: '127.0.0.1', // In a real app, get actual IP
          user_agent: 'SocialSpark App',
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error tracking product view:', error);
      return false;
    }
  }

  // =============================================
  // UTILITY FUNCTIONS
  // =============================================

  private async generateProductSlug(name: string, excludeId?: string): Promise<string> {
    try {
      const baseSlug = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      let finalSlug = baseSlug;
      let counter = 0;

      while (true) {
        const { data, error } = await supabase
          .from('products')
          .select('id')
          .eq('slug', finalSlug)
          .neq('id', excludeId || '')
          .single();

        if (error && error.code === 'PGRST116') {
          // No existing product with this slug
          break;
        }

        counter++;
        finalSlug = `${baseSlug}-${counter}`;
      }

      return finalSlug;
    } catch (error) {
      console.error('Error generating product slug:', error);
      return `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    }
  }

  private generateSlug(text: string): string {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private async getOrCreateTag(tagName: string): Promise<ProductTag | null> {
    try {
      const slug = this.generateSlug(tagName);

      // Try to get existing tag
      const { data: existingTag, error: getError } = await supabase
        .from('product_tags')
        .select('*')
        .eq('slug', slug)
        .single();

      if (existingTag) {
        return existingTag;
      }

      // Create new tag
      const { data: newTag, error: createError } = await supabase
        .from('product_tags')
        .insert({
          name: tagName,
          slug: slug,
        })
        .select()
        .single();

      if (createError) throw createError;
      return newTag;
    } catch (error) {
      console.error('Error getting or creating tag:', error);
      return null;
    }
  }

  // =============================================
  // BULK OPERATIONS
  // =============================================

  // Bulk update products
  async bulkUpdateProducts(productIds: string[], updates: Partial<Product>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create bulk operation record
      const { data: bulkOp, error: bulkError } = await supabase
        .from('product_bulk_operations')
        .insert({
          operation_type: 'update',
          status: 'processing',
          filters: { product_ids: productIds },
          changes: updates,
          total_products: productIds.length,
          created_by: user.id,
        })
        .select()
        .single();

      if (bulkError) throw bulkError;

      // Perform bulk update
      const { error: updateError } = await supabase
        .from('products')
        .update(updates)
        .in('id', productIds);

      if (updateError) throw updateError;

      // Update bulk operation status
      await supabase
        .from('product_bulk_operations')
        .update({
          status: 'completed',
          processed_products: productIds.length,
          success_count: productIds.length,
          completed_at: new Date().toISOString(),
        })
        .eq('id', bulkOp.id);

      return true;
    } catch (error) {
      console.error('Error bulk updating products:', error);
      return false;
    }
  }

  // Bulk delete products
  async bulkDeleteProducts(productIds: string[]): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create bulk operation record
      const { data: bulkOp, error: bulkError } = await supabase
        .from('product_bulk_operations')
        .insert({
          operation_type: 'delete',
          status: 'processing',
          filters: { product_ids: productIds },
          total_products: productIds.length,
          created_by: user.id,
        })
        .select()
        .single();

      if (bulkError) throw bulkError;

      // Perform bulk delete
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .in('id', productIds);

      if (deleteError) throw deleteError;

      // Update bulk operation status
      await supabase
        .from('product_bulk_operations')
        .update({
          status: 'completed',
          processed_products: productIds.length,
          success_count: productIds.length,
          completed_at: new Date().toISOString(),
        })
        .eq('id', bulkOp.id);

      return true;
    } catch (error) {
      console.error('Error bulk deleting products:', error);
      return false;
    }
  }
}

export default ProductManagementService.getInstance(); 