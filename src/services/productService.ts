import { supabase } from './supabase';
import {
  Product,
  ProductCategory,
  ProductBrand,
  ProductAttribute,
  ProductVariant,
  ProductImage,
  ProductTag,
  CreateProductData,
  UpdateProductData,
  ProductSearchParams,
  ProductFilters,
  ProductInventoryAdjustment,
  ProductPriceUpdate,
  ProductValidationResult,
  ProductPerformanceMetrics,
  BulkProductOperation,
} from '../types/product';

// =============================================
// PRODUCT SERVICE CLASS
// =============================================

class ProductService {
  // =============================================
  // PRODUCT CRUD OPERATIONS
  // =============================================

  async createProduct(data: CreateProductData): Promise<{ success: boolean; product?: Product; error?: string }> {
    try {
      // Validate product data
      const validation = this.validateProductData(data);
      if (!validation.isValid) {
        return { success: false, error: validation.errors[0]?.message };
      }

      // Generate slug if not provided
      if (!data.slug) {
        data.slug = this.generateSlug(data.name);
      }

      // Check if slug is unique
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('store_id', data.store_id)
        .eq('slug', data.slug)
        .single();

      if (existingProduct) {
        return { success: false, error: 'Product with this slug already exists' };
      }

      // Extract variants and images for separate insertion
      const { variants, images, tags, ...productData } = data;

      // Create product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          ...productData,
          status: productData.status || 'draft',
          published_at: productData.status === 'active' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (productError) {
        console.error('Error creating product:', productError);
        return { success: false, error: productError.message };
      }

      // Create variants if provided
      if (variants && variants.length > 0) {
        for (const variantData of variants) {
          await this.createProductVariant(product.id, variantData);
        }
      }

      // Create images if provided
      if (images && images.length > 0) {
        for (const imageData of images) {
          await this.createProductImage(product.id, imageData);
        }
      }

      // Create tag relationships if provided
      if (tags && tags.length > 0) {
        await this.addProductTags(product.id, tags);
      }

      // Get the complete product with relations
      const completeProduct = await this.getProductById(product.id, {
        include_variants: true,
        include_images: true,
        include_category: true,
        include_brand: true,
        include_tags: true,
      });

      return { success: true, product: completeProduct };
    } catch (error) {
      console.error('Error in createProduct:', error);
      return { success: false, error: 'Failed to create product' };
    }
  }

