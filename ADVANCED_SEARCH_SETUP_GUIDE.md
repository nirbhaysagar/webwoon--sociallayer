# Advanced Search System Setup Guide

## 🎯 **Overview**

The Advanced Search System provides comprehensive search capabilities including:
- **Full-text search** across products, sellers, and content
- **Search history** and personalized suggestions
- **Search analytics** and trending searches
- **Filter persistence** and saved searches
- **Search ranking** algorithms with relevance scoring

## 📋 **Features Implemented**

### ✅ **Database Schema**
- `search_history` - User search history and analytics
- `search_suggestions` - Popular and trending searches
- `search_analytics` - Daily search analytics and trends
- `saved_searches` - User saved searches and filters
- `search_ranking_weights` - Configurable ranking algorithms
- `search_index` - Full-text search index with vectors

### ✅ **Backend Service**
- `searchService.ts` - Complete search functionality
- Full-text search with ranking
- Search suggestions and trending
- Search history management
- Saved searches CRUD
- Analytics and reporting

### ✅ **Frontend Screen**
- `AdvancedSearchScreen.tsx` - Comprehensive search interface
- Real-time search suggestions
- Advanced filtering system
- Search history display
- Saved searches management
- Professional UI/UX design

## 🗄️ **Database Setup**

### **Step 1: Run the Database Schema**

```sql
-- Execute the advanced search schema
\i database/advanced_search_schema.sql
```

This will create:
- 6 new tables for search functionality
- Full-text search indexes
- Database functions for search operations
- Row Level Security policies
- Sample data for testing

### **Step 2: Verify Database Setup**

```sql
-- Check if tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'search_%';

-- Check if functions were created
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%search%';
```

## 🔧 **Backend Integration**

### **Step 1: Search Service**

The `searchService.ts` provides these key methods:

```typescript
// Perform full-text search
await searchService.performSearch(query, searchType, filters);

// Get search suggestions
await searchService.getSearchSuggestions(query, limit);

// Get trending searches
await searchService.getTrendingSearches(limit);

// Save search
await searchService.saveSearch({ name, query, searchType, filters });

// Get user search history
await searchService.getUserSearchHistory(limit);
```

### **Step 2: Integration Points**

**Product Management Integration:**
```typescript
// Update search index when product is created/updated
await searchService.updateProductSearchIndex(productId, {
  title: product.name,
  description: product.description,
  tags: product.tags,
  categories: product.categories,
  popularityScore: product.popularity
});
```

**Seller Management Integration:**
```typescript
// Update search index when seller profile is updated
await searchService.updateSellerSearchIndex(sellerId, {
  name: seller.name,
  description: seller.description,
  tags: seller.tags,
  categories: seller.categories,
  popularityScore: seller.popularity
});
```

## 🎨 **Frontend Implementation**

### **Step 1: Navigation Integration**

The search screen is accessible via:
```typescript
navigation.navigate('AdvancedSearch');
```

### **Step 2: Key Features**

**Search Interface:**
- Real-time search input with debouncing
- Search suggestions as you type
- Advanced filtering system
- Tab-based search (Products, Sellers, Content)

**Search Results:**
- Relevance and popularity scores
- Click tracking for analytics
- Save search functionality
- Navigation to product/seller details

**Search History:**
- Recent searches display
- Personalized suggestions
- Trending and popular searches
- Saved searches management

## 📊 **Search Analytics**

### **Analytics Dashboard**

The system tracks:
- **Search volume** by date and type
- **Popular queries** and trending searches
- **Filter usage** patterns
- **Click-through rates** on results
- **Search performance** metrics

### **Ranking Algorithm**

The search uses a weighted scoring system:
```sql
final_score = (relevance_score * weight_relevance) + 
              (popularity_score * weight_popularity)
```

Default weights:
- **Products**: 70% relevance, 30% popularity
- **Sellers**: 60% relevance, 40% popularity  
- **Content**: 80% relevance, 20% popularity

## 🔍 **Search Features**

### **Full-Text Search**
- PostgreSQL `tsvector` for fast text search
- Weighted search across title, description, tags, categories
- Automatic search vector updates via triggers

### **Smart Suggestions**
- **Popular searches** based on search count
- **Trending searches** from recent activity
- **Personalized suggestions** from user history
- **Related searches** based on query patterns

### **Advanced Filtering**
- **Category filters** (Electronics, Clothing, Home, etc.)
- **Brand filters** (Apple, Samsung, Nike, etc.)
- **Price range** filtering
- **Availability** filtering
- **Rating** filtering

### **Saved Searches**
- Save frequently used searches
- Name and organize saved searches
- Quick access to saved filters
- Delete unwanted saved searches

## 🚀 **Usage Examples**

### **Basic Search**
```typescript
// Search for products
const results = await searchService.performSearch('iphone', 'product');

// Search with filters
const filteredResults = await searchService.searchWithFilters(
  'laptop',
  { category: 'Electronics', price_min: 500, price_max: 2000 },
  'product'
);
```

### **Get Suggestions**
```typescript
// Get search suggestions
const suggestions = await searchService.getSearchSuggestions('iph');

// Get trending searches
const trending = await searchService.getTrendingSearches(10);
```

### **Save Search**
```typescript
// Save a search
const saved = await searchService.saveSearch({
  name: 'My iPhone Search',
  query: 'iphone',
  searchType: 'product',
  filters: { category: 'Electronics' }
});
```

## 📈 **Performance Optimization**

### **Database Indexes**
- Full-text search indexes on `search_vector`
- Composite indexes for filtering
- GIN indexes for fast text search
- B-tree indexes for range queries

### **Caching Strategy**
- Cache popular search suggestions
- Cache trending searches
- Cache search results for common queries
- Implement Redis for high-performance caching

### **Search Optimization**
- Debounced search input (300ms delay)
- Pagination for large result sets
- Lazy loading of search results
- Optimized search vector updates

## 🔒 **Security & Privacy**

### **Row Level Security**
- Users can only see their own search history
- Public access to search suggestions
- Admin-only access to analytics
- Secure saved searches per user

### **Data Privacy**
- Search history is user-specific
- Analytics are anonymized
- Saved searches are private
- Search data retention policies

## 🧪 **Testing**

### **Search Functionality**
```typescript
// Test basic search
const results = await searchService.performSearch('test', 'product');
expect(results.length).toBeGreaterThan(0);

// Test search suggestions
const suggestions = await searchService.getSearchSuggestions('test');
expect(suggestions.length).toBeGreaterThan(0);
```

### **Search Analytics**
```typescript
// Test analytics
const analytics = await searchService.getSearchAnalytics('2024-01-01', 'product');
expect(analytics.length).toBeGreaterThan(0);
```

## 📝 **Next Steps**

### **Immediate Actions**
1. ✅ Run the database schema
2. ✅ Test the search functionality
3. ✅ Integrate with existing product/seller data
4. ✅ Add search to navigation

### **Future Enhancements**
- **Elasticsearch integration** for advanced search
- **Machine learning** for better ranking
- **Voice search** capabilities
- **Image search** for products
- **Search analytics dashboard**
- **A/B testing** for search algorithms

## 🎯 **Success Metrics**

Track these key metrics:
- **Search conversion rate** (searches to purchases)
- **Search satisfaction** (user feedback)
- **Search performance** (response time)
- **Search usage** (daily active searches)
- **Filter effectiveness** (filter usage patterns)

---

**The Advanced Search System is now ready for production use! 🚀**

This comprehensive search solution provides enterprise-level search capabilities with full-text search, analytics, and smart ranking algorithms. The system is designed to scale and can be easily extended with additional features as needed. 