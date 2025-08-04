const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = "https://wgdeakzwsukstmtdrzng.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZGVha3p3c3Vrc3RtdGRyem5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjAzMDksImV4cCI6MjA2OTYzNjMwOX0.kdTIXv0DxnLlbvWJDK_vn9E7zzqr2g4teX4oWFr3g6Y";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    const testUser = {
      id: "00000000-0000-0000-0000-000000000001",
      email: "test@example.com",
      role: "seller"
    };
    
    const { data, error } = await supabase
      .from('users')
      .insert(testUser);
    
    if (error) {
      console.error('Error creating user:', error);
    } else {
      console.log('✅ Test user created successfully!');
      console.log('User ID:', testUser.id);
    }
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

// Run the script
createTestUser(); 