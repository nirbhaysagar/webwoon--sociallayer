import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../constants/theme';

interface FilterOption {
  id: string;
  label: string;
  value: any;
  count?: number;
}

interface FilterCategory {
  id: string;
  title: string;
  options: FilterOption[];
  multiSelect?: boolean;
}

interface SearchFilterBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onFilterChange: (filters: any) => void;
  filterCategories?: FilterCategory[];
  searchHistory?: string[];
  onSearchHistorySelect?: (query: string) => void;
  showFilters?: boolean;
  onToggleFilters?: () => void;
}

export default function SearchFilterBar({
  placeholder = 'Search products, posts, stores...',
  onSearch,
  onFilterChange,
  filterCategories = [],
  searchHistory = [],
  onSearchHistorySelect,
  showFilters = false,
  onToggleFilters,
}: SearchFilterBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilters, setTempFilters] = useState<any>({});

  useEffect(() => {
    setTempFilters(activeFilters);
  }, [activeFilters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (categoryId: string, optionId: string, value: any) => {
    const newFilters = { ...tempFilters };
    
    if (!newFilters[categoryId]) {
      newFilters[categoryId] = [];
    }

    const category = filterCategories.find(cat => cat.id === categoryId);
    const isMultiSelect = category?.multiSelect;

    if (isMultiSelect) {
      const existingIndex = newFilters[categoryId].findIndex(
        (item: any) => item.id === optionId
      );
      
      if (existingIndex >= 0) {
        newFilters[categoryId].splice(existingIndex, 1);
      } else {
        newFilters[categoryId].push({ id: optionId, value });
      }
    } else {
      newFilters[categoryId] = [{ id: optionId, value }];
    }

    setTempFilters(newFilters);
  };

  const applyFilters = () => {
    setActiveFilters(tempFilters);
    onFilterChange(tempFilters);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setTempFilters({});
    onFilterChange({});
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce((total: number, filters: any) => {
      return total + (Array.isArray(filters) ? filters.length : 0);
    }, 0);
  };

  const renderFilterOption = ({ item }: { item: FilterOption }) => {
    const category = filterCategories.find(cat => 
      cat.options.some(opt => opt.id === item.id)
    );
    const categoryId = category?.id;
    const isSelected = tempFilters[categoryId]?.some(
      (filter: any) => filter.id === item.id
    );

    return (
      <TouchableOpacity
        style={[
          styles.filterOption,
          isSelected && styles.filterOptionSelected,
        ]}
        onPress={() => handleFilterChange(categoryId!, item.id, item.value)}
      >
        <Text style={[
          styles.filterOptionText,
          isSelected && styles.filterOptionTextSelected,
        ]}>
          {item.label}
        </Text>
        {item.count && (
          <Text style={styles.filterOptionCount}>
            ({item.count})
          </Text>
        )}
        {isSelected && (
          <Ionicons name="checkmark" size={16} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  const renderFilterCategory = ({ item }: { item: FilterCategory }) => (
    <View key={item.id} style={styles.filterCategory}>
      <Text style={styles.filterCategoryTitle}>{item.title}</Text>
      <FlatList
        data={item.options}
        renderItem={renderFilterOption}
        keyExtractor={(option) => option.id}
        horizontal={false}
        numColumns={2}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderSearchHistory = () => (
    <View style={styles.searchHistory}>
      <Text style={styles.searchHistoryTitle}>Recent Searches</Text>
      {searchHistory.map((query, index) => (
        <TouchableOpacity
          key={index}
          style={styles.searchHistoryItem}
          onPress={() => {
            setSearchQuery(query);
            onSearchHistorySelect?.(query);
            setIsSearchFocused(false);
          }}
        >
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.searchHistoryText}>{query}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                onSearch('');
              }}
            >
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        {showFilters && (
          <TouchableOpacity
            style={[
              styles.filterButton,
              getActiveFilterCount() > 0 && styles.filterButtonActive,
            ]}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="filter" size={20} color={colors.primary} />
            {getActiveFilterCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {getActiveFilterCount()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Search History Dropdown */}
      {isSearchFocused && searchHistory.length > 0 && (
        <View style={styles.searchDropdown}>
          {renderSearchHistory()}
        </View>
      )}

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.activeFiltersContainer}
        >
          {Object.entries(activeFilters).map(([categoryId, filters]) => {
            const category = filterCategories.find(cat => cat.id === categoryId);
            return (filters as any[]).map((filter: any) => {
              const option = category?.options.find(opt => opt.id === filter.id);
              return (
                <View key={filter.id} style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterText}>
                    {option?.label}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleFilterChange(categoryId, filter.id, filter.value)}
                  >
                    <Ionicons name="close" size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              );
            });
          })}
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={clearFilters}
          >
            <Text style={styles.clearFiltersText}>Clear All</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity
              onPress={() => setShowFilterModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <FlatList
              data={filterCategories}
              renderItem={renderFilterCategory}
              keyExtractor={(category) => category.id}
              scrollEnabled={false}
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={applyFilters}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.m,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginRight: spacing.s,
    ...shadows.card,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.s,
    fontSize: typography.body,
    color: colors.text,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.card,
    borderRadius: radii.m,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  filterButtonActive: {
    backgroundColor: colors.primary + '20',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchDropdown: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.m,
    borderRadius: radii.m,
    ...shadows.card,
  },
  searchHistory: {
    padding: spacing.m,
  },
  searchHistoryTitle: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.s,
  },
  searchHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  searchHistoryText: {
    fontSize: typography.body,
    color: colors.text,
    marginLeft: spacing.xs,
  },
  activeFiltersContainer: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.s,
  },
  activeFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    borderRadius: radii.s,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
  },
  activeFilterText: {
    fontSize: typography.caption,
    color: colors.primary,
    marginRight: spacing.xs,
  },
  clearFiltersButton: {
    backgroundColor: colors.error + '20',
    borderRadius: radii.s,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
  },
  clearFiltersText: {
    fontSize: typography.caption,
    color: colors.error,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.h3,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalContent: {
    flex: 1,
    padding: spacing.m,
  },
  filterCategory: {
    marginBottom: spacing.l,
  },
  filterCategoryTitle: {
    fontSize: typography.subtitle,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.m,
  },
  filterOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radii.s,
    padding: spacing.s,
    margin: spacing.xs,
    ...shadows.card,
  },
  filterOptionSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
    borderWidth: 1,
  },
  filterOptionText: {
    fontSize: typography.body,
    color: colors.text,
  },
  filterOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  filterOptionCount: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  clearButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.m,
    padding: spacing.m,
    alignItems: 'center',
    marginRight: spacing.s,
  },
  clearButtonText: {
    fontSize: typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radii.m,
    padding: spacing.m,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: typography.body,
    color: colors.white,
    fontWeight: '600',
  },
}); 