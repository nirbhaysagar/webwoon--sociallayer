# 🚀 Backend Setup Guide

## ✅ **PHASE 1: DATABASE SETUP**

### **Step 1: Run Safe Migration**
1. **Open Supabase Dashboard**
2. **Go to SQL Editor**
3. **Copy and paste** the contents of `database/social_features_safe_migration.sql`
4. **Click "Run"** - This will safely create only missing tables/policies

### **Step 2: Verify Setup**
After running the migration, you should see:
- ✅ **Tables created**: `followers`, `post_likes`, `post_comments`, `search_analytics`
- ✅ **Policies applied**: RLS security for all tables
- ✅ **Functions created**: Analytics and engagement tracking
- ✅ **Triggers set up**: Automatic engagement updates

## ✅ **PHASE 2: BACKEND SERVER SETUP**

### **Step 1: Install Dependencies**
```bash
cd backend
npm install
```

### **Step 2: Environment Setup**
1. **Copy** `.env.example` to `.env`
2. **Fill in your credentials**:
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:8083
```

### **Step 3: Start Server**
```bash
npm start
# or
node server.js
```

## ✅ **PHASE 3: TEST BACKEND**

### **Test Health Check**
```bash
curl http://localhost:3001/health
```

### **Test Authentication**
```bash
curl -X POST http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📋 **NEW API ENDPOINTS**

### **Profiles API**
- `GET /api/profiles/search` - Search seller profiles
- `GET /api/profiles/:id` - Get profile details
- `PUT /api/profiles/:id` - Update profile
- `POST /api/profiles/:id/follow` - Follow profile
- `DELETE /api/profiles/:id/follow` - Unfollow profile

### **Posts API**
- `GET /api/posts/search` - Search posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like post
- `DELETE /api/posts/:id/like` - Unlike post
- `POST /api/posts/:id/comments` - Comment on post
- `GET /api/posts/:id/comments` - Get post comments

### **Search API**
- `GET /api/search/products` - Advanced product search
- `GET /api/search/suggestions` - Search suggestions
- `POST /api/search/analytics` - Track search analytics
- `GET /api/search/popular` - Get popular searches
- `GET /api/search/history` - Get user search history

## 🔧 **FRONTEND INTEGRATION**

### **Update API Base URL**
In your frontend, update the API base URL:
```javascript
const API_BASE_URL = 'http://localhost:3001/api';
```

### **Test Frontend-Backend Connection**
1. **Start backend**: `npm start` (port 3001)
2. **Start frontend**: `npx expo start --web --port 8083`
3. **Test search toggle** in ProductDiscoveryScreen
4. **Test delete button** in PostsScreen

## 🐛 **TROUBLESHOOTING**

### **Common Issues**

#### **1. "Policy already exists" Error**
- ✅ **Solution**: Use the safe migration script
- ✅ **Status**: Normal - policies already exist

#### **2. "Connection refused" Error**
- ✅ **Check**: Backend server is running on port 3001
- ✅ **Check**: CORS settings in `.env`

#### **3. "Unauthorized" Error**
- ✅ **Check**: JWT token is valid
- ✅ **Check**: User is authenticated

#### **4. "Table doesn't exist" Error**
- ✅ **Solution**: Run the safe migration script
- ✅ **Check**: Supabase connection

## 🎯 **NEXT STEPS**

### **After Backend Setup**
1. ✅ **Test API endpoints** with Postman/curl
2. ✅ **Update frontend** to use new backend routes
3. ✅ **Test search functionality** with real data
4. ✅ **Test post management** with backend
5. ✅ **Test profile features** with backend

### **Production Deployment**
1. ✅ **Set up environment variables**
2. ✅ **Configure CORS for production**
3. ✅ **Set up SSL certificates**
4. ✅ **Configure database backups**
5. ✅ **Set up monitoring**

## 📞 **SUPPORT**

If you encounter issues:
1. **Check the console logs** for error messages
2. **Verify database connection** in Supabase
3. **Test individual endpoints** with curl/Postman
4. **Check environment variables** are set correctly

---

**🎉 Your backend is now ready for production use!** 