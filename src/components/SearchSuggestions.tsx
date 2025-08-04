import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../constants/theme';
import { SearchSuggestion } from '../services/advancedSearchService';

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  onSuggestionPress: (suggestion: SearchSuggestion) => void;
  onClearHistory?: () => void;
  visible: boolean;
}

export default function SearchSuggestions({
  suggestions,
  onSuggestionPress,
  onClearHistory,
  visible
}: SearchSuggestionsProps) {
  if (!visible || suggestions.length === 0) {
    return null;
  }

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'trending':
        return 'trending-up';
      case 'recent':
        return 'time';
      case 'category':
        return 'grid';
      case 'brand':
        return 'business';
      default:
        return 'search';
    }
  };

  const getSuggestionColor = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'trending':
        return colors.primary;
      case 'recent':
        return colors.textSecondary;
      case 'category':
        return colors.success;
      case 'brand':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const renderSuggestion = ({ item }: { item: SearchSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => onSuggestionPress(item)}
    >
      <View style={styles.suggestionContent}>
        <Ionicons
          name={getSuggestionIcon(item.type)}
          size={16}
          color={getSuggestionColor(item.type)}
          style={styles.suggestionIcon}
        />
        <View style={styles.suggestionTextContainer}>
          <Text style={styles.suggestionText}>{item.text}</Text>
          {item.count && (
            <Text style={styles.suggestionCount}>
              {item.count} searches
            </Text>
          )}
        </View>
      </View>
      <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderSection = (title: string, data: SearchSuggestion[], showClear?: boolean) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {showClear && onClearHistory && (
          <TouchableOpacity onPress={onClearHistory}>
            <Text style={styles.clearButton}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={data}
        renderItem={renderSuggestion}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );

  const trendingSearches = suggestions.filter(s => s.type === 'trending');
  const recentSearches = suggestions.filter(s => s.type === 'recent');
  const categorySearches = suggestions.filter(s => s.type === 'category');
  const brandSearches = suggestions.filter(s => s.type === 'brand');

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {trendingSearches.length > 0 && (
          renderSection('Trending Searches', trendingSearches)
        )}
        
        {recentSearches.length > 0 && (
          renderSection('Recent Searches', recentSearches, true)
        )}
        
        {categorySearches.length > 0 && (
          renderSection('Categories', categorySearches)
        )}
        
        {brandSearches.length > 0 && (
          renderSection('Brands', brandSearches)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    marginTop: spacing.xs,
    maxHeight: 400,
    ...shadows.sm,
  },
  scrollView: {
    padding: spacing.sm,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.sizes.sm,
    ...typography.weights.semibold,
    color: colors.text,
  },
  clearButton: {
    ...typography.sizes.xs,
    ...typography.weights.medium,
    color: colors.primary,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    marginBottom: spacing.xs,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  suggestionIcon: {
    marginRight: spacing.xs,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionText: {
    ...typography.sizes.sm,
    ...typography.weights.medium,
    color: colors.text,
  },
  suggestionCount: {
    ...typography.sizes.xs,
    ...typography.weights.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
}); 