import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, SafeAreaView, Animated, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from '../SellerDashboard/components/HeaderWithMenu';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import Button from '../../components/common/Button';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

// Use real user data from authentication context
const useRealUserData = () => {
  const { user, profile } = useAuth();
  
  return {
    name: profile?.full_name || user?.email?.split('@')[0] || 'User',
    email: user?.email || 'user@email.com',
    phone: profile?.phone || '+1 (555) 123-4567',
    avatar: profile?.avatar_url || 'https://randomuser.me/api/portraits/women/32.jpg',
    savedItems: 24, // These could be fetched from real data later
    orders: 8,
    following: 12,
    followers: 156,
    totalSpent: 1247.50,
    memberSince: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'March 2023',
    level: profile?.stats?.level || 'Bronze',
    points: profile?.stats?.points || 2840,
  };
};

const getProfileSections = (userData) => [
  {
    title: 'Account',
    items: [
      { icon: 'person-outline', label: 'Personal Information', action: 'Edit' },
      { icon: 'location-outline', label: 'Shipping Addresses', action: 'Manage' },
      { icon: 'card-outline', label: 'Payment Methods', action: 'Manage' },
      { icon: 'notifications-outline', label: 'Notification Settings', action: 'Configure' },
    ],
  },
  {
    title: 'Shopping',
    items: [
      { icon: 'heart-outline', label: 'Saved Items', action: 'View', count: userData.savedItems },
      { icon: 'people-outline', label: 'Following', action: 'View', count: userData.following },
      { icon: 'receipt-outline', label: 'Order History', action: 'View', count: userData.orders },
      { icon: 'star-outline', label: 'Reviews & Ratings', action: 'View' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help-circle-outline', label: 'Help Center', action: 'Get Help' },
      { icon: 'chatbubble-outline', label: 'Contact Support', action: 'Contact' },
      { icon: 'document-text-outline', label: 'Terms of Service', action: 'Read' },
      { icon: 'shield-checkmark-outline', label: 'Privacy Policy', action: 'Read' },
    ],
  },
];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const MenuItem = ({ icon, label, action, count, onPress }) => {
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
            style={[styles.menuItem, { transform: [{ scale: scaleValue }] }]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
        >
            <View style={styles.menuItemLeft}>
                <Ionicons name={icon} size={24} color={colors.textSecondary} style={styles.menuIcon} />
                <Text style={styles.menuLabel}>{label}</Text>
            </View>
            <View style={styles.menuItemRight}>
                {count && (
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{count}</Text>
                </View>
                )}
                <Text style={styles.menuAction}>{action}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
        </AnimatedTouchableOpacity>
    );
};

const StatCard = ({ icon, title, value, subtitle }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={24} color={colors.primary} style={styles.statIcon} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
  </View>
);

export default function UserProfileScreen() {
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Use real user data
  const userData = useRealUserData();
  
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Update edit form when user data changes
  React.useEffect(() => {
    setEditForm({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
    });
  }, [userData]);

  const handleNavigation = (screen, params = {}) => {
    try {
      navigation.navigate(screen, params);
    } catch (error) {
      Alert.alert('Navigation Error', `Screen ${screen} not found. This feature is coming soon!`);
    }
  };

  const handleMenuItemPress = (label) => {
    switch (label) {
      case 'Personal Information':
        handleEditPress();
        break;
      case 'Shipping Addresses':
        handleNavigation('ShippingAddressesScreen');
        break;
      case 'Payment Methods':
        handleNavigation('PaymentMethodsScreen');
        break;
      case 'Notification Settings':
        handleNavigation('NotificationSettingsScreen');
        break;
      case 'Saved Items':
        handleNavigation('UserSavedScreen');
        break;
      case 'Following':
        handleNavigation('UserFollowingScreen');
        break;
      case 'Order History':
        handleNavigation('UserOrdersScreen');
        break;
      case 'Reviews & Ratings':
        Alert.alert('Coming Soon', 'Reviews & Ratings feature is under development!');
        break;
      case 'Help Center':
        handleNavigation('UserHelpScreen');
        break;
      case 'Contact Support':
        Alert.alert('Coming Soon', 'Contact Support feature is under development!');
        break;
      case 'Terms of Service':
        Alert.alert('Coming Soon', 'Terms of Service feature is under development!');
        break;
      case 'Privacy Policy':
        Alert.alert('Coming Soon', 'Privacy Policy feature is under development!');
        break;
      default:
        Alert.alert('Coming Soon', 'This feature is under development!');
    }
  };

  const handleEditPress = () => {
    setEditForm({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
    });
    setShowEditModal(true);
  };

  const handleSaveChanges = () => {
    // Note: In a real app, this would update the user profile in the database
    // For now, we'll just show a success message
    setShowEditModal(false);
    Alert.alert('Success', 'Profile updated successfully! Note: Changes will be saved to your profile.');
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditForm({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
    });
  };

  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      transparent
      onRequestClose={handleCancelEdit}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleCancelEdit} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.editForm} showsVerticalScrollIndicator={false}>
            {/* Profile Image */}
            <View style={styles.avatarSection}>
              <Image source={{ uri: userData.avatar }} style={styles.editAvatar} />
              <TouchableOpacity style={styles.changeAvatarButton}>
                <Ionicons name="camera-outline" size={20} color={colors.primary} />
                <Text style={styles.changeAvatarText}>Change Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.name}
                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.formLabel}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.email}
                onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.formLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.phone}
                onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithMenu />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: userData.avatar }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{userData.name}</Text>
              <View style={styles.levelBadge}>
                <Ionicons name="star" size={12} color={colors.discount} />
                <Text style={styles.levelText}>{userData.level}</Text>
              </View>
            </View>
            <Text style={styles.userEmail}>{userData.email}</Text>
            <Text style={styles.userPhone}>{userData.phone}</Text>
            <Text style={styles.memberSince}>Member since {userData.memberSince}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
            <Ionicons name="pencil-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Activity</Text>
          <View style={styles.statsGrid}>
            <StatCard 
              icon="heart-outline" 
              title="Saved Items" 
              value={userData.savedItems} 
            />
            <StatCard 
              icon="receipt-outline" 
              title="Orders" 
              value={userData.orders} 
            />
            <StatCard 
              icon="people-outline" 
              title="Following" 
              value={userData.following} 
            />
            <StatCard 
              icon="people-circle-outline" 
              title="Followers" 
              value={userData.followers} 
            />
          </View>
        </View>

        {/* Rewards Section */}
        <View style={styles.rewardsSection}>
          <View style={styles.rewardsHeader}>
            <Text style={styles.sectionTitle}>Rewards & Points</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.rewardsCard}>
            <View style={styles.pointsInfo}>
              <Text style={styles.pointsValue}>{userData.points}</Text>
              <Text style={styles.pointsLabel}>Points</Text>
            </View>
            <View style={styles.rewardsProgress}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '75%' }]} />
              </View>
              <Text style={styles.progressText}>75% to next level</Text>
            </View>
          </View>
        </View>

        {/* Profile Sections */}
        {getProfileSections(userData).map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <MenuItem
                key={itemIndex}
                icon={item.icon}
                label={item.label}
                action={item.action}
                count={item.count}
                onPress={() => handleMenuItemPress(item.label)}
              />
            ))}
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                'Sign Out',
                'Are you sure you want to sign out?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Sign Out', 
                    style: 'destructive',
                    onPress: () => {
                      // Handle sign out logic here
                      Alert.alert('Success', 'You have been signed out successfully!');
                    }
                  },
                ]
              );
            }}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.discount} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      {renderEditModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.xxl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginTop: spacing.m,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: colors.text,
    marginRight: spacing.s,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.discount + '20',
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: 12,
  },
  levelText: {
    fontSize: scale(12),
    fontWeight: 'bold',
    color: colors.discount,
    marginLeft: 2,
  },
  userEmail: {
    fontSize: scale(14),
    color: colors.textSecondary,
  },
  userPhone: {
    fontSize: scale(14),
    color: colors.textSecondary,
    marginTop: 2,
  },
  memberSince: {
    fontSize: scale(12),
    color: colors.textSecondary,
    marginTop: 4,
  },
  editButton: {
    padding: spacing.s,
    backgroundColor: 'transparent',
  },
  statsSection: {
    marginBottom: spacing.l,
  },
  rewardsSection: {
    marginBottom: spacing.l,
  },
  rewardsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: scale(14),
    color: colors.primary,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  rewardsCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    ...shadows.card,
  },
  pointsInfo: {
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  pointsValue: {
    fontSize: scale(32),
    fontWeight: 'bold',
    color: colors.primary,
  },
  pointsLabel: {
    fontSize: scale(14),
    color: colors.textSecondary,
    marginTop: 2,
  },
  rewardsProgress: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: spacing.s,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: scale(12),
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    alignItems: 'center',
    marginBottom: spacing.s,
    ...shadows.card,
  },
  statIcon: {
    marginBottom: spacing.s,
  },
  statValue: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  statTitle: {
    fontSize: scale(12),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: scale(10),
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: scale(18),
    fontWeight: '500',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: 12,
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
    marginRight: spacing.m,
  },
  menuLabel: {
    fontSize: scale(16),
    color: colors.text,
    fontWeight: '500',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: spacing.s,
  },
  countText: {
    fontSize: scale(12),
    fontWeight: 'bold',
    color: colors.text,
  },
  menuAction: {
    fontSize: scale(14),
    color: colors.textSecondary,
    marginRight: spacing.s,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginTop: spacing.l,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  logoutIcon: {
    marginRight: spacing.s,
  },
  logoutText: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: colors.discount,
  },
  // Edit Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: radii.large,
    width: '90%',
    maxHeight: '80%',
    ...shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: scale(20),
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: spacing.s,
  },
  editForm: {
    padding: spacing.l,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  editAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.m,
  },
  changeAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.s,
  },
  changeAvatarText: {
    fontSize: scale(14),
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  formSection: {
    marginBottom: spacing.l,
  },
  formLabel: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.s,
    marginTop: spacing.m,
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: radii.medium,
    padding: spacing.m,
    fontSize: scale(16),
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.s,
  },
  modalActions: {
    flexDirection: 'row',
    padding: spacing.l,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginRight: spacing.s,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginLeft: spacing.s,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
  },
});
