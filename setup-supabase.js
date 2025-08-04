const fs = require('fs');
const path = require('path');

console.log('🚀 SocialSpark Supabase Setup');
console.log('==============================\n');

// Create .env file content
const envContent = `# Supabase Configuration
# Replace these with your actual Supabase project credentials
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# App Configuration
EXPO_PUBLIC_APP_NAME=SocialSpark
EXPO_PUBLIC_APP_VERSION=1.0.0
`;

// Write .env file
fs.writeFileSync('.env', envContent);

console.log('✅ Created .env file');
console.log('\n📋 Next Steps:');
console.log('1. Go to https://supabase.com');
console.log('2. Create a new project');
console.log('3. Go to Settings → API');
console.log('4. Copy your Project URL and anon key');
console.log('5. Update the .env file with your credentials');
console.log('6. Create Storage Bucket:');
console.log('   • Go to Storage in Supabase dashboard');
console.log('   • Create bucket named "product-images"');
console.log('   • Set bucket to public');
console.log('   • Add RLS policy:');
console.log('     CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = \'product-images\');');
console.log('     CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = \'product-images\' AND auth.role() = \'authenticated\');');
console.log('7. Run: npm start -- --web');
console.log('\n🎯 After setup, you\'ll get:');
console.log('• Complete Seller Dashboard');
console.log('• Complete User Dashboard');
console.log('• Real-time data updates');
console.log('• Authentication system');
console.log('• Image upload functionality');
console.log('• All features working!'); 