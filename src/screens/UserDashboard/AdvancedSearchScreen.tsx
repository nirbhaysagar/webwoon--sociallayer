import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { searchService, SearchResult, SearchSuggestion, SearchFilters } from '../../services/searchService';
import BackButton from '../../components/BackButton';

interface SearchTab {
  id: string;
  title: string;
  type: 'product' | 'seller' | 'content';
}

const SearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<SearchSuggestion[]>([]);
  const [popularSearches, setPopularSearches] = useState<SearchSuggestion[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchSuggestion[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'product' | 'seller' | 'content'>('product');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');

  const searchTabs: SearchTab[] = [
    { id: 'product', title: 'Products', type: 'product' },
    { id: 'seller', title: 'Sellers', type: 'seller' },
    { id: 'content', title: 'Content', type: 'content' },
  ];

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [trending, popular, history, saved] = await Promise.all([
        searchService.getTrendingSearches(5),
        searchService.getPopularSearches(5),
        searchService.getUserSearchHistory(5).then(history => 
          history.map(h => ({ suggestion: h.search_query, suggestion_type: 'history', search_count: 0 }))
        ),
        searchService.getSavedSearches()
      ]);

      setTrendingSearches(trending);
      setPopularSearches(popular);
      setSearchHistory(history);
      setSavedSearches(saved);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchService.performSearch(query, activeTab, filters);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        Alert.alert('Error', 'Failed to perform search');
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [activeTab, filters]
  );

  // Update suggestions when query changes
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      loadSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const loadSuggestions = async () => {
    try {
      const suggestions = await searchService.getSearchSuggestions(searchQuery, 8);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const results = await searchService.performSearch(searchQuery, activeTab, filters);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to perform search');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.suggestion);
    handleSearch();
  };

  const handleResultPress = (result: SearchResult) => {
    // Navigate to appropriate screen based on content type
    if (result.content_type === 'product') {
      navigation.navigate('ProductDetail' as never, { productId: result.content_id } as never);
    } else if (result.content_type === 'seller') {
      navigation.navigate('SellerProfile' as never, { sellerId: result.content_id } as never);
    }
  };

  const handleSaveSearch = async () => {
    if (!saveSearchName.trim()) {
      Alert.alert('Error', 'Please enter a name for the saved search');
      return;
    }

    try {
      const saved = await searchService.saveSearch({
        name: saveSearchName,
        query: searchQuery,
        searchType: activeTab,
        filters
      });

      if (saved) {
        Alert.alert('Success', 'Search saved successfully');
        setShowSaveSearchModal(false);
        setSaveSearchName('');
        loadInitialData(); // Refresh saved searches
      }
    } catch (error) {
      console.error('Error saving search:', error);
      Alert.alert('Error', 'Failed to save search');
    }
  };

  const handleDeleteSavedSearch = async (searchId: number) => {
    Alert.alert(
      'Delete Saved Search',
      'Are you sure you want to delete this saved search?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await searchService.deleteSavedSearch(searchId);
              if (success) {
                loadInitialData(); // Refresh saved searches
              }
            } catch (error) {
              console.error('Error deleting saved search:', error);
              Alert.alert('Error', 'Failed to delete saved search');
            }
          }
        }
      ]
    );
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleResultPress(item)}
    >
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.resultDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.resultScores}>
          <Text style={styles.scoreText}>
            Relevance: {(item.relevance_score * 100).toFixed(1)}%
          </Text>
          <Text style={styles.scoreText}>
            Popularity: {(item.popularity_score * 100).toFixed(1)}%
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  const renderSuggestion = ({ item }: { item: SearchSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
    >
      <Ionicons 
        name={item.suggestion_type === 'history' ? 'time' : 'search'} 
        size={16} 
        color="#666" 
      />
      <Text style={styles.suggestionText}>{item.suggestion}</Text>
      {item.search_count > 0 && (
        <Text style={styles.suggestionCount}>{item.search_count}</Text>
      )}
    </TouchableOpacity>
  );

  const renderFilterOption = (title: string, options: string[], currentValue?: string) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterOptions}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.filterOption,
                currentValue === option && styles.filterOptionActive
              ]}
              onPress={() => setFilters(prev => ({ ...prev, [title.toLowerCase()]: option }))}
            >
              <Text style={[
                styles.filterOptionText,
                currentValue === option && styles.filterOptionTextActive
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Advanced Search</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, sellers, or content..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Tabs */}
      <View style={styles.tabContainer}>
        {searchTabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.type && styles.activeTab]}
            onPress={() => setActiveTab(tab.type)}
          >
            <Text style={[styles.tabText, activeTab === tab.type && styles.activeTabText]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersTitle}>Filters</Text>
          {renderFilterOption('Category', ['Electronics', 'Clothing', 'Home', 'Sports', 'Books'])}
          {renderFilterOption('Brand', ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony'])}
          {renderFilterOption('Availability', ['In Stock', 'Out of Stock', 'Pre-order'])}
          <View style={styles.priceFilter}>
            <Text style={styles.filterTitle}>Price Range</Text>
            <View style={styles.priceInputs}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min"
                keyboardType="numeric"
                value={filters.price_min?.toString() || ''}
                onChangeText={(text) => setFilters(prev => ({ ...prev, price_min: parseFloat(text) || undefined }))}
              />
              <Text style={styles.priceSeparator}>-</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max"
                keyboardType="numeric"
                value={filters.price_max?.toString() || ''}
                onChangeText={(text) => setFilters(prev => ({ ...prev, price_max: parseFloat(text) || undefined }))}
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={() => setFilters({})}
          >
            <Text style={styles.clearFiltersText}>Clear All Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search Results or Suggestions */}
      {searchQuery.length > 0 ? (
        <View style={styles.resultsContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            <>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>
                  {searchResults.length} results found
                </Text>
                <TouchableOpacity
                  style={styles.saveSearchButton}
                  onPress={() => setShowSaveSearchModal(true)}
                >
                  <Ionicons name="bookmark-outline" size={20} color="#007AFF" />
                  <Text style={styles.saveSearchText}>Save Search</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => `${item.content_type}-${item.content_id}`}
                showsVerticalScrollIndicator={false}
              />
            </>
          ) : (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search-outline" size={48} color="#ccc" />
              <Text style={styles.noResultsText}>No results found</Text>
              <Text style={styles.noResultsSubtext}>
                Try adjusting your search terms or filters
              </Text>
            </View>
          )}
        </View>
      ) : (
        <ScrollView style={styles.suggestionsContainer} showsVerticalScrollIndicator={false}>
          {/* Trending Searches */}
          {trendingSearches.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trending Searches</Text>
              <FlatList
                data={trendingSearches}
                renderItem={renderSuggestion}
                keyExtractor={(item) => `trending-${item.suggestion}`}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Popular Searches */}
          {popularSearches.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Searches</Text>
              <FlatList
                data={popularSearches}
                renderItem={renderSuggestion}
                keyExtractor={(item) => `popular-${item.suggestion}`}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Search History */}
          {searchHistory.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              <FlatList
                data={searchHistory}
                renderItem={renderSuggestion}
                keyExtractor={(item) => `history-${item.suggestion}`}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Saved Searches</Text>
              {savedSearches.map((saved) => (
                <View key={saved.id} style={styles.savedSearchItem}>
                  <TouchableOpacity
                    style={styles.savedSearchContent}
                    onPress={() => {
                      setSearchQuery(saved.search_query);
                      setActiveTab(saved.search_type as any);
                      setFilters(saved.filters || {});
                    }}
                  >
                    <Text style={styles.savedSearchName}>{saved.name}</Text>
                    <Text style={styles.savedSearchQuery}>{saved.search_query}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteSavedButton}
                    onPress={() => handleDeleteSavedSearch(saved.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Save Search Modal */}
      <Modal
        visible={showSaveSearchModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSaveSearchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save Search</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter a name for this search"
              value={saveSearchName}
              onChangeText={setSaveSearchName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowSaveSearchModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSaveSearch}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  filtersContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
  },
  filterOption: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterOptionActive: {
    backgroundColor: '#007AFF',
  },
  filterOptionText: {
    fontSize: 12,
    color: '#666',
  },
  filterOptionTextActive: {
    color: 'white',
  },
  priceFilter: {
    marginBottom: 16,
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 14,
  },
  priceSeparator: {
    marginHorizontal: 8,
    color: '#666',
  },
  clearFiltersButton: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  clearFiltersText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
  },
  saveSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveSearchText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resultScores: {
    flexDirection: 'row',
  },
  scoreText: {
    fontSize: 12,
    color: '#999',
    marginRight: 12,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  suggestionsContainer: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    marginLeft: 8,
  },
  suggestionCount: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  savedSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  savedSearchContent: {
    flex: 1,
  },
  savedSearchName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  savedSearchQuery: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deleteSavedButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    marginHorizontal: 4,
  },
  modalButtonPrimary: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  modalButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  modalButtonTextPrimary: {
    color: 'white',
  },
});

export default SearchScreen; 