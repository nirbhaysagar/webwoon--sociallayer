import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../../services/productService';
import { Product, ProductCategory, ProductBrand } from '../../types/product';

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  featuredProducts: number;
  totalCategories: number;
  totalBrands: number;
}

export default function ProductDashboardScreen({ navigation }: any) {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    featuredProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get all products for stats
      const productsResponse = await productService.searchProducts({
        page: 1,
        limit: 1000,
      });

      if (productsResponse.success && productsResponse.products) {
        const products = productsResponse.products;
        
        // Calculate stats
        const activeProducts = products.filter(p => p.product_status === 'active').length;
        const lowStockProducts = products.filter(p => p.stock_quantity <= p.low_stock_threshold).length;
        const featuredProducts = products.filter(p => p.is_featured).length;

        setStats({
          totalProducts: products.length,
          activeProducts,
          lowStockProducts,
          featuredProducts,
          totalCategories: 0, // Will be updated
          totalBrands: 0, // Will be updated
        });

        // Get recent products
        const recentResponse = await productService.searchProducts({
          page: 1,
          limit: 5,
          sort_by: 'created_at',
          sort_order: 'desc',
        });

        if (recentResponse.success && recentResponse.products) {
          setRecentProducts(recentResponse.products);
        }
      }

      // Get categories and brands count
      const categoriesResponse = await productService.getProductCategories();
      const brandsResponse = await productService.getProductBrands();

      if (categoriesResponse.success && categoriesResponse.categories) {
        setStats(prev => ({ ...prev, totalCategories: categoriesResponse.categories!.length }));
      }

      if (brandsResponse.success && brandsResponse.brands) {
        setStats(prev => ({ ...prev, totalBrands: brandsResponse.brands!.length }));
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon, color, onPress }: any) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.statContent}>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={24} color="white" />
        </View>
        <View style={styles.statText}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const ProductCard = ({ product }: { product: Product }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
    >
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.productPrice}>
          ${product.base_price.toFixed(2)}
        </Text>
        <View style={styles.productMeta}>
          <View style={[styles.statusBadge, { 
            backgroundColor: product.product_status === 'active' ? '#10B981' : '#F59E0B' 
          }]}>
            <Text style={styles.statusText}>{product.product_status}</Text>
          </View>
          <Text style={styles.stockText}>
            Stock: {product.stock_quantity}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6B7280" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Product Dashboard</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateProduct')}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon="cube-outline"
            color="#3B82F6"
            onPress={() => navigation.navigate('ProductList')}
          />
          <StatCard
            title="Active Products"
            value={stats.activeProducts}
            icon="checkmark-circle-outline"
            color="#10B981"
            onPress={() => navigation.navigate('ProductList', { status: 'active' })}
          />
          <StatCard
            title="Low Stock"
            value={stats.lowStockProducts}
            icon="warning-outline"
            color="#F59E0B"
            onPress={() => navigation.navigate('ProductList', { lowStock: true })}
          />
          <StatCard
            title="Featured"
            value={stats.featuredProducts}
            icon="star-outline"
            color="#8B5CF6"
            onPress={() => navigation.navigate('ProductList', { featured: true })}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('CreateProduct')}
            >
              <Ionicons name="add-circle-outline" size={24} color="#3B82F6" />
              <Text style={styles.actionText}>Add Product</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Categories')}
            >
              <Ionicons name="folder-outline" size={24} color="#10B981" />
              <Text style={styles.actionText}>Categories</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Inventory')}
            >
              <Ionicons name="analytics-outline" size={24} color="#F59E0B" />
              <Text style={styles.actionText}>Inventory</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Analytics')}
            >
              <Ionicons name="bar-chart-outline" size={24} color="#8B5CF6" />
              <Text style={styles.actionText}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProductList')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentProducts.length > 0 ? (
            recentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No products yet</Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => navigation.navigate('CreateProduct')}
              >
                <Text style={styles.emptyButtonText}>Add Your First Product</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: (width - 44) / 2,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
    flex: 1,
  },
  actionText: {
    fontSize: 12,
    color: '#374151',
    marginTop: 4,
    textAlign: 'center',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  stockText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
}); 