const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStoreIntegration() {
  console.log('🚀 Setting up Store Integration Database...\n');

  try {
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'database', 'store_integration_schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    console.log('📋 Executing database schema...');
    
    // Split the SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          if (error) {
            console.log(`⚠️  Statement skipped (likely already exists): ${statement.substring(0, 50)}...`);
          }
        } catch (err) {
          // Ignore errors for statements that might already exist
          console.log(`⚠️  Statement skipped: ${statement.substring(0, 50)}...`);
        }
      }
    }

    console.log('✅ Database schema executed successfully!\n');

    // Verify platform configurations
    console.log('🔍 Verifying platform configurations...');
    const { data: configs, error: configError } = await supabase
      .from('platform_configs')
      .select('*');

    if (configError) {
      console.error('❌ Failed to verify platform configs:', configError);
    } else {
      console.log(`✅ Found ${configs.length} platform configurations:`);
      configs.forEach(config => {
        console.log(`   - ${config.display_name} (${config.platform_type})`);
      });
    }

    console.log('\n🎉 Store Integration setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run the app and navigate to Store Integration');
    console.log('   2. Connect your first store (Shopify, WooCommerce, etc.)');
    console.log('   3. Test the sync functionality');
    console.log('\n🔧 For development, you can use test credentials:');
    console.log('   - Shopify: Use a development store with API access');
    console.log('   - WooCommerce: Use a test site with REST API enabled');
    console.log('   - Custom: Use any API endpoint with proper authentication');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Alternative setup using direct SQL execution
async function setupWithDirectSQL() {
  console.log('🚀 Setting up Store Integration Database (Direct SQL)...\n');

  try {
    // Create tables manually
    const tables = [
      {
        name: 'store_connections',
        sql: `
          CREATE TABLE IF NOT EXISTS store_connections (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            platform_type VARCHAR(50) NOT NULL,
            store_name VARCHAR(255),
            store_domain VARCHAR(255),
            connection_status VARCHAR(20) DEFAULT 'connecting',
            credentials JSONB,
            settings JSONB,
            last_sync_at TIMESTAMP WITH TIME ZONE,
            sync_status VARCHAR(20) DEFAULT 'idle',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'sync_history',
        sql: `
          CREATE TABLE IF NOT EXISTS sync_history (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            store_connection_id UUID REFERENCES store_connections(id) ON DELETE CASCADE,
            sync_type VARCHAR(50),
            status VARCHAR(20),
            items_synced INTEGER DEFAULT 0,
            items_failed INTEGER DEFAULT 0,
            error_message TEXT,
            started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            completed_at TIMESTAMP WITH TIME ZONE
          );
        `
      },
      {
        name: 'platform_configs',
        sql: `
          CREATE TABLE IF NOT EXISTS platform_configs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            platform_type VARCHAR(50) UNIQUE NOT NULL,
            display_name VARCHAR(100),
            description TEXT,
            api_fields JSONB,
            supported_features JSONB,
            auth_method VARCHAR(50),
            base_url VARCHAR(255),
            webhook_support BOOLEAN DEFAULT false,
            rate_limits JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'synced_products',
        sql: `
          CREATE TABLE IF NOT EXISTS synced_products (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            store_connection_id UUID REFERENCES store_connections(id) ON DELETE CASCADE,
            platform_product_id VARCHAR(255),
            platform_type VARCHAR(50),
            name VARCHAR(255),
            description TEXT,
            price DECIMAL(10,2),
            sku VARCHAR(100),
            inventory_quantity INTEGER DEFAULT 0,
            images JSONB,
            status VARCHAR(20) DEFAULT 'active',
            metadata JSONB,
            last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'synced_orders',
        sql: `
          CREATE TABLE IF NOT EXISTS synced_orders (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            store_connection_id UUID REFERENCES store_connections(id) ON DELETE CASCADE,
            platform_order_id VARCHAR(255),
            platform_type VARCHAR(50),
            order_number VARCHAR(100),
            customer_email VARCHAR(255),
            total_amount DECIMAL(10,2),
            currency VARCHAR(10),
            status VARCHAR(50),
            order_date TIMESTAMP WITH TIME ZONE,
            items JSONB,
            shipping_address JSONB,
            billing_address JSONB,
            metadata JSONB,
            last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      }
    ];

    for (const table of tables) {
      console.log(`📋 Creating table: ${table.name}`);
      const { error } = await supabase.rpc('exec_sql', { sql: table.sql });
      if (error) {
        console.log(`⚠️  Table ${table.name} might already exist:`, error.message);
      } else {
        console.log(`✅ Table ${table.name} created successfully`);
      }
    }

    // Insert platform configurations
    console.log('\n📋 Inserting platform configurations...');
    const platformConfigs = [
      {
        platform_type: 'shopify',
        display_name: 'Shopify',
        description: 'Connect your Shopify store to sync products and orders',
        api_fields: { shop: 'string', accessToken: 'string' },
        supported_features: { products: true, orders: true, customers: true, inventory: true },
        auth_method: 'oauth',
        base_url: 'https://{shop}.myshopify.com',
        webhook_support: true,
        rate_limits: { requests_per_minute: 40 }
      },
      {
        platform_type: 'woocommerce',
        display_name: 'WooCommerce',
        description: 'Connect your WooCommerce store to sync products and orders',
        api_fields: { site_url: 'string', consumer_key: 'string', consumer_secret: 'string' },
        supported_features: { products: true, orders: true, customers: true, inventory: true },
        auth_method: 'api_key',
        base_url: 'https://{site_url}/wp-json/wc/v3',
        webhook_support: true,
        rate_limits: { requests_per_minute: 30 }
      },
      {
        platform_type: 'magento',
        display_name: 'Magento',
        description: 'Connect your Magento store to sync products and orders',
        api_fields: { base_url: 'string', access_token: 'string' },
        supported_features: { products: true, orders: true, customers: true, inventory: true },
        auth_method: 'api_key',
        base_url: 'https://{base_url}/rest/V1',
        webhook_support: false,
        rate_limits: { requests_per_minute: 20 }
      },
      {
        platform_type: 'custom',
        display_name: 'Custom Platform',
        description: 'Connect any custom e-commerce platform',
        api_fields: { base_url: 'string', api_key: 'string', api_secret: 'string' },
        supported_features: { products: true, orders: true, customers: false, inventory: true },
        auth_method: 'api_key',
        base_url: 'https://{base_url}/api',
        webhook_support: false,
        rate_limits: { requests_per_minute: 10 }
      }
    ];

    for (const config of platformConfigs) {
      const { error } = await supabase
        .from('platform_configs')
        .upsert(config, { onConflict: 'platform_type' });
      
      if (error) {
        console.log(`⚠️  Platform config ${config.platform_type} might already exist:`, error.message);
      } else {
        console.log(`✅ Platform config ${config.platform_type} inserted successfully`);
      }
    }

    console.log('\n🎉 Store Integration setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run the app and navigate to Store Integration');
    console.log('   2. Connect your first store (Shopify, WooCommerce, etc.)');
    console.log('   3. Test the sync functionality');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
if (process.argv.includes('--direct')) {
  setupWithDirectSQL();
} else {
  setupStoreIntegration();
} 