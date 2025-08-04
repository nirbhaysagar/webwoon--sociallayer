const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = "https://wgdeakzwsukstmtdrzng.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZGVha3p3c3Vrc3RtdGRyem5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjAzMDksImV4cCI6MjA2OTYzNjMwOX0.kdTIXv0DxnLlbvWJDK_vn9E7zzqr2g4teX4oWFr3g6Y";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const sampleProducts = [
  {
    name: "Wireless Bluetooth Headphones",
    description: "Premium wireless headphones with noise cancellation",
    price: 199.99,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80"],
    is_active: true
  },
  {
    name: "Smart Fitness Watch",
    description: "Advanced fitness tracking with heart rate monitor",
    price: 299.99,
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80"],
    is_active: true
  },
  {
    name: "Organic Cotton T-Shirt",
    description: "Comfortable organic cotton t-shirt",
    price: 29.99,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80"],
    is_active: true
  },
  {
    name: "Leather Crossbody Bag",
    description: "Stylish leather crossbody bag",
    price: 89.99,
    images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80"],
    is_active: true
  },
  {
    name: "Wireless Charging Pad",
    description: "Fast wireless charging pad for all devices",
    price: 49.99,
    images: ["https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=400&q=80"],
    is_active: true
  },
  {
    name: "Ceramic Coffee Mug",
    description: "Beautiful handcrafted ceramic coffee mug",
    price: 19.99,
    images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=400&q=80"],
    is_active: true
  },
  {
    name: "Yoga Mat",
    description: "Non-slip yoga mat for home workouts",
    price: 39.99,
    images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80"],
    is_active: true
  },
  {
    name: "LED Desk Lamp",
    description: "Adjustable LED desk lamp with touch controls",
    price: 79.99,
    images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&q=80"],
    is_active: true
  },
  {
    name: "Portable Bluetooth Speaker",
    description: "Waterproof portable speaker with 20-hour battery",
    price: 129.99,
    images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=400&q=80"],
    is_active: true
  },
  {
    name: "Stainless Steel Water Bottle",
    description: "Insulated stainless steel water bottle",
    price: 24.99,
    images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=400&q=80"],
    is_active: true
  },
  {
    name: "Wireless Gaming Mouse",
    description: "High-precision wireless gaming mouse",
    price: 89.99,
    images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=400&q=80"],
    is_active: true
  },
  {
    name: "Aromatherapy Diffuser",
    description: "Ultrasonic essential oil diffuser",
    price: 34.99,
    images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=80"],
    is_active: true
  }
];

async function addSampleProducts() {
  try {
    console.log('Adding sample products to database...');
    
    // First, let's check if there are any existing users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }
    
    let sellerId;
    if (users && users.length > 0) {
      sellerId = users[0].id;
      console.log('Using existing user ID:', sellerId);
    } else {
      console.log('No users found. Please create a user first.');
      return;
    }
    
    for (const product of sampleProducts) {
      const productWithSeller = {
        ...product,
        seller_id: sellerId
      };
      
      const { data, error } = await supabase
        .from('products')
        .insert(productWithSeller);
      
      if (error) {
        console.error('Error adding product:', product.name, error);
      } else {
        console.log('✅ Added:', product.name);
      }
    }
    
    console.log('Sample products added successfully!');
  } catch (error) {
    console.error('Error adding sample products:', error);
  }
}

// Run the script
addSampleProducts(); 