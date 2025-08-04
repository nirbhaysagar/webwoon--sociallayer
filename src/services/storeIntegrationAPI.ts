import { StoreIntegrationService } from './storeIntegration';
import { PlatformAdapterFactory } from './platformAdapters';
import { SimpleEncryption } from './encryption';

/**
 * Store Integration API
 * Provides a clean interface for frontend to interact with store integration services
 */
export class StoreIntegrationAPI {
  private static service = new StoreIntegrationService();

  /**
   * Initialize platform adapters
   */
  static async initialize(): Promise<void> {
    await PlatformAdapterFactory.initialize();
  }

  /**
   * Get all supported platforms
   */
  static getSupportedPlatforms() {
    return PlatformAdapterFactory.getAllPlatformConfigs();
  }

  /**
   * Get platform configuration by type
   */
  static getPlatformConfig(platformType: string) {
    return PlatformAdapterFactory.getPlatformConfig(platformType);
  }

  /**
   * Connect a new store
   */
  static async connectStore(
    userId: string,
    platformData: {
      platformType: string;
      credentials: any;
      settings?: any;
    }
  ) {
    try {
      const result = await this.service.connectStore(
        userId,
        platformData.platformType,
        platformData.credentials,
        platformData.settings
      );

      return {
        success: true,
        data: result,
        message: 'Store connected successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to connect store'
      };
    }
  }

  /**
   * Disconnect a store
   */
  static async disconnectStore(userId: string, connectionId: string) {
    try {
      await this.service.disconnectStore(userId, connectionId);
      return {
        success: true,
        message: 'Store disconnected successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to disconnect store'
      };
    }
  }

  /**
   * Get user's connected stores
   */
  static async getUserStores(userId: string) {
    try {
      const stores = await this.service.getUserStores(userId);
      return {
        success: true,
        data: stores,
        message: 'Stores retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to get user stores'
      };
    }
  }

  /**
   * Get store connection details
   */
  static async getStoreConnection(connectionId: string, userId: string) {
    try {
      const connection = await this.service.getStoreConnection(connectionId, userId);
      return {
        success: true,
        data: connection,
        message: 'Store connection retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to get store connection'
      };
    }
  }

  /**
   * Sync store data
   */
  static async syncStoreData(
    connectionId: string,
    syncTypes: string[] = ['products'],
    options?: any
  ) {
    try {
      const result = await this.service.syncStoreData(connectionId, syncTypes, options);
      return {
        success: result.success,
        data: result,
        message: result.success 
          ? `Sync completed successfully. ${result.items_synced} items synced.`
          : `Sync completed with errors. ${result.items_synced} items synced, ${result.items_failed} failed.`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to sync store data'
      };
    }
  }

  /**
   * Get sync history
   */
  static async getSyncHistory(connectionId: string, limit: number = 50) {
    try {
      const history = await this.service.getSyncHistory(connectionId, limit);
      return {
        success: true,
        data: history,
        message: 'Sync history retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to get sync history'
      };
    }
  }

  /**
   * Get synced products
   */
  static async getSyncedProducts(userId: string, connectionId?: string) {
    try {
      const products = await this.service.getSyncedProducts(userId, connectionId);
      return {
        success: true,
        data: products,
        message: 'Synced products retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to get synced products'
      };
    }
  }

  /**
   * Get synced orders
   */
  static async getSyncedOrders(userId: string, connectionId?: string) {
    try {
      const orders = await this.service.getSyncedOrders(userId, connectionId);
      return {
        success: true,
        data: orders,
        message: 'Synced orders retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to get synced orders'
      };
    }
  }

  /**
   * Test store connection
   */
  static async testConnection(connectionId: string, userId: string) {
    try {
      const isConnected = await this.service.testConnection(connectionId, userId);
      return {
        success: isConnected,
        data: { isConnected },
        message: isConnected 
          ? 'Connection test successful'
          : 'Connection test failed'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to test connection'
      };
    }
  }

  /**
   * Update connection settings
   */
  static async updateConnectionSettings(
    connectionId: string,
    userId: string,
    settings: any
  ) {
    try {
      await this.service.updateConnectionSettings(connectionId, userId, settings);
      return {
        success: true,
        message: 'Connection settings updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update connection settings'
      };
    }
  }

  /**
   * Validate platform credentials
   */
  static async validateCredentials(platformType: string, credentials: any) {
    try {
      const isValid = await PlatformAdapterFactory.validateCredentials(platformType, credentials);
      return {
        success: isValid,
        data: { isValid },
        message: isValid 
          ? 'Credentials are valid'
          : 'Invalid credentials'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to validate credentials'
      };
    }
  }

  /**
   * Get store information from platform
   */
  static async getStoreInfo(platformType: string, credentials: any) {
    try {
      const storeInfo = await PlatformAdapterFactory.getStoreInfo(platformType, credentials);
      return {
        success: true,
        data: storeInfo,
        message: 'Store information retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to get store information'
      };
    }
  }

