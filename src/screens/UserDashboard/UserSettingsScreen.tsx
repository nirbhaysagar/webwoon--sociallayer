import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import BackButton from '../../components/BackButton';

const settingsSections = [
  {
    title: 'Account',
    items: [
      { id: 'profile', title: 'Edit Profile', icon: 'person-outline', type: 'navigate' },
      { id: 'email', title: 'Email & Password', icon: 'mail-outline', type: 'navigate' },
      { id: 'phone', title: 'Phone Number', icon: 'call-outline', type: 'navigate' },
      { id: 'address', title: 'Shipping Addresses', icon: 'location-outline', type: 'navigate' },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { id: 'notifications', title: 'Push Notifications', icon: 'notifications-outline', type: 'toggle', value: true },
      { id: 'email_notifications', title: 'Email Notifications', icon: 'mail-outline', type: 'toggle', value: false },
      { id: 'dark_mode', title: 'Dark Mode', icon: 'moon-outline', type: 'toggle', value: false },
      { id: 'language', title: 'Language', icon: 'language-outline', type: 'navigate', subtitle: 'English' },
    ]
  },
  {
    title: 'Privacy & Security',
    items: [
      { id: 'privacy', title: 'Privacy Settings', icon: 'shield-outline', type: 'navigate' },
      { id: 'security', title: 'Security', icon: 'lock-closed-outline', type: 'navigate' },
      { id: 'data', title: 'Data & Storage', icon: 'cloud-outline', type: 'navigate' },
    ]
  },
  {
    title: 'Support',
    items: [
      { id: 'help', title: 'Help Center', icon: 'help-circle-outline', type: 'navigate' },
      { id: 'contact', title: 'Contact Support', icon: 'chatbubble-outline', type: 'navigate' },
      { id: 'feedback', title: 'Send Feedback', icon: 'chatbox-outline', type: 'navigate' },
    ]
  },
  {
    title: 'About',
    items: [
      { id: 'terms', title: 'Terms of Service', icon: 'document-text-outline', type: 'navigate' },
      { id: 'privacy_policy', title: 'Privacy Policy', icon: 'document-outline', type: 'navigate' },
      { id: 'version', title: 'App Version', icon: 'information-circle-outline', type: 'info', subtitle: '1.0.0' },
    ]
  }
];

export default function UserSettingsScreen() {
  const navigation = useNavigation();
  const [settings, setSettings] = useState({
    notifications: true,
    email_notifications: false,
    dark_mode: false,
  });

  const toggleSetting = (id) => {
    setSettings(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderSettingItem = (item) => {
    const settingValue = settings[item.id];
    
    return (
      <TouchableOpacity 
        key={item.id}
        style={styles.settingItem}
        onPress={() => {
          if (item.type === 'toggle') {
            toggleSetting(item.id);
          } else if (item.type === 'navigate') {
            // Navigation logic for each settings option
            switch (item.id) {
              case 'profile':
                navigation.navigate('EditProfile');
                break;
              case 'email':
                navigation.navigate('EmailPassword');
                break;
              case 'phone':
                navigation.navigate('PhoneNumber');
                break;
              case 'address':
                navigation.navigate('ShippingAddresses');
                break;
              case 'privacy':
                navigation.navigate('PrivacySettings');
                break;
              case 'security':
                navigation.navigate('Security');
                break;
              case 'data':
                navigation.navigate('DataStorage');
                break;
              case 'help':
                navigation.navigate('HelpCenter');
                break;
              case 'contact':
                navigation.navigate('ContactSupport');
                break;
              case 'feedback':
                navigation.navigate('SendFeedback');
                break;
              case 'terms':
                navigation.navigate('TermsOfService');
                break;
              case 'privacy_policy':
                navigation.navigate('PrivacyPolicy');
                break;
              // Add more as needed
              default:
                break;
            }
          }
        }}
      >
        <View style={styles.settingLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon} size={20} color={colors.textSecondary} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        
        {item.type === 'toggle' ? (
          <Switch
            value={settingValue}
            onValueChange={() => toggleSetting(item.id)}
            trackColor={{ false: colors.border, true: colors.primary + '40' }}
            thumbColor={settingValue ? colors.primary : colors.textSecondary}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your experience</Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {settingsSections.map((section, index) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}
        
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.s,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: scale(24),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: scale(14),
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
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    overflow: 'hidden',
    ...shadows.card,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.text,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error + '10',
    paddingVertical: spacing.m,
    borderRadius: radii.medium,
    marginTop: spacing.l,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginLeft: spacing.s,
  },
}); 