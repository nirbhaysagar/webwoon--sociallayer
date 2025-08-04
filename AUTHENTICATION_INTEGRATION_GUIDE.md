# 🔐 Authentication & Authorization Integration Guide

## 📋 Overview

This guide maps all SocialSpark features to their authentication requirements. When you're ready to implement real authentication, use this as a checklist to systematically replace mock data with authenticated user sessions.

---

## 🎯 **CURRENT STATUS: Mock Authentication**

### **Current Implementation:**
- All features use mock user data from `AppContext`
- User ID: `1` (hardcoded)
- No real authentication flow
- Supabase client configured but not actively used for auth

### **Production Goal:**
- Real user authentication via Supabase Auth
- Role-based access control (User vs Seller vs Admin)
- Secure API endpoints with proper authorization
- Session management and token refresh

---

## 🔗 **FEATURE AUTHENTICATION MAPPING**

### **1. 🔍 Advanced Search System**
**Current:** Mock user ID `1`
**Production Requirements:**
- **Authentication:** User must be logged in
- **Authorization:** All users can search
- **Data Access:** 
  - Search history: User-specific
  - Saved searches: User-specific
  - Search analytics: Admin-only
- **Files to Update:**
  ```typescript
  src/services/searchService.ts
  src/screens/UserDashboard/SearchScreen.tsx
  database/advanced_search_schema.sql
  ```

### **2. 🛒 AI Cart Recovery System**
**Current:** Mock user ID `1`
**Production Requirements:**
- **Authentication:** User must be logged in
- **Authorization:** Users can view their own abandoned carts
- **Data Access:**
  - Abandoned carts: User-specific
  - Recovery campaigns: Admin/Seller access
  - Analytics: Admin-only
- **Files to Update:**
  ```typescript
  src/services/cartRecoveryService.ts
  src/screens/SellerDashboard/AIIntegrationScreen.tsx
  database/ai_cart_recovery_schema.sql
  ```

### **3. 🤖 AI Recommendation Engine**
**Current:** Mock user ID `1`
**Production Requirements:**
- **Authentication:** User must be logged in
- **Authorization:** All authenticated users
- **Data Access:**
  - User behavior: User-specific
  - User preferences: User-specific
  - Recommendations: User-specific
  - Analytics: Admin-only
- **Files to Update:**
  ```typescript
  src/services/recommendationService.ts
  database/ai_recommendation_schema.sql
  ```

### **4. 💬 Messaging System**
**Current:** Mock user ID `1`
**Production Requirements:**
- **Authentication:** User must be logged in
- **Authorization:** Users can message sellers, sellers can message users
- **Data Access:**
  - Conversations: User-specific
  - Messages: User-specific
  - Seller conversations: Seller-specific
- **Files to Update:**
  ```typescript
  src/services/messagingService.ts
  src/screens/UserDashboard/MessagingScreen.tsx
  src/screens/UserDashboard/ChatScreen.tsx
  src/screens/SellerDashboard/SellerMessagingScreen.tsx
  database/messaging_schema.sql
  ```

### **5. 📦 Order Management**
**Current:** Mock user ID `1`
**Production Requirements:**
- **Authentication:** User must be logged in
- **Authorization:** Users can view their own orders, sellers can view their store orders
- **Data Access:**
  - User orders: User-specific
  - Seller orders: Seller-specific (filtered by store)
  - Order tracking: User-specific
- **Files to Update:**
  ```typescript
  src/services/orderService.ts
  src/screens/UserDashboard/OrderManagementScreen.tsx
  src/screens/UserDashboard/OrderTrackingScreen.tsx
  database/order_schema.sql
  ```

### **6. 🔔 Push Notifications**
**Current:** Mock user ID `1`
**Production Requirements:**
- **Authentication:** User must be logged in
- **Authorization:** Users manage their own preferences
- **Data Access:**
  - User notifications: User-specific
  - Notification preferences: User-specific
  - Templates: Admin-only
