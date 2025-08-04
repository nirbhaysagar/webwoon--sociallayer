import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from '../SellerDashboard/components/HeaderWithMenu';

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

export default function UserHelpScreen() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const renderHelpCategory = (category) => (
    <TouchableOpacity key={category.id} style={styles.categoryCard}>
      <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
        <Ionicons name={category.icon} size={24} color={category.color} />
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryTitle}>{category.title}</Text>
        <Text style={styles.categoryDescription}>{category.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderFaq = (faq) => (
    <TouchableOpacity 
      key={faq.id} 
      style={styles.faqItem}
      onPress={() => toggleFaq(faq.id)}
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
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <HeaderWithMenu />
      
      <View style={styles.header}>
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.subtitle}>Get help with your questions</Text>
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How can we help?</Text>
          <View style={styles.categoriesGrid}>
            {helpCategories.map(renderHelpCategory)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqContainer}>
            {faqs.map(renderFaq)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <View style={styles.contactContainer}>
            <TouchableOpacity style={styles.contactCard}>
              <Ionicons name="chatbubble-outline" size={24} color={colors.primary} />
              <Text style={styles.contactTitle}>Live Chat</Text>
              <Text style={styles.contactDescription}>Chat with our support team</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactCard}>
              <Ionicons name="mail-outline" size={24} color={colors.primary} />
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactDescription}>support@socialspark.ai</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactCard}>
              <Ionicons name="call-outline" size={24} color={colors.primary} />
              <Text style={styles.contactTitle}>Phone Support</Text>
              <Text style={styles.contactDescription}>1-800-SPARK-HELP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.m,
    paddingTop: spacing.m,
    paddingBottom: spacing.s,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
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