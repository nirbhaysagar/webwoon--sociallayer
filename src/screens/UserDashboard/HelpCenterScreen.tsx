import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, radii } from '../../constants/theme';
import BackButton from '../../components/BackButton';

interface FAQCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  faqs: FAQItem[];
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function HelpCenterScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqCategories: FAQCategory[] = [
    {
      id: 'account',
      title: 'Account & Profile',
      icon: 'person-outline',
      color: colors.primary,
      faqs: [
        {
          id: '1',
          question: 'How do I change my profile picture?',
          answer: 'Go to your Profile settings and tap on your current profile picture. You can then select a new image from your gallery or take a new photo.'
        },
        {
          id: '2',
          question: 'How do I update my email address?',
          answer: 'Navigate to Settings > Profile > Email & Password. Enter your new email address and follow the verification process.'
        },
        {
          id: '3',
          question: 'How do I delete my account?',
          answer: 'Go to Settings > Data & Storage > Delete Account. Please note that this action is permanent and cannot be undone.'
        }
      ]
    },
    {
      id: 'orders',
      title: 'Orders & Shipping',
      icon: 'bag-outline',
      color: colors.success,
      faqs: [
        {
          id: '4',
          question: 'How do I track my order?',
          answer: 'Go to the Orders section in your dashboard. Click on any order to see its current status and tracking information.'
        },
        {
          id: '5',
          question: 'What is your return policy?',
          answer: 'We offer a 30-day return policy for most items. Items must be unused and in original packaging. Some items may have different return policies.'
        },
        {
          id: '6',
          question: 'How do I cancel an order?',
          answer: 'You can cancel an order within 1 hour of placing it. Go to Orders > Select Order > Cancel Order. After 1 hour, please contact support.'
        }
      ]
    },
    {
      id: 'payments',
      title: 'Payments & Billing',
      icon: 'card-outline',
      color: colors.warning,
      faqs: [
        {
          id: '7',
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards, PayPal, Apple Pay, and Google Pay. Some sellers may also accept additional payment methods.'
        },
        {
          id: '8',
          question: 'How do I get a refund?',
          answer: 'Go to Orders > Select Order > Request Refund. You can also contact support for assistance with refunds.'
        },
        {
          id: '9',
          question: 'Is my payment information secure?',
          answer: 'Yes, all payment information is encrypted and processed securely. We never store your full credit card details on our servers.'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Technical Support',
      icon: 'settings-outline',
      color: colors.error,
      faqs: [
        {
          id: '10',
          question: 'The app is not loading properly',
          answer: 'Try closing and reopening the app. If the problem persists, check your internet connection or try restarting your device.'
        },
        {
          id: '11',
          question: 'I can\'t upload photos',
          answer: 'Make sure you have granted camera and photo library permissions to the app. Go to your device settings to check permissions.'
        },
        {
          id: '12',
          question: 'How do I clear the app cache?',
          answer: 'Go to Settings > Data & Storage > Clear Cache. This will free up storage space and may resolve performance issues.'
        }
      ]
    }
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      Alert.alert('Search', 'Please enter a search term');
      return;
    }
    // TODO: Implement search functionality
    Alert.alert('Search', `Searching for: ${searchQuery}`);
  };

  const handleContactSupport = () => {
    navigation.navigate('ContactSupport' as any);
  };

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const filteredCategories = selectedCategory 
    ? faqCategories.filter(cat => cat.id === selectedCategory)
    : faqCategories;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <BackButton />
      
      <View style={{ padding: spacing.l }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: spacing.s }}>
          Help Center
        </Text>
        <Text style={{ fontSize: 16, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.l }}>
          Find answers to common questions and get help when you need it.
        </Text>

        {/* Search Bar */}
        <View style={{ marginBottom: spacing.l }}>
          <View style={{
            flexDirection: 'row',
            backgroundColor: colors.white,
            borderRadius: radii.m,
            paddingHorizontal: spacing.m,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <TextInput
              style={{
                flex: 1,
                paddingVertical: spacing.m,
                fontSize: 16,
                color: colors.text,
              }}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for help topics..."
              placeholderTextColor={colors.textSecondary}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity onPress={handleSearch}>
              <Ionicons name="search" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Navigation */}
        {!selectedCategory && (
          <View style={{ marginBottom: spacing.l }}>
            <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: spacing.m }}>
              Browse by Category
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {faqCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={{
                    width: '48%',
                    backgroundColor: colors.white,
                    padding: spacing.m,
                    borderRadius: radii.m,
                    marginBottom: spacing.m,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Ionicons name={category.icon as any} size={32} color={category.color} />
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: colors.text, 
                    marginTop: spacing.s,
                    textAlign: 'center'
                  }}>
                    {category.title}
                  </Text>
                  <Text style={{ 
                    fontSize: 12, 
                    color: colors.textSecondary,
                    textAlign: 'center',
                    marginTop: spacing.xs
                  }}>
                    {category.faqs.length} articles
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Back to Categories Button */}
        {selectedCategory && (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: spacing.m,
            }}
            onPress={() => setSelectedCategory(null)}
          >
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
            <Text style={{ fontSize: 16, color: colors.primary, marginLeft: spacing.s }}>
              Back to Categories
            </Text>
          </TouchableOpacity>
        )}

        {/* FAQ Sections */}
        {filteredCategories.map((category) => (
          <View key={category.id} style={{ marginBottom: spacing.l }}>
            <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: spacing.m }}>
              {category.title}
            </Text>
            {category.faqs.map((faq) => (
              <TouchableOpacity
                key={faq.id}
                style={{
                  backgroundColor: colors.white,
                  borderRadius: radii.s,
                  padding: spacing.m,
                  marginBottom: spacing.s,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() => toggleFAQ(faq.id)}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '500', 
                    color: colors.text,
                    flex: 1,
                    marginRight: spacing.s
                  }}>
                    {faq.question}
                  </Text>
                  <Ionicons
                    name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
                {expandedFAQ === faq.id && (
                  <Text style={{ 
                    fontSize: 14, 
                    color: colors.textSecondary, 
                    lineHeight: 20, 
                    marginTop: spacing.s 
                  }}>
                    {faq.answer}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Contact Support */}
        <View style={{ marginBottom: spacing.l }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: spacing.m }}>
            Still Need Help?
          </Text>
          <View style={{
            backgroundColor: colors.white,
            borderRadius: radii.m,
            padding: spacing.m,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <Text style={{ fontSize: 16, color: colors.text, marginBottom: spacing.s }}>
              Can't find what you're looking for?
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.m }}>
              Our support team is here to help you with any questions or issues you may have.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                padding: spacing.m,
                borderRadius: radii.m,
                alignItems: 'center',
              }}
              onPress={handleContactSupport}
            >
              <Text style={{ color: colors.white, fontSize: 16, fontWeight: '600' }}>
                Contact Support
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ marginBottom: spacing.l }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: spacing.m }}>
            Quick Actions
          </Text>
          <View style={{
            backgroundColor: colors.white,
            borderRadius: radii.m,
            padding: spacing.m,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <TouchableOpacity 
              style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingVertical: spacing.s,
                borderBottomWidth: 1,
                borderBottomColor: colors.border
              }}
              onPress={() => Alert.alert('Live Chat', 'Live chat feature is coming soon!')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
                <Text style={{ fontSize: 16, color: colors.text, marginLeft: spacing.s }}>
                  Start Live Chat
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingVertical: spacing.s
              }}
              onPress={() => Alert.alert('Email Support', 'Opening email app...')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="mail-outline" size={20} color={colors.primary} />
                <Text style={{ fontSize: 16, color: colors.text, marginLeft: spacing.s }}>
                  Send Email
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
} 