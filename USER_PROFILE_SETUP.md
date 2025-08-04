# User Profile Management Setup Guide

This guide will help you set up the complete user profile management system with Supabase backend integration.

## 🗄️ Database Schema Setup

### Step 1: Execute the User Profile Schema

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database/user_profile_schema.sql`
4. Execute the script

This will create:
- ✅ **Enhanced users table** with profile fields (username, bio, website, location, etc.)
- ✅ **User profile history** table for tracking changes
- ✅ **Email change requests** table for email verification
- ✅ **Phone verification codes** table for SMS verification
- ✅ **Shipping addresses** table with full CRUD operations
- ✅ **Password reset tokens** table for security
- ✅ **User sessions** table for session management
- ✅ **Indexes** for performance optimization
- ✅ **RLS policies** for security
- ✅ **Triggers** for automatic updates
- ✅ **Helper functions** for data retrieval

### Step 2: Verify Tables Created

Check that these tables exist in your Supabase database:
- `public.users` (enhanced with new columns)
- `public.user_profile_history`
- `public.email_change_requests`
- `public.phone_verification_codes`
- `public.shipping_addresses`
- `public.password_reset_tokens`
- `public.user_sessions`

## 🔧 Backend Services

### User Profile Service (`src/services/userProfileService.ts`)
- ✅ **Get current user profile** - Retrieve user profile data
- ✅ **Update profile** - Update user profile information
- ✅ **Username availability** - Check if username is available
- ✅ **Upload profile image** - Upload avatar to Supabase Storage
- ✅ **Email change requests** - Request and verify email changes
- ✅ **Password management** - Change password securely
- ✅ **Phone verification** - Send and verify SMS codes
- ✅ **Shipping addresses** - Full CRUD operations for addresses
- ✅ **Profile history** - Track profile changes
- ✅ **Session management** - Manage user sessions

## 📱 Frontend Screens

### Updated Screens with Supabase Integration:

#### 1. Edit Profile Screen (`src/screens/UserDashboard/EditProfileScreen.tsx`)
- ✅ **Load user profile** from Supabase
- ✅ **Update profile** with real-time validation
- ✅ **Username availability** checking
- ✅ **Profile image upload** to Supabase Storage
- ✅ **Form validation** and error handling
- ✅ **Real-time feedback** for user actions

#### 2. Email & Password Screen (`src/screens/UserDashboard/EmailPasswordScreen.tsx`)
- ✅ **Email change requests** with verification
- ✅ **Password updates** with validation
- ✅ **Security tips** and best practices
- ✅ **Form validation** and error handling
- ✅ **Loading states** and user feedback

#### 3. Phone Number Screen (`src/screens/UserDashboard/PhoneNumberScreen.tsx`)
- ✅ **Phone verification** with SMS codes
- ✅ **Phone number formatting** and validation
- ✅ **Verification code** input and validation
- ✅ **Resend code** functionality
- ✅ **User-friendly** error messages

#### 4. Shipping Addresses Screen (`src/screens/UserDashboard/ShippingAddressesScreen.tsx`)
- ✅ **Add shipping addresses** with validation
- ✅ **Delete addresses** with confirmation
- ✅ **Address list** with type indicators
- ✅ **Default address** management
- ✅ **Empty state** with call-to-action

## 🔐 Security Features

### Row Level Security (RLS)
- ✅ **User profile history** - Users can only view their own history
- ✅ **Email change requests** - Users can only manage their own requests
- ✅ **Phone verification** - Users can only manage their own codes
- ✅ **Shipping addresses** - Users can only manage their own addresses
- ✅ **Password reset tokens** - Users can only manage their own tokens
- ✅ **User sessions** - Users can only manage their own sessions

### Data Validation
- ✅ **Email format validation** - Ensures valid email addresses
- ✅ **Phone number validation** - Validates phone number format
- ✅ **Password strength** - Enforces minimum password requirements
- ✅ **Username availability** - Prevents duplicate usernames
- ✅ **Address validation** - Ensures required fields are filled

## 📊 Features Implemented

### Profile Management
- ✅ **Complete profile CRUD** operations
- ✅ **Real-time validation** and error handling
- ✅ **Profile image upload** to Supabase Storage
- ✅ **Profile change history** tracking
- ✅ **Username availability** checking

### Email Management
- ✅ **Email change requests** with verification tokens
- ✅ **Email validation** and format checking
- ✅ **Verification email** sending (simulated)
- ✅ **Token expiration** handling
- ✅ **Duplicate email** prevention

### Password Management
- ✅ **Password change** with current password verification
- ✅ **Password strength** validation
- ✅ **Password reset** functionality
- ✅ **Security tips** and best practices
- ✅ **Loading states** and user feedback

### Phone Verification
- ✅ **Phone number validation** and formatting
- ✅ **SMS verification codes** (simulated)
- ✅ **Code expiration** handling
- ✅ **Resend functionality** for expired codes
- ✅ **User-friendly** error messages

### Shipping Addresses
- ✅ **Add new addresses** with validation
- ✅ **Delete addresses** with confirmation
- ✅ **Address type** management (home, work, other)
- ✅ **Default address** setting
- ✅ **Address list** with visual indicators

## 🚀 Usage Examples

### Update User Profile
```typescript
import userProfileService from '../services/userProfileService';

