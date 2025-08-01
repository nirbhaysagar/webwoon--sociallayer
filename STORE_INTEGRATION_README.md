# 🏪 Store Integration System

A comprehensive backend implementation for connecting and syncing data from any e-commerce platform to your app.

## 🚀 Features

### ✅ **Universal Platform Support**
- **Shopify** - Full API integration with webhooks
- **WooCommerce** - REST API with authentication
- **Magento** - REST API integration
- **Custom Platforms** - Flexible API adapter for any e-commerce platform

### ✅ **Core Functionality**
- 🔐 **Secure Credential Storage** - Encrypted API keys and tokens
- 🔄 **Real-time Data Sync** - Products, orders, customers, inventory
- 📊 **Sync History Tracking** - Complete audit trail of all sync operations
- 🎯 **Platform-Specific Adapters** - Optimized for each platform's API
- 🔗 **Webhook Support** - Real-time updates from connected stores
- 📈 **Connection Statistics** - Monitor sync performance and data counts

### ✅ **Advanced Features**
- 🛡️ **Error Handling & Recovery** - Robust error management
- ⚡ **Rate Limiting** - Respects platform API limits
- 🔄 **Automatic Retry Logic** - Handles temporary failures
- 📋 **Field Mapping** - Customize data mapping between platforms
- 🎛️ **Sync Scheduling** - Automated sync intervals

## 🏗️ Architecture

### **Database Schema**
```
store_connections     - Store connection details
├── id (UUID)
├── user_id (UUID)
├── platform_type (VARCHAR)
├── store_name (VARCHAR)
├── store_domain (VARCHAR)
├── connection_status (VARCHAR)
├── credentials (JSONB) - Encrypted
├── settings (JSONB)
├── last_sync_at (TIMESTAMP)
└── sync_status (VARCHAR)

sync_history         - Sync operation tracking
├── id (UUID)
├── store_connection_id (UUID)
├── sync_type (VARCHAR)
├── status (VARCHAR)
├── items_synced (INTEGER)
├── items_failed (INTEGER)
├── error_message (TEXT)
├── started_at (TIMESTAMP)
└── completed_at (TIMESTAMP)

platform_configs     - Platform configurations
├── id (UUID)
├── platform_type (VARCHAR)
├── display_name (VARCHAR)
├── description (TEXT)
├── api_fields (JSONB)
├── supported_features (JSONB)
├── auth_method (VARCHAR)
├── base_url (VARCHAR)
├── webhook_support (BOOLEAN)
└── rate_limits (JSONB)

synced_products      - Synced product data
├── id (UUID)
├── user_id (UUID)
├── store_connection_id (UUID)
├── platform_product_id (VARCHAR)
├── platform_type (VARCHAR)
├── name (VARCHAR)
├── description (TEXT)
├── price (DECIMAL)
├── sku (VARCHAR)
├── inventory_quantity (INTEGER)
├── images (JSONB)
├── status (VARCHAR)
├── metadata (JSONB)
└── last_synced_at (TIMESTAMP)

synced_orders        - Synced order data
├── id (UUID)
├── user_id (UUID)
├── store_connection_id (UUID)
├── platform_order_id (VARCHAR)
├── platform_type (VARCHAR)
├── order_number (VARCHAR)
├── customer_email (VARCHAR)
├── total_amount (DECIMAL)
├── currency (VARCHAR)
├── status (VARCHAR)
├── order_date (TIMESTAMP)
├── items (JSONB)
├── shipping_address (JSONB)
├── billing_address (JSONB)
├── metadata (JSONB)
└── last_synced_at (TIMESTAMP)
```

### **Service Layer**
```
StoreIntegrationAPI          - Main API interface
├── connectStore()          - Connect new store
├── disconnectStore()       - Disconnect store
├── syncStoreData()         - Manual sync
├── getUserStores()         - Get user's stores
├── getSyncHistory()        - Get sync history
├── validateCredentials()   - Test connection
└── getConnectionStats()    - Get statistics

StoreIntegrationService      - Core business logic
├── connectStore()          - Store connection logic
├── performSync()           - Sync orchestration
├── upsertSyncedProduct()   - Product sync
├── upsertSyncedOrder()     - Order sync
└── setupWebhooks()         - Webhook management

PlatformAdapterFactory       - Platform management
├── createAdapter()         - Create platform adapter
├── validateCredentials()   - Test credentials
├── getStoreInfo()          - Get store information
└── supportsFeature()       - Check feature support

Platform Adapters           - Platform-specific logic
├── ShopifyAdapter          - Shopify integration
├── WooCommerceAdapter      - WooCommerce integration
├── MagentoAdapter          - Magento integration
└── CustomPlatformAdapter   - Custom platform support
```

