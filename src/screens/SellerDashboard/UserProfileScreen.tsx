import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from './components/HeaderWithMenu';
import { useNavigation } from '@react-navigation/native';

const mockUser = {
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  name: 'Alex Johnson',
  email: 'alex.johnson@email.com',
  phone: '+1 555-1234',
  role: 'Seller',
  joinDate: 'January 2024',
  location: 'New York, NY',
  bio: 'Passionate entrepreneur building the future of e-commerce.',
};

const profileSections = [
  {
    title: 'Personal Information',
    items: [
      { icon: 'person-outline', label: 'Full Name', value: mockUser.name, editable: true },
      { icon: 'mail-outline', label: 'Email', value: mockUser.email, editable: true },
      { icon: 'call-outline', label: 'Phone', value: mockUser.phone, editable: true },
      { icon: 'location-outline', label: 'Location', value: mockUser.location, editable: true },
    ],
  },
  {
    title: 'Account',
    items: [
      { icon: 'shield-outline', label: 'Role', value: mockUser.role, editable: false },
      { icon: 'calendar-outline', label: 'Member Since', value: mockUser.joinDate, editable: false },
      { icon: 'key-outline', label: 'Change Password', value: 'Update', editable: true, action: 'changePassword' },
      { icon: 'trash-outline', label: 'Delete Account', value: 'Permanent', editable: true, action: 'deleteAccount', danger: true },
    ],
  },
];

export default function UserProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(mockUser);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    console.log('Edit profile');
  };

  const handleChangePassword = () => {
    // Navigate to change password screen
    console.log('Change password');
  };

  const handleDeleteAccount = () => {
    // Show delete account confirmation
    console.log('Delete account');
  };

  const handleSectionAction = (action: string) => {
    switch (action) {
      case 'changePassword':
        handleChangePassword();
        break;
      case 'deleteAccount':
        handleDeleteAccount();
        break;
      default:
        break;
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
        <Text style={styles.screenTitle}>Profile</Text>
        
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{profile.name}</Text>
            <Text style={styles.userEmail}>{profile.email}</Text>
            <Text style={styles.userRole}>{profile.role}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Ionicons name="pencil-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Bio Section */}
        <View style={styles.bioSection}>
          <Text style={styles.bioTitle}>About</Text>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </View>

        {/* Notification Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="mail-outline" size={24} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>Email Notifications</Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ true: colors.primary, false: colors.disabled }}
              thumbColor={emailNotifications ? colors.primary : colors.disabled}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={24} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ true: colors.primary, false: colors.disabled }}
              thumbColor={pushNotifications ? colors.primary : colors.disabled}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield-checkmark-outline" size={24} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
            </View>
            <Switch
              value={twoFactorAuth}
              onValueChange={setTwoFactorAuth}
              trackColor={{ true: colors.primary, false: colors.disabled }}
              thumbColor={twoFactorAuth ? colors.primary : colors.disabled}
            />
          </View>
        </View>

        {/* Profile Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity 
                key={itemIndex} 
                style={styles.menuItem}
                onPress={() => item.action && handleSectionAction(item.action)}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons 
                    name={item.icon} 
                    size={24} 
                    color={item.danger ? colors.error : colors.textSecondary} 
                    style={styles.menuIcon} 
                  />
                  <Text style={[styles.menuLabel, item.danger && styles.dangerText]}>{item.label}</Text>
                </View>
                <View style={styles.menuItemRight}>
                  <Text style={[styles.menuValue, item.danger && styles.dangerText]}>{item.value}</Text>
                  {item.editable && (
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color={item.danger ? colors.error : colors.textSecondary} 
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Account Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="download-outline" size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>Export Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={[styles.actionButtonText, styles.dangerText]}>Sign Out</Text>
          </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.l,
    marginTop: spacing.s,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.l,
    ...shadows.card,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: spacing.m,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  editButton: {
    padding: spacing.s,
    backgroundColor: colors.background,
    borderRadius: radii.circle,
    ...shadows.card,
  },
  bioSection: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.l,
    ...shadows.card,
  },
  bioTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.s,
  },
  bioText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  settingsSection: {
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
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.s,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'monospace',
    color: colors.text,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuValue: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: spacing.s,
    fontFamily: 'monospace',
  },
  dangerText: {
    color: colors.error,
  },
  actionsSection: {
    marginTop: spacing.l,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.primary,
    marginLeft: spacing.s,
  },
  dangerButton: {
    backgroundColor: colors.error + '10',
  },
}); 