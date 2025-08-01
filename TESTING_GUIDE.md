# 🔐 Authentication Testing Guide

## **Overview**
This guide will help you test our complete authentication system for both users and sellers.

## **📋 Prerequisites**

### **1. Database Setup**
First, run these SQL files in your Supabase database (in order):

```sql
-- 1. User Authentication Schema
database/user_authentication_schema.sql

-- 2. Product Management Schema  
database/product_management_schema_basic.sql

-- 3. Update Stores for Users
database/update_stores_for_users.sql

-- 4. Sample Data
database/sample_data.sql
```

### **2. Environment Setup**
Make sure your Supabase configuration is correct in `src/services/supabase.ts`:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
```

## **🧪 Running the Tests**

### **Option 1: Automated Test Suite**
Run our comprehensive test suite:

```bash
# Install dependencies if needed
npm install

# Run the test suite
npx ts-node src/test-auth.ts
```

### **Option 2: Manual Testing**
Test each feature manually using our services.

## **📊 What the Tests Cover**

### **✅ Test Categories:**

1. **Database Connection** - Verify Supabase connection
2. **User Authentication** - Sign up, sign in, sign out
3. **Seller Conversion** - Regular user → Seller upgrade
4. **Store Creation** - Sellers creating stores
5. **Product Management** - Sellers creating products
6. **User Profile Management** - Profile CRUD operations
7. **Address Management** - User address management
8. **Preferences Management** - User preferences
9. **Security & Permissions** - Access control testing
10. **Cleanup** - Session cleanup

## **🔍 Manual Testing Steps**

### **Step 1: Test User Authentication**

```typescript
import { userService } from './src/services/userService';

// 1. Sign Up
const signUpResult = await userService.signUp({
  email: 'test@example.com',
  password: 'password123',
  first_name: 'Test',
  last_name: 'User'
});

// 2. Sign In
const signInResult = await userService.signIn('test@example.com', 'password123');

// 3. Get Current User
const currentUser = await userService.getCurrentUser();

// 4. Sign Out
const signOutResult = await userService.signOut();
```

### **Step 2: Test Seller Conversion**

```typescript
// 1. Create user and sign in
const user = await userService.signUp({...});
await userService.signIn('test@example.com', 'password123');

// 2. Become seller
const becomeSellerResult = await userService.becomeSeller(user.id);

// 3. Check seller status
const sellerStatus = await userService.isSeller(user.id);
```

### **Step 3: Test Store Creation**

```typescript
// 1. Ensure user is seller
await userService.becomeSeller(userId);

// 2. Create store
const storeData = {
  name: 'My Test Store',
  slug: 'my-test-store',
  description: 'A test store',
  business_type: 'individual',
  business_phone: '+1234567890',
  business_email: 'store@example.com'
};

const createStoreResult = await userService.createStore(userId, storeData);

// 3. Get user stores
const userStores = await userService.getUserStores(userId);
```

### **Step 4: Test Product Management**

```typescript
import { productService } from './src/services/productService';

// 1. Create product (requires seller + store)
const productData = {
  name: 'Test Product',
  slug: 'test-product',
  description: 'A test product',
  base_price: 99.99,
  stock_quantity: 100,
  product_status: 'active',
  store_id: storeId // From store creation
};

const createProductResult = await productService.createProduct(productData);

// 2. Search products
const searchResult = await productService.searchProducts({
  search: 'Test Product',
  page: 1,
  limit: 10
});
```

## **🎯 Expected Results**

### **✅ Successful Test Output:**
```
🧪 Starting Authentication Tests...

📊 Testing Database Connection...
✅ Database Connection: Connected successfully

👤 Testing User Authentication...
✅ User Sign Up: User created successfully
✅ User Sign In: User signed in successfully
✅ Get Current User: Current user retrieved
✅ User Sign Out: User signed out successfully

🏪 Testing Seller Conversion...
✅ Seller Sign Up: User created successfully
✅ Become Seller: User converted to seller successfully
✅ Seller Status Check: Seller status verified

🏬 Testing Store Creation...
✅ Store Owner Sign Up: User created successfully
✅ Store Creation: Store created successfully
✅ Get User Stores: Found 1 stores

📦 Testing Product Management...
✅ Product Manager Sign Up: User created successfully
✅ Product Store Creation: Store created successfully
✅ Product Creation: Product created successfully
✅ Product Search: Found 1 products

👤 Testing User Profile Management...
✅ Profile User Sign Up: User created successfully
✅ Get User Profile: User profile retrieved successfully
✅ Update User Profile: User profile updated successfully

📍 Testing Address Management...
✅ Address User Sign Up: User created successfully
✅ Create Address: Address created successfully
✅ Get User Addresses: Found 1 addresses

⚙️ Testing Preferences Management...
✅ Preferences User Sign Up: User created successfully
✅ Update User Preferences: User preferences updated successfully
✅ Get User Preferences: User preferences retrieved successfully

🔒 Testing Security & Permissions...
✅ Unauthenticated Access Blocked: Security properly blocks unauthenticated access
✅ Seller-Only Operations Protected: Non-sellers cannot create stores

🧹 Testing Cleanup...
✅ Test Cleanup: All test sessions cleaned up

📊 Test Results Summary:
========================
Total Tests: 20
Passed: 20 ✅
Failed: 0 ❌
Success Rate: 100.0%

✅ All tests completed!
```

## **❌ Common Issues & Solutions**

### **Issue 1: Database Connection Failed**
**Solution:** Check your Supabase URL and API key in the configuration.

### **Issue 2: User Sign Up Failed**
**Solution:** 
- Check if email is unique
- Verify password meets requirements
- Ensure Supabase auth is enabled

### **Issue 3: Seller Conversion Failed**
**Solution:**
- Verify user_profiles table exists
- Check RLS policies
- Ensure functions are created

### **Issue 4: Store Creation Failed**
**Solution:**
- Verify user is a seller
- Check stores table structure
- Ensure foreign key constraints

### **Issue 5: Product Creation Failed**
**Solution:**
- Verify user has a store
- Check product table structure
- Ensure all required fields

## **🔧 Troubleshooting**

### **Database Verification:**
```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'stores', 'products');

-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('handle_new_user', 'update_seller_status', 'create_seller_store');
```

### **RLS Policy Check:**
```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'stores', 'products');
```

## **📈 Performance Testing**

### **Load Testing:**
```typescript
// Test multiple concurrent users
const concurrentUsers = 10;
const promises = [];

for (let i = 0; i < concurrentUsers; i++) {
  promises.push(userService.signUp({
    email: `user${i}@example.com`,
    password: 'password123'
  }));
}

const results = await Promise.all(promises);
```

## **🎉 Success Criteria**

Your authentication system is working correctly when:

1. ✅ Users can sign up and sign in
2. ✅ Users can convert to sellers
3. ✅ Sellers can create stores
4. ✅ Sellers can create products
5. ✅ Security blocks unauthorized access
6. ✅ All CRUD operations work
7. ✅ Data relationships are maintained
8. ✅ Sessions are managed properly

## **🚀 Next Steps**

After successful testing:

1. **Build UI Components** - Create React Native screens
2. **Add Error Handling** - Improve user experience
3. **Implement Analytics** - Track user behavior
4. **Add Notifications** - Email/SMS notifications
5. **Performance Optimization** - Caching and optimization

---

**Happy Testing! 🧪✨** 