// Update profile
const success = await userProfileService.updateProfile({
  full_name: 'John Doe',
  username: 'johndoe',
  bio: 'Software developer and tech enthusiast',
  website: 'https://johndoe.com',
  location: 'San Francisco, CA',
});
```

### Add Shipping Address
```typescript
// Add new shipping address
const newAddress = await userProfileService.addShippingAddress({
  name: 'John Doe',
  phone: '+1 (555) 123-4567',
  address: '123 Main Street',
  city: 'San Francisco',
  state: 'CA',
  zip_code: '94102',
  country: 'United States',
  address_type: 'home',
  is_default: true,
});
```

### Request Email Change
```typescript
// Request email change
const success = await userProfileService.requestEmailChange('newemail@example.com');
if (success) {
  // Verification email sent
  // User needs to verify the new email
}
```

### Verify Phone Number
```typescript
// Send verification code
await userProfileService.sendPhoneVerificationCode('+1 (555) 123-4567');

// Verify code
const success = await userProfileService.verifyPhoneNumber('+1 (555) 123-4567', '123456');
```

## 🔧 Configuration

### Supabase Storage Bucket
Create a storage bucket for profile images:
1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `profile-images`
3. Set the bucket to public
4. Configure RLS policies for the bucket

### Environment Variables
Ensure these are set in your `.env` file:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🧪 Testing

### Test Profile Updates
1. Navigate to Edit Profile screen
2. Update profile information
3. Verify changes are saved to database
4. Check profile history is logged

### Test Email Changes
1. Navigate to Email & Password screen
2. Enter new email address
3. Verify email change request is created
4. Check verification token is generated

### Test Phone Verification
1. Navigate to Phone Number screen
2. Enter new phone number
3. Verify SMS code is generated
4. Test verification process

### Test Shipping Addresses
1. Navigate to Shipping Addresses screen
2. Add new address
3. Verify address is saved
4. Test delete functionality

## 📈 Performance Optimizations

### Database Indexes
- ✅ **User profile queries** optimized with indexes
- ✅ **Email change requests** indexed by token
- ✅ **Phone verification** indexed by user and expiration
- ✅ **Shipping addresses** indexed by user and default status
- ✅ **Password reset tokens** indexed by token and expiration

### Caching Strategy
- ✅ **Profile data** cached locally
- ✅ **Address list** cached for quick access
- ✅ **Validation results** cached to reduce API calls

## 🔒 Security Considerations

### Data Protection
- ✅ **Sensitive data** encrypted in transit
- ✅ **Password hashing** handled by Supabase Auth
- ✅ **Token expiration** for security
- ✅ **Session management** for security

### Access Control
- ✅ **RLS policies** prevent unauthorized access
- ✅ **User authentication** required for all operations
- ✅ **Input validation** prevents injection attacks
- ✅ **Rate limiting** on sensitive operations

## 🎯 Next Steps

### SMS Integration
To enable real SMS verification:
1. Integrate with Twilio or similar SMS service
2. Update `sendPhoneVerificationCode` to send real SMS
3. Configure webhooks for delivery status

### Email Integration
To enable real email verification:
1. Integrate with SendGrid or similar email service
2. Update `requestEmailChange` to send real emails
3. Configure email templates

### Image Upload Enhancement
To improve image upload:
1. Add image compression
2. Implement multiple image formats
3. Add image cropping functionality
4. Implement CDN for faster delivery

---

**The user profile management system is now fully integrated with Supabase!** 🎉

All profile operations are now backed by real database operations with proper security, validation, and error handling. 