- **Files to Update:**
  ```typescript
  src/services/notificationService.ts
  src/screens/UserDashboard/NotificationSettingsScreen.tsx
  src/screens/UserDashboard/NotificationHistoryScreen.tsx
  database/push_notifications_schema.sql
  ```

### **7. 👤 User Profile Management**
**Current:** Mock user ID `1`
**Production Requirements:**
- **Authentication:** User must be logged in
- **Authorization:** Users can edit their own profiles
- **Data Access:**
  - Profile data: User-specific
  - Shipping addresses: User-specific
  - Profile history: User-specific
- **Files to Update:**
  ```typescript
  src/services/userProfileService.ts
  src/screens/UserDashboard/UserProfileScreen.tsx
  src/screens/UserDashboard/EditProfileScreen.tsx
  database/user_profile_schema.sql
  ```

### **8. 🏪 Product Management (Seller)**
**Current:** Mock user ID `1`
**Production Requirements:**
- **Authentication:** Seller must be logged in
- **Authorization:** Sellers can manage their own products
- **Data Access:**
  - Products: Seller-specific (filtered by store)
  - Inventory: Seller-specific
  - Analytics: Seller-specific
- **Files to Update:**
  ```typescript
  src/services/productManagementService.ts
  src/screens/SellerDashboard/ProductsScreen.tsx
  database/product_management_schema.sql
  ```

### **9. 👥 Follow System**
**Current:** Mock user ID `1`
**Production Requirements:**
- **Authentication:** User must be logged in
- **Authorization:** Users can follow/unfollow sellers
- **Data Access:**
  - Follows: User-specific
  - Followers: Seller-specific
- **Files to Update:**
  ```typescript
  src/services/followService.ts
  src/screens/UserDashboard/UserFollowingScreen.tsx
  database/follow_system.sql
  ```

### **10. 📺 Live Streaming**
**Current:** Mock user ID `1`
**Production Requirements:**
- **Authentication:** Users must be logged in
- **Authorization:** Sellers can create streams, users can view
- **Data Access:**
  - Live rooms: Seller-specific (creation), public (viewing)
  - Stream analytics: Seller-specific
- **Files to Update:**
  ```typescript
  src/screens/UserDashboard/LiveRoomsScreen.tsx
  src/screens/SellerDashboard/SellerLiveRoomsScreen.tsx
  database/live_streaming_schema.sql
  ```

---

## 🔧 **IMPLEMENTATION ROADMAP**

### **Phase 1: Authentication Foundation**
1. **Set up Supabase Auth**
   ```typescript
   // Replace mock authentication in AppContext
   src/context/AppContext.tsx
   ```

2. **Create Auth Service**
   ```typescript
   src/services/authService.ts
   ```

3. **Update Navigation Guards**
   ```typescript
   src/navigation/UserDashboardNavigator.tsx
   src/navigation/SellerDashboardNavigator.tsx
   ```

### **Phase 2: User Features (Priority 1)**
1. **User Profile & Settings**
2. **Order Management**
3. **Messaging System**
4. **Search & Recommendations**

### **Phase 3: Seller Features (Priority 2)**
1. **Product Management**
2. **AI Integration Dashboard**
3. **Analytics & Reporting**

### **Phase 4: Admin Features (Priority 3)**
1. **System Analytics**
2. **User Management**
3. **Content Moderation**

---

## 🔐 **AUTHENTICATION PATTERNS**

### **1. User Authentication Pattern**
```typescript
// Current (Mock)
const { user } = useApp(); // Returns mock user

// Production (Real)
const { user, session } = useAuth(); // Returns real Supabase session
```

### **2. API Service Pattern**
```typescript
// Current (Mock)
const userId = 1; // Hardcoded

// Production (Real)
const userId = session?.user?.id; // From Supabase session
```

### **3. Authorization Pattern**
```typescript
// Current (No checks)
const data = await service.getData();

// Production (With checks)
if (!session?.user?.id) {
  throw new Error('Unauthorized');
}
const data = await service.getData(session.user.id);
```