## 🛠️ Setup Instructions

### **1. Database Setup**

Run the setup script to create the database schema:

```bash
# Install dependencies
npm install @supabase/supabase-js dotenv

# Run the setup script
node setup-store-integration.js

# Or use direct SQL method
node setup-store-integration.js --direct
```

### **2. Environment Variables**

Ensure these environment variables are set:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ENCRYPTION_KEY=your_secure_encryption_key
```

### **3. Initialize in App**

Add this to your app initialization:

```typescript
import { StoreIntegrationAPI } from './src/services/storeIntegrationAPI';

// Initialize store integration
await StoreIntegrationAPI.initialize();
```

## 📱 Usage Examples

### **Connect a Shopify Store**

```typescript
import { StoreIntegrationAPI } from './src/services/storeIntegrationAPI';

const result = await StoreIntegrationAPI.connectStore('user-id', {
  platformType: 'shopify',
  credentials: {
    shop: 'your-store.myshopify.com',
    accessToken: 'shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  },
  settings: {
    sync_products: true,
    sync_orders: true,
    auto_sync: true
  }
});

if (result.success) {
  console.log('Store connected successfully!');
} else {
  console.error('Connection failed:', result.message);
}
```

### **Sync Store Data**

```typescript
const result = await StoreIntegrationAPI.manualSync(
  'connection-id',
  ['products', 'orders'],
  { limit: 100 }
);

console.log(`Synced ${result.data.items_synced} items`);
```

### **Get User's Stores**

```typescript
const result = await StoreIntegrationAPI.getUserStores('user-id');

result.data.forEach(store => {
  console.log(`${store.store_name} (${store.platform_type})`);
});
```

### **Test Connection**

```typescript
const result = await StoreIntegrationAPI.validateCredentials('shopify', {
  shop: 'your-store.myshopify.com',
  accessToken: 'your-access-token'
});

if (result.success) {
  console.log('Credentials are valid!');
}
```

## 🔧 Platform-Specific Setup

### **Shopify**
1. Create a private app in your Shopify admin
2. Generate API credentials
3. Enable required API scopes (products, orders, customers)
4. Use the shop URL and access token

### **WooCommerce**
1. Go to WooCommerce > Settings > Advanced > REST API
2. Add a new key with read/write permissions
3. Use the site URL, consumer key, and consumer secret

### **Magento**
1. Create an integration in Magento admin
2. Generate access tokens
3. Use the base URL and access token

### **Custom Platform**
1. Ensure your API follows REST conventions
2. Implement required endpoints (products, orders)
3. Use the base URL and API key/secret

## 🔐 Security Features

### **Credential Encryption**
- All API credentials are encrypted before storage
- Uses AES-GCM encryption with secure key derivation
- Supports both production and development encryption methods

### **Row Level Security (RLS)**
- Users can only access their own store connections
- Automatic data isolation between users
- Secure credential access

### **API Rate Limiting**
- Respects platform-specific rate limits
- Automatic retry with exponential backoff
- Prevents API abuse

## 📊 Monitoring & Analytics

### **Sync History**
Track all sync operations with detailed metrics:
- Items synced vs failed
- Error messages and timestamps
- Sync duration and performance

### **Connection Statistics**
Monitor store health and performance:
- Connection status and last sync time
- Product and order counts
- Platform-specific metrics

### **Error Tracking**
Comprehensive error handling:
- API errors with detailed messages
- Network timeout handling
- Credential validation errors

## 🚀 Advanced Features

### **Webhook Support**
Real-time updates from connected stores:
- Automatic webhook registration
- Secure webhook validation
- Real-time data synchronization

### **Custom Field Mapping**
Flexible data mapping between platforms:
- Custom field mappings
- Data transformation rules
- Platform-specific adapters

### **Bulk Operations**
Efficient bulk sync operations:
- Multi-store synchronization
- Batch processing
- Progress tracking

## 🔄 Sync Types

### **Products**
- Product details and variants
- Inventory levels
- Images and media
- Categories and tags
- Pricing information

### **Orders**
- Order details and line items
- Customer information
- Shipping and billing addresses
- Payment information
- Order status tracking

### **Customers**
- Customer profiles
- Order history
- Contact information
- Customer segments

### **Inventory**
- Stock levels
- Inventory updates
- Low stock alerts
- Inventory tracking

## 🛠️ Development

### **Adding New Platforms**

1. Create a new adapter class:
```typescript
export class NewPlatformAdapter extends BasePlatformAdapter {
  async validateCredentials(credentials: PlatformCredentials): Promise<boolean> {
    // Implement validation logic
  }

  async getProducts(credentials: PlatformCredentials): Promise<Product[]> {
    // Implement product fetching
  }

  async getOrders(credentials: PlatformCredentials): Promise<Order[]> {
    // Implement order fetching
  }
}
```

2. Add platform configuration:
```sql
INSERT INTO platform_configs (
  platform_type, display_name, description, 
  api_fields, supported_features, auth_method, 
  base_url, webhook_support, rate_limits
) VALUES (
  'new_platform', 'New Platform', 'Description',
  '{"api_key": "string", "api_secret": "string"}',
  '{"products": true, "orders": true}',
  'api_key',
  'https://api.newplatform.com',
  false,
  '{"requests_per_minute": 30}'
);
```

3. Register in the factory:
```typescript
case 'new_platform':
  adapter = new NewPlatformAdapter(config);
  break;
```

### **Testing**

```typescript
// Test platform adapter
const adapter = PlatformAdapterFactory.createAdapter('shopify');
const isValid = await adapter.validateCredentials(credentials);

// Test sync operation
const result = await StoreIntegrationAPI.syncStoreData(
  'connection-id',
  ['products']
);
```

## 📝 API Reference

### **StoreIntegrationAPI Methods**

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `initialize()` | Initialize platform adapters | - | Promise<void> |
| `connectStore()` | Connect a new store | userId, platformData | Promise<Result> |
| `disconnectStore()` | Disconnect a store | userId, connectionId | Promise<Result> |
| `syncStoreData()` | Sync store data | connectionId, syncTypes, options | Promise<Result> |
| `getUserStores()` | Get user's stores | userId | Promise<Result> |
| `getSyncHistory()` | Get sync history | connectionId, limit | Promise<Result> |
| `validateCredentials()` | Test credentials | platformType, credentials | Promise<Result> |
| `getConnectionStats()` | Get connection stats | connectionId, userId | Promise<Result> |

### **Platform Adapter Methods**

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `validateCredentials()` | Validate API credentials | credentials | Promise<boolean> |
| `getStoreInfo()` | Get store information | credentials | Promise<StoreInfo> |
| `getProducts()` | Get products | credentials, options | Promise<Product[]> |
| `getOrders()` | Get orders | credentials, options | Promise<Order[]> |
| `getCustomers()` | Get customers | credentials, options | Promise<Customer[]> |
| `setupWebhooks()` | Setup webhooks | credentials, webhookUrl | Promise<void> |

## 🎯 Best Practices

### **Error Handling**
- Always check API response success
- Implement proper error logging
- Provide user-friendly error messages
- Handle network timeouts gracefully

### **Performance**
- Use pagination for large datasets
- Implement caching where appropriate
- Respect API rate limits
- Use background sync for large operations

### **Security**
- Never log sensitive credentials
- Use secure encryption for stored data
- Validate all input data
- Implement proper authentication

### **Monitoring**
- Track sync success rates
- Monitor API usage and limits
- Log performance metrics
- Alert on critical failures

## 🔧 Troubleshooting

### **Common Issues**

1. **Connection Failed**
   - Verify API credentials
   - Check network connectivity
   - Ensure proper API permissions

2. **Sync Errors**
   - Check API rate limits
   - Verify data format
   - Review error logs

3. **Webhook Issues**
   - Verify webhook URL accessibility
   - Check webhook permissions
   - Validate webhook signatures

### **Debug Mode**

Enable debug logging:
```typescript
// Add to your app initialization
console.log('Store Integration Debug Mode Enabled');
```

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Shopify API Documentation](https://shopify.dev/api)
- [WooCommerce REST API](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [Magento REST API](https://developer.adobe.com/commerce/webapi/rest/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**🎉 Congratulations!** You now have a fully functional store integration system that can connect to any e-commerce platform and sync data seamlessly. 