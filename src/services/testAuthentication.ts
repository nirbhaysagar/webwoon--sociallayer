import { userService } from './userService';
import { productService } from './productService';
import { supabase } from './supabase';

// =============================================
// AUTHENTICATION TEST SUITE
// =============================================

export class AuthenticationTester {
  private testResults: any[] = [];

  async runAllTests() {
    console.log('🧪 Starting Authentication Tests...\n');

    try {
      // Test 1: Database Connection
      await this.testDatabaseConnection();

      // Test 2: User Authentication
      await this.testUserAuthentication();

      // Test 3: Seller Conversion
      await this.testSellerConversion();

      // Test 4: Store Creation
      await this.testStoreCreation();

      // Test 5: Product Management (Seller Only)
      await this.testProductManagement();

      // Test 6: User Profile Management
      await this.testUserProfileManagement();

      // Test 7: Address Management
      await this.testAddressManagement();

      // Test 8: Preferences Management
      await this.testPreferencesManagement();

      // Test 9: Security & Permissions
      await this.testSecurityPermissions();

      // Test 10: Cleanup
      await this.testCleanup();

      this.printResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  private async testDatabaseConnection() {
    console.log('📊 Testing Database Connection...');
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      if (error) {
        this.addResult('Database Connection', false, error.message);
      } else {
        this.addResult('Database Connection', true, 'Connected successfully');
      }
    } catch (error) {
      this.addResult('Database Connection', false, 'Connection failed');
    }
  }

  private async testUserAuthentication() {
    console.log('👤 Testing User Authentication...');

    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';

    try {
      // Test Sign Up
      const signUpResult = await userService.signUp({
        email: testEmail,
        password: testPassword,
        first_name: 'Test',
        last_name: 'User',
      });

      if (signUpResult.success) {
        this.addResult('User Sign Up', true, 'User created successfully');
      } else {
        this.addResult('User Sign Up', false, signUpResult.error || 'Sign up failed');
        return;
      }

      // Test Sign In
      const signInResult = await userService.signIn(testEmail, testPassword);
      
      if (signInResult.success) {
        this.addResult('User Sign In', true, 'User signed in successfully');
      } else {
        this.addResult('User Sign In', false, signInResult.error || 'Sign in failed');
      }

      // Test Get Current User
      const currentUserResult = await userService.getCurrentUser();
      
      if (currentUserResult.success && currentUserResult.user) {
        this.addResult('Get Current User', true, 'Current user retrieved');
      } else {
        this.addResult('Get Current User', false, 'Failed to get current user');
      }

      // Test Sign Out
      const signOutResult = await userService.signOut();
      
      if (signOutResult.success) {
        this.addResult('User Sign Out', true, 'User signed out successfully');
      } else {
        this.addResult('User Sign Out', false, signOutResult.error || 'Sign out failed');
      }

    } catch (error) {
      this.addResult('User Authentication', false, 'Authentication test failed');
    }
  }

  private async testSellerConversion() {
    console.log('🏪 Testing Seller Conversion...');

    const testEmail = `seller-${Date.now()}@example.com`;
    const testPassword = 'sellerpass123';

    try {
      // Create test user
      const signUpResult = await userService.signUp({
        email: testEmail,
        password: testPassword,
        first_name: 'Test',
        last_name: 'Seller',
      });

      if (!signUpResult.success) {
        this.addResult('Seller Sign Up', false, 'Failed to create seller account');
        return;
      }

      // Sign in
      await userService.signIn(testEmail, testPassword);

      // Test Become Seller
      const becomeSellerResult = await userService.becomeSeller(signUpResult.user!.id);
      
      if (becomeSellerResult.success) {
        this.addResult('Become Seller', true, 'User converted to seller successfully');
      } else {
        this.addResult('Become Seller', false, becomeSellerResult.error || 'Failed to become seller');
      }

      // Test Seller Status Check
      const sellerStatusResult = await userService.isSeller(signUpResult.user!.id);
      
      if (sellerStatusResult.success && sellerStatusResult.isSeller) {
        this.addResult('Seller Status Check', true, 'Seller status verified');
      } else {
        this.addResult('Seller Status Check', false, 'Seller status check failed');
      }

      // Sign out
      await userService.signOut();

    } catch (error) {
      this.addResult('Seller Conversion', false, 'Seller conversion test failed');
    }
  }

  private async testStoreCreation() {
    console.log('🏬 Testing Store Creation...');

    const testEmail = `store-${Date.now()}@example.com`;
    const testPassword = 'storepass123';

    try {
      // Create test seller
      const signUpResult = await userService.signUp({
        email: testEmail,
        password: testPassword,
        first_name: 'Test',
        last_name: 'Store',
      });

      if (!signUpResult.success) {
        this.addResult('Store Owner Sign Up', false, 'Failed to create store owner account');
        return;
      }

      // Sign in and become seller
      await userService.signIn(testEmail, testPassword);
      await userService.becomeSeller(signUpResult.user!.id);

      // Test Store Creation
      const storeData = {
        name: 'Test Store',
        slug: `test-store-${Date.now()}`,
        description: 'A test store for authentication testing',
        business_type: 'individual',
        business_phone: '+1234567890',
        business_email: testEmail,
      };

      const createStoreResult = await userService.createStore(signUpResult.user!.id, storeData);
      
      if (createStoreResult.success) {
        this.addResult('Store Creation', true, 'Store created successfully');
      } else {
        this.addResult('Store Creation', false, createStoreResult.error || 'Failed to create store');
      }

      // Test Get User Stores
      const getUserStoresResult = await userService.getUserStores(signUpResult.user!.id);
      
      if (getUserStoresResult.success && getUserStoresResult.stores && getUserStoresResult.stores.length > 0) {
        this.addResult('Get User Stores', true, `Found ${getUserStoresResult.stores.length} stores`);
      } else {
        this.addResult('Get User Stores', false, 'Failed to get user stores');
      }

      // Sign out
      await userService.signOut();

    } catch (error) {
      this.addResult('Store Creation', false, 'Store creation test failed');
    }
  }

  private async testProductManagement() {
    console.log('📦 Testing Product Management...');

    const testEmail = `product-${Date.now()}@example.com`;
    const testPassword = 'productpass123';

    try {
      // Create test seller with store
      const signUpResult = await userService.signUp({
        email: testEmail,
        password: testPassword,
        first_name: 'Test',
        last_name: 'Product',
      });

      if (!signUpResult.success) {
        this.addResult('Product Manager Sign Up', false, 'Failed to create product manager account');
        return;
      }

      // Sign in, become seller, create store
      await userService.signIn(testEmail, testPassword);
      await userService.becomeSeller(signUpResult.user!.id);

      const storeData = {
        name: 'Product Test Store',
        slug: `product-test-store-${Date.now()}`,
        description: 'Store for product management testing',
      };

      const createStoreResult = await userService.createStore(signUpResult.user!.id, storeData);
      
      if (!createStoreResult.success) {
        this.addResult('Product Store Creation', false, 'Failed to create store for product testing');
        return;
      }

      // Test Product Creation
      const productData = {
        name: 'Test Product',
        slug: `test-product-${Date.now()}`,
        description: 'A test product for authentication testing',
        base_price: 99.99,
        stock_quantity: 100,
        product_status: 'active',
        store_id: createStoreResult.storeId,
      };

      const createProductResult = await productService.createProduct(productData);
      
      if (createProductResult.success) {
        this.addResult('Product Creation', true, 'Product created successfully');
      } else {
        this.addResult('Product Creation', false, createProductResult.error || 'Failed to create product');
      }

      // Test Product Search
      const searchResult = await productService.searchProducts({
        query: 'Test Product',
        page: 1,
        limit: 10,
      });
      
      if (searchResult.success && searchResult.products && searchResult.products.length > 0) {
        this.addResult('Product Search', true, `Found ${searchResult.products.length} products`);
      } else {
        this.addResult('Product Search', false, 'Product search failed');
      }

      // Sign out
      await userService.signOut();

    } catch (error) {
      this.addResult('Product Management', false, 'Product management test failed');
    }
  }

  private async testUserProfileManagement() {
    console.log('👤 Testing User Profile Management...');

    const testEmail = `profile-${Date.now()}@example.com`;
    const testPassword = 'profilepass123';

    try {
      // Create test user
      const signUpResult = await userService.signUp({
        email: testEmail,
        password: testPassword,
        first_name: 'Profile',
        last_name: 'Test',
      });

      if (!signUpResult.success) {
        this.addResult('Profile User Sign Up', false, 'Failed to create profile test user');
        return;
      }

      // Sign in
      await userService.signIn(testEmail, testPassword);

      // Test Get User Profile
      const getProfileResult = await userService.getUserProfile(signUpResult.user!.id);
      
      if (getProfileResult.success && getProfileResult.profile) {
        this.addResult('Get User Profile', true, 'User profile retrieved successfully');
      } else {
        this.addResult('Get User Profile', false, 'Failed to get user profile');
      }

      // Test Update User Profile
      const updateData = {
        display_name: 'Updated Test User',
        phone: '+1234567890',
        bio: 'This is a test bio for profile management testing',
        is_public_profile: true,
        allow_marketing_emails: false,
      };

      const updateProfileResult = await userService.updateUserProfile(signUpResult.user!.id, updateData);
      
      if (updateProfileResult.success) {
        this.addResult('Update User Profile', true, 'User profile updated successfully');
      } else {
        this.addResult('Update User Profile', false, updateProfileResult.error || 'Failed to update profile');
      }

      // Sign out
      await userService.signOut();

    } catch (error) {
      this.addResult('User Profile Management', false, 'Profile management test failed');
    }
  }

  private async testAddressManagement() {
    console.log('📍 Testing Address Management...');

    const testEmail = `address-${Date.now()}@example.com`;
    const testPassword = 'addresspass123';

    try {
      // Create test user
      const signUpResult = await userService.signUp({
        email: testEmail,
        password: testPassword,
        first_name: 'Address',
        last_name: 'Test',
      });

      if (!signUpResult.success) {
        this.addResult('Address User Sign Up', false, 'Failed to create address test user');
        return;
      }

      // Sign in
      await userService.signIn(testEmail, testPassword);

      // Test Create Address
      const addressData = {
        address_type: 'shipping' as const,
        is_default: true,
        first_name: 'Test',
        last_name: 'User',
        address_line_1: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        postal_code: '12345',
        country: 'Test Country',
        instructions: 'Leave at front door',
      };

      const createAddressResult = await userService.createAddress(signUpResult.user!.id, addressData);
      
      if (createAddressResult.success) {
        this.addResult('Create Address', true, 'Address created successfully');
      } else {
        this.addResult('Create Address', false, createAddressResult.error || 'Failed to create address');
      }

      // Test Get User Addresses
      const getAddressesResult = await userService.getUserAddresses(signUpResult.user!.id);
      
      if (getAddressesResult.success && getAddressesResult.addresses && getAddressesResult.addresses.length > 0) {
        this.addResult('Get User Addresses', true, `Found ${getAddressesResult.addresses.length} addresses`);
      } else {
        this.addResult('Get User Addresses', false, 'Failed to get user addresses');
      }

      // Sign out
      await userService.signOut();

    } catch (error) {
      this.addResult('Address Management', false, 'Address management test failed');
    }
  }

  private async testPreferencesManagement() {
    console.log('⚙️ Testing Preferences Management...');

    const testEmail = `preferences-${Date.now()}@example.com`;
    const testPassword = 'preferencespass123';

    try {
      // Create test user
      const signUpResult = await userService.signUp({
        email: testEmail,
        password: testPassword,
        first_name: 'Preferences',
        last_name: 'Test',
      });

      if (!signUpResult.success) {
        this.addResult('Preferences User Sign Up', false, 'Failed to create preferences test user');
        return;
      }

      // Sign in
      await userService.signIn(testEmail, testPassword);

      // Test Update Preferences
      const preferencesData = {
        preferred_categories: ['electronics', 'fashion'],
        preferred_brands: ['Apple', 'Nike'],
        price_range_min: 10,
        price_range_max: 1000,
        theme: 'dark' as const,
        compact_mode: true,
      };

      const updatePreferencesResult = await userService.updateUserPreferences(signUpResult.user!.id, preferencesData);
      
      if (updatePreferencesResult.success) {
        this.addResult('Update User Preferences', true, 'User preferences updated successfully');
      } else {
        this.addResult('Update User Preferences', false, updatePreferencesResult.error || 'Failed to update preferences');
      }

      // Test Get User Preferences
      const getPreferencesResult = await userService.getUserPreferences(signUpResult.user!.id);
      
      if (getPreferencesResult.success) {
        this.addResult('Get User Preferences', true, 'User preferences retrieved successfully');
      } else {
        this.addResult('Get User Preferences', false, 'Failed to get user preferences');
      }

      // Sign out
      await userService.signOut();

    } catch (error) {
      this.addResult('Preferences Management', false, 'Preferences management test failed');
    }
  }

  private async testSecurityPermissions() {
    console.log('🔒 Testing Security & Permissions...');

    try {
      // Test unauthenticated access
      await userService.signOut();

      const unauthenticatedProfileResult = await userService.getUserProfile('test-user-id');
      
      if (!unauthenticatedProfileResult.success) {
        this.addResult('Unauthenticated Access Blocked', true, 'Security properly blocks unauthenticated access');
      } else {
        this.addResult('Unauthenticated Access Blocked', false, 'Security failed to block unauthenticated access');
      }

      // Test seller-only operations
      const testEmail = `security-${Date.now()}@example.com`;
      const testPassword = 'securitypass123';

      const signUpResult = await userService.signUp({
        email: testEmail,
        password: testPassword,
        first_name: 'Security',
        last_name: 'Test',
      });

      if (signUpResult.success) {
        await userService.signIn(testEmail, testPassword);

        // Try to create store without being seller
        const createStoreResult = await userService.createStore(signUpResult.user!.id, {
          name: 'Security Test Store',
          slug: 'security-test-store',
        });

        if (!createStoreResult.success) {
          this.addResult('Seller-Only Operations Protected', true, 'Non-sellers cannot create stores');
        } else {
          this.addResult('Seller-Only Operations Protected', false, 'Security failed to protect seller operations');
        }

        await userService.signOut();
      }

    } catch (error) {
      this.addResult('Security & Permissions', false, 'Security test failed');
    }
  }

  private async testCleanup() {
    console.log('🧹 Testing Cleanup...');

    try {
      // Sign out any remaining sessions
      await userService.signOut();
      
      this.addResult('Test Cleanup', true, 'All test sessions cleaned up');
    } catch (error) {
      this.addResult('Test Cleanup', false, 'Cleanup failed');
    }
  }

  private addResult(testName: string, passed: boolean, message: string) {
    this.testResults.push({
      test: testName,
      passed,
      message,
      timestamp: new Date().toISOString(),
    });

    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}: ${message}`);
  }

  private printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');

    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    const failed = total - passed;

    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => console.log(`  - ${r.test}: ${r.message}`));
    }

    console.log('\n✅ All tests completed!');
  }
}

// Export for use
export const authenticationTester = new AuthenticationTester(); 