  /**
   * Check if platform supports a feature
   */
  static supportsFeature(platformType: string, feature: string) {
    return PlatformAdapterFactory.supportsFeature(platformType, feature);
  }

  /**
   * Get required fields for a platform
   */
  static getRequiredFields(platformType: string) {
    return PlatformAdapterFactory.getRequiredFields(platformType);
  }

  /**
   * Get authentication method for a platform
   */
  static getAuthMethod(platformType: string) {
    return PlatformAdapterFactory.getAuthMethod(platformType);
  }

  /**
   * Manual sync trigger
   */
  static async manualSync(
    connectionId: string,
    syncTypes: string[] = ['products', 'orders'],
    options?: any
  ) {
    try {
      const result = await this.service.syncStoreData(connectionId, syncTypes, options);
      return {
        success: result.success,
        data: result,
        message: result.success 
          ? `Manual sync completed. ${result.items_synced} items synced.`
          : `Manual sync completed with errors. ${result.items_synced} items synced, ${result.items_failed} failed.`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to perform manual sync'
      };
    }
  }

  /**
   * Get connection statistics
   */
  static async getConnectionStats(connectionId: string, userId: string) {
    try {
      const [connection, history, products, orders] = await Promise.all([
        this.service.getStoreConnection(connectionId, userId),
        this.service.getSyncHistory(connectionId, 10),
        this.service.getSyncedProducts(userId, connectionId),
        this.service.getSyncedOrders(userId, connectionId)
      ]);

      const stats = {
        connection_status: connection.connection_status,
        sync_status: connection.sync_status,
        last_sync: connection.last_sync_at,
        total_syncs: history.length,
        recent_syncs: history.slice(0, 5),
        products_count: products.length,
        orders_count: orders.length,
        platform_type: connection.platform_type,
        store_name: connection.store_name
      };

      return {
        success: true,
        data: stats,
        message: 'Connection statistics retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to get connection statistics'
      };
    }
  }

  /**
   * Bulk operations
   */
  static async bulkSync(userId: string, connectionIds: string[], syncTypes: string[] = ['products']) {
    try {
      const results = [];
      let totalSynced = 0;
      let totalFailed = 0;

      for (const connectionId of connectionIds) {
        try {
          const result = await this.service.syncStoreData(connectionId, syncTypes);
          results.push({
            connectionId,
            success: result.success,
            items_synced: result.items_synced,
            items_failed: result.items_failed,
            errors: result.errors
          });
          totalSynced += result.items_synced;
          totalFailed += result.items_failed;
        } catch (error) {
          results.push({
            connectionId,
            success: false,
            items_synced: 0,
            items_failed: 1,
            errors: [error.message]
          });
          totalFailed++;
        }
      }

      return {
        success: totalFailed === 0,
        data: {
          results,
          summary: {
            total_connections: connectionIds.length,
            successful_syncs: results.filter(r => r.success).length,
            failed_syncs: results.filter(r => !r.success).length,
            total_items_synced: totalSynced,
            total_items_failed: totalFailed
          }
        },
        message: `Bulk sync completed. ${totalSynced} items synced, ${totalFailed} failed.`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to perform bulk sync'
      };
    }
  }

  /**
   * Get platform-specific connection form fields
   */
  static getConnectionFormFields(platformType: string) {
    const config = this.getPlatformConfig(platformType);
    if (!config) {
      return null;
    }

    const fields = [];
    for (const [key, type] of Object.entries(config.api_fields)) {
      fields.push({
        name: key,
        type: type,
        required: true,
        label: this.formatFieldLabel(key),
        placeholder: this.getFieldPlaceholder(key, platformType)
      });
    }

    return {
      platform: platformType,
      display_name: config.display_name,
      description: config.description,
      auth_method: config.auth_method,
      fields: fields,
      supported_features: config.supported_features
    };
  }

  /**
   * Format field labels for display
   */
  private static formatFieldLabel(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ');
  }

  /**
   * Get field placeholder text
   */
  private static getFieldPlaceholder(fieldName: string, platformType: string): string {
    const placeholders: Record<string, Record<string, string>> = {
      shopify: {
      shop: 'your-store.myshopify.com',
      accessToken: 'shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    },
    woocommerce: {
      site_url: 'https://your-site.com',
      consumer_key: 'ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      consumer_secret: 'cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    },
    magento: {
      base_url: 'https://your-magento-site.com',
      access_token: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    },
    custom: {
      base_url: 'https://your-api-endpoint.com',
      api_key: 'your-api-key',
      api_secret: 'your-api-secret'
    }
  };

  return placeholders[platformType]?.[fieldName] || `Enter ${this.formatFieldLabel(fieldName).toLowerCase()}`;
  }
} 