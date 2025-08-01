# 🔧 Supabase Setup Instructions

## ❌ Current Issue
The app is showing authentication errors because Supabase credentials are not configured. The app is currently running with a **mock client** for development.

## ✅ How to Fix

### 1. Create `.env` file
Create a `.env` file in your project root (same folder as `package.json`) with:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# App Configuration
EXPO_PUBLIC_APP_NAME=SocialSpark
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### 2. Get Your Supabase Credentials

1. **Go to [Supabase.com](https://supabase.com)**
2. **Create a new project** (or use existing)
3. **Go to Settings → API**
4. **Copy your credentials:**
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### 3. Update `.env` file
Replace the placeholder values with your actual credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Restart the app
After updating the `.env` file, restart your development server:

```bash
npx expo start --clear
```

## 🎯 What This Fixes

- ✅ **Authentication errors** will be resolved
- ✅ **Real Supabase connection** instead of mock
- ✅ **User registration/login** will work
- ✅ **Database operations** will work
- ✅ **Push notifications** will work

## 🚀 Current Status

- ✅ **App is running** with mock client
- ✅ **UI is working** (no more bundling errors)
- ✅ **Authentication system** is ready
- ⚠️ **Need real Supabase credentials** to enable full functionality

## 📝 Next Steps

1. **Set up Supabase credentials** (above)
2. **Test user registration**
3. **Test user login**
4. **Test all features**

The app will work perfectly once you add your Supabase credentials! 🎉 