# 🗄️ SocialSpark Database & Data Consistency Architecture

## 📋 Overview

This document outlines the complete data architecture, consistency strategies, and real-time update mechanisms for the SocialSpark platform.

---

## 🏗️ Data Architecture

### **Core Principles**
1. **Single Source of Truth**: All data originates from Supabase PostgreSQL
2. **Real-time Synchronization**: Live updates via Supabase Realtime
3. **Optimistic Updates**: Immediate UI feedback with rollback on failure
4. **Intelligent Caching**: 5-minute cache with automatic invalidation
5. **Role-based Access**: Different data views based on user roles

### **Data Flow Diagram**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   AppContext    │    │   Supabase      │
│     UI Layer    │◄──►│   State Mgmt    │◄──►│   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Actions  │    │   Cache Layer   │    │   Realtime      │
│   (CRUD)        │    │   (5min TTL)    │    │   Subscriptions │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🔄 Data Consistency Strategy

### **1. Cache Management**
```typescript
// Cache keys follow pattern: `{entity}-{storeId}`
const cacheKey = `products-${storeId}`;
const cachedData = dataConsistencyManager.getCachedData(cacheKey);

if (cachedData) {
  // Use cached data if fresh (< 5 minutes)
  dispatch({ type: 'SET_PRODUCTS', payload: cachedData });
  return;
}
```

### **2. Cache Invalidation Rules**
- **CREATE**: Invalidate entity cache immediately
- **UPDATE**: Invalidate entity cache immediately  
- **DELETE**: Invalidate entity cache immediately
- **Role Switch**: Clear all cache
- **Sign Out**: Clear all cache

### **3. Optimistic Updates**
```typescript
// Example: Creating a product
const createProduct = async (productData) => {
  try {
    // 1. Optimistic UI update
    dispatch({ type: 'ADD_PRODUCT', payload: optimisticProduct });
    
    // 2. API call
    const realProduct = await productAPI.createProduct(productData);
    
    // 3. Update with real data
    dispatch({ type: 'UPDATE_PRODUCT', payload: realProduct });
    
    // 4. Invalidate cache
    dataConsistencyManager.invalidateCache(`products-${storeId}`);
    
  } catch (error) {
    // 5. Rollback on error
    dispatch({ type: 'DELETE_PRODUCT', payload: optimisticProduct.id });
    throw error;
  }
};
```

---

## 📡 Realtime Updates

### **1. Subscription Management**
```typescript
// Subscribe to products changes
realtimeManager.subscribeToProducts(storeId, (payload) => {
  switch (payload.eventType) {
    case 'INSERT':
      dispatch({ type: 'ADD_PRODUCT', payload: payload.new });
      break;
    case 'UPDATE':
      dispatch({ type: 'UPDATE_PRODUCT', payload: payload.new });
      break;
    case 'DELETE':
      dispatch({ type: 'DELETE_PRODUCT', payload: payload.old.id });
      break;
  }
});
```

### **2. Realtime Channels**
- **Products**: `products-{storeId}`
- **Orders**: `orders-{storeId}`
- **Posts**: `posts-{storeId}`
- **User Data**: `user-{userId}`

### **3. Connection States**
```typescript
interface AppState {
  realtimeConnected: boolean;
  lastSync: {
    products: number;
    orders: number;
    posts: number;
  };
}
```

---

## 🔐 Authentication & Role Management

### **1. User Roles**
```typescript
enum UserRole {
  USER = 'user',      // Can browse, shop, follow
  SELLER = 'seller',  // Can manage store, products, posts
  ADMIN = 'admin'     // Full platform access
}
```

### **2. Role Switching**
```typescript
const switchRole = async (newRole: UserRole) => {
  const updatedUser = await switchUserRole(newRole);
  dispatch({ type: 'SET_CURRENT_ROLE', payload: newRole });
  
  // Clear cache when switching roles
  dataConsistencyManager.clearCache();
};
```

### **3. Data Access Patterns**
- **User Mode**: Browse products, follow stores, place orders
- **Seller Mode**: Manage products, posts, orders, analytics
- **Admin Mode**: Platform-wide management

---

## 📊 Data Models & Relationships

### **1. Core Entities**
```sql
-- Users (extends Supabase auth.users)
users (id, email, role, profile_data, created_at)

-- Stores (for sellers)
stores (id, owner_id, name, description, settings)

-- Products (belongs to store)
products (id, store_id, name, price, inventory, is_active)

-- Orders (belongs to store and customer)
orders (id, store_id, customer_id, status, total, created_at)

-- Posts (belongs to store)
posts (id, store_id, content, media_urls, is_published)
```

### **2. Data Relationships**
```
User (1) ──► Store (1) ──► Products (N)
User (1) ──► Orders (N) ──► Store (1)
Store (1) ──► Posts (N)
Store (1) ──► Customers (N)
```

---

## 🚀 Performance Optimizations

### **1. Caching Strategy**
- **Cache Duration**: 5 minutes
- **Cache Keys**: Entity-specific with store/user context
- **Invalidation**: Immediate on mutations
- **Memory Management**: Automatic cleanup on role switch

