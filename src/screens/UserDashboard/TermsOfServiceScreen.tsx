import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, radii } from '../../constants/theme';
import BackButton from '../../components/BackButton';

export default function TermsOfServiceScreen() {
  const navigation = useNavigation();
  const [expandedSection, setExpandedSection] = useState('overview');

  const termsSections = [
    {
      id: 'overview',
      title: 'Overview',
      content: 'These Terms of Service govern your use of SocialSpark platform and services. By using our services, you agree to these terms.'
    },
    {
      id: 'account',
      title: 'Account Terms',
      content: 'You must be 18 or older to create an account. You are responsible for maintaining the security of your account and password.'
    },
    {
      id: 'usage',
      title: 'Acceptable Use',
      content: 'You agree not to use our services for illegal purposes, harassment, or to violate any applicable laws or regulations.'
    },
    {
      id: 'content',
      title: 'User Content',
      content: 'You retain ownership of content you post, but grant us license to use it. You are responsible for the content you share.'
    },
    {
      id: 'payments',
      title: 'Payment Terms',
      content: 'All purchases are final unless required by law. Prices may change with notice. Refunds are subject to our refund policy.'
    },
    {
      id: 'termination',
      title: 'Account Termination',
      content: 'We may terminate accounts that violate these terms. You may delete your account at any time through account settings.'
    },
    {
      id: 'liability',
      title: 'Limitation of Liability',
      content: 'We are not liable for indirect, incidental, or consequential damages. Our liability is limited to the amount you paid us.'
    },
    {
      id: 'changes',
      title: 'Changes to Terms',
      content: 'We may update these terms from time to time. We will notify you of material changes via email or in-app notification.'
    }
  ];

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <BackButton />
      
      <View style={{ padding: spacing.l }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: spacing.s }}>
          Terms of Service
        </Text>
        <Text style={{ fontSize: 16, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.l }}>
          Last updated: December 2024
        </Text>

        {termsSections.map((section) => (
          <View key={section.id} style={{ marginBottom: spacing.m }}>
            <TouchableOpacity
              style={{
                backgroundColor: colors.white,
                borderRadius: radii.s,
                padding: spacing.m,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={() => toggleSection(section.id)}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ 
                  fontSize: 18, 
                  fontWeight: '600', 
                  color: colors.text,
                  flex: 1,
                  marginRight: spacing.s
                }}>
                  {section.title}
                </Text>
                <Ionicons
                  name={expandedSection === section.id ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
              {expandedSection === section.id && (
                <Text style={{ 
                  fontSize: 14, 
                  color: colors.textSecondary, 
                  lineHeight: 22, 
                  marginTop: spacing.s 
                }}>
                  {section.content}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ marginBottom: spacing.l }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: spacing.m }}>
            Contact Legal Team
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
              Questions about our Terms of Service?
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.m }}>
              Contact our legal team for assistance with any terms-related questions.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                padding: spacing.m,
                borderRadius: radii.m,
                alignItems: 'center',
              }}
              onPress={() => navigation.navigate('ContactSupport' as any)}
            >
              <Text style={{ color: colors.white, fontSize: 16, fontWeight: '600' }}>
                Contact Legal Team
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
} 