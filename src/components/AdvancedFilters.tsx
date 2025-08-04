import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Switch, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../constants/theme';
import { AdvancedProductFilters } from '../services/advancedSearchService';

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

interface AdvancedFiltersProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: AdvancedProductFilters) => void;
  currentFilters: AdvancedProductFilters;
  categories?: string[];
  stores?: string[];
}

export default function AdvancedFilters({
  visible,
  onClose,
  onApplyFilters,
  currentFilters,
  categories = [],
  stores = []
}: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<AdvancedProductFilters>(currentFilters);
  const [priceRange, setPriceRange] = useState({
    min: currentFilters.priceRange?.min || 0,
    max: currentFilters.priceRange?.max || 1000
  });

  useEffect(() => {
    setFilters(currentFilters);
    setPriceRange({
      min: currentFilters.priceRange?.min || 0,
      max: currentFilters.priceRange?.max || 1000
    });
  }, [currentFilters]);

  const filterCategories: FilterCategory[] = [
    {
      id: 'categories',
      title: 'Categories',
      options: categories.map(cat => ({ id: cat, label: cat, value: cat })),
      multiSelect: true
    },
    {
      id: 'stores',
      title: 'Stores',
      options: stores.map(store => ({ id: store, label: store, value: store })),
      multiSelect: true
    },
    {
      id: 'availability',
      title: 'Availability',
      options: [
        { id: 'all', label: 'All Items', value: 'all' },
        { id: 'in_stock', label: 'In Stock', value: 'in_stock' },
        { id: 'out_of_stock', label: 'Out of Stock', value: 'out_of_stock' }
      ]
    },
    {
      id: 'sortBy',
      title: 'Sort By',
      options: [
        { id: 'relevance', label: 'Relevance', value: 'relevance' },
        { id: 'price_low', label: 'Price: Low to High', value: 'price_low' },
        { id: 'price_high', label: 'Price: High to Low', value: 'price_high' },
        { id: 'newest', label: 'Newest First', value: 'newest' },
        { id: 'rating', label: 'Highest Rated', value: 'rating' }
      ]
    }
  ];

  const handleFilterChange = (categoryId: string, optionId: string, value: any) => {
    const newFilters = { ...filters };
    
    if (categoryId === 'categories' || categoryId === 'stores') {
      const currentArray = (newFilters[categoryId as keyof AdvancedProductFilters] as string[]) || [];
      const existingIndex = currentArray.findIndex(item => item === value);
      
      if (existingIndex >= 0) {
        currentArray.splice(existingIndex, 1);
      } else {
        currentArray.push(value);
      }
      
      newFilters[categoryId as keyof AdvancedProductFilters] = currentArray;
    } else {
      newFilters[categoryId as keyof AdvancedProductFilters] = value;
    }
    
    setFilters(newFilters);
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange({ min: values[0], max: values[1] });
  };

  const handleApplyFilters = () => {
    const finalFilters = {
      ...filters,
      priceRange: priceRange
    };
    onApplyFilters(finalFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters: AdvancedProductFilters = {};
    setFilters(clearedFilters);
    setPriceRange({ min: 0, max: 1000 });
  };

  const renderFilterOption = (category: FilterCategory, option: FilterOption) => {
    const currentValue = filters[category.id as keyof AdvancedProductFilters];
    const isSelected = category.multiSelect
      ? Array.isArray(currentValue) && (currentValue as string[]).includes(option.value as string)
      : currentValue === option.value;

    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.filterOption,
          isSelected && styles.filterOptionSelected
        ]}
        onPress={() => handleFilterChange(category.id, option.id, option.value)}
      >
        <Text style={[
          styles.filterOptionText,
          isSelected && styles.filterOptionTextSelected
        ]}>
          {option.label}
        </Text>
        {option.count && (
          <Text style={styles.filterOptionCount}>
            ({option.count})
          </Text>
        )}
        {isSelected && (
          <Ionicons name="checkmark" size={16} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  const renderFilterCategory = (category: FilterCategory) => (
    <View key={category.id} style={styles.filterCategory}>
      <Text style={styles.filterCategoryTitle}>{category.title}</Text>
      <View style={styles.filterOptions}>
        {category.options.map(option => renderFilterOption(category, option))}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Advanced Filters</Text>
          <TouchableOpacity onPress={handleClearFilters} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Price Range */}
          <View style={styles.filterCategory}>
            <Text style={styles.filterCategoryTitle}>Price Range</Text>
            <View style={styles.priceRangeContainer}>
              <View style={styles.priceInputRow}>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.priceInputLabel}>Min</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={priceRange.min.toString()}
                    onChangeText={(text) => setPriceRange(prev => ({ ...prev, min: parseFloat(text) || 0 }))}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
                <Text style={styles.priceRangeSeparator}>-</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.priceInputLabel}>Max</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={priceRange.max.toString()}
                    onChangeText={(text) => setPriceRange(prev => ({ ...prev, max: parseFloat(text) || 1000 }))}
                    keyboardType="numeric"
                    placeholder="1000"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Filter Categories */}
          {filterCategories.map(renderFilterCategory)}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyFilters}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  clearButton: {
    padding: spacing.xs,
  },
  clearButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.primary,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  filterCategory: {
    marginBottom: spacing.lg,
  },
  filterCategoryTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  filterOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  filterOptionTextSelected: {
    color: colors.white,
  },
  filterOptionCount: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  priceRangeContainer: {
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
  },
  priceRangeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceInputLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  priceInput: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priceRangeSeparator: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
}); 