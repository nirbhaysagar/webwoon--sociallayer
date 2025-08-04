import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator, Alert, TextInput, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from '../SellerDashboard/components/HeaderWithMenu';
import { useUserShop } from '../../context/UserShopContext';
import { ProductService, Product } from '../../services/productService';
import { AdvancedSearchService, AdvancedProductFilters, SearchSuggestion } from '../../services/advancedSearchService';
import SearchSuggestions from '../../components/SearchSuggestions';
import AdvancedFilters from '../../components/AdvancedFilters';
import SearchAnalyticsDashboard from '../../components/SearchAnalytics';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import { AnalyticsService } from '../../services/analyticsService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ProductDiscoveryScreen({ navigation }) {
  const { addToCart, addToWishlist } = useUserShop();
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<'products' | 'profiles'>('products');
  const [profileType, setProfileType] = useState<'all' | 'sellers' | 'companies' | 'influencers'>('all');
  
  // Advanced search states
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<AdvancedProductFilters>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [stores, setStores] = useState<string[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Load categories and products
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesList, productsList, historyList, storesList] = await Promise.all([
        ProductService.getProductCategories(),
        ProductService.getFeaturedProducts(20),
        AdvancedSearchService.getSearchHistory(),
        AdvancedSearchService.getPopularSearches().then(suggestions => 
          suggestions.map(s => s.text)
        )
      ]);
      
      console.log('Loaded categories:', categoriesList);
      console.log('Loaded products:', productsList);
      console.log('Products length:', productsList.length);
      
      setCategories(categoriesList);
      setProducts(productsList);
      setSearchHistory(historyList);
      setStores(storesList);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Advanced search functions
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }
    
    setIsSearching(true);
    setShowSuggestions(false);
    
    try {
      const suggestions = await AdvancedSearchService.getSearchSuggestions(query);
      setSearchSuggestions(suggestions);
      
      if (searchType === 'products') {
        // Search for products
        const filters: AdvancedProductFilters = { ...currentFilters, search: query };
        const results = await AdvancedSearchService.searchProductsWithFilters(filters);
        setSearchResults(results);
      } else {
        // Search for seller profiles
        const results = await AdvancedSearchService.searchSellerProfiles(query);
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [currentFilters, searchType]);

  const handleSuggestionPress = useCallback(async (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    await handleSearch(suggestion.text);
  }, [handleSearch]);

  const handleAdvancedFilters = useCallback(async (filters: AdvancedProductFilters) => {
    setCurrentFilters(filters);
    setShowAdvancedFilters(false);
    
    // Apply filters to current search
    if (searchQuery.trim().length > 0) {
      const newFilters = { ...filters, search: searchQuery };
      const results = await AdvancedSearchService.searchProductsWithFilters(newFilters);
      setSearchResults(results);
    }
  }, [searchQuery]);

  const handleClearHistory = useCallback(async () => {
    await AdvancedSearchService.clearSearchHistory();
    setSearchHistory([]);
  }, []);

  const handleSearchFocus = useCallback(async () => {
    if (searchQuery.trim().length === 0) {
      const suggestions = await AdvancedSearchService.getSearchSuggestions('');
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    }
  }, [searchQuery]);

  const handleCategoryPress = async (category: string) => {
    try {
      setLoading(true);
      setSelectedCategory(category === selectedCategory ? '' : category);
      
      // Since database doesn't have category column, we'll filter mock products
      if (category === selectedCategory) {
        // Deselect category - show all products
        const productsList = await ProductService.getFeaturedProducts(20);
        setProducts(productsList);
      } else {
        // Filter by category using mock data
        const allProducts = await ProductService.getFeaturedProducts(50);
        const filteredProducts = allProducts.filter(product => {
          // Simple category mapping based on product name/description
          const productText = `${product.name} ${product.description || ''}`.toLowerCase();
          
          switch (category) {
            case 'Electronics':
              return productText.includes('headphone') || productText.includes('watch') || 
                     productText.includes('wireless') || productText.includes('bluetooth') ||
                     productText.includes('smart') || productText.includes('tech');
            case 'Clothing':
              return productText.includes('shirt') || productText.includes('t-shirt') || 
                     productText.includes('cotton') || productText.includes('clothing');
            case 'Accessories':
              return productText.includes('bag') || productText.includes('crossbody') || 
                     productText.includes('leather') || productText.includes('accessory');
            case 'Home & Garden':
              return productText.includes('lamp') || productText.includes('desk') || 
                     productText.includes('home') || productText.includes('garden');
            case 'Sports':
              return productText.includes('fitness') || productText.includes('yoga') || 
                     productText.includes('sport') || productText.includes('workout');
            default:
              return true;
          }
        });
        
        setProducts(filteredProducts);
      }
      
      setCurrentProductIndex(0); // Reset to first product
    } catch (err) {
      console.error('Error filtering products:', err);
      Alert.alert('Error', 'Failed to filter products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      // Track add to cart event
      await AnalyticsService.trackEvent('add_to_cart', { 
        productId: product.id, 
        productName: product.name,
        price: product.price 
      });

      const cartItem = {
        id: product.id.toString(),
        title: product.name,
        price: product.price,
        image: product.image_url,
        store: product.store?.name || 'Store',
        quantity: 1
      };
      
      await addToCart(cartItem);
      Alert.alert('Success', 'Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const handleAddToWishlist = async (product: Product) => {
    try {
      // Track add to wishlist event
      await AnalyticsService.trackEvent('like', { 
        productId: product.id, 
        productName: product.name,
        price: product.price 
      });

      const wishlistItem = {
        id: product.id.toString(),
        title: product.name,
        price: product.price,
        image: product.image_url,
        store: product.store?.name || 'Store',
        quantity: 1
      };
      
      await addToWishlist(wishlistItem);
      Alert.alert('Success', 'Product added to wishlist!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      Alert.alert('Error', 'Failed to add item to wishlist');
    }
  };

  const handleSwipeLeft = () => {
    // Skip product
    if (currentProductIndex < products.length - 1) {
      setCurrentProductIndex(currentProductIndex + 1);
    }
  };

  const handleSwipeRight = () => {
    // Like product - add to wishlist
    if (currentProductIndex < products.length) {
      const product = products[currentProductIndex];
      handleAddToWishlist(product);
      if (currentProductIndex < products.length - 1) {
        setCurrentProductIndex(currentProductIndex + 1);
      }
    }
  };

  const handleSearchTypeChange = (type: 'products' | 'profiles') => {
    setSearchType(type);
    setSearchQuery('');
    setSearchResults([]);
    if (type === 'products') {
      setProfileType('all');
    }
  };

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item && styles.selectedCategory
      ]}
      onPress={() => handleCategoryPress(item)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === item && styles.selectedCategoryText
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <Image 
        source={{ uri: item.image_url }} 
        style={styles.productImage} 
      />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productStore}>{item.store?.name || 'Store'}</Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        
        <View style={styles.productActions}>
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={() => handleAddToCart(item)}
          >
            <Ionicons name="cart-outline" size={16} color={colors.white} />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.wishlistButton}
            onPress={() => handleAddToWishlist(item)}
          >
            <Ionicons name="heart-outline" size={16} color={colors.favorite} />
            <Text style={styles.wishlistText}>Wishlist</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.searchResultCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <Image 
        source={{ uri: item.image_url }} 
        style={styles.searchResultImage} 
      />
      
      <View style={styles.searchResultInfo}>
        <Text style={styles.searchResultName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.searchResultStore}>{item.store?.name || 'Store'}</Text>
        <Text style={styles.searchResultPrice}>${item.price.toFixed(2)}</Text>
        
        <View style={styles.searchResultActions}>
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={() => handleAddToCart(item)}
          >
            <Ionicons name="cart-outline" size={16} color={colors.white} />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.wishlistButton}
            onPress={() => handleAddToWishlist(item)}
          >
            <Ionicons name="heart-outline" size={16} color={colors.favorite} />
            <Text style={styles.wishlistText}>Wishlist</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderProfileResult = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.profileResultCard}
      onPress={() => {
        // Navigate to seller profile
        if (item.type === 'seller') {
          navigation.navigate('SellerProfileScreen', { 
            storeId: item.id,
            storeName: item.name,
            storeAvatar: item.avatar,
            storeCategory: item.category || 'Store'
          });
        } else {
          // For other profile types, show a different screen or alert
          Alert.alert('Profile', `Viewing ${item.name}'s profile`);
        }
      }}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: item.avatar }} 
        style={styles.profileResultImage} 
      />
      
      <View style={styles.profileResultInfo}>
        <View style={styles.profileResultHeader}>
          <Text style={styles.profileResultName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.isVerified && (
            <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
          )}
        </View>
        <Text style={styles.profileResultUsername}>{item.username}</Text>
        <Text style={styles.profileResultBio} numberOfLines={2}>
          {item.bio}
        </Text>
        
        {/* Profile Type Specific Info */}
        {item.type === 'seller' && (
          <View style={styles.profileTypeInfo}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color={colors.warning} />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <Text style={styles.profileTypeInfoText}>{item.productsCount} products</Text>
          </View>
        )}
        
        {item.type === 'company' && (
          <View style={styles.profileTypeInfo}>
            <Text style={styles.profileTypeInfoText}>{item.employees} employees</Text>
            <Text style={styles.profileTypeInfoText}>Founded {item.founded}</Text>
          </View>
        )}
        
        {item.type === 'influencer' && (
          <View style={styles.profileTypeInfo}>
            <Text style={styles.profileTypeInfoText}>{item.category}</Text>
            <Text style={styles.profileTypeInfoText}>{item.engagement} engagement</Text>
          </View>
        )}
        
        <Text style={styles.profileResultFollowers}>
          {item.followers.toLocaleString()} followers
        </Text>
        
        <View style={styles.profileResultActions}>
          <TouchableOpacity 
            style={styles.followButton}
            onPress={(e) => {
              e.stopPropagation(); // Prevent card navigation when button is pressed
              Alert.alert('Follow', `Following ${item.name}`);
            }}
          >
            <Ionicons name="person-add-outline" size={16} color={colors.white} />
            <Text style={styles.followText}>Follow</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.messageButton}
            onPress={(e) => {
              e.stopPropagation(); // Prevent card navigation when button is pressed
              Alert.alert('Message', `Messaging ${item.name}`);
            }}
          >
            <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
            <Text style={styles.messageText}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTinderCard = () => {
    console.log('renderTinderCard called');
    console.log('currentProductIndex:', currentProductIndex);
    console.log('products.length:', products.length);
    console.log('products:', products);
    
    // Fallback products if none loaded
    const displayProducts = products.length > 0 ? products : [
      {
        id: 1,
        name: "Wireless Bluetooth Headphones",
        description: "Premium wireless headphones with noise cancellation",
        price: 199.99,
        image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
        store: { name: "TechStore" }
      },
      {
        id: 2,
        name: "Smart Fitness Watch",
        description: "Advanced fitness tracking with heart rate monitor",
        price: 299.99,
        image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80",
        store: { name: "TechStore" }
      }
    ];
    
    if (currentProductIndex >= displayProducts.length) {
      console.log('No more products to show');
      return (
        <View style={styles.noMoreProducts}>
          <Ionicons name="heart-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.noMoreProductsTitle}>No more products!</Text>
          <Text style={styles.noMoreProductsSubtitle}>
            You've seen all products in this category
          </Text>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={() => setCurrentProductIndex(0)}
          >
            <Text style={styles.resetText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const product = displayProducts[currentProductIndex];
    console.log('Current product:', product);
    
    return (
      <TouchableOpacity 
        style={styles.tinderCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
      >
        <Image 
          source={{ uri: product.image_url }} 
          style={styles.tinderCardImage} 
        />
        
        <View style={styles.tinderCardOverlay}>
          <View style={styles.tinderCardInfo}>
            <Text style={styles.tinderCardName} numberOfLines={1}>
              {product.name}
            </Text>
            <Text style={styles.tinderCardStore}>{product.store?.name || 'Store'}</Text>
            <Text style={styles.tinderCardPrice}>${product.price.toFixed(2)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const displayProducts = searchQuery.trim().length > 0 ? searchResults : products;

  return (
    <View style={styles.container}>
      <HeaderWithMenu />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Discover Products</Text>
          <Text style={styles.subtitle}>Find amazing products by category</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowAnalytics(true)}
          >
            <Ionicons name="analytics-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('ProductSearch')}
          >
            <Ionicons name="search" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={searchType === 'products' ? "Search products, stores, categories..." : "Search sellers, companies, influencers..."}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearch}
              onFocus={handleSearchFocus}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowSuggestions(false);
                }}
              >
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowAdvancedFilters(true)}
          >
            <Ionicons name="filter" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Search Suggestions */}
        <SearchSuggestions
          suggestions={searchSuggestions}
          onSuggestionPress={handleSuggestionPress}
          onClearHistory={handleClearHistory}
          visible={showSuggestions}
        />

        {/* Search Type Toggle */}
        <View style={styles.searchTypeToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              searchType === 'products' && styles.toggleButtonActive
            ]}
            onPress={() => handleSearchTypeChange('products')}
          >
            <Ionicons 
              name="cube-outline" 
              size={16} 
              color={searchType === 'products' ? colors.white : colors.textSecondary} 
            />
            <Text style={[
              styles.toggleButtonText,
              searchType === 'products' && styles.toggleButtonTextActive
            ]}>
              Products
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.toggleButton,
              searchType === 'profiles' && styles.toggleButtonActive
            ]}
            onPress={() => handleSearchTypeChange('profiles')}
          >
            <Ionicons 
              name="people-outline" 
              size={16} 
              color={searchType === 'profiles' ? colors.white : colors.textSecondary} 
            />
            <Text style={[
              styles.toggleButtonText,
              searchType === 'profiles' && styles.toggleButtonTextActive
            ]}>
              Profiles
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Filters Display */}
        {Object.keys(currentFilters).length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.activeFiltersContainer}
          >
            {Object.entries(currentFilters).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) return null;
              
              let displayText = '';
              if (key === 'priceRange' && value.min && value.max) {
                displayText = `$${value.min} - $${value.max}`;
              } else if (Array.isArray(value)) {
                displayText = value.join(', ');
              } else {
                displayText = String(value);
              }

              return (
                <View key={key} style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterText}>{displayText}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      const newFilters = { ...currentFilters };
                      delete newFilters[key as keyof AdvancedProductFilters];
                      setCurrentFilters(newFilters);
                    }}
                  >
                    <Ionicons name="close" size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              );
            })}
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => setCurrentFilters({})}
            >
              <Text style={styles.clearFiltersText}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* Categories Section */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : searchQuery.trim().length > 0 ? (
          // Search Results
          <View style={styles.searchResultsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {searchType === 'products' ? 'Product' : 'Profile'} Search Results ({searchResults.length})
                {searchType === 'profiles' && profileType !== 'all' && ` - ${profileType.charAt(0).toUpperCase() + profileType.slice(1)}`}
              </Text>
            </View>
            
            {searchResults.length === 0 ? (
              <View style={styles.centered}>
                <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
                <Text style={styles.emptyTitle}>No {searchType === 'products' ? 'products' : 'profiles'} found</Text>
                <Text style={styles.emptySubtitle}>
                  Try searching with different keywords
                </Text>
              </View>
            ) : searchType === 'products' ? (
              // Product Search Results
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.productsList}
                columnWrapperStyle={styles.productRow}
              />
            ) : (
              // Profile Search Results
              <FlatList
                data={searchResults}
                renderItem={renderProfileResult}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.profilesList}
              />
            )}
          </View>
        ) : (
          // Tinder-like Cards + Product List
          <ScrollView style={styles.discoveryContainer} showsVerticalScrollIndicator={false}>
            {/* Tinder Cards Section */}
            <View style={styles.tinderSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {selectedCategory ? selectedCategory : 'Featured Products'}
                </Text>
                <Text style={styles.productCount}>
                  {currentProductIndex + 1} of {products.length > 0 ? products.length : 2}
                </Text>
              </View>
              
              <View style={styles.tinderContainer}>
                {renderTinderCard()}
              </View>
              
              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.skipButton}
                  onPress={handleSwipeLeft}
                >
                  <Ionicons name="close" size={32} color={colors.error} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.likeButton}
                  onPress={handleSwipeRight}
                >
                  <Ionicons name="heart" size={32} color={colors.favorite} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Product List Section */}
            <View style={styles.productListSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>All Products</Text>
                <Text style={styles.productCount}>{products.length} products</Text>
              </View>
              
              <FlatList
                data={products}
                renderItem={renderProductCard}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalProductList}
                ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
                scrollEnabled={false}
              />
            </View>
          </ScrollView>
        )}
      </View>

      {/* Advanced Filters Modal */}
      <AdvancedFilters
        visible={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        onApplyFilters={handleAdvancedFilters}
        currentFilters={currentFilters}
        categories={categories}
        stores={stores}
      />

      {/* Search Analytics Modal */}
      <SearchAnalyticsDashboard
        visible={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
  },
  headerContent: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radii.md,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
  },
  filterButton: {
    padding: spacing.sm,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  activeFilterTag: {
    backgroundColor: colors.background,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterText: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.text,
    marginRight: spacing.xs,
  },
  clearFiltersButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    marginLeft: spacing.sm,
  },
  clearFiltersText: {
    color: colors.white,
    ...typography.caption,
    fontWeight: '600',
  },
  categoriesSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  categoriesList: {
    paddingRight: spacing.lg,
  },
  categoryItem: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    ...typography.body,
    fontWeight: '500',
    color: colors.text,
  },
  selectedCategoryText: {
    color: colors.white,
  },
  mainContent: {
    flex: 1,
  },
  searchResultsContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  discoveryContainer: {
    flex: 1,
  },
  tinderSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  productListSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  productCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  tinderContainer: {
    height: 450, // Increased height to ensure visibility
    justifyContent: 'center',
    alignItems: 'center',
  },
  tinderCard: {
    width: screenWidth - spacing.lg * 2,
    height: 400,
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.lg,
  },
  tinderCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  tinderCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  tinderCardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  tinderCardName: {
    ...typography.h2,
    color: colors.white,
    fontWeight: '700',
    flex: 1,
    marginRight: spacing.md,
  },
  tinderCardStore: {
    ...typography.body,
    color: colors.white,
    opacity: 0.9,
    fontSize: 14,
  },
  tinderCardPrice: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.white,
    fontSize: 18,
  },
  tinderCardDescription: {
    ...typography.body,
    color: colors.white,
    opacity: 0.9,
  },
  tinderCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: colors.white,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
    borderWidth: 2,
    borderColor: colors.error,
  },
  likeButton: {
    backgroundColor: colors.white,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
    borderWidth: 2,
    borderColor: colors.favorite,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  horizontalProductList: {
    paddingHorizontal: spacing.lg,
  },
  productCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    width: 200,
    ...shadows.md,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
  },
  productInfo: {
    padding: spacing.md,
  },
  productName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  productStore: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  productPrice: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  productActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  addToCartButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addToCartText: {
    color: colors.white,
    ...typography.caption,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  wishlistButton: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  wishlistText: {
    color: colors.favorite,
    ...typography.caption,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  searchResultCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    flex: 1,
    maxWidth: '48%',
    ...shadows.md,
  },
  searchResultImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
  },
  searchResultInfo: {
    padding: spacing.md,
  },
  searchResultName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  searchResultStore: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  searchResultPrice: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  searchResultActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  productsList: {
    paddingBottom: spacing.xl,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  noMoreProducts: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  noMoreProductsTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.md,
  },
  noMoreProductsSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  resetButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    marginTop: spacing.lg,
  },
  resetText: {
    color: colors.white,
    ...typography.body,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    marginTop: spacing.md,
  },
  retryText: {
    color: colors.white,
    ...typography.body,
    fontWeight: '600',
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    marginTop: spacing.lg,
  },
  browseText: {
    color: colors.white,
    ...typography.body,
    fontWeight: '600',
  },
  profileTypeFilters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  activeProfileTypeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  profileTypeText: {
    ...typography.body,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  activeProfileTypeText: {
    color: colors.white,
  },
  profilesList: {
    paddingBottom: spacing.xl,
  },
  profileResultCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    ...shadows.md,
  },
  profileResultImage: {
    width: 60,
    height: 60,
    borderRadius: radii.full,
    marginRight: spacing.md,
  },
  profileResultInfo: {
    flex: 1,
  },
  profileResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  profileResultName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.xs,
  },
  profileResultUsername: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  profileResultBio: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  profileResultFollowers: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  profileResultActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  followButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  followText: {
    color: colors.white,
    ...typography.caption,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  messageButton: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageText: {
    color: colors.primary,
    ...typography.caption,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  profileTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  ratingText: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.warning,
  },
  profileTypeInfoText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  searchTypeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleButtonText: {
    ...typography.body,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  toggleButtonTextActive: {
    color: colors.white,
  },
}); 