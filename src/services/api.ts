import { supabase } from './supabase';
import type { Product, Order, Post, Customer, Store, Conversation, Message, MessageReaction, ConversationWithMessages, MessageWithReactions } from './supabase';

// =============================================
// PRODUCT API SERVICES
// =============================================

export const productAPI = {
  // Upload image to Supabase Storage with improved error handling and validation
  async uploadImage(imageUri: string, productId: string, fileName?: string) {
    try {
      console.log('Starting image upload for product:', productId);
      console.log('Image URI:', imageUri);

      // Validate image URI
      if (!imageUri || !imageUri.startsWith('file://') && !imageUri.startsWith('http')) {
        throw new Error('Invalid image URI');
      }

      // Convert image URI to blob with error handling
      let response;
      try {
        response = await fetch(imageUri);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
      } catch (fetchError) {
        console.error('Error fetching image:', fetchError);
        throw new Error('Failed to load image from device');
      }

      const blob = await response.blob();
      
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (blob.size > maxSize) {
        throw new Error('Image file is too large. Maximum size is 10MB.');
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(blob.type)) {
        throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      }

      // Generate unique filename
      const fileExt = blob.type.split('/')[1] || 'jpg';
      const uniqueFileName = fileName || `${productId}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      console.log('Uploading to Supabase Storage with filename:', uniqueFileName);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(uniqueFileName, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: blob.type
        });

      if (error) {
        console.error('Supabase upload error:', error);
        
        // Handle specific Supabase errors
        if (error.message.includes('bucket')) {
          throw new Error('Storage bucket not found. Please create the "product-images" bucket in Supabase.');
        }
        if (error.message.includes('policy')) {
          throw new Error('Upload permission denied. Please check storage policies.');
        }
        if (error.message.includes('duplicate')) {
          throw new Error('File already exists. Please try again.');
        }
        
        throw new Error(`Upload failed: ${error.message}`);
      }

      console.log('Upload successful, getting public URL...');

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(uniqueFileName);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded image');
      }

      console.log('Image upload completed successfully');
      console.log('Public URL:', urlData.publicUrl);

      return {
        imageUrl: urlData.publicUrl,
        fileName: uniqueFileName
      };
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  },

  // Create product with image upload - improved version
  async createProductWithImage(productData: Partial<Product>, imageUri?: string) {
    try {
      console.log('Creating product with image...');
      console.log('Product data:', productData);
      console.log('Image URI:', imageUri);

      // First create the product
      const product = await this.createProduct(productData);
      console.log('Product created with ID:', product.id);
      
      // If image is provided, upload it
      if (imageUri && product.id) {
        console.log('Uploading image for product:', product.id);
        
        try {
          const { imageUrl, fileName } = await this.uploadImage(imageUri, product.id.toString());
          
          console.log('Image uploaded successfully, creating product_image record...');
          
          // Create product_image record - convert product.id to number for bigint
          const { error: imageError } = await supabase
            .from('product_images')
            .insert({
              product_id: Number(product.id), // Convert to number for bigint
              image_url: imageUrl,
              alt_text: productData.name || 'Product image',
              is_primary: true,
              sort_order: 0
            });

          if (imageError) {
            console.error('Failed to create product image record:', imageError);
            // Don't throw here as the product was created successfully
            // But we should clean up the uploaded image
            try {
              await supabase.storage
                .from('product-images')
                .remove([fileName]);
            } catch (cleanupError) {
              console.error('Failed to cleanup uploaded image:', cleanupError);
            }
          } else {
            console.log('Product image record created successfully');
          }
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          // Don't fail the entire product creation, just log the error
          // The product will be created without an image
        }
      }

      return product;
    } catch (error) {
      console.error('Create product with image error:', error);
      throw error;
    }
  },

  // Update product image
  async updateProductImage(productId: string, imageUri: string) {
    try {
      console.log('Updating product image for:', productId);
      
      // Upload new image
      const { imageUrl, fileName } = await this.uploadImage(imageUri, productId);
      
      // Delete old image if exists
      const { data: oldImages } = await supabase
        .from('product_images')
        .select('image_url, id')
        .eq('product_id', Number(productId)) // Convert to number for bigint
        .eq('is_primary', true);

      if (oldImages && oldImages.length > 0) {
        // Delete old image from storage
        const oldFileName = oldImages[0].image_url.split('/').pop();
        if (oldFileName) {
          try {
            await supabase.storage
              .from('product-images')
              .remove([oldFileName]);
          } catch (cleanupError) {
            console.error('Failed to cleanup old image:', cleanupError);
          }
        }

        // Update existing record
        await supabase
          .from('product_images')
          .update({
            image_url: imageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', oldImages[0].id);
      } else {
        // Create new record
        await supabase
          .from('product_images')
          .insert({
            product_id: Number(productId), // Convert to number for bigint
            image_url: imageUrl,
            alt_text: 'Product image',
            is_primary: true,
            sort_order: 0
          });
      }

      return { imageUrl, fileName };
    } catch (error) {
      console.error('Update product image error:', error);
      throw error;
    }
  },

  // Delete product image
  async deleteProductImage(productId: string) {
    try {
      console.log('Deleting product image for:', productId);
      
      // Get image record
      const { data: images } = await supabase
        .from('product_images')
        .select('image_url, id')
        .eq('product_id', Number(productId)) // Convert to number for bigint
        .eq('is_primary', true);

      if (images && images.length > 0) {
        // Delete from storage
        const fileName = images[0].image_url.split('/').pop();
        if (fileName) {
          try {
            await supabase.storage
              .from('product-images')
              .remove([fileName]);
          } catch (storageError) {
            console.error('Failed to delete from storage:', storageError);
          }
        }

        // Delete from database
        await supabase
          .from('product_images')
          .delete()
          .eq('id', images[0].id);
      }

      return true;
    } catch (error) {
      console.error('Delete product image error:', error);
      throw error;
    }
  },

  // Get all products for a store
  async getProducts(storeId: string, filters?: any) {
    let query = supabase
      .from('products')
      .select(`
        *,
        categories(name, slug),
        product_images(image_url, alt_text, is_primary)
      `)
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id);
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get single product
  async getProduct(productId: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name, slug),
        product_images(image_url, alt_text, is_primary),
        product_variants(*)
      `)
      .eq('id', productId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create product
  async createProduct(productData: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update product
  async updateProduct(productId: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete product
  async deleteProduct(productId: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
    return true;
  },

  // Bulk operations
  async bulkUpdateProducts(productIds: string[], updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .in('id', productIds)
      .select();

    if (error) throw error;
    return data;
  },

  async bulkDeleteProducts(productIds: string[]) {
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', productIds);

    if (error) throw error;
    return true;
  },
};

// =============================================
// ORDER API SERVICES
// =============================================

export const orderAPI = {
  // Get all orders for a store
  async getOrders(storeId: string, filters?: any) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        customers(first_name, last_name, email),
        order_items(
          *,
          products(name, sku),
          product_variants(name, sku)
        )
      `)
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get single order
  async getOrder(orderId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers(*),
        order_items(
          *,
          products(name, sku, product_images(image_url)),
          product_variants(name, sku)
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: Order['status']) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    // Send notification for order status update
    if (data) {
      const { notificationService } = require('./notifications');
      await notificationService.getInstance().sendOrderUpdateNotification(
        data.customer_id,
        {
          id: data.id,
          orderNumber: data.order_number,
          status: data.status,
        }
      );
    }

    return data;
  },

  // Create order (for testing/demo)
  async createOrder(orderData: Partial<Order>) {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get orders for a specific user
  async getUserOrders(userId: string, filters?: any) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        stores(name, logo_url),
        order_items(
          *,
          products(name, sku, product_images(image_url)),
          product_variants(name, sku)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
};

// =============================================
// POST API SERVICES
// =============================================

export const postAPI = {
  // Get all posts for a store
  async getPosts(storeId: string, filters?: any) {
    let query = supabase
      .from('posts')
      .select(`
        *,
        post_products(
          position_x,
          position_y,
          products(name, price, product_images(image_url))
        )
      `)
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (filters?.is_published !== undefined) {
      query = query.eq('is_published', filters.is_published);
    }
    if (filters?.is_featured) {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get single post
  async getPost(postId: string) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        post_products(
          position_x,
          position_y,
          products(name, price, product_images(image_url))
        )
      `)
      .eq('id', postId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create post
  async createPost(postData: Partial<Post>) {
    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update post
  async updatePost(postId: string, updates: Partial<Post>) {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete post
  async deletePost(postId: string) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
    return true;
  },

  // Publish post
  async publishPost(postId: string) {
    const { data, error } = await supabase
      .from('posts')
      .update({ 
        is_published: true, 
        published_at: new Date().toISOString() 
      })
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Schedule post
  async schedulePost(postId: string, scheduledAt: string) {
    const { data, error } = await supabase
      .from('posts')
      .update({ scheduled_at: scheduledAt })
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get posts for multiple stores
  async getPostsForStores(storeIds: string[]) {
    if (!storeIds || storeIds.length === 0) return { data: [], error: null };
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .in('store_id', storeIds)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get related posts from other stores in the same categories
  async getRelatedPosts(categories: string[], excludeStoreIds: string[]) {
    if (!categories || categories.length === 0) return { data: [], error: null };
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .in('category', categories)
      .not('store_id', 'in', `(${excludeStoreIds.join(',')})`)
      .order('created_at', { ascending: false })
      .limit(20);
    return { data, error };
  },

  // Get trending/random posts
  async getTrendingPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    return { data, error };
  },
};

// =============================================
// ANALYTICS API SERVICES
// =============================================

export const analyticsAPI = {
  // Get enhanced store analytics
  async getEnhancedAnalytics(storeId: string, period: string = '7d') {
    try {
      // Calculate date range based on period
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Get orders data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', storeId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString());

      if (ordersError) throw ordersError;

      // Get previous period for comparison
      const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
      const prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - periodDays);

      const { data: prevOrders, error: prevOrdersError } = await supabase
        .from('orders')
        .eq('store_id', storeId)
        .gte('created_at', prevStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      if (prevOrdersError) throw prevOrdersError;

      // Calculate metrics
      const currentRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const prevRevenue = prevOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const revenueChange = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

      const currentOrders = orders?.length || 0;
      const prevOrdersCount = prevOrders?.length || 0;
      const ordersChange = prevOrdersCount > 0 ? ((currentOrders - prevOrdersCount) / prevOrdersCount) * 100 : 0;

      // Get unique customers
      const currentCustomers = new Set(orders?.map(order => order.customer_id)).size;
      const prevCustomers = new Set(prevOrders?.map(order => order.customer_id)).size;
      const customersChange = prevCustomers > 0 ? ((currentCustomers - prevCustomers) / prevCustomers) * 100 : 0;

      // Mock engagement data (would be calculated from posts, likes, etc.)
      const engagement = Math.floor(Math.random() * 1000) + 500;
      const prevEngagement = Math.floor(Math.random() * 800) + 400;
      const engagementChange = prevEngagement > 0 ? ((engagement - prevEngagement) / prevEngagement) * 100 : 0;

      // Get top products
      const { data: topProducts, error: productsError } = await supabase
        .from('products')
        .select('id, name, price')
        .eq('store_id', storeId)
        .limit(5);

      if (productsError) throw productsError;

      const topProductsWithStats = topProducts?.map(product => ({
        id: product.id,
        name: product.name,
        sales: Math.floor(Math.random() * 50) + 10,
        revenue: (Math.floor(Math.random() * 50) + 10) * (product.price || 0),
        growth: Math.floor(Math.random() * 100) - 50,
      })) || [];

      // Mock recent activity
      const recentActivity = [
        {
          id: '1',
          type: 'order' as const,
          title: 'New Order #1234',
          description: 'Customer purchased 3 items',
          amount: 89.99,
          timestamp: '2 hours ago',
        },
        {
          id: '2',
          type: 'follower' as const,
          title: 'New Follower',
          description: 'Sarah Johnson started following your store',
          timestamp: '4 hours ago',
        },
        {
          id: '3',
          type: 'sale' as const,
          title: 'Flash Sale Success',
          description: '20% off sale generated $500 in revenue',
          amount: 500,
          timestamp: '1 day ago',
        },
        {
          id: '4',
          type: 'review' as const,
          title: '5-Star Review',
          description: 'Amazing product quality!',
          timestamp: '2 days ago',
        },
      ];

      // Mock customer segments
      const customerSegments = [
        {
          segment: 'New Customers',
          count: Math.floor(Math.random() * 100) + 50,
          percentage: 35,
          revenue: Math.floor(Math.random() * 5000) + 2000,
        },
        {
          segment: 'Returning Customers',
          count: Math.floor(Math.random() * 200) + 100,
          percentage: 45,
          revenue: Math.floor(Math.random() * 10000) + 5000,
        },
        {
          segment: 'VIP Customers',
          count: Math.floor(Math.random() * 50) + 20,
          percentage: 20,
          revenue: Math.floor(Math.random() * 8000) + 4000,
        },
      ];

      return {
        revenue: {
          total: currentRevenue,
          change: Math.round(revenueChange),
          trend: revenueChange > 0 ? 'up' : revenueChange < 0 ? 'down' : 'stable',
        },
        orders: {
          total: currentOrders,
          change: Math.round(ordersChange),
          trend: ordersChange > 0 ? 'up' : ordersChange < 0 ? 'down' : 'stable',
        },
        customers: {
          total: currentCustomers,
          change: Math.round(customersChange),
          trend: customersChange > 0 ? 'up' : customersChange < 0 ? 'down' : 'stable',
        },
        engagement: {
          total: engagement,
          change: Math.round(engagementChange),
          trend: engagementChange > 0 ? 'up' : engagementChange < 0 ? 'down' : 'stable',
        },
        topProducts: topProductsWithStats,
        recentActivity,
        customerSegments,
        salesChart: [], // Would be populated with actual chart data
      };
    } catch (error) {
      console.error('Error getting enhanced analytics:', error);
      throw error;
    }
  },

  // Track event
  async trackEvent(storeId: string, eventType: string, eventData?: any) {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        store_id: storeId,
        event_type: eventType,
        event_data: eventData,
      });

    if (error) throw error;
    return true;
  },

  // Get analytics for store (legacy)
  async getStoreAnalytics(storeId: string, dateRange?: any) {
    let query = supabase
      .from('analytics_events')
      .select('*')
      .eq('store_id', storeId);

    if (dateRange?.from) {
      query = query.gte('created_at', dateRange.from);
    }
    if (dateRange?.to) {
      query = query.lte('created_at', dateRange.to);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get sales analytics
  async getSalesAnalytics(storeId: string, dateRange?: any) {
    let query = supabase
      .from('orders')
      .select('total_amount, status, created_at')
      .eq('store_id', storeId)
      .eq('status', 'delivered');

    if (dateRange?.from) {
      query = query.gte('created_at', dateRange.from);
    }
    if (dateRange?.to) {
      query = query.lte('created_at', dateRange.to);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get product performance
  async getProductPerformance(storeId: string) {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        quantity,
        total_price,
        products(name, sku)
      `)
      .eq('products.store_id', storeId);

    if (error) throw error;
    return data;
  },
};

// =============================================
// CUSTOMER API SERVICES
// =============================================

export const customerAPI = {
  // Get all customers for a store
  async getCustomers(storeId: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get customer details
  async getCustomer(customerId: string) {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        orders(*)
      `)
      .eq('id', customerId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update customer
  async updateCustomer(customerId: string, updates: Partial<Customer>) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', customerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =============================================
// STORE API SERVICES
// =============================================

export const storeAPI = {
  // Get store details
  async getStore(storeId: string) {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update store
  async updateStore(storeId: string, updates: Partial<Store>) {
    const { data, error } = await supabase
      .from('stores')
      .update(updates)
      .eq('id', storeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create store
  async createStore(storeData: Partial<Store>) {
    const { data, error } = await supabase
      .from('stores')
      .insert(storeData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get multiple stores by IDs
  async getStoresByIds(storeIds: string[]) {
    if (!storeIds || storeIds.length === 0) return [];
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .in('id', storeIds);
    if (error) throw error;
    return data;
  },

  // Update store information
  updateStoreInfo: async (storeData: Partial<Store>): Promise<Store> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get the user's store
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (storeError) throw storeError;

      const { data, error } = await supabase
        .from('stores')
        .update({
          name: storeData.name,
          description: storeData.description,
          website_url: storeData.website_url,
          contact_info: storeData.contact_info,
          social_media: storeData.social_media,
          settings: storeData.settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', store.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update store info error:', error);
      throw error;
    }
  },
};

// =============================================
// CATEGORY API SERVICES
// =============================================

export const categoryAPI = {
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  },
};

// =============================================
// UTILITY FUNCTIONS
// =============================================

export const apiUtils = {
  // Handle API errors
  handleError: (error: any) => {
    console.error('API Error:', error);
    throw new Error(error.message || 'An error occurred');
  },

  // Format currency
  formatCurrency: (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  // Format date
  formatDate: (date: string) => {
    return new Date(date).toLocaleDateString();
  },

  // Generate mock data for testing
  generateMockData: () => {
    return {
      products: [
        {
          id: '1',
          name: 'Summer Collection Sneakers',
          price: 89.99,
          stock_quantity: 50,
          is_active: true,
        },
        {
          id: '2',
          name: 'Smart Home Bundle',
          price: 299.99,
          stock_quantity: 25,
          is_active: true,
        },
      ],
      orders: [
        {
          id: '1',
          order_number: 'ORD-2024-001',
          status: 'delivered',
          total_amount: 89.99,
          created_at: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          order_number: 'ORD-2024-002',
          status: 'shipped',
          total_amount: 599.98,
          created_at: '2024-01-10T14:30:00Z',
        },
      ],
    };
  },
}; 

export const followAPI = {
  // Follow a store
  async followStore(userId: string, storeId: string) {
    const { data, error } = await supabase
      .from('follows')
      .insert({ user_id: userId, store_id: storeId })
      .select()
      .single();
    if (error) throw error;

    // Send notification to store owner about new follower
    if (data) {
      const { notificationService } = require('./notifications');
      const { data: userData } = await supabase
        .from('users')
        .select('full_name, avatar_url')
        .eq('id', userId)
        .single();

      if (userData) {
        await notificationService.getInstance().sendNewFollowerNotification(
          storeId, // store owner's user ID
          {
            id: userId,
            name: userData.full_name || 'A user',
          }
        );
      }
    }

    return data;
  },

  // Unfollow a store
  async unfollowStore(userId: string, storeId: string) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('user_id', userId)
      .eq('store_id', storeId);
    if (error) throw error;
    return true;
  },

  // Get all stores followed by a user
  async getFollowedStores(userId: string) {
    const { data, error } = await supabase
      .from('follows')
      .select('store_id')
      .eq('user_id', userId);
    if (error) throw error;
    return data.map(row => row.store_id);
  },

  // Check if user is following a store
  async isFollowing(userId: string, storeId: string) {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('user_id', userId)
      .eq('store_id', storeId)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // Not found is ok
    return !!data;
  },
}; 

export const swipeAPI = {
  // Log a swipe event
  async logSwipe({
    user_id,
    post_id,
    action,
    product_id,
    store_id,
    category,
    subcategory,
    price,
    brand,
    tags,
    color,
    size,
    discount,
    in_stock,
    post_type,
    media_type,
    location,
    store_rating,
    product_rating,
    post_created_at,
    engagement,
    time_spent_on_card,
    session_id,
    device_type,
    app_version,
    referrer,
    position_in_feed,
  }) {
    const { data, error } = await supabase
      .from('product_swipes')
      .insert([
        {
          user_id,
          post_id,
          action,
          product_id,
          store_id,
          category,
          subcategory,
          price,
          brand,
          tags,
          color,
          size,
          discount,
          in_stock,
          post_type,
          media_type,
          location,
          store_rating,
          product_rating,
          post_created_at,
          engagement,
          time_spent_on_card,
          session_id,
          device_type,
          app_version,
          referrer,
          position_in_feed,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
}; 

// =============================================
// COMMENT API SERVICES
// =============================================

export const commentAPI = {
  // Get comments for a post
  async getComments(postId: string) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users(id, full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  // Add a comment to a post
  async addComment(postId: string, comment: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content: comment,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Like/unlike a comment
  async toggleCommentLike(commentId: string, userId: string) {
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', userId);

        if (error) throw error;
        return { liked: false };
      } else {
        // Like
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: userId,
          });

        if (error) throw error;
        return { liked: true };
      }
    } catch (error) {
      console.error('Error toggling comment like:', error);
      throw error;
    }
  },

  // Delete a comment
  async deleteComment(commentId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },
};

// =============================================
// SOCIAL API SERVICES
// =============================================

export const socialAPI = {
  // Share a post
  async sharePost(postId: string, userId: string, platform?: string) {
    try {
      const { data, error } = await supabase
        .from('post_shares')
        .insert({
          post_id: postId,
          user_id: userId,
          platform: platform || 'app',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sharing post:', error);
      throw error;
    }
  },

  // Get share statistics for a post
  async getPostShares(postId: string) {
    try {
      const { data, error } = await supabase
        .from('post_shares')
        .select('platform')
        .eq('post_id', postId);

      if (error) throw error;
      
      // Group by platform
      const sharesByPlatform = data?.reduce((acc, share) => {
        acc[share.platform] = (acc[share.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return sharesByPlatform;
    } catch (error) {
      console.error('Error getting post shares:', error);
      return {};
    }
  },

  // Direct share to followers
  async shareToFollowers(postId: string, userId: string, followerIds: string[]) {
    try {
      const shares = followerIds.map(followerId => ({
        post_id: postId,
        user_id: userId,
        shared_with: followerId,
        platform: 'direct',
      }));

      const { data, error } = await supabase
        .from('post_shares')
        .insert(shares)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sharing to followers:', error);
      throw error;
    }
  },

  // Get user's followers for direct sharing
  async getFollowers(userId: string) {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower_id,
          users!follows_follower_id_fkey(id, full_name, avatar_url)
        `)
        .eq('following_id', userId);

      if (error) throw error;
      return data?.map(follow => follow.users) || [];
    } catch (error) {
      console.error('Error getting followers:', error);
      return [];
    }
  },
}; 

// =============================================
// MESSAGING API SERVICES
// =============================================

export const messagingAPI = {
  // =============================================
  // CONVERSATION MANAGEMENT
  // =============================================

  // Get all conversations for a store (seller side)
  async getStoreConversations(storeId: string, filters?: any) {
    let query = supabase
      .from('conversations')
      .select(`
        *,
        customers(first_name, last_name, email, avatar_url),
        stores(name, logo_url)
      `)
      .eq('store_id', storeId)
      .eq('is_deleted', false)
      .order('last_message_at', { ascending: false });

    if (filters?.is_archived !== undefined) {
      query = query.eq('is_archived', filters.is_archived);
    }
    if (filters?.unread_only) {
      query = query.gt('unread_count', 0);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get all conversations for a user (customer side)
  async getUserConversations(userId: string, filters?: any) {
    let query = supabase
      .from('conversations')
      .select(`
        *,
        stores(name, logo_url, description)
      `)
      .eq('customer_id', userId)
      .eq('is_deleted', false)
      .order('last_message_at', { ascending: false });

    if (filters?.is_archived !== undefined) {
      query = query.eq('is_archived', filters.is_archived);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get a single conversation with messages
  async getConversation(conversationId: string): Promise<ConversationWithMessages> {
    // Get conversation details
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select(`
        *,
        customers(first_name, last_name, email, avatar_url),
        stores(name, logo_url, description)
      `)
      .eq('id', conversationId)
      .single();

    if (convError) throw convError;

    // Get messages for this conversation
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select(`
        *,
        message_reactions(*)
      `)
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (msgError) throw msgError;

    return {
      ...conversation,
      messages: messages || [],
    };
  },

  // Create a new conversation
  async createConversation(storeId: string, customerId: string): Promise<Conversation> {
    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('store_id', storeId)
      .eq('customer_id', customerId)
      .eq('is_deleted', false)
      .single();

    if (existing) {
      return existing;
    }

    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        store_id: storeId,
        customer_id: customerId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Archive/unarchive conversation
  async toggleConversationArchive(conversationId: string, isArchived: boolean) {
    const { data, error } = await supabase
      .from('conversations')
      .update({ is_archived: isArchived })
      .eq('id', conversationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete conversation (soft delete)
  async deleteConversation(conversationId: string) {
    const { error } = await supabase
      .from('conversations')
      .update({ is_deleted: true })
      .eq('id', conversationId);

    if (error) throw error;
    return true;
  },

  // =============================================
  // MESSAGE MANAGEMENT
  // =============================================

  // Send a message
  async sendMessage(messageData: {
    conversation_id: string;
    sender_type: 'customer' | 'store';
    sender_id: string;
    message: string;
    message_type?: 'text' | 'image' | 'file' | 'order_link' | 'product_link';
    media_url?: string;
    reply_to_message_id?: string;
  }): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        ...messageData,
        message_type: messageData.message_type || 'text',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get messages for a conversation
  async getMessages(conversationId: string, limit: number = 50, offset: number = 0): Promise<MessageWithReactions[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        message_reactions(*)
      `)
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  },

  // Mark messages as read
  async markMessagesAsRead(conversationId: string, userId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId) // Don't mark own messages as read
      .eq('is_read', false);

    if (error) throw error;
    return true;
  },

  // Delete a message (soft delete)
  async deleteMessage(messageId: string, deletedBy: string) {
    const { error } = await supabase
      .from('messages')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
      })
      .eq('id', messageId);

    if (error) throw error;
    return true;
  },

  // Edit a message
  async editMessage(messageId: string, newMessage: string) {
    const { data, error } = await supabase
      .from('messages')
      .update({
        message: newMessage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // =============================================
  // MESSAGE REACTIONS
  // =============================================

  // Add reaction to message
  async addMessageReaction(messageId: string, userId: string, reactionType: string) {
    const { data, error } = await supabase
      .from('message_reactions')
      .upsert({
        message_id: messageId,
        user_id: userId,
        reaction_type: reactionType,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remove reaction from message
  async removeMessageReaction(messageId: string, userId: string) {
    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },

  // Get reactions for a message
  async getMessageReactions(messageId: string) {
    const { data, error } = await supabase
      .from('message_reactions')
      .select('*')
      .eq('message_id', messageId);

    if (error) throw error;
    return data || [];
  },

  // =============================================
  // UTILITY FUNCTIONS
  // =============================================

  // Get unread count for a user
  async getUnreadCount(userId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('unread_count')
      .eq('customer_id', userId)
      .eq('is_deleted', false);

    if (error) throw error;
    return data?.reduce((total, conv) => total + (conv.unread_count || 0), 0) || 0;
  },

  // Get unread count for a store
  async getStoreUnreadCount(storeId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('unread_count')
      .eq('store_id', storeId)
      .eq('is_deleted', false);

    if (error) throw error;
    return data?.reduce((total, conv) => total + (conv.unread_count || 0), 0) || 0;
  },

  // Search conversations
  async searchConversations(storeId: string, searchTerm: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        customers(first_name, last_name, email),
        stores(name)
      `)
      .eq('store_id', storeId)
      .eq('is_deleted', false)
      .or(`customers.first_name.ilike.%${searchTerm}%,customers.last_name.ilike.%${searchTerm}%,customers.email.ilike.%${searchTerm}%`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Search messages in a conversation
  async searchMessages(conversationId: string, searchTerm: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .ilike('message', `%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
}; 