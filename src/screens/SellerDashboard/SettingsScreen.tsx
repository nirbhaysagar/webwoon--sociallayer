import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from './components/HeaderWithMenu';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../../lib/scale';

const settingsSections = [
  {
    title: 'Account',
    items: [
      { icon: 'person-outline', label: 'Personal Information', action: 'Edit', route: 'PersonalInfoScreen' },
      { icon: 'business-outline', label: 'Business Information', action: 'Edit', route: 'BusinessInfoScreen' },
      { icon: 'card-outline', label: 'Payout Settings', action: 'Manage', route: 'PayoutSettingsScreen' },
      { icon: 'shield-outline', label: 'Security', action: 'Configure', route: 'SecurityScreen' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: 'notifications-outline', label: 'Notifications', action: 'Configure', route: 'NotificationPreferencesScreen' },
      { icon: 'language-outline', label: 'Language', action: 'English', route: 'LanguageScreen' },
      { icon: 'color-palette-outline', label: 'Theme', action: 'Light', route: 'ThemeScreen' },
      { icon: 'time-outline', label: 'Time Zone', action: 'UTC-5', route: 'TimezoneScreen' },
    ],
  },
  {
    title: 'Store',
    items: [
      { icon: 'storefront-outline', label: 'Store Settings', action: 'Configure', route: 'StoreSettingsScreen' },
      { icon: 'people-outline', label: 'Team Management', action: 'Manage', route: 'RoleManagementScreen' },
      { icon: 'analytics-outline', label: 'Analytics Settings', action: 'Configure', route: 'AnalyticsSettingsScreen' },
      { icon: 'link-outline', label: 'Integrations', action: 'Manage', route: 'IntegrationsScreen' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help-circle-outline', label: 'Help Center', action: 'Get Help', route: 'HelpSupportScreen' },
      { icon: 'chatbubble-outline', label: 'Contact Support', action: 'Contact', route: 'ContactSupportScreen' },
      { icon: 'document-text-outline', label: 'Terms of Service', action: 'Read', route: 'TermsScreen' },
      { icon: 'shield-checkmark-outline', label: 'Privacy Policy', action: 'Read', route: 'PrivacyScreen' },
    ],
  },
];

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const navigateToSection = (route: string) => {
    if (navigation.canGoBack()) {
      navigation.navigate(route as never);
    } else {
      // Fallback for screens that might not exist yet
      console.log(`Navigate to ${route}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithMenu />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.screenTitle}>Settings</Text>
        
        {/* Quick Toggles */}
        <View style={styles.toggleSection}>
          <Text style={styles.sectionTitle}>Quick Settings</Text>
          
          <View style={styles.toggleItem}>
            <View style={styles.toggleLeft}>
              <Ionicons name="moon-outline" size={24} color={colors.textSecondary} />
              <Text style={styles.toggleLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ true: colors.primary, false: colors.disabled }}
              thumbColor={darkMode ? colors.primary : colors.disabled}
            />
          </View>
          
          <View style={styles.toggleItem}>
            <View style={styles.toggleLeft}>
              <Ionicons name="notifications-outline" size={24} color={colors.textSecondary} />
              <Text style={styles.toggleLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ true: colors.primary, false: colors.disabled }}
              thumbColor={pushNotifications ? colors.primary : colors.disabled}
            />
          </View>
          
          <View style={styles.toggleItem}>
            <View style={styles.toggleLeft}>
              <Ionicons name="mail-outline" size={24} color={colors.textSecondary} />
              <Text style={styles.toggleLabel}>Email Notifications</Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ true: colors.primary, false: colors.disabled }}
              thumbColor={emailNotifications ? colors.primary : colors.disabled}
            />
          </View>
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity 
                key={itemIndex} 
                style={styles.menuItem}
                onPress={() => navigateToSection(item.route)}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name={item.icon} size={24} color={colors.textSecondary} style={styles.menuIcon} />
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <View style={styles.menuItemRight}>
                  <Text style={styles.menuAction}>{item.action}</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* App Info */}
        <View style={styles.appInfoSection}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.appInfoItem}>
            <Text style={styles.appInfoLabel}>Version</Text>
            <Text style={styles.appInfoValue}>1.0.0</Text>
          </View>
          <View style={styles.appInfoItem}>
            <Text style={styles.appInfoLabel}>Build</Text>
            <Text style={styles.appInfoValue}>2024.1.1</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.m,
    paddingTop: spacing.s,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  screenTitle: {
    fontSize: scale(28),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.l,
    marginTop: spacing.s,
  },
  toggleSection: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.l,
    ...shadows.card,
  },
  section: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.s,
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: scale(16),
    fontWeight: '500',
    fontFamily: 'monospace',
    color: colors.text,
    marginLeft: spacing.s,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: spacing.s,
  },
  menuLabel: {
    fontSize: scale(16),
    fontWeight: '500',
    fontFamily: 'monospace',
    color: colors.text,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuAction: {
    fontSize: scale(14),
    color: colors.textSecondary,
    marginRight: spacing.s,
    fontFamily: 'monospace',
  },
  appInfoSection: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginTop: spacing.l,
    ...shadows.card,
  },
  appInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  appInfoLabel: {
    fontSize: scale(16),
    fontWeight: '500',
    fontFamily: 'monospace',
    color: colors.text,
  },
  appInfoValue: {
    fontSize: scale(14),
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
});