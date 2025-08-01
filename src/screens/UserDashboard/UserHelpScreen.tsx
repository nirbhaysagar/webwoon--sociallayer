import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, TextInput, Alert, SafeAreaView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from '../SellerDashboard/components/HeaderWithMenu';
import { scale } from '../../lib/scale';
import { useNavigation } from '@react-navigation/native';

const helpCategories = [
  {
    id: 'account',
    title: 'Account & Profile',
    icon: 'person-outline',
    description: 'Manage your account settings',
    color: colors.primary,
  },
  {
    id: 'orders',
    title: 'Orders & Shipping',
    icon: 'receipt-outline',
    description: 'Track orders and shipping info',
    color: colors.success,
  },
  {
    id: 'payments',
    title: 'Payments & Refunds',
    icon: 'card-outline',
    description: 'Payment methods and refunds',
    color: colors.discount,
  },
  {
    id: 'app',
    title: 'App Features',
    icon: 'phone-portrait-outline',
    description: 'How to use app features',
    color: colors.textSecondary,
  },
];

const faqs = [
  {
    id: '1',
    question: 'How do I track my order?',
    answer: 'You can track your order by going to the Orders tab in your profile. Click on any order to see detailed tracking information.',
    category: 'orders',
  },
  {
    id: '2',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, Apple Pay, and Google Pay. All payments are processed securely.',
    category: 'payments',
  },
  {
    id: '3',
    question: 'How do I change my shipping address?',
    answer: 'Go to Settings > Shipping Addresses to add or edit your delivery addresses.',
    category: 'account',
  },
  {
    id: '4',
    question: 'Can I cancel my order?',
    answer: 'Orders can be cancelled within 1 hour of placement. Go to Orders and select "Cancel Order" if available.',
    category: 'orders',
  },
];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const HelpCategoryCard = ({ category }) => {
    const [scaleValue] = useState(new Animated.Value(1));

    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.98,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    return (
        <AnimatedTouchableOpacity 
            style={[styles.categoryCard, { transform: [{ scale: scaleValue }] }]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                <Ionicons name={category.icon} size={24} color={category.color} />
            </View>
            <View style={styles.categoryInfo}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </AnimatedTouchableOpacity>
    );
};

const FaqItem = ({ faq, expandedFaq, toggleFaq }) => {
    const [scaleValue] = useState(new Animated.Value(1));

    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.98,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    return (
        <AnimatedTouchableOpacity 
            style={[styles.faqItem, { transform: [{ scale: scaleValue }] }]}
            onPress={() => toggleFaq(faq.id)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons 
                    name={expandedFaq === faq.id ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={colors.textSecondary} 
                />
            </View>
            {expandedFaq === faq.id && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
        </AnimatedTouchableOpacity>
    );
};

const ContactCard = ({ icon, title, description }) => {
    const [scaleValue] = useState(new Animated.Value(1));

    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.98,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    return (
        <AnimatedTouchableOpacity 
            style={[styles.contactCard, { transform: [{ scale: scaleValue }] }]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <Ionicons name={icon} size={24} color={colors.primary} />
            <Text style={styles.contactTitle}>{title}</Text>
            <Text style={styles.contactDescription}>{description}</Text>
        </AnimatedTouchableOpacity>
    );
};


export default function UserHelpScreen() {
  const navigation = useNavigation();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'Opening contact form...');
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithMenu />
      
      <View style={styles.header}>
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.subtitle}>Find answers to common questions</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search help articles..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {helpCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category.id && styles.categoryButtonTextActive
              ]}>
                {category.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredFaqs}
        renderItem={({ item }) => (
          <FaqItem 
            key={item.id} 
            faq={item} 
            expandedFaq={expandedFaq} 
            toggleFaq={toggleFaq} 
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
        style={styles.flatList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="help-circle-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No help articles found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or category filter</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
        <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
        <Text style={styles.contactButtonText}>Contact Support</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.m,
  },
  title: {
    fontSize: scale(24),
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: scale(16),
    color: colors.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: spacing.m,
    marginBottom: spacing.m,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    fontSize: scale(16),
    color: colors.text,
    marginLeft: spacing.s,
    flex: 1,
  },
  categoryContainer: {
    paddingHorizontal: spacing.m,
    marginBottom: spacing.m,
  },
  categoryButton: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginRight: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryButtonTextActive: {
    color: colors.text,
  },
  listContainer: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.l,
    flexGrow: 1,
  },
  flatList: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: scale(18),
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  emptySubtext: {
    fontSize: scale(14),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.medium,
    padding: spacing.m,
    margin: spacing.m,
    ...shadows.card,
  },
  contactButtonText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.s,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.m,
    paddingBottom: 120,
  },
  section: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: 12,
  },
  categoriesGrid: {
    gap: spacing.s,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    ...shadows.card,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  faqContainer: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    overflow: 'hidden',
    ...shadows.card,
  },
  faqItem: {
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: spacing.s,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: spacing.s,
  },
  contactContainer: {
    gap: spacing.s,
  },
  contactCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    alignItems: 'center',
    ...shadows.card,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.s,
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
