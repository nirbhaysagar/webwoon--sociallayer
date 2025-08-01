import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image, RefreshControl, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from './components/HeaderWithMenu';
import { useApp } from '../../context/AppContext';
import { useProductsSync } from '../../hooks/useDataSync';
import Toast from 'react-native-toast-message';
import { scale, verticalScale, moderateScale } from '../../lib/scale';

const filterOptions = ['All', 'Active', 'Draft', 'Out of Stock'];
const sortOptions = ['Newest', 'Name', 'Price', 'Stock'];

export default function ProductsScreen({ navigation }) {
  const { deleteProduct, setFilters, setLoadingState } = useApp();
  const { data: products, isLoading, isRealtimeConnected, lastSyncTime, refresh } = useProductsSync({
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    onDataChange: (data) => {
      console.log('Products data updated:', data.length, 'items');
    },
    onError: (error) => {
      Toast.show({ type: 'error', text1: 'Failed to load products', text2: error.message });
    }
  });

  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const matchesFilter = selectedFilter === 'All' || 
      (selectedFilter === 'Active' && product.is_active) ||
      (selectedFilter === 'Draft' && !product.is_active) ||
      (selectedFilter === 'Out of Stock' && product.stock_quantity === 0);
    
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (selectedSort) {
      case 'Newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'Name':
        return a.name.localeCompare(b.name);
      case 'Price':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'Stock':
        return a.stock_quantity - b.stock_quantity;
      default:
        return 0;
    }
  });

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.is_active).length;
  const outOfStock = products.filter(p => p.stock_quantity === 0).length;
  const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.price) * p.stock_quantity), 0);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const handleProductPress = (product) => {
    if (isBulkMode) {
      setSelectedProducts(prev => 
        prev.includes(product.id) 
          ? prev.filter(id => id !== product.id)
          : [...prev, product.id]
      );
    } else {
      navigation.navigate('AddEditProduct', { productId: product.id });
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedProducts.length === 0) return;

    setLoadingState('products', true);
    try {
      switch (action) {
        case 'delete':
          await Promise.all(selectedProducts.map(id => deleteProduct(id)));
          Toast.show({ type: 'success', text1: `${selectedProducts.length} products deleted` });
          break;
        case 'activate':
          // Implement bulk activate
          Toast.show({ type: 'success', text1: `${selectedProducts.length} products activated` });
          break;
        case 'deactivate':
          // Implement bulk deactivate
          Toast.show({ type: 'success', text1: `${selectedProducts.length} products deactivated` });
          break;
      }
      setSelectedProducts([]);
      setIsBulkMode(false);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to perform bulk action' });
    } finally {
      setLoadingState('products', false);
    }
  };

  const renderProductCard = ({ item }) => {
    const isSelected = selectedProducts.includes(item.id);
    const primaryImage = item.product_images?.find(img => img.is_primary)?.image_url || 
                       item.product_images?.[0]?.image_url || 
                       'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80';

    return (
      <TouchableOpacity 
        style={[styles.productCard, isSelected && styles.selectedCard]}
        onPress={() => handleProductPress(item)}
      >
        {isBulkMode && (
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
        )}
        
        <Image source={{ uri: primaryImage }} style={styles.productImage} />
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productPrice}>${parseFloat(item.price).toFixed(2)}</Text>
          
          <View style={styles.productMeta}>
            <View style={styles.stockIndicator}>
              <Ionicons 
                name={item.stock_quantity > 0 ? "checkmark-circle" : "close-circle"} 
                size={12} 
                color={item.stock_quantity > 0 ? colors.success : colors.error} 
              />
              <Text style={[styles.stockText, { color: item.stock_quantity > 0 ? colors.success : colors.error }]}>
                {item.stock_quantity > 0 ? `${item.stock_quantity} in stock` : 'Out of stock'}
              </Text>
            </View>
            
            {item.category && (
              <Text style={styles.categoryText}>{item.category.name}</Text>
            )}
          </View>
        </View>

        {!isBulkMode && (
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderWithMenu />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Sync Status */}
        <View style={styles.syncStatus}>
          <Ionicons 
            name={isRealtimeConnected ? "wifi" : "wifi-outline"} 
            size={16} 
            color={isRealtimeConnected ? colors.success : colors.textSecondary} 
          />
          <Text style={[styles.syncText, { color: isRealtimeConnected ? colors.success : colors.textSecondary }]}>
            {isRealtimeConnected ? 'Live Sync' : 'Offline'}
          </Text>
          {lastSyncTime && (
            <Text style={styles.lastSyncText}>
              Last sync: {new Date(lastSyncTime).toLocaleTimeString()}
            </Text>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalProducts}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeProducts}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{outOfStock}</Text>
            <Text style={styles.statLabel}>Out of Stock</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${totalValue.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Inventory Value</Text>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={styles.filterSection}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {filterOptions.map(filter => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sort Options */}
        <View style={styles.sortSection}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {sortOptions.map(sort => (
              <TouchableOpacity
                key={sort}
                style={[styles.sortChip, selectedSort === sort && styles.sortChipActive]}
                onPress={() => setSelectedSort(sort)}
              >
                <Text style={[styles.sortText, selectedSort === sort && styles.sortTextActive]}>
                  {sort}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Bulk Actions */}
        {isBulkMode && (
          <View style={styles.bulkActions}>
            <Text style={styles.bulkText}>{selectedProducts.length} selected</Text>
            <View style={styles.bulkButtons}>
              <TouchableOpacity 
                style={styles.bulkButton} 
                onPress={() => handleBulkAction('activate')}
              >
                <Text style={styles.bulkButtonText}>Activate</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.bulkButton, styles.bulkButtonDanger]} 
                onPress={() => handleBulkAction('delete')}
              >
                <Text style={styles.bulkButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Products Grid */}
        <FlatList
          data={sortedProducts}
          keyExtractor={item => item.id}
          renderItem={renderProductCard}
          numColumns={2}
          contentContainerStyle={styles.productsGrid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Try adjusting your search' : 'Create your first product to get started'}
              </Text>
            </View>
          }
        />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditProduct')}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.m,
    paddingBottom: 120,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.s,
    marginBottom: spacing.m,
    ...shadows.card,
  },
  syncText: {
    marginLeft: spacing.xs,
    fontSize: scale(14),
  },
  lastSyncText: {
    fontSize: scale(12),
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.l,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.s,
    alignItems: 'center',
    marginHorizontal: 2,
    ...shadows.card,
  },
  statValue: {
    fontSize: scale(18),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
  },
  statLabel: {
    fontSize: scale(12),
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: spacing.m,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.s,
    fontSize: scale(16),
    color: colors.text,
  },
  filterScroll: {
    marginBottom: spacing.s,
  },
  filterChip: {
    backgroundColor: colors.background,
    borderRadius: radii.small,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginRight: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: scale(14),
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  sortSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  sortLabel: {
    fontSize: scale(14),
    color: colors.textSecondary,
    marginRight: spacing.s,
  },
  sortChip: {
    backgroundColor: colors.background,
    borderRadius: radii.small,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    marginRight: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortText: {
    fontSize: scale(12),
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  sortTextActive: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  bulkActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  bulkText: {
    fontSize: scale(14),
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.text,
  },
  bulkButtons: {
    flexDirection: 'row',
  },
  bulkButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.small,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginLeft: spacing.s,
  },
  bulkButtonDanger: {
    backgroundColor: colors.error,
  },
  bulkButtonText: {
    color: '#fff',
    fontSize: scale(12),
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  productsGrid: {
    paddingBottom: 80,
  },
  productCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    marginHorizontal: 4,
    marginBottom: spacing.m,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.card,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  checkbox: {
    position: 'absolute',
    top: spacing.s,
    left: spacing.s,
    width: scale(20),
    height: scale(20),
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  productImage: {
    width: '100%',
    height: scale(150),
    resizeMode: 'cover',
  },
  productInfo: {
    padding: spacing.m,
  },
  productName: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  productPrice: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: scale(12),
    marginLeft: spacing.xs,
  },
  categoryText: {
    fontSize: scale(12),
    color: colors.textSecondary,
  },
  actionButton: {
    position: 'absolute',
    top: spacing.s,
    right: spacing.s,
    width: scale(30),
    height: scale(30),
    borderRadius: 15,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: spacing.m,
    width: scale(56),
    height: scale(56),
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.floating,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.m,
  },
  emptyText: {
    fontSize: scale(14),
    color: colors.textSecondary,
    marginTop: spacing.s,
    textAlign: 'center',
    paddingHorizontal: spacing.m,
  },
}); 