  async getProductById(
    productId: string,
    options: {
      include_variants?: boolean;
      include_images?: boolean;
      include_category?: boolean;
      include_brand?: boolean;
      include_tags?: boolean;
    } = {}
  ): Promise<Product | null> {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      // Add relations based on options
      if (options.include_category) {
        query = query.select(`
          *,
          category:product_categories(*)
        `);
      }

      if (options.include_brand) {
        query = query.select(`
          *,
          brand:product_brands(*)
        `);
      }

      const { data: product, error } = await query;

      if (error || !product) {
        return null;
      }

      // Load additional relations if requested
      if (options.include_variants) {
        product.variants = await this.getProductVariants(productId);
      }

      if (options.include_images) {
        product.images = await this.getProductImages(productId);
      }

      if (options.include_tags) {
        product.tags = await this.getProductTags(productId);
      }

      return product as Product;
    } catch (error) {
      console.error('Error in getProductById:', error);
      return null;
    }
  }

  async updateProduct(data: UpdateProductData): Promise<{ success: boolean; product?: Product; error?: string }> {
    try {
      const { id, variants, images, tags, ...updateData } = data;

      // Validate product data
      const validation = this.validateProductData(updateData);
      if (!validation.isValid) {
        return { success: false, error: validation.errors[0]?.message };
      }

      // Update product
      const { data: product, error } = await supabase
        .from('products')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        return { success: false, error: error.message };
      }

      // Update variants if provided
      if (variants) {
        await this.updateProductVariants(id, variants);
      }

      // Update images if provided
      if (images) {
        await this.updateProductImages(id, images);
      }

      // Update tags if provided
      if (tags) {
        await this.updateProductTags(id, tags);
      }

      return { success: true, product: product as Product };
    } catch (error) {
      console.error('Error in updateProduct:', error);
      return { success: false, error: 'Failed to update product' };
    }
  }

  async deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Error deleting product:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      return { success: false, error: 'Failed to delete product' };
    }
  }

  // =============================================
  // PRODUCT SEARCH & FILTERING
  // =============================================

  async searchProducts(params: ProductSearchParams): Promise<{
    success: boolean;
    products?: Product[];
    total?: number;
    error?: string;
  }> {
    try {
      const {
        query,
        filters,
        sort,
        page = 1,
        limit = 20,
        include_variants = false,
        include_images = false,
        include_category = false,
        include_brand = false,
        include_tags = false,
      } = params;

      let supabaseQuery = supabase
        .from('products')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters) {
        supabaseQuery = this.applyProductFilters(supabaseQuery, filters);
      }

      // Apply search query
      if (query) {
        supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
      }

      // Apply sorting
      if (sort) {
        supabaseQuery = supabaseQuery.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      supabaseQuery = supabaseQuery.range(offset, offset + limit - 1);

      const { data: products, error, count } = await supabaseQuery;

      if (error) {
        console.error('Error searching products:', error);
        return { success: false, error: error.message };
      }

      // Load additional relations if requested
      if (products) {
        for (const product of products) {
          if (include_variants) {
            product.variants = await this.getProductVariants(product.id);
          }
          if (include_images) {
            product.images = await this.getProductImages(product.id);
          }
          if (include_category) {
            product.category = await this.getProductCategory(product.category_id);
          }
          if (include_brand) {
            product.brand = await this.getProductBrand(product.brand_id);
          }
          if (include_tags) {
            product.tags = await this.getProductTags(product.id);
          }
        }
      }

      return {
        success: true,
        products: products as Product[],
        total: count || 0,
      };
    } catch (error) {
      console.error('Error in searchProducts:', error);
      return { success: false, error: 'Failed to search products' };
    }
  }

  // =============================================
  // PRODUCT VARIANTS
  // =============================================

  async createProductVariant(
    productId: string,
    variantData: any
  ): Promise<{ success: boolean; variant?: ProductVariant; error?: string }> {
    try {
      const { attributes, ...variantInfo } = variantData;

      const { data: variant, error } = await supabase
        .from('product_variants')
        .insert({
          product_id: productId,
          ...variantInfo,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating variant:', error);
        return { success: false, error: error.message };
      }

      // Create variant attributes if provided
      if (attributes) {
        await this.createVariantAttributes(variant.id, attributes);
      }

      return { success: true, variant: variant as ProductVariant };
    } catch (error) {
      console.error('Error in createProductVariant:', error);
      return { success: false, error: 'Failed to create variant' };
    }
  }

  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    try {
      const { data: variants, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error getting variants:', error);
        return [];
      }

      return variants as ProductVariant[];
    } catch (error) {
      console.error('Error in getProductVariants:', error);
      return [];
    }
  }

  // =============================================
  // PRODUCT IMAGES
  // =============================================

  async createProductImage(
    productId: string,
    imageData: any
  ): Promise<{ success: boolean; image?: ProductImage; error?: string }> {
    try {
      const { data: image, error } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          ...imageData,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating image:', error);
        return { success: false, error: error.message };
      }

      return { success: true, image: image as ProductImage };
    } catch (error) {
      console.error('Error in createProductImage:', error);
      return { success: false, error: 'Failed to create image' };
    }
  }

  async getProductImages(productId: string): Promise<ProductImage[]> {
    try {
      const { data: images, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error getting images:', error);
        return [];
      }

      return images as ProductImage[];
    } catch (error) {
      console.error('Error in getProductImages:', error);
      return [];
    }
  }

  // =============================================
  // PRODUCT CATEGORIES
  // =============================================

  async getProductCategories(): Promise<ProductCategory[]> {
    try {
      const { data: categories, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error getting categories:', error);
        return [];
      }

      return categories as ProductCategory[];
    } catch (error) {
      console.error('Error in getProductCategories:', error);
      return [];
    }
  }

  async getProductCategory(categoryId?: string): Promise<ProductCategory | null> {
    if (!categoryId) return null;

    try {
      const { data: category, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (error) {
        console.error('Error getting category:', error);
        return null;
      }

      return category as ProductCategory;
    } catch (error) {
      console.error('Error in getProductCategory:', error);
      return null;
    }
  }

  // =============================================
  // PRODUCT BRANDS
  // =============================================

  async getProductBrands(): Promise<ProductBrand[]> {
    try {
      const { data: brands, error } = await supabase
        .from('product_brands')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error getting brands:', error);
        return [];
      }

      return brands as ProductBrand[];
    } catch (error) {
      console.error('Error in getProductBrands:', error);
      return [];
    }
  }

  async getProductBrand(brandId?: string): Promise<ProductBrand | null> {
    if (!brandId) return null;

    try {
      const { data: brand, error } = await supabase
        .from('product_brands')
        .select('*')
        .eq('id', brandId)
        .single();

      if (error) {
        console.error('Error getting brand:', error);
        return null;
      }

      return brand as ProductBrand;
    } catch (error) {
      console.error('Error in getProductBrand:', error);
      return null;
    }
  }

  // =============================================
  // PRODUCT TAGS
  // =============================================

  async getProductTags(productId: string): Promise<ProductTag[]> {
    try {
      const { data: tags, error } = await supabase
        .from('product_tag_relationships')
        .select(`
          tag_id,
          product_tags(*)
        `)
        .eq('product_id', productId);

      if (error) {
        console.error('Error getting tags:', error);
        return [];
      }

      return tags?.map(t => t.product_tags) as ProductTag[] || [];
    } catch (error) {
      console.error('Error in getProductTags:', error);
      return [];
    }
  }

  async addProductTags(productId: string, tagNames: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      for (const tagName of tagNames) {
        // Create tag if it doesn't exist
        const { data: existingTag } = await supabase
          .from('product_tags')
          .select('id')
          .eq('name', tagName)
          .single();

        let tagId = existingTag?.id;

        if (!tagId) {
          const { data: newTag, error: tagError } = await supabase
            .from('product_tags')
            .insert({
              name: tagName,
              slug: this.generateSlug(tagName),
            })
            .select('id')
            .single();

          if (tagError) {
            console.error('Error creating tag:', tagError);
            continue;
          }

          tagId = newTag.id;
        }

        // Create relationship
        await supabase
          .from('product_tag_relationships')
          .upsert({
            product_id: productId,
            tag_id: tagId,
          });
      }

      return { success: true };
    } catch (error) {
      console.error('Error in addProductTags:', error);
      return { success: false, error: 'Failed to add tags' };
    }
  }

  // =============================================
  // INVENTORY MANAGEMENT
  // =============================================

  async adjustInventory(adjustment: ProductInventoryAdjustment): Promise<{ success: boolean; error?: string }> {
    try {
      const { product_id, variant_id, quantity_change, change_type, notes, reference_id, reference_type } = adjustment;

      // Get current quantity
      let currentQuantity = 0;
      if (variant_id) {
        const { data: variant } = await supabase
          .from('product_variants')
          .select('stock_quantity')
          .eq('id', variant_id)
          .single();
        currentQuantity = variant?.stock_quantity || 0;
      } else {
        const { data: product } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', product_id)
          .single();
        currentQuantity = product?.stock_quantity || 0;
      }

      const newQuantity = currentQuantity + quantity_change;

      // Update inventory
      if (variant_id) {
        await supabase
          .from('product_variants')
          .update({ stock_quantity: newQuantity })
          .eq('id', variant_id);
      } else {
        await supabase
          .from('products')
          .update({ stock_quantity: newQuantity })
          .eq('id', product_id);
      }

      // Record inventory history
      await supabase
        .from('product_inventory_history')
        .insert({
          product_id,
          variant_id,
          change_type,
          quantity_change,
          previous_quantity: currentQuantity,
          new_quantity: newQuantity,
          reference_id,
          reference_type,
          notes,
        });

      return { success: true };
    } catch (error) {
      console.error('Error in adjustInventory:', error);
      return { success: false, error: 'Failed to adjust inventory' };
    }
  }

  // =============================================
  // PRICE MANAGEMENT
  // =============================================

  async updatePrice(update: ProductPriceUpdate): Promise<{ success: boolean; error?: string }> {
    try {
      const { product_id, variant_id, new_price, change_reason, reference_id, reference_type } = update;

      // Get current price
      let currentPrice = 0;
      if (variant_id) {
        const { data: variant } = await supabase
          .from('product_variants')
          .select('price')
          .eq('id', variant_id)
          .single();
        currentPrice = variant?.price || 0;
      } else {
        const { data: product } = await supabase
          .from('products')
          .select('base_price')
          .eq('id', product_id)
          .single();
        currentPrice = product?.base_price || 0;
      }

      // Update price
      if (variant_id) {
        await supabase
          .from('product_variants')
          .update({ price: new_price })
          .eq('id', variant_id);
      } else {
        await supabase
          .from('products')
          .update({ base_price: new_price })
          .eq('id', product_id);
      }

      // Record price history
      await supabase
        .from('product_price_history')
        .insert({
          product_id,
          variant_id,
          old_price: currentPrice,
          new_price,
          change_reason,
          reference_id,
          reference_type,
        });

      return { success: true };
    } catch (error) {
      console.error('Error in updatePrice:', error);
      return { success: false, error: 'Failed to update price' };
    }
  }

  // =============================================
  // BULK OPERATIONS
  // =============================================

  async bulkOperation(operation: BulkProductOperation): Promise<{ success: boolean; error?: string }> {
    try {
      const { product_ids, operation: op, data } = operation;

      switch (op) {
        case 'activate':
          await supabase
            .from('products')
            .update({ status: 'active', published_at: new Date().toISOString() })
            .in('id', product_ids);
          break;

        case 'deactivate':
          await supabase
            .from('products')
            .update({ status: 'inactive' })
            .in('id', product_ids);
          break;

        case 'archive':
          await supabase
            .from('products')
            .update({ status: 'archived' })
            .in('id', product_ids);
          break;

        case 'delete':
          await supabase
            .from('products')
            .delete()
            .in('id', product_ids);
          break;

        case 'update_category':
          if (data?.category_id) {
            await supabase
              .from('products')
              .update({ category_id: data.category_id })
              .in('id', product_ids);
          }
          break;

        case 'update_brand':
          if (data?.brand_id) {
            await supabase
              .from('products')
              .update({ brand_id: data.brand_id })
              .in('id', product_ids);
          }
          break;

        case 'update_price':
          if (data?.price) {
            await supabase
              .from('products')
              .update({ base_price: data.price })
              .in('id', product_ids);
          }
          break;

        case 'update_inventory':
          if (data?.stock_quantity !== undefined) {
            await supabase
              .from('products')
              .update({ stock_quantity: data.stock_quantity })
              .in('id', product_ids);
          }
          break;
      }

      return { success: true };
    } catch (error) {
      console.error('Error in bulkOperation:', error);
      return { success: false, error: 'Failed to perform bulk operation' };
    }
  }

  // =============================================
  // ANALYTICS & PERFORMANCE
  // =============================================

  async getProductPerformanceMetrics(storeId: string): Promise<ProductPerformanceMetrics> {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('status, stock_quantity, average_rating, review_count')
        .eq('store_id', storeId);

      if (error) {
        console.error('Error getting performance metrics:', error);
        return {
          total_products: 0,
          active_products: 0,
          low_stock_products: 0,
          out_of_stock_products: 0,
          total_revenue: 0,
          total_orders: 0,
          average_rating: 0,
          total_reviews: 0,
        };
      }

      const totalProducts = products.length;
      const activeProducts = products.filter(p => p.status === 'active').length;
      const lowStockProducts = products.filter(p => p.stock_quantity <= 5 && p.stock_quantity > 0).length;
      const outOfStockProducts = products.filter(p => p.stock_quantity === 0).length;
      const averageRating = products.reduce((sum, p) => sum + (p.average_rating || 0), 0) / totalProducts;
      const totalReviews = products.reduce((sum, p) => sum + (p.review_count || 0), 0);

      return {
        total_products: totalProducts,
        active_products: activeProducts,
        low_stock_products: lowStockProducts,
        out_of_stock_products: outOfStockProducts,
        total_revenue: 0, // TODO: Calculate from orders
        total_orders: 0, // TODO: Calculate from orders
        average_rating: averageRating,
        total_reviews: totalReviews,
      };
    } catch (error) {
      console.error('Error in getProductPerformanceMetrics:', error);
      return {
        total_products: 0,
        active_products: 0,
        low_stock_products: 0,
        out_of_stock_products: 0,
        total_revenue: 0,
        total_orders: 0,
        average_rating: 0,
        total_reviews: 0,
      };
    }
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  private applyProductFilters(query: any, filters: ProductFilters): any {
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    if (filters.brand_id) {
      query = query.eq('brand_id', filters.brand_id);
    }

    if (filters.price_min !== undefined) {
      query = query.gte('base_price', filters.price_min);
    }

    if (filters.price_max !== undefined) {
      query = query.lte('base_price', filters.price_max);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured);
    }

    if (filters.is_bestseller !== undefined) {
      query = query.eq('is_bestseller', filters.is_bestseller);
    }

    if (filters.is_new_arrival !== undefined) {
      query = query.eq('is_new_arrival', filters.is_new_arrival);
    }

    if (filters.is_on_sale !== undefined) {
      query = query.eq('is_on_sale', filters.is_on_sale);
    }

    if (filters.in_stock !== undefined) {
      if (filters.in_stock) {
        query = query.gt('stock_quantity', 0);
      } else {
        query = query.eq('stock_quantity', 0);
      }
    }

    if (filters.rating_min !== undefined) {
      query = query.gte('average_rating', filters.rating_min);
    }

    return query;
  }

  private validateProductData(data: any): ProductValidationResult {
    const errors: any[] = [];
    const warnings: any[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Product name is required', code: 'REQUIRED' });
    }

    if (!data.base_price || data.base_price <= 0) {
      errors.push({ field: 'base_price', message: 'Valid base price is required', code: 'INVALID_PRICE' });
    }

    if (data.compare_price && data.compare_price <= data.base_price) {
      errors.push({ field: 'compare_price', message: 'Compare price must be greater than base price', code: 'INVALID_COMPARE_PRICE' });
    }

    if (data.stock_quantity !== undefined && data.stock_quantity < 0) {
      errors.push({ field: 'stock_quantity', message: 'Stock quantity cannot be negative', code: 'INVALID_STOCK' });
    }

    if (data.sku && data.sku.length > 100) {
      warnings.push({ field: 'sku', message: 'SKU is quite long', code: 'LONG_SKU' });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private async createVariantAttributes(variantId: string, attributes: Record<string, string>): Promise<void> {
    for (const [attributeName, attributeValue] of Object.entries(attributes)) {
      // Get or create attribute
      let { data: attribute } = await supabase
        .from('product_attributes')
        .select('id')
        .eq('name', attributeName)
        .single();

      if (!attribute) {
        const { data: newAttribute } = await supabase
          .from('product_attributes')
          .insert({
            name: attributeName,
            slug: this.generateSlug(attributeName),
            type: 'select',
          })
          .select('id')
          .single();
        attribute = newAttribute;
      }

      // Get or create attribute value
      let { data: existingAttributeValue } = await supabase
        .from('product_attribute_values')
        .select('id')
        .eq('attribute_id', attribute.id)
        .eq('value', attributeValue)
        .single();

      if (!existingAttributeValue) {
        const { data: newAttributeValue } = await supabase
          .from('product_attribute_values')
          .insert({
            attribute_id: attribute.id,
            value: attributeValue,
            display_value: attributeValue,
          })
          .select('id')
          .single();
        existingAttributeValue = newAttributeValue;
      }

      // Create variant attribute relationship
      await supabase
        .from('product_variant_attributes')
        .insert({
          variant_id: variantId,
          attribute_id: attribute.id,
          attribute_value_id: existingAttributeValue.id,
        });
    }
  }

  private async updateProductVariants(productId: string, variants: any[]): Promise<void> {
    // Delete existing variants
    await supabase
      .from('product_variants')
      .delete()
      .eq('product_id', productId);

    // Create new variants
    for (const variantData of variants) {
      await this.createProductVariant(productId, variantData);
    }
  }

  private async updateProductImages(productId: string, images: any[]): Promise<void> {
    // Delete existing images
    await supabase
      .from('product_images')
      .delete()
      .eq('product_id', productId);

    // Create new images
    for (const imageData of images) {
      await this.createProductImage(productId, imageData);
    }
  }

  private async updateProductTags(productId: string, tagNames: string[]): Promise<void> {
    // Delete existing tag relationships
    await supabase
      .from('product_tag_relationships')
      .delete()
      .eq('product_id', productId);

    // Add new tags
    await this.addProductTags(productId, tagNames);
  }
}

// =============================================
// EXPORT INSTANCE
// =============================================

export const productService = new ProductService(); 