# Product Management Setup Guide

This guide will help you set up the complete product management system with Supabase backend integration.

## 🗄️ Database Schema Setup

### Step 1: Execute the Product Management Schema

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database/product_management_schema.sql`
4. Execute the script

This will create:
- ✅ **Enhanced products table** with additional fields (slug, meta_title, meta_description, featured_image_url, gallery_urls, video_url, brand, model, condition, warranty_info, return_policy, shipping_info, tax_info, custom_fields, view_count, favorite_count, rating_average, rating_count)
- ✅ **Product categories** table for organizing products
- ✅ **Product variants** table for different product options (size, color, etc.)
- ✅ **Product images** table for managing product galleries
- ✅ **Product attributes** table for customizable product properties
- ✅ **Product attribute values** table for attribute options
- ✅ **Product attribute assignments** table for linking attributes to products
- ✅ **Product tags** table for product labeling
- ✅ **Product tag assignments** table for linking tags to products
- ✅ **Product reviews** table for customer feedback
- ✅ **Product favorites** table for user wishlists
- ✅ **Product views** table for analytics tracking
- ✅ **Product inventory history** table for stock tracking
- ✅ **Product price history** table for price tracking
- ✅ **Product bulk operations** table for batch operations
- ✅ **Complete indexes** for performance optimization
- ✅ **RLS policies** for security
- ✅ **Triggers** for automatic updates
- ✅ **Helper functions** for data retrieval

### Step 2: Verify Tables Created

Check that these tables exist in your Supabase database:
- `public.products` (enhanced with new columns)
- `public.product_categories`
- `public.product_variants`
- `public.product_images`
- `public.product_attributes`
- `public.product_attribute_values`
- `public.product_attribute_assignments`
- `public.product_tags`
- `public.product_tag_assignments`
- `public.product_reviews`
- `public.product_favorites`
- `public.product_views`
- `public.product_inventory_history`
- `public.product_price_history`
- `public.product_bulk_operations`

## 🔧 Backend Services

### Product Management Service (`src/services/productManagementService.ts`)
- ✅ **Get products** - Retrieve products with filtering and pagination
- ✅ **Get single product** - Get detailed product information
- ✅ **Create product** - Add new products with variants and tags
- ✅ **Update product** - Modify existing product information
- ✅ **Delete product** - Remove products from the system
- ✅ **Product variants** - Manage product variations (size, color, etc.)
- ✅ **Product images** - Upload and manage product galleries
- ✅ **Product categories** - Organize products by categories
- ✅ **Product tags** - Label products for better organization
- ✅ **Product search** - Advanced search with filters
- ✅ **Product analytics** - Track views, favorites, and performance
- ✅ **Bulk operations** - Perform batch actions on multiple products
- ✅ **Inventory tracking** - Monitor stock levels and changes
- ✅ **Price history** - Track price changes over time

## 📱 Frontend Screens

### Updated Screens with Supabase Integration:

#### 1. Products Screen (`src/screens/SellerDashboard/ProductsScreen.tsx`)
- ✅ **Load products** from Supabase with real-time updates
- ✅ **Search products** with debounced search functionality
- ✅ **Filter products** by status, category, price range
- ✅ **Bulk operations** for activating, deactivating, featuring, deleting
- ✅ **Product selection** with long-press to enter selection mode
- ✅ **Empty state** with call-to-action for first product
- ✅ **Pull-to-refresh** for real-time data updates
- ✅ **Loading states** and error handling

## 🔐 Security Features

### Row Level Security (RLS)
- ✅ **Products** - Store owners can only manage their own products
- ✅ **Categories** - Store owners can manage categories
- ✅ **Variants** - Store owners can manage variants for their products
- ✅ **Images** - Store owners can manage images for their products
- ✅ **Attributes** - Store owners can manage product attributes
- ✅ **Tags** - Store owners can manage product tags
- ✅ **Reviews** - Users can create reviews, store owners can manage them
- ✅ **Favorites** - Users can manage their own favorites
- ✅ **Views** - Users can create view records, store owners can view analytics
- ✅ **Inventory history** - Store owners can view their inventory history
- ✅ **Price history** - Store owners can view their price history
- ✅ **Bulk operations** - Store owners can perform bulk operations

### Data Validation
- ✅ **Product name** - Required field validation
- ✅ **Product price** - Numeric validation with minimum values
- ✅ **Stock quantity** - Non-negative integer validation
- ✅ **Product slug** - Unique slug generation and validation
- ✅ **Image upload** - File type and size validation
- ✅ **Category hierarchy** - Parent-child relationship validation

## 📊 Features Implemented

### Product Management
- ✅ **Complete CRUD operations** for products
- ✅ **Product variants** with different prices and stock levels
- ✅ **Product images** with primary image and gallery support
- ✅ **Product categories** with hierarchical organization
- ✅ **Product tags** for flexible labeling
- ✅ **Product attributes** for customizable properties
- ✅ **SEO optimization** with meta titles and descriptions
- ✅ **Product conditions** (new, used, refurbished)
- ✅ **Brand and model** tracking
- ✅ **Warranty and return policy** information

### Inventory Management
- ✅ **Stock quantity** tracking
- ✅ **Low stock thresholds** with alerts
- ✅ **Inventory history** for audit trails
- ✅ **Bulk stock updates** for efficiency
- ✅ **Stock movement** tracking (purchases, sales, adjustments)
- ✅ **Out of stock** detection and handling

### Pricing Management
- ✅ **Regular pricing** with cost tracking
- ✅ **Compare pricing** for sales and discounts
- ✅ **Price history** for tracking changes
- ✅ **Bulk price updates** for promotions
- ✅ **Currency support** (configurable)

### Product Analytics
- ✅ **View tracking** for product popularity
- ✅ **Favorite tracking** for user preferences
- ✅ **Rating system** with average ratings
- ✅ **Review management** with approval system
- ✅ **Performance metrics** for business insights

### Search and Filtering
- ✅ **Text search** across product names and descriptions
- ✅ **Category filtering** for organized browsing
- ✅ **Price range filtering** for budget constraints
- ✅ **Brand filtering** for brand preferences
- ✅ **Condition filtering** for product quality
- ✅ **Tag filtering** for specific features
- ✅ **Attribute filtering** for detailed specifications
- ✅ **Sorting options** (newest, price, rating, name)

### Bulk Operations
- ✅ **Bulk activation/deactivation** for product status
- ✅ **Bulk featuring** for promotional products
- ✅ **Bulk deletion** with confirmation
- ✅ **Bulk price updates** for promotions
- ✅ **Bulk category changes** for reorganization
- ✅ **Operation tracking** with progress monitoring

## 🚀 Usage Examples

### Create a New Product
```typescript
import productManagementService from '../services/productManagementService';