### **4. RLS Policy Pattern**
```sql
-- Current (Basic)
CREATE POLICY "Users can view their own data" ON table_name
    FOR SELECT USING (auth.uid()::bigint = user_id);

-- Production (Enhanced)
CREATE POLICY "Users can view their own data" ON table_name
    FOR SELECT USING (
        auth.uid()::bigint = user_id AND 
        auth.role() = 'authenticated'
    );
```

---

## 📊 **DATABASE INTEGRATION**

### **Tables Requiring User ID Updates:**
1. **user_behavior** - Track real user interactions
2. **user_preferences** - Store real user preferences
3. **abandoned_carts** - Link to real user sessions
4. **user_notifications** - Send to real users
5. **user_profile_history** - Track real profile changes
6. **follows** - Real user relationships
7. **orders** - Real user purchases
8. **conversations** - Real user messages

### **RLS Policies to Implement:**
```sql
-- Example for each table
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data" ON table_name
    FOR SELECT USING (auth.uid()::bigint = user_id);

CREATE POLICY "Users can insert their own data" ON table_name
    FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);

CREATE POLICY "Users can update their own data" ON table_name
    FOR UPDATE USING (auth.uid()::bigint = user_id);
```

---

## 🚀 **MIGRATION CHECKLIST**

### **Before Authentication Integration:**
- [ ] Backup current mock data
- [ ] Document all hardcoded user IDs
- [ ] Test all features with mock data
- [ ] Set up Supabase Auth configuration

### **During Authentication Integration:**
- [ ] Replace `useApp()` with `useAuth()` in components
- [ ] Update all service calls to use real user ID
- [ ] Implement proper error handling for auth failures
- [ ] Add loading states for auth checks
- [ ] Update navigation guards

### **After Authentication Integration:**
- [ ] Test all features with real authentication
- [ ] Verify RLS policies work correctly
- [ ] Test role-based access control
- [ ] Implement session refresh logic
- [ ] Add logout functionality

---

## 🔍 **DEBUGGING GUIDE**

### **Common Issues:**
1. **"User not authenticated" errors**
   - Check if Supabase session exists
   - Verify auth state in AppContext

2. **"Permission denied" errors**
   - Check RLS policies in database
   - Verify user role and permissions

3. **"Data not loading" errors**
   - Check if user ID is being passed correctly
   - Verify database queries include user filters

### **Testing Commands:**
```bash
# Check authentication status
console.log('Session:', session);
console.log('User ID:', session?.user?.id);

# Check database permissions
SELECT * FROM table_name WHERE user_id = auth.uid();
```

---

## 📈 **PERFORMANCE CONSIDERATIONS**

### **Authentication Optimizations:**
1. **Session Caching** - Cache user session locally
2. **Token Refresh** - Implement automatic token refresh
3. **Lazy Loading** - Load user data only when needed
4. **Connection Pooling** - Optimize database connections

### **Security Best Practices:**
1. **HTTPS Only** - Force secure connections
2. **Token Expiration** - Set reasonable token lifetimes
3. **Rate Limiting** - Prevent abuse of auth endpoints
4. **Audit Logging** - Track authentication events

---

## 🎯 **NEXT STEPS**

1. **Choose your starting point:**
   - Start with User Profile (easiest)
   - Start with Search System (most used)
   - Start with Order Management (core business)

2. **Set up Supabase Auth:**
   ```bash
   # Configure Supabase Auth
   # Set up email/password authentication
   # Configure social logins (optional)
   ```

3. **Begin migration:**
   - Pick one feature to migrate first
   - Update all related files
   - Test thoroughly before moving to next feature

4. **Monitor and iterate:**
   - Track authentication success rates
   - Monitor for auth-related errors
   - Gather user feedback on auth experience

---

## 📞 **SUPPORT**

When implementing authentication:
1. **Check Supabase documentation** for auth patterns
2. **Use browser dev tools** to inspect auth state
3. **Test with real users** before full deployment
4. **Monitor error logs** for auth-related issues

**Remember:** Authentication is critical for security. Take your time and test thoroughly at each step! 