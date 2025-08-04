# 🚀 Backend Setup Guide

## 📋 Overview

This guide covers the complete backend setup for SocialSpark, including new social features, profile management, post interactions, and advanced search functionality.

## 🏗️ Architecture

### **Core Components**
- **Express.js Server** - Main API server
- **Supabase Integration** - Database and authentication
- **JWT Authentication** - Secure API access
- **Rate Limiting** - Protection against abuse
- **CORS Configuration** - Cross-origin requests

### **New Features Added**
- ✅ **Profile Management** - Seller profiles, follow/unfollow
- ✅ **Post Management** - CRUD operations, likes, comments
- ✅ **Advanced Search** - Product search, suggestions, analytics
- ✅ **Social Features** - Followers, engagement metrics

## 📁 File Structure

```
backend/
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── profiles.js      # Profile management
│   ├── posts.js         # Post CRUD & interactions
│   ├── search.js        # Advanced search
│   ├── stripe.js        # Payment processing
│   ├── paypal.js        # Payment processing
│   ├── orders.js        # Order management
│   ├── analytics.js     # Analytics data
│   └── webhooks.js      # Payment webhooks
├── middleware/
│   ├── auth.js          # JWT authentication
│   ├── validation.js    # Request validation
│   └── errorHandler.js  # Error handling
├── services/
│   ├── supabase.js      # Database client
│   └── initialization.js # Service setup
├── database/
│   └── social_features_schema.sql # New tables
└── server.js            # Main server file
```

## 🗄️ Database Schema

### **New Tables Added**

#### **1. Followers Table**
```sql
CREATE TABLE public.followers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    store_id UUID REFERENCES public.stores(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, store_id)
);
```

#### **2. Post Likes Table**
```sql
CREATE TABLE public.post_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    post_id BIGINT REFERENCES public.posts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);
```

#### **3. Post Comments Table**
```sql
CREATE TABLE public.post_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    post_id BIGINT REFERENCES public.posts(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **4. Search Analytics Table**
```sql
CREATE TABLE public.search_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    query TEXT NOT NULL,
    result_count INTEGER DEFAULT 0,
    filters JSONB,
    session_id TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 Setup Instructions

### **Step 1: Environment Configuration**

Create `.env` file in backend directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:8083

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Payment Configuration (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```

### **Step 2: Install Dependencies**

```bash
cd backend
npm install
```

### **Step 3: Database Setup**

1. **Run the social features schema:**
   ```sql
   -- Copy and paste the contents of database/social_features_schema.sql
   -- into your Supabase SQL editor
   ```

2. **Verify tables are created:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('followers', 'post_likes', 'post_comments', 'search_analytics');
   ```

### **Step 4: Start the Server**

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🔌 API Endpoints

### **Profile Management**

#### **Search Profiles**
```http
GET /api/profiles/search?q=TechStore&type=all&limit=20&page=1
```

#### **Get Profile Details**
```http
GET /api/profiles/:id
```

#### **Update Profile**
```http
PUT /api/profiles/:id
Content-Type: application/json

{
  "name": "Updated Store Name",
  "description": "New description",
  "category": "Electronics",
  "website": "https://example.com",
  "location": "New York"
}
```

#### **Follow/Unfollow Profile**
```http
POST /api/profiles/:id/follow
DELETE /api/profiles/:id/follow
```

### **Post Management**

#### **Search Posts**
```http
GET /api/posts/search?q=summer&status=all&limit=20&page=1
```

#### **Get All Posts**
```http
GET /api/posts?store_id=uuid&status=draft&limit=20&page=1
```

#### **Create Post**
```http
POST /api/posts
Content-Type: application/json

{
  "title": "New Product Launch",
  "content": "Check out our latest collection!",
  "media_urls": ["https://example.com/image.jpg"],
  "status": "draft",
  "tags": ["fashion", "new"]
}
```

#### **Update Post**
```http
PUT /api/posts/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content",
  "status": "published"
}
```

#### **Delete Post**
```http
DELETE /api/posts/:id
```

#### **Like/Unlike Post**
```http
POST /api/posts/:id/like
DELETE /api/posts/:id/like
```

#### **Comment on Post**
```http
POST /api/posts/:id/comments
Content-Type: application/json

{
  "content": "Great product!"
}
```

#### **Get Post Comments**
```http
GET /api/posts/:id/comments?limit=20&page=1
```

### **Advanced Search**

#### **Product Search**
```http
GET /api/search/products?q=wireless&categories=1,2&price_min=10&price_max=100&availability=in_stock&sort_by=price_low
```

#### **Search Suggestions**
```http
GET /api/search/suggestions?q=wireless&type=products
```

#### **Track Search Analytics**
```http
POST /api/search/analytics
Content-Type: application/json

{
  "query": "wireless headphones",
  "result_count": 15,
  "filters": {"categories": ["1", "2"]},
  "session_id": "session-123"
}
```

#### **Get Popular Searches**
```http
GET /api/search/popular?limit=10&period=7 days
```

#### **Get Search History**
```http
GET /api/search/history?limit=10
```

## 🔐 Authentication

### **JWT Token Required**
All API endpoints (except webhooks) require authentication:

```http
Authorization: Bearer your_jwt_token
```

### **Token Format**
```javascript
// Token structure
{
  "user_id": "uuid",
  "email": "user@example.com",
  "role": "user|seller|admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## 🛡️ Security Features

### **Row Level Security (RLS)**
- Users can only access their own data
- Store owners can only modify their own posts
- Public read access for posts and profiles

### **Rate Limiting**
- 100 requests per 15 minutes per IP
- Configurable via environment variables

### **Input Validation**
- Request body validation
- Query parameter validation
- SQL injection protection

### **Error Handling**
- Consistent error responses
- Detailed logging
- Graceful error recovery

## 📊 Analytics & Monitoring

### **Search Analytics**
- Track user search behavior
- Popular search queries
- Search result counts
- Filter usage patterns

### **Engagement Metrics**
- Automatic like/comment counting
- Real-time engagement updates
- Post performance tracking

### **Performance Monitoring**
- Request/response logging
- Error tracking
- Database query optimization

## 🧪 Testing

### **Test the API**

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Test health endpoint:**
   ```bash
   curl http://localhost:3001/health
   ```

3. **Test authentication:**
   ```bash
   curl -H "Authorization: Bearer your_token" \
        http://localhost:3001/api/profiles/search?q=test
   ```

### **Sample Test Data**

```javascript
// Test profile search
const response = await fetch('/api/profiles/search?q=TechStore', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Test post creation
const postData = {
  title: 'Test Post',
  content: 'This is a test post',
  status: 'draft'
};

const response = await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(postData)
});
```

## 🚀 Deployment

### **Environment Variables**
Ensure all required environment variables are set in production.

### **Database Migration**
Run the social features schema in your production Supabase instance.

### **Health Checks**
The `/health` endpoint provides server status monitoring.

## 📝 Troubleshooting

### **Common Issues**

1. **Database Connection Errors**
   - Verify Supabase credentials
   - Check network connectivity
   - Ensure RLS policies are correct

2. **Authentication Errors**
   - Verify JWT token format
   - Check token expiration
   - Ensure user exists in database

3. **Rate Limiting**
   - Reduce request frequency
   - Implement client-side caching
   - Contact admin for limit increases

### **Debug Mode**
Enable detailed logging:
```bash
NODE_ENV=development npm run dev
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [JWT Authentication](https://jwt.io/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs
3. Verify database schema
4. Test with sample data

---

**🎉 Your backend is now ready for production use!** 