// Create product with variants
const newProduct = await productManagementService.createProduct(storeId, {
  name: 'Premium Wireless Headphones',
  description: 'High-quality wireless headphones with noise cancellation',
  price: 199.99,
  compare_price: 249.99,
  cost_price: 120.00,
  stock_quantity: 50,
  category_id: 'electronics-category-id',
  brand: 'AudioTech',
  condition: 'new',
  tags: ['wireless', 'noise-cancelling', 'premium'],
  images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  variants: [
    {
      name: 'Black',
      price: 199.99,
      stock_quantity: 25,
      attributes: { color: 'black' }
    },
    {
      name: 'White',
      price: 199.99,
      stock_quantity: 25,
      attributes: { color: 'white' }
    }
  ]
});
```

### Search Products
```typescript
// Search products with filters
const searchResults = await productManagementService.searchProducts({
  search: 'headphones',
  category_id: 'electronics-category-id',
  min_price: 100,
  max_price: 300,
  brands: ['AudioTech', 'SoundMax'],
  conditions: ['new'],
  sort_by: 'price',
  sort_order: 'ASC',
  limit: 20,
  offset: 0
});
```

### Update Product
```typescript
// Update product information
const success = await productManagementService.updateProduct(productId, {
  name: 'Updated Product Name',
  price: 179.99,
  is_featured: true,
  tags: ['featured', 'bestseller'],
  images: ['https://example.com/new-image.jpg']
});
```

### Bulk Operations
```typescript
// Bulk update multiple products
const success = await productManagementService.bulkUpdateProducts(
  ['product-id-1', 'product-id-2', 'product-id-3'],
  { is_featured: true, is_active: true }
);

