import { PlatformAdapter, PlatformConfig, PlatformCredentials } from './types';
import { ShopifyAdapter } from './ShopifyAdapter';
import { WooCommerceAdapter } from './WooCommerceAdapter';
import { MagentoAdapter } from './MagentoAdapter';
import { CustomPlatformAdapter } from './CustomPlatformAdapter';
import { supabase } from '../supabase';

/**
 * Platform Adapter Factory
 * Creates and manages platform-specific adapters for different e-commerce platforms
 */
export class PlatformAdapterFactory {
  private static adapters: Map<string, PlatformAdapter> = new Map();
  private static platformConfigs: Map<string, PlatformConfig> = new Map();

  /**
   * Initialize platform configurations from database
   */
  static async initialize(): Promise<void> {
    try {
      const { data: configs, error } = await supabase
        .from('platform_configs')
        .select('*');

      if (error) {
        console.error('Failed to load platform configs:', error);
        return;
      }

      configs?.forEach(config => {
        this.platformConfigs.set(config.platform_type, {
          platform_type: config.platform_type,
          display_name: config.display_name,
          description: config.description,
          api_fields: config.api_fields,
          supported_features: config.supported_features,
          auth_method: config.auth_method,
          base_url: config.base_url,
          webhook_support: config.webhook_support,
          rate_limits: config.rate_limits
        });
      });
    } catch (error) {
      console.error('Failed to initialize platform adapters:', error);
    }
  }

  /**
   * Create a platform adapter for the specified platform type
   */
  static createAdapter(platformType: string): PlatformAdapter {
    // Check if adapter already exists
    if (this.adapters.has(platformType)) {
      return this.adapters.get(platformType)!;
    }

    // Get platform configuration
    const config = this.platformConfigs.get(platformType);
    if (!config) {
      throw new Error(`Unsupported platform: ${platformType}`);
    }

    // Create adapter based on platform type
    let adapter: PlatformAdapter;
    switch (platformType) {
      case 'shopify':
        adapter = new ShopifyAdapter(config);
        break;
      case 'woocommerce':
        adapter = new WooCommerceAdapter(config);
        break;
      case 'magento':
        adapter = new MagentoAdapter(config);
        break;
      case 'custom':
        adapter = new CustomPlatformAdapter(config);
        break;
      default:
        throw new Error(`Unsupported platform: ${platformType}`);
    }

    // Cache the adapter
    this.adapters.set(platformType, adapter);
    return adapter;
  }

  /**
   * Get all supported platform types
   */
  static getSupportedPlatforms(): string[] {
    return Array.from(this.platformConfigs.keys());
  }

  /**
   * Get platform configuration
   */
  static getPlatformConfig(platformType: string): PlatformConfig | null {
    return this.platformConfigs.get(platformType) || null;
  }

  /**
   * Get all platform configurations
   */
  static getAllPlatformConfigs(): PlatformConfig[] {
    return Array.from(this.platformConfigs.values());
  }

  /**
   * Validate credentials for a specific platform
   */
  static async validateCredentials(platformType: string, credentials: PlatformCredentials): Promise<boolean> {
    try {
      const adapter = this.createAdapter(platformType);
      return await adapter.validateCredentials(credentials);
    } catch (error) {
      console.error(`Failed to validate credentials for ${platformType}:`, error);
      return false;
    }
  }

  /**
   * Test connection for a specific platform
   */
  static async testConnection(platformType: string, credentials: PlatformCredentials): Promise<boolean> {
    try {
      const adapter = this.createAdapter(platformType);
      return await adapter.testConnection(credentials);
    } catch (error) {
      console.error(`Failed to test connection for ${platformType}:`, error);
      return false;
    }
  }

  /**
   * Get store information for a specific platform
   */
  static async getStoreInfo(platformType: string, credentials: PlatformCredentials) {
    try {
      const adapter = this.createAdapter(platformType);
      return await adapter.getStoreInfo(credentials);
    } catch (error) {
      console.error(`Failed to get store info for ${platformType}:`, error);
      throw error;
    }
  }

  /**
   * Check if platform supports a specific feature
   */
  static supportsFeature(platformType: string, feature: string): boolean {
    const config = this.getPlatformConfig(platformType);
    return config?.supported_features[feature] || false;
  }

  /**
   * Get required API fields for a platform
   */
  static getRequiredFields(platformType: string): Record<string, string> {
    const config = this.getPlatformConfig(platformType);
    return config?.api_fields || {};
  }

  /**
   * Get authentication method for a platform
   */
  static getAuthMethod(platformType: string): string {
    const config = this.getPlatformConfig(platformType);
    return config?.auth_method || 'api_key';
  }

  /**
   * Clear cached adapters (useful for testing or when configs change)
   */
  static clearCache(): void {
    this.adapters.clear();
  }

  /**
   * Reload platform configurations from database
   */
  static async reloadConfigs(): Promise<void> {
    this.clearCache();
    await this.initialize();
  }
}
