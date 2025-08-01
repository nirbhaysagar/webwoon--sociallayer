import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Animated, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii } from '../../constants/theme';
import HeaderWithMenu from '../SellerDashboard/components/HeaderWithMenu';
import { useNavigation } from '@react-navigation/native';
import NotificationDemo from '../../components/NotificationDemo';
import AuthTest from '../../components/AuthTest';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const SettingsItem = ({ icon, title, value, onValueChange, onPress, type = 'switch', highlighted = false }) => {
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

    const handlePress = () => {
      if (type === 'navigation' && onPress) {
        onPress();
      }
    };

    return (
        <AnimatedTouchableOpacity
            style={[
              styles.menuItem, 
              { transform: [{ scale: scaleValue }] },
              highlighted && styles.highlightedItem
            ]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
        >
            <Ionicons name={icon} size={24} color={colors.primary} style={styles.menuIcon} />
            <Text style={styles.menuText}>{title}</Text>
            {type === 'switch' ? (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.white}
                />
            ) : (
                <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
            )}
        </AnimatedTouchableOpacity>
    );
};

export default function UserSettingsScreen() {
  const navigation = useNavigation();
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    location: false,
    biometrics: true,
    autoSave: true,
  });

  // Modal states
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showQuickSettingsModal, setShowQuickSettingsModal] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'I love shopping and discovering new products!',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNavigation = (screen) => {
    switch (screen) {
      case 'EditProfile':
        setShowEditProfileModal(true);
        break;
      case 'ChangePassword':
        setShowChangePasswordModal(true);
        break;
      case 'PaymentMethods':
        navigation.navigate('PaymentMethodsScreen');
        break;
      case 'TermsOfService':
        setShowTermsModal(true);
        break;
      case 'PrivacyPolicy':
        setShowPrivacyModal(true);
        break;
      case 'HelpSupport':
        setShowHelpModal(true);
        break;
      default:
        Alert.alert('Coming Soon', 'This feature is under development!');
    }
  };

  const handleSaveProfile = () => {
    Alert.alert('Success', 'Profile updated successfully!');
    setShowEditProfileModal(false);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long!');
      return;
    }
    Alert.alert('Success', 'Password changed successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowChangePasswordModal(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Logged out successfully!');
          }
        },
      ]
    );
  };

  const renderEditProfileModal = () => (
    <Modal
      visible={showEditProfileModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowEditProfileModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity
              onPress={() => setShowEditProfileModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView}>
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.name}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
                placeholder="Enter your full name"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.email}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, email: text }))}
                placeholder="Enter your email"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.phone}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, phone: text }))}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Bio</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={profileData.bio}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, bio: text }))}
                placeholder="Tell us about yourself"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowEditProfileModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderChangePasswordModal = () => (
    <Modal
      visible={showChangePasswordModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowChangePasswordModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TouchableOpacity
              onPress={() => setShowChangePasswordModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView}>
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Current Password</Text>
              <TextInput
                style={styles.textInput}
                value={passwordData.currentPassword}
                onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
                placeholder="Enter current password"
                secureTextEntry
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>New Password</Text>
              <TextInput
                style={styles.textInput}
                value={passwordData.newPassword}
                onChangeText={(text) => setPasswordData(prev => ({ ...prev, newPassword: text }))}
                placeholder="Enter new password"
                secureTextEntry
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.textInput}
                value={passwordData.confirmPassword}
                onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmPassword: text }))}
                placeholder="Confirm new password"
                secureTextEntry
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowChangePasswordModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleChangePassword}
            >
              <Text style={styles.saveButtonText}>Change Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderTermsModal = () => (
    <Modal
      visible={showTermsModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowTermsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Terms of Service</Text>
            <TouchableOpacity
              onPress={() => setShowTermsModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView}>
            <Text style={styles.modalText}>
              <Text style={styles.modalTextBold}>Last updated: January 2024</Text>
              {'\n\n'}
              <Text style={styles.modalTextBold}>1. Acceptance of Terms</Text>
              {'\n'}
              By accessing and using SocialSpark, you accept and agree to be bound by the terms and provision of this agreement.
              {'\n\n'}
              <Text style={styles.modalTextBold}>2. Use License</Text>
              {'\n'}
              Permission is granted to temporarily download one copy of the app per device for personal, non-commercial transitory viewing only.
              {'\n\n'}
              <Text style={styles.modalTextBold}>3. User Account</Text>
              {'\n'}
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
              {'\n\n'}
              <Text style={styles.modalTextBold}>4. Privacy</Text>
              {'\n'}
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service.
              {'\n\n'}
              <Text style={styles.modalTextBold}>5. Modifications</Text>
              {'\n'}
              We reserve the right to modify these terms at any time. We will notify users of any material changes.
            </Text>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowTermsModal(false)}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                Alert.alert('Download', 'Terms of Service downloaded successfully!');
                setShowTermsModal(false);
              }}
            >
              <Text style={styles.saveButtonText}>Download PDF</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderPrivacyModal = () => (
    <Modal
      visible={showPrivacyModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowPrivacyModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <TouchableOpacity
              onPress={() => setShowPrivacyModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView}>
            <Text style={styles.modalText}>
              <Text style={styles.modalTextBold}>Last updated: January 2024</Text>
              {'\n\n'}
              <Text style={styles.modalTextBold}>1. Information We Collect</Text>
              {'\n'}
              We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us.
              {'\n\n'}
              <Text style={styles.modalTextBold}>2. How We Use Your Information</Text>
              {'\n'}
              We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
              {'\n\n'}
              <Text style={styles.modalTextBold}>3. Information Sharing</Text>
              {'\n'}
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.
              {'\n\n'}
              <Text style={styles.modalTextBold}>4. Data Security</Text>
              {'\n'}
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              {'\n\n'}
              <Text style={styles.modalTextBold}>5. Your Rights</Text>
              {'\n'}
              You have the right to access, update, or delete your personal information at any time through your account settings.
            </Text>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowPrivacyModal(false)}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                Alert.alert('Download', 'Privacy Policy downloaded successfully!');
                setShowPrivacyModal(false);
              }}
            >
              <Text style={styles.saveButtonText}>Download PDF</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderHelpModal = () => (
    <Modal
      visible={showHelpModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowHelpModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Help & Support</Text>
            <TouchableOpacity
              onPress={() => setShowHelpModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView}>
            <View style={styles.helpSection}>
              <Text style={styles.helpSectionTitle}>Quick Actions</Text>
              <TouchableOpacity style={styles.helpItem}>
                <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
                <Text style={styles.helpItemText}>Live Chat Support</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.helpItem}>
                <Ionicons name="mail-outline" size={20} color={colors.primary} />
                <Text style={styles.helpItemText}>Email Support</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.helpItem}>
                <Ionicons name="call-outline" size={20} color={colors.primary} />
                <Text style={styles.helpItemText}>Call Support</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.helpSection}>
              <Text style={styles.helpSectionTitle}>Common Issues</Text>
              <TouchableOpacity style={styles.helpItem}>
                <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
                <Text style={styles.helpItemText}>How to place an order</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.helpItem}>
                <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
                <Text style={styles.helpItemText}>Payment issues</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.helpItem}>
                <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
                <Text style={styles.helpItemText}>Shipping & delivery</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowHelpModal(false)}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                Alert.alert('Contact', 'Opening contact support...');
                setShowHelpModal(false);
              }}
            >
              <Text style={styles.saveButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderQuickSettingsModal = () => (
    <Modal
      visible={showQuickSettingsModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowQuickSettingsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.quickSettingsContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Quick Settings</Text>
            <TouchableOpacity
              onPress={() => setShowQuickSettingsModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.quickSettingsGrid}>
            <TouchableOpacity style={styles.quickSettingItem}>
              <Ionicons name="notifications-outline" size={24} color={colors.primary} />
              <Text style={styles.quickSettingText}>Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickSettingItem}>
              <Ionicons name="moon-outline" size={24} color={colors.primary} />
              <Text style={styles.quickSettingText}>Dark Mode</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickSettingItem}>
              <Ionicons name="location-outline" size={24} color={colors.primary} />
              <Text style={styles.quickSettingText}>Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickSettingItem}>
              <Ionicons name="finger-print-outline" size={24} color={colors.primary} />
              <Text style={styles.quickSettingText}>Biometric</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <HeaderWithMenu />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingsItem 
            icon="person-outline" 
            title="Edit Profile" 
            type="navigation" 
            onPress={() => handleNavigation('EditProfile')}
          />
          <SettingsItem 
            icon="lock-closed-outline" 
            title="Change Password" 
            type="navigation" 
            onPress={() => handleNavigation('ChangePassword')}
          />
          <SettingsItem 
            icon="card-outline" 
            title="Payment Methods" 
            type="navigation" 
            onPress={() => handleNavigation('PaymentMethods')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingsItem 
            icon="notifications-outline" 
            title="Push Notifications" 
            value={settings.notifications} 
            onValueChange={() => toggleSetting('notifications')}
          />
          <SettingsItem 
            icon="moon-outline" 
            title="Dark Mode" 
            value={settings.darkMode} 
            onValueChange={() => toggleSetting('darkMode')}
          />
          <SettingsItem 
            icon="location-outline" 
            title="Location Services" 
            value={settings.location} 
            onValueChange={() => toggleSetting('location')}
          />
          <SettingsItem 
            icon="finger-print-outline" 
            title="Biometric Login" 
            value={settings.biometrics} 
            onValueChange={() => toggleSetting('biometrics')}
          />
          <SettingsItem 
            icon="save-outline" 
            title="Auto Save" 
            value={settings.autoSave} 
            onValueChange={() => toggleSetting('autoSave')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <SettingsItem 
            icon="document-text-outline" 
            title="Terms of Service" 
            type="navigation" 
            onPress={() => handleNavigation('TermsOfService')}
          />
          <SettingsItem 
            icon="shield-checkmark-outline" 
            title="Privacy Policy" 
            type="navigation" 
            onPress={() => handleNavigation('PrivacyPolicy')}
          />
          <SettingsItem 
            icon="help-circle-outline" 
            title="Help & Support" 
            type="navigation" 
            onPress={() => handleNavigation('HelpSupport')}
            highlighted={true}
          />
        </View>
        
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.white} />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Notification Demo Section */}
      <View style={styles.demoSection}>
        <NotificationDemo />
      </View>

      {/* Auth Test Section */}
      <View style={styles.demoSection}>
        <AuthTest />
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowQuickSettingsModal(true)}
      >
        <Ionicons name="settings-outline" size={24} color={colors.white} />
      </TouchableOpacity>

      {renderEditProfileModal()}
      {renderChangePasswordModal()}
      {renderTermsModal()}
      {renderPrivacyModal()}
      {renderHelpModal()}
      {renderQuickSettingsModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.l,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: 'bold',
    color: colors.text,
    marginVertical: spacing.l,
  },
  section: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: typography.subtitle,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.m,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.m,
    padding: spacing.m,
    marginBottom: spacing.s,
  },
  highlightedItem: {
    borderWidth: 2,
    borderColor: colors.discount,
  },
  menuIcon: {
    marginRight: spacing.m,
  },
  menuText: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
  },
  logoutButton: {
    backgroundColor: colors.error,
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.m,
    borderRadius: radii.medium,
  },
  logoutButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    marginLeft: spacing.s,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: radii.l,
    width: '90%',
    maxHeight: '80%',
    padding: spacing.l,
  },
  quickSettingsContent: {
    backgroundColor: colors.white,
    borderRadius: radii.l,
    width: '80%',
    padding: spacing.l,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
    paddingBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.h2,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: spacing.s,
  },
  modalScrollView: {
    flex: 1,
  },
  formSection: {
    marginBottom: spacing.m,
  },
  formLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.s,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.s,
    padding: spacing.m,
    fontSize: typography.body,
    color: colors.text,
    backgroundColor: colors.background,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.l,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.border,
    padding: spacing.m,
    borderRadius: radii.s,
    marginRight: spacing.s,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: spacing.m,
    borderRadius: radii.s,
    marginLeft: spacing.s,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  // Help modal styles
  helpSection: {
    marginBottom: spacing.l,
  },
  helpSectionTitle: {
    fontSize: typography.subtitle,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.m,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.m,
    borderRadius: radii.s,
    marginBottom: spacing.s,
  },
  helpItemText: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
    marginLeft: spacing.m,
  },
  // Quick settings styles
  quickSettingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickSettingItem: {
    width: '48%',
    backgroundColor: colors.background,
    padding: spacing.m,
    borderRadius: radii.s,
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  quickSettingText: {
    fontSize: typography.caption,
    color: colors.text,
    marginTop: spacing.s,
    textAlign: 'center',
  },
  // Modal text styles
  modalText: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  modalTextBold: {
    fontWeight: 'bold',
  },
  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  demoSection: {
    marginTop: spacing.l,
    paddingHorizontal: spacing.l,
  },
});
