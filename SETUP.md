# SocialSpark Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase

#### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Wait for the project to be ready

#### Step 2: Get Your Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** (starts with `https://`)
3. Copy your **anon public** key (starts with `eyJ`)

#### Step 3: Create Environment File
Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Replace the values with your actual Supabase credentials.**

### 3. Set Up Database

#### Option A: Using Supabase Dashboard (Recommended)
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database/schema.sql`
4. Click **Run** to execute the schema

#### Option B: Using pgAdmin
1. Open pgAdmin
2. Connect to your Supabase database
3. Open the Query Tool
4. Copy and paste the contents of `database/schema.sql`
5. Execute the script

### 4. Start the Application
```bash
npm start
```

## 🏗️ Architecture Overview

### Data Flow
```
React Native App → Supabase Client → PostgreSQL Database
```

### Key Components
- **AppContext**: Central state management
- **API Services**: Database operations
- **Realtime Manager**: Live updates
- **Data Consistency Manager**: Caching layer

### User Roles
- **Seller**: Manage products, orders, create content
- **Customer**: Browse, purchase, follow stores

## 🔧 Configuration Details

### Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Database Tables
- `users`: User accounts and authentication
- `stores`: Store information
- `products`: Product catalog
- `orders`: Order management
- `posts`: Social content
- `customers`: Customer profiles
- `analytics_events`: Usage tracking

## 🚨 Troubleshooting

### Common Issues

#### 1. "Failed to construct 'URL': Invalid URL"
**Cause**: Supabase credentials not configured
**Solution**: Create `.env` file with proper credentials

#### 2. "Network request failed"
**Cause**: Supabase project not accessible
**Solution**: Check your project URL and ensure it's correct

#### 3. "Permission denied"
**Cause**: Row Level Security (RLS) policies
**Solution**: Ensure you're authenticated and have proper permissions

#### 4. Blank white screen
**Cause**: App failed to initialize
**Solution**: Check console for errors and ensure Supabase is configured

### Development Tips

1. **Use the Demo Screen**: When Supabase isn't configured, the app shows a helpful demo screen
2. **Check Console**: Always check the browser console for error messages
3. **Test Authentication**: Try signing in/up to test the connection
4. **Monitor Network**: Use browser dev tools to monitor API calls

## 📱 Features

### Seller Dashboard
- Product management
- Order processing
- Content creation
- Analytics
- Customer messaging

### Customer Experience
- Product browsing
- Shopping cart
- Order tracking
- Social features
- Store following

## 🔒 Security

### Row Level Security (RLS)
- Users can only access their own data
- Store owners manage their stores only
- Proper authentication required

### Environment Variables
- Never commit `.env` file to version control
- Use different credentials for development/production
- Rotate keys regularly

## 📊 Analytics

The app tracks:
- User interactions
- Product views
- Order conversions
- Content engagement
- Store performance

## 🚀 Deployment

### Web Deployment
```bash
npm run build:web
```

### Mobile Deployment
```bash
expo build:android
expo build:ios
```

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify your Supabase configuration
3. Ensure the database schema is properly set up
4. Test with a fresh Supabase project

---

**Happy coding! 🎉** 