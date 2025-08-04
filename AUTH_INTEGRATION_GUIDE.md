# 🔐 Authentication Integration Guide

## Current Status: Mock Authentication
- All features use hardcoded user ID: `1`
- No real authentication flow
- Supabase configured but not used for auth

## Production Goal: Real Authentication
- Supabase Auth integration
- Role-based access (User/Seller/Admin)
- Secure API endpoints
- Session management

---

## 🔗 Feature Authentication Mapping

### 1. 🔍 Advanced Search System
**Files to Update:**
- `src/services/searchService.ts`
- `src/screens/UserDashboard/SearchScreen.tsx`
- `database/advanced_search_schema.sql`

**Auth Requirements:**
- User must be logged in
- Search history: User-specific
- Analytics: Admin-only

### 2. 🛒 AI Cart Recovery
**Files to Update:**
- `src/services/cartRecoveryService.ts`
- `src/screens/SellerDashboard/AIIntegrationScreen.tsx`
- `database/ai_cart_recovery_schema.sql`

**Auth Requirements:**
- Users: View own abandoned carts
- Sellers: Manage recovery campaigns
- Admin: View analytics

### 3. 🤖 AI Recommendations
**Files to Update:**
- `src/services/recommendationService.ts`
- `database/ai_recommendation_schema.sql`

**Auth Requirements:**
- User behavior tracking: User-specific
- Recommendations: User-specific
- Analytics: Admin-only

### 4. 💬 Messaging System
**Files to Update:**
- `src/services/messagingService.ts`
- `src/screens/UserDashboard/MessagingScreen.tsx`
- `src/screens/UserDashboard/ChatScreen.tsx`
- `src/screens/SellerDashboard/SellerMessagingScreen.tsx`

**Auth Requirements:**
- Users can message sellers
- Sellers can message users
- Conversations: User-specific

### 5. 📦 Order Management
**Files to Update:**
- `src/services/orderService.ts`
- `src/screens/UserDashboard/OrderManagementScreen.tsx`
- `src/screens/UserDashboard/OrderTrackingScreen.tsx`

**Auth Requirements:**
- Users: View own orders
- Sellers: View store orders
- Order tracking: User-specific

### 6. 🔔 Push Notifications
**Files to Update:**
- `src/services/notificationService.ts`
- `src/screens/UserDashboard/NotificationSettingsScreen.tsx`
- `src/screens/UserDashboard/NotificationHistoryScreen.tsx`

**Auth Requirements:**
- User notifications: User-specific
- Preferences: User-specific
- Templates: Admin-only

### 7. 👤 User Profile
**Files to Update:**
- `src/services/userProfileService.ts`
- `src/screens/UserDashboard/UserProfileScreen.tsx`
- `src/screens/UserDashboard/EditProfileScreen.tsx`

**Auth Requirements:**
- Profile data: User-specific
- Shipping addresses: User-specific
- History: User-specific

### 8. 🏪 Product Management (Seller)
**Files to Update:**
- `src/services/productManagementService.ts`
- `src/screens/SellerDashboard/ProductsScreen.tsx`

**Auth Requirements:**
- Products: Seller-specific
- Inventory: Seller-specific
- Analytics: Seller-specific

### 9. 👥 Follow System
**Files to Update:**
- `src/services/followService.ts`
- `src/screens/UserDashboard/UserFollowingScreen.tsx`

**Auth Requirements:**
- Follows: User-specific
- Followers: Seller-specific

### 10. 📺 Live Streaming
**Files to Update:**
- `src/screens/UserDashboard/LiveRoomsScreen.tsx`
- `src/screens/SellerDashboard/SellerLiveRoomsScreen.tsx`

**Auth Requirements:**
- Sellers: Create streams
- Users: View streams
- Analytics: Seller-specific

---

## 🔧 Implementation Roadmap

### Phase 1: Authentication Foundation
1. Set up Supabase Auth
2. Create Auth Service
3. Update Navigation Guards

### Phase 2: User Features (Priority 1)
1. User Profile & Settings
2. Order Management
3. Messaging System
4. Search & Recommendations

### Phase 3: Seller Features (Priority 2)
1. Product Management
2. AI Integration Dashboard
3. Analytics & Reporting

### Phase 4: Admin Features (Priority 3)
1. System Analytics
2. User Management
3. Content Moderation

---

## 🔐 Authentication Patterns

### Current (Mock):
```typescript
const { user } = useApp(); // Returns mock user
const userId = 1; // Hardcoded
```

### Production (Real):
```typescript
const { user, session } = useAuth(); // Real Supabase session
const userId = session?.user?.id; // From session
```

### API Service Pattern:
```typescript
// Current
const data = await service.getData();

// Production
if (!session?.user?.id) throw new Error('Unauthorized');
const data = await service.getData(session.user.id);
```

---

## 📊 Database Integration

### Tables Requiring User ID Updates:
1. `user_behavior` - Track real interactions
2. `user_preferences` - Store preferences
3. `abandoned_carts` - Link to sessions
4. `user_notifications` - Send to users
5. `user_profile_history` - Track changes
6. `follows` - User relationships
7. `orders` - User purchases
8. `conversations` - User messages

### RLS Policies Example:
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON table_name
    FOR SELECT USING (auth.uid()::bigint = user_id);

CREATE POLICY "Users can insert own data" ON table_name
    FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);
```

---

## 🚀 Migration Checklist

### Before Integration:
- [ ] Backup mock data
- [ ] Document hardcoded user IDs
- [ ] Test all features
- [ ] Set up Supabase Auth

### During Integration:
- [ ] Replace `useApp()` with `useAuth()`
- [ ] Update service calls
- [ ] Add error handling
- [ ] Update navigation guards

### After Integration:
- [ ] Test with real auth
- [ ] Verify RLS policies
- [ ] Test role-based access
- [ ] Add logout functionality

---

## 🎯 Next Steps

1. **Choose starting point:**
   - User Profile (easiest)
   - Search System (most used)
   - Order Management (core business)

2. **Set up Supabase Auth**

3. **Begin migration:**
   - Pick one feature first
   - Update all related files
   - Test thoroughly

4. **Monitor and iterate**

---

## 📞 Support

- Check Supabase auth documentation
- Use browser dev tools to inspect auth state
- Test with real users before deployment
- Monitor error logs for auth issues

**Remember:** Authentication is critical for security. Take your time and test thoroughly! 