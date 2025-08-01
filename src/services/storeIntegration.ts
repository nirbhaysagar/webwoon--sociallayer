import { supabase } from './supabase';
import { PlatformAdapterFactory } from './platformAdapters';
import { SimpleEncryption } from './encryption';
import { Product, Order, Customer, StoreInfo, SyncOptions, SyncResult } from './platformAdapters/types';

/**
 * Store Integration Service
 * Handles all store connection and synchronization operations
 */
export class StoreIntegrationService {
  /**
   * Connect a new store to the platform
   */
  async connectStore(
    userId: string, 
    platformType: string, 
    credentials: any,
    settings?: any
  ): Promise<any> {
    try {
      // 1. Validate platform type
      if (!PlatformAdapterFactory.getSupportedPlatforms().includes(platformType)) {
        throw new Error(`Unsupported platform: ${platformType}`);
      }

      // 2. Validate credentials with platform
      const isValid = await PlatformAdapterFactory.validateCredentials(platformType, credentials);
      if (!isValid) {
        throw new Error('Invalid credentials for the selected platform');
      }

      // 3. Test connection and get store info
      const storeInfo = await PlatformAdapterFactory.getStoreInfo(platformType, credentials);

      // 4. Encrypt credentials for storage
      const encryptedCredentials = SimpleEncryption.encrypt(credentials);

      // 5. Create connection record
      const { data: connection, error } = await supabase
        .from('store_connections')
        .insert({
          user_id: userId,
          platform_type: platformType,
          store_name: storeInfo.name,
          store_domain: storeInfo.domain,
          connection_status: 'connected',
          credentials: encryptedCredentials,
          settings: settings || this.getDefaultSettings(platformType),
          last_sync_at: new Date().toISOString(),
          sync_status: 'idle'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create store connection: ${error.message}`);
      }

      // 6. Setup webhooks if supported
      if (PlatformAdapterFactory.supportsFeature(platformType, 'webhooks')) {
        try {
          await this.setupWebhooks(connection.id, platformType, credentials);
        } catch (webhookError) {
          console.warn('Failed to setup webhooks:', webhookError);
        }
      }

      // 7. Trigger initial sync
      await this.triggerInitialSync(connection.id);

      return {
        ...connection,
        store_info: storeInfo
      };
    } catch (error) {
      console.error('Failed to connect store:', error);
      throw new Error(`Failed to connect store: ${error.message}`);
    }
  }

  /**
   * Disconnect a store
   */
  async disconnectStore(userId: string, connectionId: string): Promise<void> {
    try {
      // 1. Get connection details
      const { data: connection, error: fetchError } = await supabase
        .from('store_connections')
        .select('*')
        .eq('id', connectionId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !connection) {
        throw new Error('Store connection not found');
      }

      // 2. Remove webhooks if supported
      if (PlatformAdapterFactory.supportsFeature(connection.platform_type, 'webhooks')) {
        try {
          const credentials = SimpleEncryption.decrypt(connection.credentials);
          const adapter = PlatformAdapterFactory.createAdapter(connection.platform_type);
          await adapter.removeWebhooks(credentials);
        } catch (webhookError) {
          console.warn('Failed to remove webhooks:', webhookError);
        }
      }

      // 3. Update connection status
      const { error: updateError } = await supabase
        .from('store_connections')
        .update({
          connection_status: 'disconnected',
          sync_status: 'idle'
        })
        .eq('id', connectionId)
        .eq('user_id', userId);

      if (updateError) {
        throw new Error(`Failed to disconnect store: ${updateError.message}`);
      }
    } catch (error) {
      console.error('Failed to disconnect store:', error);
      throw new Error(`Failed to disconnect store: ${error.message}`);
    }
  }

  /**
   * Get user's connected stores
   */
  async getUserStores(userId: string): Promise<any[]> {
    try {
      const { data: connections, error } = await supabase
        .from('store_connections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get user stores: ${error.message}`);
      }

      return connections || [];
    } catch (error) {
      console.error('Failed to get user stores:', error);
      throw new Error(`Failed to get user stores: ${error.message}`);
    }
  }

  /**
   * Get store connection details
   */
  async getStoreConnection(connectionId: string, userId: string): Promise<any> {
    try {
      const { data: connection, error } = await supabase
        .from('store_connections')
        .select('*')
        .eq('id', connectionId)
        .eq('user_id', userId)
        .single();

      if (error || !connection) {
        throw new Error('Store connection not found');
      }

      return connection;
    } catch (error) {
      console.error('Failed to get store connection:', error);
      throw new Error(`Failed to get store connection: ${error.message}`);
    }
  }

