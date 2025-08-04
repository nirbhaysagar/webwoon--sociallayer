# Supabase Storage Setup Guide

## 🚀 Setting up Image Upload for SocialSpark

This guide will help you set up Supabase Storage for product image uploads.

---

## 📋 Prerequisites

1. **Supabase Project**: You need a Supabase project set up
2. **Admin Access**: You need admin access to your Supabase dashboard
3. **Environment Variables**: Your `.env` file should have Supabase credentials

---

## 🔧 Step-by-Step Setup

### **Step 1: Create Storage Bucket**

1. Go to your **Supabase Dashboard**
2. Navigate to **Storage** in the left sidebar
3. Click **"Create a new bucket"**
4. Configure the bucket:
   - **Name**: `product-images`
   - **Public bucket**: ✅ **Check this**
   - **File size limit**: `10MB` (or your preferred limit)
   - **Allowed MIME types**: `image/*`

### **Step 2: Set Storage Policies**

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to product-images bucket
CREATE POLICY "Public Access to Product Images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Policy for authenticated users to upload to product-images bucket
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Policy for users to update their own uploaded images
CREATE POLICY "Users can update their own product images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for users to delete their own uploaded images
CREATE POLICY "Users can delete their own product images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### **Step 3: Create Product Images Table**

Run this SQL to create the product_images table:

```sql
-- Create product_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON product_images(is_primary);

-- Enable RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_images
CREATE POLICY "Users can view product images" ON product_images
FOR SELECT USING (true);

CREATE POLICY "Store owners can create product images" ON product_images
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM products p
    JOIN stores s ON p.store_id = s.id
    WHERE p.id = product_id AND s.owner_id = auth.uid()
  )
);

CREATE POLICY "Store owners can update product images" ON product_images
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM products p
    JOIN stores s ON p.store_id = s.id
    WHERE p.id = product_id AND s.owner_id = auth.uid()
  )
);

CREATE POLICY "Store owners can delete product images" ON product_images
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM products p
    JOIN stores s ON p.store_id = s.id
    WHERE p.id = product_id AND s.owner_id = auth.uid()
  )
);
```

### **Step 4: Test the Setup**

1. **Test Image Upload**:
   - Go to your app
   - Try to add a product with an image
   - Check the console for upload logs
   - Verify the image appears in Supabase Storage

2. **Test Image Retrieval**:
   - Check if uploaded images are accessible via public URLs
   - Verify images load correctly in your app

---

## 🔍 Troubleshooting

### **Common Issues:**

#### **1. "Storage bucket not found" Error**
- **Solution**: Make sure you created the `product-images` bucket
- **Check**: Go to Storage → Buckets in Supabase dashboard

#### **2. "Upload permission denied" Error**
- **Solution**: Check that RLS policies are correctly set
- **Check**: Run the SQL policies from Step 2

#### **3. "File too large" Error**
- **Solution**: Increase file size limit in bucket settings
- **Check**: Storage → Buckets → product-images → Settings

#### **4. Images not loading**
- **Solution**: Check that bucket is set to "Public"
- **Check**: Storage → Buckets → product-images → Settings

#### **5. "Invalid file type" Error**
- **Solution**: Check MIME type settings in bucket
- **Check**: Storage → Buckets → product-images → Settings

---

## 📱 Testing in Your App

### **Test Image Upload Flow:**

1. **Open AddEditProductScreen**
2. **Tap "Add Product Image"**
3. **Select an image from your device**
4. **Fill in product details**
5. **Tap "Save Product"**
6. **Check console logs for upload progress**

### **Expected Console Output:**

```
Starting image upload for product: [product-id]
Image URI: file://[path-to-image]
Uploading to Supabase Storage with filename: [filename]
Upload successful, getting public URL...
Image upload completed successfully
Public URL: https://[project].supabase.co/storage/v1/object/public/product-images/[filename]
Creating product with image...
Product created with ID: [product-id]
Uploading image for product: [product-id]
Image uploaded successfully, creating product_image record...
Product image record created successfully
```

---

## 🎯 Success Indicators

✅ **Image upload works without errors**
✅ **Images are stored in Supabase Storage**
✅ **Images are accessible via public URLs**
✅ **Product images are linked in database**
✅ **Images display correctly in your app**

---

## 🔒 Security Considerations

1. **File Size Limits**: Set appropriate limits (10MB recommended)
2. **File Type Validation**: Only allow image types
3. **Access Control**: Use RLS policies to control access
4. **Cleanup**: Old images are automatically cleaned up
5. **CDN**: Supabase provides CDN for fast image delivery

---

## 📈 Performance Tips

1. **Image Compression**: Images are automatically optimized
2. **Caching**: Set appropriate cache headers
3. **CDN**: Supabase provides global CDN
4. **Lazy Loading**: Implement in your app for better performance

---

## 🚀 Next Steps

After setting up storage:

1. **Test the complete flow** - Add products with images
2. **Implement image editing** - Crop, resize, filter
3. **Add multiple images** - Gallery support
4. **Optimize performance** - Lazy loading, caching
5. **Add image analytics** - Track upload usage

---

*Need help? Check the console logs for detailed error messages!* 