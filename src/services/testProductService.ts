import { productService } from './productService';

// Test function to verify ProductService functionality
export async function testProductService() {
  console.log('🧪 Testing ProductService...');

  try {
    // Test 1: Get all products
    console.log('\n📋 Test 1: Getting all products...');
    const allProducts = await productService.searchProducts({
      page: 1,
      limit: 10
    });
    
    if (allProducts.success) {
      console.log(`✅ Found ${allProducts.products?.length || 0} products`);
      if (allProducts.products && allProducts.products.length > 0) {
        console.log('📦 Sample product:', {
          name: allProducts.products[0].name,
          price: allProducts.products[0].base_price,
          status: allProducts.products[0].product_status
        });
      }
    } else {
      console.log('❌ Failed to get products:', allProducts.error);
    }

    // Test 2: Get featured products
    console.log('\n⭐ Test 2: Getting featured products...');
    const featuredProducts = await productService.searchProducts({
      page: 1,
      limit: 5,
      filters: {
        is_featured: true
      }
    });
    
    if (featuredProducts.success) {
      console.log(`✅ Found ${featuredProducts.products?.length || 0} featured products`);
    } else {
      console.log('❌ Failed to get featured products:', featuredProducts.error);
    }

    // Test 3: Get products by category
    console.log('\n📂 Test 3: Getting products by category...');
    const electronicsProducts = await productService.searchProducts({
      page: 1,
      limit: 5,
      filters: {
        category_slug: 'smartphones'
      }
    });
    
    if (electronicsProducts.success) {
      console.log(`✅ Found ${electronicsProducts.products?.length || 0} smartphone products`);
    } else {
      console.log('❌ Failed to get smartphone products:', electronicsProducts.error);
    }

    // Test 4: Get categories
    console.log('\n📁 Test 4: Getting product categories...');
    const categories = await productService.getProductCategories();
    
    if (categories.success) {
      console.log(`✅ Found ${categories.categories?.length || 0} categories`);
      if (categories.categories && categories.categories.length > 0) {
        console.log('📂 Sample categories:', categories.categories.slice(0, 3).map(c => c.name));
      }
    } else {
      console.log('❌ Failed to get categories:', categories.error);
    }

    // Test 5: Get brands
    console.log('\n🏷️ Test 5: Getting product brands...');
    const brands = await productService.getProductBrands();
    
    if (brands.success) {
      console.log(`✅ Found ${brands.brands?.length || 0} brands`);
      if (brands.brands && brands.brands.length > 0) {
        console.log('🏷️ Sample brands:', brands.brands.slice(0, 3).map(b => b.name));
      }
    } else {
      console.log('❌ Failed to get brands:', brands.error);
    }

    console.log('\n🎉 ProductService tests completed!');

  } catch (error) {
    console.error('❌ Error testing ProductService:', error);
  }
}

// Export for use in other files
export default testProductService; 