  /**
   * Sync store data
   */
  async syncStoreData(
    connectionId: string, 
    syncTypes: string[] = ['products'],
    options?: SyncOptions
  ): Promise<SyncResult> {
    try {
      // 1. Get connection details
      const connection = await this.getStoreConnection(connectionId, 'temp'); // We'll get userId from connection
      const userId = connection.user_id;

      // 2. Update sync status
      await this.updateSyncStatus(connectionId, 'syncing');

      // 3. Create sync history record
      const syncHistoryId = await this.createSyncHistory(connectionId, syncTypes.join(','));

      // 4. Get platform adapter
      const adapter = PlatformAdapterFactory.createAdapter(connection.platform_type);
      const credentials = SimpleEncryption.decrypt(connection.credentials);

      let totalSynced = 0;
      let totalFailed = 0;
      const errors: string[] = [];

      // 5. Perform sync for each type
      for (const syncType of syncTypes) {
        try {
          const result = await this.performSync(adapter, credentials, syncType, userId, connectionId, options);
          totalSynced += result.items_synced;
          totalFailed += result.items_failed;
          if (result.errors) {
            errors.push(...result.errors);
          }
        } catch (error) {
          totalFailed++;
          errors.push(`${syncType} sync failed: ${error.message}`);
        }
      }

      // 6. Update sync history
      await this.updateSyncHistory(syncHistoryId, {
        status: totalFailed === 0 ? 'success' : 'partial',
        items_synced: totalSynced,
        items_failed: totalFailed,
        error_message: errors.length > 0 ? errors.join('; ') : null,
        completed_at: new Date().toISOString()
      });

      // 7. Update connection last sync time
      await this.updateConnectionLastSync(connectionId);

      return {
        success: totalFailed === 0,
        items_synced: totalSynced,
        items_failed: totalFailed,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      console.error('Failed to sync store data:', error);
      throw new Error(`Failed to sync store data: ${error.message}`);
    } finally {
      await this.updateSyncStatus(connectionId, 'idle');
    }
  }

  /**
   * Get sync history for a store
   */
  async getSyncHistory(connectionId: string, limit: number = 50): Promise<any[]> {
    try {
      const { data: history, error } = await supabase
        .from('sync_history')
        .select('*')
        .eq('store_connection_id', connectionId)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to get sync history: ${error.message}`);
      }

      return history || [];
    } catch (error) {
      console.error('Failed to get sync history:', error);
      throw new Error(`Failed to get sync history: ${error.message}`);
    }
  }

  /**
   * Get synced products for a user
   */
  async getSyncedProducts(userId: string, connectionId?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('synced_products')
        .select('*')
        .eq('user_id', userId);

      if (connectionId) {
        query = query.eq('store_connection_id', connectionId);
      }

      const { data: products, error } = await query.order('last_synced_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get synced products: ${error.message}`);
      }

      return products || [];
    } catch (error) {
      console.error('Failed to get synced products:', error);
      throw new Error(`Failed to get synced products: ${error.message}`);
    }
  }

  /**
   * Get synced orders for a user
   */
  async getSyncedOrders(userId: string, connectionId?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('synced_orders')
        .select('*')
        .eq('user_id', userId);

      if (connectionId) {
        query = query.eq('store_connection_id', connectionId);
      }

      const { data: orders, error } = await query.order('last_synced_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get synced orders: ${error.message}`);
      }

      return orders || [];
    } catch (error) {
      console.error('Failed to get synced orders:', error);
      throw new Error(`Failed to get synced orders: ${error.message}`);
    }
  }

  /**
   * Test store connection
   */
  async testConnection(connectionId: string, userId: string): Promise<boolean> {
    try {
      const connection = await this.getStoreConnection(connectionId, userId);
      const credentials = SimpleEncryption.decrypt(connection.credentials);
      const adapter = PlatformAdapterFactory.createAdapter(connection.platform_type);
      
      return await adapter.testConnection(credentials);
    } catch (error) {
      console.error('Failed to test connection:', error);
      return false;
    }
  }

  /**
   * Update store connection settings
   */
  async updateConnectionSettings(
    connectionId: string, 
    userId: string, 
    settings: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('store_connections')
        .update({ settings })
        .eq('id', connectionId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to update connection settings: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to update connection settings:', error);
      throw new Error(`Failed to update connection settings: ${error.message}`);
    }
  }

  // Private helper methods

  private getDefaultSettings(platformType: string): any {
    return {
      sync_interval: 'daily',
      sync_products: true,
      sync_orders: true,
      sync_customers: false,
      auto_sync: true,
      field_mappings: {},
      filters: {}
    };
  }

  private async setupWebhooks(connectionId: string, platformType: string, credentials: any): Promise<void> {
    try {
      const webhookUrl = `${process.env.API_BASE_URL}/webhooks/${platformType}/${connectionId}`;
      const adapter = PlatformAdapterFactory.createAdapter(platformType);
      await adapter.setupWebhooks(credentials, webhookUrl);
    } catch (error) {
      console.error('Failed to setup webhooks:', error);
      throw error;
    }
  }

  private async triggerInitialSync(connectionId: string): Promise<void> {
    try {
      // Trigger initial sync in background
      setTimeout(async () => {
        try {
          await this.syncStoreData(connectionId, ['products']);
        } catch (error) {
          console.error('Initial sync failed:', error);
        }
      }, 5000); // Delay to allow connection to be established
    } catch (error) {
      console.error('Failed to trigger initial sync:', error);
    }
  }

  private async updateSyncStatus(connectionId: string, status: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('store_connections')
        .update({ sync_status: status })
        .eq('id', connectionId);

      if (error) {
        console.error('Failed to update sync status:', error);
      }
    } catch (error) {
      console.error('Failed to update sync status:', error);
    }
  }

  private async createSyncHistory(connectionId: string, syncType: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('sync_history')
        .insert({
          store_connection_id: connectionId,
          sync_type: syncType,
          status: 'running',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create sync history: ${error.message}`);
      }

      return data.id;
    } catch (error) {
      console.error('Failed to create sync history:', error);
      throw error;
    }
  }

  private async updateSyncHistory(
    syncHistoryId: string, 
    updates: {
      status?: string;
      items_synced?: number;
      items_failed?: number;
      error_message?: string | null;
      completed_at?: string;
    }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('sync_history')
        .update(updates)
        .eq('id', syncHistoryId);

      if (error) {
        console.error('Failed to update sync history:', error);
      }
    } catch (error) {
      console.error('Failed to update sync history:', error);
    }
  }

  private async updateConnectionLastSync(connectionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('store_connections')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', connectionId);

      if (error) {
        console.error('Failed to update last sync time:', error);
      }
    } catch (error) {
      console.error('Failed to update last sync time:', error);
    }
  }

  private async performSync(
    adapter: any,
    credentials: any,
    syncType: string,
    userId: string,
    connectionId: string,
    options?: SyncOptions
  ): Promise<{ items_synced: number; items_failed: number; errors?: string[] }> {
    let itemsSynced = 0;
    let itemsFailed = 0;
    const errors: string[] = [];

    try {
      switch (syncType) {
        case 'products':
          const products = await adapter.getProducts(credentials, options);
          for (const product of products) {
            try {
              await this.upsertSyncedProduct(userId, connectionId, product);
              itemsSynced++;
            } catch (error) {
              itemsFailed++;
              errors.push(`Failed to sync product ${product.id}: ${error.message}`);
            }
          }
          break;

        case 'orders':
          const orders = await adapter.getOrders(credentials, options);
          for (const order of orders) {
            try {
              await this.upsertSyncedOrder(userId, connectionId, order);
              itemsSynced++;
            } catch (error) {
              itemsFailed++;
              errors.push(`Failed to sync order ${order.id}: ${error.message}`);
            }
          }
          break;

        case 'customers':
          const customers = await adapter.getCustomers(credentials, options);
          // Handle customer sync if needed
          break;

        default:
          throw new Error(`Unsupported sync type: ${syncType}`);
      }
    } catch (error) {
      itemsFailed++;
      errors.push(`${syncType} sync failed: ${error.message}`);
    }

    return { items_synced: itemsSynced, items_failed: itemsFailed, errors };
  }

  private async upsertSyncedProduct(userId: string, connectionId: string, product: Product): Promise<void> {
    try {
      const { error } = await supabase
        .from('synced_products')
        .upsert({
          user_id: userId,
          store_connection_id: connectionId,
          platform_product_id: product.platform_product_id,
          platform_type: product.platform,
          name: product.name,
          description: product.description,
          price: product.price,
          sku: product.sku,
          inventory_quantity: product.inventory,
          images: product.images,
          status: product.status,
          metadata: product.metadata,
          last_synced_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,store_connection_id,platform_product_id'
        });

      if (error) {
        throw new Error(`Failed to upsert synced product: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to upsert synced product:', error);
      throw error;
    }
  }

  private async upsertSyncedOrder(userId: string, connectionId: string, order: Order): Promise<void> {
    try {
      const { error } = await supabase
        .from('synced_orders')
        .upsert({
          user_id: userId,
          store_connection_id: connectionId,
          platform_order_id: order.platform_order_id,
          platform_type: order.platform,
          order_number: order.order_number,
          customer_email: order.customer_email,
          total_amount: order.total_amount,
          currency: order.currency,
          status: order.status,
          order_date: order.order_date.toISOString(),
          items: order.items,
          shipping_address: order.shipping_address,
          billing_address: order.billing_address,
          metadata: order.metadata,
          last_synced_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,store_connection_id,platform_order_id'
        });

      if (error) {
        throw new Error(`Failed to upsert synced order: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to upsert synced order:', error);
      throw error;
    }
  }
} 