// Bulk delete products
const success = await productManagementService.bulkDeleteProducts([
  'product-id-1', 'product-id-2'
]);
```

### Get Product Analytics
```typescript
// Get product performance metrics
const analytics = await productManagementService.getProductAnalytics(productId);
console.log('Total views:', analytics.total_views);
console.log('Total favorites:', analytics.total_favorites);
console.log('Average rating:', analytics.average_rating);
console.log('Sales count:', analytics.sales_count);
console.log('Revenue:', analytics.revenue);
```

## 🔧 Configuration

### Supabase Storage Bucket
Create storage buckets for product images:
1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `product-images`
3. Set the bucket to public
4. Configure RLS policies for the bucket

### Environment Variables
Ensure these are set in your `.env` file:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🧪 Testing

### Test Product Creation
1. Navigate to Products screen
2. Tap the "+" button to add a new product
3. Fill in product details and save
4. Verify product appears in the list
5. Check that product is saved to database

### Test Product Search
1. Use the search bar to find products
2. Test different filters (category, price range, etc.)
3. Verify search results are accurate
4. Test sorting options

### Test Bulk Operations
1. Long-press a product to enter selection mode
2. Select multiple products
3. Perform bulk actions (activate, deactivate, delete)
4. Verify changes are applied to all selected products

### Test Product Analytics
1. View a product multiple times
2. Add product to favorites
3. Check analytics dashboard for tracking data
4. Verify view counts and favorite counts update

## 📈 Performance Optimizations

### Database Indexes
- ✅ **Product queries** optimized with indexes on store_id, is_active, price, created_at
- ✅ **Search queries** indexed for fast text search
- ✅ **Category filtering** indexed for quick category lookups
- ✅ **Price filtering** indexed for range queries
- ✅ **Brand filtering** indexed for brand-specific queries
- ✅ **Stock tracking** indexed for inventory queries

### Caching Strategy
- ✅ **Product list** cached for quick access
- ✅ **Search results** cached to reduce API calls
- ✅ **Category data** cached for filter options
- ✅ **Tag data** cached for tag management

## 🔒 Security Considerations

### Data Protection
- ✅ **Sensitive data** encrypted in transit
- ✅ **Image uploads** validated for security
- ✅ **User permissions** enforced through RLS
- ✅ **Bulk operations** logged for audit trails

### Access Control
- ✅ **RLS policies** prevent unauthorized access
- ✅ **Store ownership** verified for all operations
- ✅ **Input validation** prevents injection attacks
- ✅ **Rate limiting** on bulk operations

## 🎯 Next Steps

### Advanced Features
To enhance the product management system:
1. **Product Import/Export** - CSV/Excel import/export functionality
2. **Product Templates** - Pre-configured product setups
3. **Advanced Analytics** - Detailed performance metrics and reports
4. **Inventory Alerts** - Low stock notifications and reorder suggestions
5. **Product Recommendations** - AI-powered product suggestions
6. **Multi-language Support** - Internationalization for global markets
7. **Product Comparison** - Side-by-side product comparison
8. **Wishlist Management** - Advanced wishlist features
9. **Product Reviews** - Enhanced review system with moderation
10. **Product Videos** - Video content for products

### Integration Features
To connect with external services:
1. **Payment Gateway Integration** - Connect with Stripe, PayPal
2. **Shipping Provider Integration** - Connect with shipping APIs
3. **Tax Calculation Integration** - Connect with tax services
4. **Inventory Management Integration** - Connect with warehouse systems
5. **Marketing Integration** - Connect with email marketing platforms

---

**The product management system is now fully integrated with Supabase!** 🎉

All product operations are now backed by real database operations with proper security, validation, and error handling. The system supports complete CRUD operations, advanced filtering, bulk operations, and comprehensive analytics tracking. 