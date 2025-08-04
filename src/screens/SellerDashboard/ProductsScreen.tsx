import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image, RefreshControl, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import BackButton from '../../components/BackButton';
import HeaderWithMenu from './components/HeaderWithMenu';
import { useApp } from '../../context/AppContext';
import { useProductsSync } from '../../hooks/useDataSync';
import Toast from 'react-native-toast-message';
import productManagementService, { Product, ProductFilters } from '../../services/productManagementService';

const filterOptions = ['All', 'Active', 'Draft', 'Out of Stock'];

export default function ProductsScreen() {
  const navigation = useNavigation();
  const { state } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const storeId = state.currentStore?.id || 'mock-store-id';

  useEffect(() => {
    loadProducts();
  }, [storeId]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      const filters: ProductFilters = {
        search: searchQuery || undefined,
        limit: 50,
      };

      // Apply filter
      if (selectedFilter === 'Active') {
        // Products are already filtered by is_active in the service
      } else if (selectedFilter === 'Draft') {
        // For draft products, we'd need to modify the service to include is_active: false
      } else if (selectedFilter === 'Out of Stock') {
        // For out of stock, we'd need to modify the service to include stock_quantity: 0
      }

      const productsData = await productManagementService.getProducts(storeId, filters);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load products',
        text2: 'Please try again later',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Debounce search
    setTimeout(() => {
      loadProducts();
    }, 500);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    loadProducts();
  };

  const handleProductPress = (product: Product) => {
    if (isSelectionMode) {
      toggleProductSelection(product.id);
    } else {
      navigation.navigate('ProductDetail', { productId: product.id });
    }
  };

  const handleLongPress = (product: Product) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedProducts([product.id]);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBulkAction = async (action: string) => {
    if (selectedProducts.length === 0) {
      Alert.alert('No products selected', 'Please select products to perform bulk actions.');
      return;
    }

    try {
      let success = false;

      switch (action) {
        case 'delete':
          Alert.alert(
            'Delete Products',
            `Are you sure you want to delete ${selectedProducts.length} product(s)?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                  success = await productManagementService.bulkDeleteProducts(selectedProducts);
                  if (success) {
                    Toast.show({
                      type: 'success',
                      text1: 'Products deleted successfully',
                    });
                    setSelectedProducts([]);
                    setIsSelectionMode(false);
                    loadProducts();
                  } else {
                    Toast.show({
                      type: 'error',
                      text1: 'Failed to delete products',
                    });
                  }
                }
              }
            ]
          );
          break;

        case 'activate':
          success = await productManagementService.bulkUpdateProducts(selectedProducts, { is_active: true });
          break;

        case 'deactivate':
          success = await productManagementService.bulkUpdateProducts(selectedProducts, { is_active: false });
          break;

        case 'feature':
          success = await productManagementService.bulkUpdateProducts(selectedProducts, { is_featured: true });
          break;

        case 'unfeature':
          success = await productManagementService.bulkUpdateProducts(selectedProducts, { is_featured: false });
          break;
      }

      if (success && action !== 'delete') {
        Toast.show({
          type: 'success',
          text1: `Products ${action}d successfully`,
        });
        setSelectedProducts([]);
        setIsSelectionMode(false);
        loadProducts();
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to perform bulk action',
      });
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[
        styles.productCard,
        selectedProducts.includes(item.id) && styles.selectedProductCard
      ]}
      onPress={() => handleProductPress(item)}
      onLongPress={() => handleLongPress(item)}
    >
      <Image
        source={{ uri: item.featured_image_url || 'https://via.placeholder.com/150' }}
        style={styles.productImage}
        resizeMode="cover"
      />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>
          ${item.price.toFixed(2)}
        </Text>
        <Text style={styles.productStock}>
          {item.stock_quantity} in stock
        </Text>
      </View>

      <View style={styles.productActions}>
        {isSelectionMode && (
          <TouchableOpacity
            style={[
              styles.selectionIndicator,
              selectedProducts.includes(item.id) && styles.selectedIndicator
            ]}
            onPress={() => toggleProductSelection(item.id)}
          >
            <Ionicons
              name={selectedProducts.includes(item.id) ? "checkmark-circle" : "ellipse-outline"}
              size={20}
              color={selectedProducts.includes(item.id) ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditProduct', { productId: item.id })}
        >
          <Ionicons name="pencil" size={16} color={colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            Alert.alert(
              'Delete Product',
              'Are you sure you want to delete this product?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    const success = await productManagementService.deleteProduct(item.id);
                    if (success) {
                      Toast.show({
                        type: 'success',
                        text1: 'Product deleted successfully',
                      });
                      loadProducts();
                    } else {
                      Toast.show({
                        type: 'error',
                        text1: 'Failed to delete product',
                      });
                    }
                  }
                }
              ]
            );
          }}
        >
          <Ionicons name="trash" size={16} color={colors.error} />
        </TouchableOpacity>
      </View>

      {item.is_featured && (
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={12} color={colors.white} />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="cube-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No products yet</Text>
      <Text style={styles.emptySubtitle}>
        Start by adding your first product to your store
      </Text>
      <TouchableOpacity
        style={styles.addFirstButton}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Text style={styles.addFirstButtonText}>Add Your First Product</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Products</Text>
          <Text style={styles.subtitle}>
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddProduct')}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.activeFilterTab
            ]}
            onPress={() => handleFilterChange(filter)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter && styles.activeFilterText
            ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Selection Mode Actions */}
      {isSelectionMode && (
        <View style={styles.selectionActions}>
          <Text style={styles.selectionText}>
            {selectedProducts.length} selected
          </Text>
          <View style={styles.selectionButtons}>
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={() => handleBulkAction('activate')}
            >
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.selectionButtonText}>Activate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={() => handleBulkAction('deactivate')}
            >
              <Ionicons name="pause-circle" size={16} color={colors.warning} />
              <Text style={styles.selectionButtonText}>Deactivate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={() => handleBulkAction('delete')}
            >
              <Ionicons name="trash" size={16} color={colors.error} />
              <Text style={styles.selectionButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.cancelSelectionButton}
            onPress={() => {
              setIsSelectionMode(false);
              setSelectedProducts([]);
            }}
          >
            <Text style={styles.cancelSelectionText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Products List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : products.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          numColumns={2}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.s,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: scale(14),
    color: colors.textSecondary,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.medium,
    padding: spacing.s,
  },
  searchContainer: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.s,
    fontSize: 16,
    color: colors.text,
  },
  filterContainer: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  filterTab: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginRight: spacing.s,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activeFilterText: {
    color: colors.white,
    fontWeight: '600',
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    backgroundColor: colors.primary,
  },
  selectionText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  selectionButtons: {
    flexDirection: 'row',
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.m,
  },
  selectionButtonText: {
    color: colors.white,
    fontSize: 12,
    marginLeft: spacing.xs,
  },
  cancelSelectionButton: {
    marginLeft: spacing.m,
  },
  cancelSelectionText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  productsList: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.l,
  },
  productCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    margin: spacing.xs,
    padding: spacing.s,
    ...shadows.card,
  },
  selectedProductCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: radii.small,
    marginBottom: spacing.s,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  productStock: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.s,
  },
  selectionIndicator: {
    padding: spacing.xs,
  },
  selectedIndicator: {
    // Already styled by the icon color
  },
  actionButton: {
    padding: spacing.xs,
  },
  featuredBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.warning,
    borderRadius: 10,
    padding: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.m,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.l,
  },
  addFirstButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.medium,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.l,
  },
  addFirstButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 