import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../../services/productService';
import { Product, ProductSearchParams } from '../../types/product';

interface ProductListScreenProps {
  navigation: any;
  route: any;
}

export default function ProductListScreen({ navigation, route }: ProductListScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Get filters from route params
  const routeFilters = route.params || {};

  useEffect(() => {
    loadProducts(true);
  }, [routeFilters]);

  const loadProducts = async (reset = false) => {
    try {
      if (reset) {
        setCurrentPage(1);
        setProducts([]);
      }

      const params: ProductSearchParams = {
        page: reset ? 1 : currentPage,
        limit: 20,
        sort_by: sortBy,
        sort_order: sortOrder,
        search: searchQuery,
        filters: {
          ...routeFilters,
          product_status: statusFilter || undefined,
          category_slug: categoryFilter || undefined,
        },
      };

      const response = await productService.searchProducts(params);

      if (response.success && response.products) {
        if (reset) {
          setProducts(response.products);
        } else {
          setProducts(prev => [...prev, ...response.products!]);
        }
        
        setHasMore(response.products.length === 20);
        setCurrentPage(prev => prev + 1);
      } else {
        Alert.alert('Error', response.error || 'Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts(true);
  };

  const handleSearch = () => {
    loadProducts(true);
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const handleEditProduct = (product: Product) => {
    navigation.navigate('EditProduct', { productId: product.id });
  };

  const handleDeleteProduct = async (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await productService.deleteProduct(product.id);
              if (response.success) {
                setProducts(prev => prev.filter(p => p.id !== product.id));
                Alert.alert('Success', 'Product deleted successfully');
              } else {
                Alert.alert('Error', response.error || 'Failed to delete product');
              }
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete' | 'feature' | 'unfeature') => {
    if (selectedProducts.size === 0) {
      Alert.alert('No Selection', 'Please select products first');
      return;
    }

    const actionText = {
      activate: 'activate',
      deactivate: 'deactivate',
      delete: 'delete',
      feature: 'feature',
      unfeature: 'unfeature',
    }[action];

    Alert.alert(
      `Bulk ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
      `Are you sure you want to ${actionText} ${selectedProducts.size} product(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText.charAt(0).toUpperCase() + actionText.slice(1),
          style: action === 'delete' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              const productIds = Array.from(selectedProducts);
              const response = await productService.bulkOperation({
                product_ids: productIds,
                operation: action,
              });

              if (response.success) {
                setSelectedProducts(new Set());
                loadProducts(true);
                Alert.alert('Success', `Products ${actionText}d successfully`);
              } else {
                Alert.alert('Error', response.error || `Failed to ${actionText} products`);
              }
            } catch (error) {
              console.error(`Error ${actionText}ing products:`, error);
              Alert.alert('Error', `Failed to ${actionText} products`);
            }
          },
        },
      ]
    );
  };

  const renderProductItem = ({ item: product }: { item: Product }) => {
    const isSelected = selectedProducts.has(product.id);

    return (
      <View style={[styles.productItem, isSelected && styles.selectedProduct]}>
        <TouchableOpacity
          style={styles.productContent}
          onPress={() => handleProductPress(product)}
        >
          <View style={styles.productImage}>
            {product.images && product.images.length > 0 ? (
              <Text style={styles.imagePlaceholder}>📷</Text>
            ) : (
              <Text style={styles.imagePlaceholder}>📦</Text>
            )}
          </View>
          
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

          <View style={styles.productActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditProduct(product)}
            >
              <Ionicons name="create-outline" size={20} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteProduct(product)}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.selectButton, isSelected && styles.selectedButton]}
          onPress={() => toggleProductSelection(product.id)}
        >
          <Ionicons 
            name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
            size={24} 
            color={isSelected ? "#3B82F6" : "#9CA3AF"} 
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={20} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateProduct')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Status:</Text>
          <View style={styles.filterOptions}>
            {['', 'active', 'inactive', 'draft'].map(status => (
              <TouchableOpacity
                key={status}
                style={[styles.filterOption, statusFilter === status && styles.filterOptionActive]}
                onPress={() => {
                  setStatusFilter(status);
                  loadProducts(true);
                }}
              >
                <Text style={[styles.filterOptionText, statusFilter === status && styles.filterOptionTextActive]}>
                  {status || 'All'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Sort by:</Text>
          <View style={styles.filterOptions}>
            {[
              { key: 'created_at', label: 'Date' },
              { key: 'name', label: 'Name' },
              { key: 'base_price', label: 'Price' },
              { key: 'stock_quantity', label: 'Stock' },
            ].map(sort => (
              <TouchableOpacity
                key={sort.key}
                style={[styles.filterOption, sortBy === sort.key && styles.filterOptionActive]}
                onPress={() => {
                  setSortBy(sort.key);
                  loadProducts(true);
                }}
              >
                <Text style={[styles.filterOptionText, sortBy === sort.key && styles.filterOptionTextActive]}>
                  {sort.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderBulkActions = () => {
    if (selectedProducts.size === 0) return null;

    return (
      <View style={styles.bulkActions}>
        <Text style={styles.bulkActionsText}>
          {selectedProducts.size} product(s) selected
        </Text>
        <View style={styles.bulkButtons}>
          <TouchableOpacity
            style={[styles.bulkButton, styles.bulkButtonPrimary]}
            onPress={() => handleBulkAction('activate')}
          >
            <Text style={styles.bulkButtonText}>Activate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bulkButton, styles.bulkButtonWarning]}
            onPress={() => handleBulkAction('deactivate')}
          >
            <Text style={styles.bulkButtonText}>Deactivate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bulkButton, styles.bulkButtonDanger]}
            onPress={() => handleBulkAction('delete')}
          >
            <Text style={styles.bulkButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && products.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderFilters()}
      {renderBulkActions()}
      
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        style={styles.productList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={() => {
          if (hasMore && !loading) {
            loadProducts();
          }
        }}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No products found</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => navigation.navigate('CreateProduct')}
            >
              <Text style={styles.emptyButtonText}>Add Your First Product</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          hasMore && (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text style={styles.loadingFooterText}>Loading more...</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  searchButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 8,
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    width: 60,
  },
  filterOptions: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  filterOptionActive: {
    backgroundColor: '#3B82F6',
  },
  filterOptionText: {
    fontSize: 12,
    color: '#6B7280',
  },
  filterOptionTextActive: {
    color: 'white',
  },
  bulkActions: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F59E0B',
  },
  bulkActionsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#92400E',
    marginBottom: 8,
  },
  bulkButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  bulkButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  bulkButtonPrimary: {
    backgroundColor: '#3B82F6',
  },
  bulkButtonWarning: {
    backgroundColor: '#F59E0B',
  },
  bulkButtonDanger: {
    backgroundColor: '#EF4444',
  },
  bulkButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  productList: {
    flex: 1,
  },
  productItem: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedProduct: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  productContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  imagePlaceholder: {
    fontSize: 24,
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  stockText: {
    fontSize: 12,
    color: '#6B7280',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  selectButton: {
    padding: 12,
  },
  selectedButton: {
    backgroundColor: '#EBF8FF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
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
  loadingFooter: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingFooterText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
}); 