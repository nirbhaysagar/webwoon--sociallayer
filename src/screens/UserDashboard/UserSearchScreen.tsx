import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { Product } from '../../services/supabase';

const { width } = Dimensions.get('window');

// Mock data for search suggestions and trending searches
const mockRecentSearches = [
  'wireless headphones',
  'smart watch',
  'running shoes',
  'laptop bag',
  'coffee maker'
];

const mockTrendingSearches = [
  'iPhone 15',
  'Nike Air Max',
  'Samsung Galaxy',
  'MacBook Pro',
  'Sony WH-1000XM5',
  'Apple Watch Series 9',
  'Adidas Ultraboost',
  'Dell XPS 13'
];

const mockSearchSuggestions = [
  'wireless bluetooth headphones',
  'wireless earbuds',
  'wireless charging pad',
  'wireless keyboard',
  'wireless mouse'
];

const UserSearchScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState(mockRecentSearches);
  const [trendingSearches, setTrendingSearches] = useState(mockTrendingSearches);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Focus search input when screen loads
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      // Show search suggestions based on query
      const filteredSuggestions = mockSearchSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    setShowSuggestions(false);

    try {
      // Add to recent searches
      if (!recentSearches.includes(query.toLowerCase())) {
        setRecentSearches(prev => [query.toLowerCase(), ...prev.slice(0, 4)]);
      }

      // Search in Supabase
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .eq('is_active', true)
        .limit(50);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search products. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleRecentSearchPress = (search: string) => {
    setSearchQuery(search);
    handleSearch(search);
  };

  const handleTrendingSearchPress = (search: string) => {
    setSearchQuery(search);
    handleSearch(search);
  };

  const handleProductPress = (product: Product) => {
    // Convert Product to product detail format
    const productDetail = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.price * 1.3, // Mock original price
      discount: 23, // Mock discount
      rating: 4.5,
      reviewCount: 156,
      description: `Experience the amazing ${product.name}. This premium product offers exceptional quality and value for money. Perfect for everyday use and special occasions.`,
      features: [
        'Premium Quality',
        'Durable Design',
        'Easy to Use',
        'Great Value',
        'Customer Favorite',
        'Fast Shipping'
      ],
      images: [
        (product.media_urls && product.media_urls[0]) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
        'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400'
      ],
      colors: ['Black', 'White', 'Blue'],
      sizes: ['S', 'M', 'L', 'XL'],
      inStock: true,
      stockCount: 25,
      seller: {
        name: product.store_id || 'Unknown Store',
        rating: 4.8,
        reviewCount: 15420,
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100'
      },
      reviews: [
        {
          id: '1',
          user: 'Alex Johnson',
          rating: 5,
          date: '2 days ago',
          comment: 'Amazing product! Quality is outstanding and delivery was fast.',
          helpful: 24
        },
        {
          id: '2',
          user: 'Sarah Wilson',
          rating: 4,
          date: '1 week ago',
          comment: 'Great value for money. Very satisfied with the purchase.',
          helpful: 18
        },
        {
          id: '3',
          user: 'Mike Chen',
          rating: 5,
          date: '2 weeks ago',
          comment: 'Perfect for my needs. Highly recommend!',
          helpful: 31
        }
      ],
      relatedProducts: [
        {
          id: '2',
          name: 'Similar Product 1',
          price: 79.99,
          image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200'
        },
        {
          id: '3',
          name: 'Similar Product 2',
          price: 149.99,
          image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200'
        },
        {
          id: '4',
          name: 'Similar Product 3',
          price: 99.99,
          image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200'
        }
      ]
    };
    
    navigation.navigate('ProductDetailScreen', { product: productDetail });
  };

  const renderSearchResult = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.searchResultCard} 
      onPress={() => handleProductPress(item)}
    >
      <Image 
        source={{ uri: (item.media_urls && item.media_urls[0]) || 'https://via.placeholder.com/120' }} 
        style={styles.searchResultImage} 
      />
      <View style={styles.searchResultInfo}>
        <Text style={styles.searchResultName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.searchResultStore}>{item.store_id || 'Unknown Store'}</Text>
        <Text style={styles.searchResultPrice}>${item.price.toFixed(2)}</Text>
        <View style={styles.searchResultRating}>
          <Ionicons name="star" size={14} color={colors.discount} />
          <Text style={styles.searchResultRatingText}>4.5 (156 reviews)</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.searchResultAction}>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSearchSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity 
      style={styles.suggestionItem} 
      onPress={() => handleSuggestionPress(item)}
    >
      <Ionicons name="search-outline" size={16} color={colors.textSecondary} />
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderRecentSearch = ({ item }: { item: string }) => (
    <TouchableOpacity 
      style={styles.recentSearchItem} 
      onPress={() => handleRecentSearchPress(item)}
    >
      <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
      <Text style={styles.recentSearchText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderTrendingSearch = ({ item }: { item: string }) => (
    <TouchableOpacity 
      style={styles.trendingSearchItem} 
      onPress={() => handleTrendingSearchPress(item)}
    >
      <Ionicons name="trending-up-outline" size={16} color={colors.primary} />
      <Text style={styles.trendingSearchText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderSearchContent = () => {
    if (isSearching) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Searching products...</Text>
        </View>
      );
    }

    if (hasSearched && searchResults.length === 0) {
      return (
        <View style={styles.centered}>
          <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.noResultsText}>No products found</Text>
          <Text style={styles.noResultsSubtext}>Try adjusting your search terms</Text>
        </View>
      );
    }

    if (hasSearched && searchResults.length > 0) {
      return (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.searchResultsList}
        />
      );
    }

    // Show search suggestions and trending searches
    return (
      <ScrollView style={styles.suggestionsContainer} showsVerticalScrollIndicator={false}>
        {showSuggestions && searchSuggestions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Suggestions</Text>
            {searchSuggestions.map((suggestion, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.suggestionItem} 
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <Ionicons name="search-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!showSuggestions && (
          <>
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.recentSearchItem} 
                    onPress={() => handleRecentSearchPress(search)}
                  >
                    <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.recentSearchText}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trending Searches</Text>
              <View style={styles.trendingGrid}>
                {trendingSearches.map((search, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.trendingSearchItem} 
                    onPress={() => handleTrendingSearchPress(search)}
                  >
                    <Ionicons name="trending-up-outline" size={16} color={colors.primary} />
                    <Text style={styles.trendingSearchText}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search for products..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch(searchQuery)}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
                setHasSearched(false);
              }}
            >
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {renderSearchContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.m,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  searchIcon: {
    marginRight: spacing.s,
  },
  searchInput: {
    flex: 1,
    fontSize: scale(16),
    color: colors.text,
  },
  clearButton: {
    marginLeft: spacing.s,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.m,
    fontSize: scale(16),
    color: colors.textSecondary,
  },
  noResultsText: {
    marginTop: spacing.m,
    fontSize: scale(20),
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  noResultsSubtext: {
    marginTop: spacing.s,
    fontSize: scale(14),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  suggestionsContainer: {
    flex: 1,
    paddingHorizontal: spacing.l,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.m,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.s,
    backgroundColor: colors.card,
    borderRadius: radii.s,
    marginBottom: spacing.s,
  },
  suggestionText: {
    marginLeft: spacing.s,
    fontSize: scale(16),
    color: colors.text,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.s,
    backgroundColor: colors.card,
    borderRadius: radii.s,
    marginBottom: spacing.s,
  },
  recentSearchText: {
    marginLeft: spacing.s,
    fontSize: scale(16),
    color: colors.text,
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  trendingSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    backgroundColor: colors.primary + '15',
    borderRadius: radii.pill,
    marginBottom: spacing.s,
    width: (width - spacing.l * 2 - spacing.s) / 2,
  },
  trendingSearchText: {
    marginLeft: spacing.xs,
    fontSize: scale(14),
    color: colors.primary,
    fontWeight: '600',
  },
  searchResultsList: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xl,
  },
  searchResultCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  searchResultImage: {
    width: 80,
    height: 80,
    borderRadius: radii.s,
    marginRight: spacing.m,
  },
  searchResultInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  searchResultName: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  searchResultStore: {
    fontSize: scale(14),
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  searchResultPrice: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  searchResultRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultRatingText: {
    marginLeft: spacing.xs,
    fontSize: scale(12),
    color: colors.textSecondary,
  },
  searchResultAction: {
    justifyContent: 'center',
    paddingLeft: spacing.s,
  },
});

export default UserSearchScreen; 