const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.log('Please add:');
  console.log('EXPO_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorageSetup() {
  console.log('🧪 Testing Supabase Storage Setup...\n');

  try {
    // Test 1: Check if bucket exists
    console.log('1. Checking if "product-images" bucket exists...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return false;
    }

    const productImagesBucket = buckets.find(bucket => bucket.name === 'product-images');
    if (!productImagesBucket) {
      console.error('❌ "product-images" bucket not found!');
      console.log('Please create the bucket in your Supabase dashboard:');
      console.log('1. Go to Storage in Supabase dashboard');
      console.log('2. Click "Create a new bucket"');
      console.log('3. Name it "product-images"');
      console.log('4. Set it to public');
      return false;
    }

    console.log('✅ "product-images" bucket found');

    // Test 2: Check bucket settings
    console.log('\n2. Checking bucket settings...');
    if (!productImagesBucket.public) {
      console.error('❌ Bucket is not public!');
      console.log('Please make the bucket public in Supabase dashboard');
      return false;
    }
    console.log('✅ Bucket is public');

    // Test 3: Test upload permissions
    console.log('\n3. Testing upload permissions...');
    const testBlob = new Blob(['test'], { type: 'text/plain' });
    const testFileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(testFileName, testBlob);

    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError.message);
      if (uploadError.message.includes('policy')) {
        console.log('Please set up storage policies. Run this SQL in Supabase:');
        console.log(`
          CREATE POLICY "Authenticated users can upload product images" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
        `);
      }
      return false;
    }

    console.log('✅ Upload test successful');

    // Test 4: Test public URL access
    console.log('\n4. Testing public URL access...');
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(testFileName);

    if (!urlData?.publicUrl) {
      console.error('❌ Failed to get public URL');
      return false;
    }

    console.log('✅ Public URL generated:', urlData.publicUrl);

    // Test 5: Clean up test file
    console.log('\n5. Cleaning up test file...');
    const { error: deleteError } = await supabase.storage
      .from('product-images')
      .remove([testFileName]);

    if (deleteError) {
      console.warn('⚠️ Failed to delete test file:', deleteError.message);
    } else {
      console.log('✅ Test file cleaned up');
    }

    // Test 6: Check product_images table
    console.log('\n6. Checking product_images table...');
    const { data: tableData, error: tableError } = await supabase
      .from('product_images')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ product_images table error:', tableError.message);
      console.log('Please create the product_images table. Run this SQL in Supabase:');
      console.log(`
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
      `);
      return false;
    }

    console.log('✅ product_images table exists');

    console.log('\n🎉 All tests passed! Your Supabase Storage is ready for image uploads.');
    console.log('\n📱 You can now test image uploads in your app:');
    console.log('1. Open your app');
    console.log('2. Go to Add Product screen');
    console.log('3. Select an image');
    console.log('4. Fill in product details');
    console.log('5. Save the product');
    console.log('6. Check the console for upload logs');

    return true;

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  }
}

// Run the test
testStorageSetup().then(success => {
  if (success) {
    console.log('\n✅ Storage setup is complete!');
    process.exit(0);
  } else {
    console.log('\n❌ Storage setup needs attention.');
    console.log('Please follow the instructions above and run this test again.');
    process.exit(1);
  }
}); 