### **2. Realtime Efficiency**
- **Event Filtering**: Store-specific subscriptions
- **Payload Optimization**: Only essential data in realtime
- **Connection Management**: Automatic reconnect on network issues

### **3. State Management**
- **Redux-like Pattern**: Predictable state updates
- **Immutable Updates**: No direct state mutations
- **Action Batching**: Multiple updates in single dispatch

---

## 🔧 Implementation Examples

### **1. Loading Data with Cache**
```typescript
const loadProducts = async () => {
  const cacheKey = `products-${state.store.id}`;
  const cachedData = dataConsistencyManager.getCachedData(cacheKey);
  
  if (cachedData) {
    dispatch({ type: 'SET_PRODUCTS', payload: cachedData });
    return;
  }
  
  const products = await productAPI.getProducts(state.store.id);
  dataConsistencyManager.updateCache(cacheKey, products);
  dispatch({ type: 'SET_PRODUCTS', payload: products });
};
```

### **2. Real-time Product Updates**
```typescript
// Subscribe to product changes
realtimeManager.subscribeToProducts(storeId, (payload) => {
  console.log('Product update:', payload);
  
  // Update state based on event type
  switch (payload.eventType) {
    case 'INSERT':
      dispatch({ type: 'ADD_PRODUCT', payload: payload.new });
      break;
    case 'UPDATE':
      dispatch({ type: 'UPDATE_PRODUCT', payload: payload.new });
      break;
    case 'DELETE':
      dispatch({ type: 'DELETE_PRODUCT', payload: payload.old.id });
      break;
  }
});
```

### **3. Optimistic Product Creation**
```typescript
const createProduct = async (productData) => {
  const optimisticProduct = {
    id: `temp-${Date.now()}`,
    ...productData,
    created_at: new Date().toISOString(),
  };
  
  // Optimistic update
  dispatch({ type: 'ADD_PRODUCT', payload: optimisticProduct });
  
  try {
    const realProduct = await productAPI.createProduct(productData);
    dispatch({ type: 'UPDATE_PRODUCT', payload: realProduct });
    dataConsistencyManager.invalidateCache(`products-${storeId}`);
  } catch (error) {
    dispatch({ type: 'DELETE_PRODUCT', payload: optimisticProduct.id });
    throw error;
  }
};
```

---

## 🛡️ Error Handling & Recovery

### **1. Network Failures**
- **Automatic Retry**: 3 attempts with exponential backoff
- **Offline Queue**: Actions queued for when connection returns
- **State Recovery**: Restore from cache on app restart

### **2. Data Conflicts**
- **Last Write Wins**: Server data takes precedence
- **Conflict Resolution**: Merge strategies for complex updates
- **User Notification**: Clear feedback on sync issues

### **3. Cache Corruption**
- **Cache Validation**: Verify data integrity
- **Automatic Refresh**: Force reload on corruption
- **Fallback Strategy**: Direct API calls when cache fails

---

## 📈 Monitoring & Analytics

### **1. Performance Metrics**
- **Cache Hit Rate**: Percentage of requests served from cache
- **Realtime Latency**: Time from DB change to UI update
- **API Response Times**: Endpoint performance tracking

### **2. Data Consistency Metrics**
- **Sync Success Rate**: Percentage of successful realtime updates
- **Conflict Resolution**: Number of data conflicts resolved
- **Cache Invalidation**: Frequency and impact of cache clears

### **3. User Experience Metrics**
- **Time to Interactive**: How quickly data loads
- **Update Responsiveness**: Real-time update performance
- **Error Recovery**: How quickly errors are resolved

---

## 🔮 Future Enhancements

### **1. Advanced Caching**
- **Redis Integration**: Distributed caching for multi-user
- **Predictive Caching**: Pre-load data based on user patterns
- **Compression**: Reduce cache memory footprint

### **2. Enhanced Realtime**
- **Selective Subscriptions**: Subscribe only to relevant data
- **Batch Updates**: Group multiple changes into single update
- **Conflict Resolution**: Advanced merge strategies

### **3. Offline Support**
- **Local Database**: SQLite for offline data storage
- **Sync Queue**: Background sync when online
- **Conflict Resolution**: Handle offline/online conflicts

---

## 📚 Best Practices

### **1. Data Consistency**
- Always invalidate cache on mutations
- Use optimistic updates for better UX
- Handle conflicts gracefully with user feedback

### **2. Performance**
- Cache frequently accessed data
- Minimize realtime subscription scope
- Batch related operations when possible

### **3. Error Handling**
- Provide clear error messages to users
- Implement retry mechanisms for transient failures
- Log errors for debugging and monitoring

### **4. Security**
- Validate all data on client and server
- Use RLS policies for data access control
- Audit all data access and modifications

---

This architecture ensures **data consistency**, **real-time updates**, and **optimal performance** across the entire SocialSpark platform while maintaining a **seamless user experience**. 