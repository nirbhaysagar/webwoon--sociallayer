import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, TextInput, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import BackButton from '../../components/BackButton';

const mockUser = {
  username: '@janedoe',
  name: 'Jane Doe',
  bio: 'Fashion enthusiast and lifestyle creator. Sharing my passion for style and beauty! ✨',
  website: 'www.janedoe.com',
  location: 'New York, NY',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=400&q=80',
  posts: 156,
  followers: 2847,
  following: 892,
  products: 89,
  sales: 1247,
  revenue: 45600,
  email: 'jane.doe@email.com',
  phone: '+1 (555) 123-4567',
};

export default function UserProfileScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(mockUser);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    username: user.username,
    bio: user.bio,
    website: user.website,
    location: user.location,
    email: user.email,
    phone: user.phone,
  });

  const handleEditProfile = () => {
    setEditForm({
      name: user.name,
      username: user.username,
      bio: user.bio,
      website: user.website,
      location: user.location,
      email: user.email,
      phone: user.phone,
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = () => {
    // Validate required fields
    if (!editForm.name.trim() || !editForm.username.trim()) {
      Alert.alert('Error', 'Name and username are required');
      return;
    }

    // Update user data
    setUser({
      ...user,
      ...editForm,
    });

    setShowEditModal(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
  };

  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancelEdit}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCancelEdit} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Modal Body */}
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Profile Picture Section */}
            <View style={styles.avatarSection}>
              <Image source={{ uri: user.avatar }} style={styles.editAvatar} />
              <TouchableOpacity style={styles.changeAvatarButton}>
                <Ionicons name="camera" size={20} color={colors.white} />
                <Text style={styles.changeAvatarText}>Change Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.name}
                  onChangeText={(text) => setEditForm({...editForm, name: text})}
                  placeholder="Enter your full name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.username}
                  onChangeText={(text) => setEditForm({...editForm, username: text})}
                  placeholder="@username"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={editForm.bio}
                  onChangeText={(text) => setEditForm({...editForm, bio: text})}
                  placeholder="Tell us about yourself..."
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Website</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.website}
                  onChangeText={(text) => setEditForm({...editForm, website: text})}
                  placeholder="https://yourwebsite.com"
                  keyboardType="url"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.location}
                  onChangeText={(text) => setEditForm({...editForm, location: text})}
                  placeholder="City, State"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.email}
                  onChangeText={(text) => setEditForm({...editForm, email: text})}
                  placeholder="your.email@example.com"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm({...editForm, phone: text})}
                  placeholder="+1 (555) 123-4567"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account</Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Ionicons name="pencil" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.username}>{user.username}</Text>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
            </View>
            <Text style={styles.fullName}>{user.name}</Text>
            <Text style={styles.bio}>{user.bio}</Text>
            <Text style={styles.website}>{user.website}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.location}>{user.location}</Text>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.posts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.followers.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.products}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
        </View>

        {/* Revenue Stats */}
        <View style={styles.revenueContainer}>
          <View style={styles.revenueItem}>
            <Text style={styles.revenueNumber}>{user.sales.toLocaleString()}</Text>
            <Text style={styles.revenueLabel}>Sales</Text>
          </View>
          <View style={styles.revenueItem}>
            <Text style={styles.revenueNumber}>${user.revenue.toLocaleString()}</Text>
            <Text style={styles.revenueLabel}>Revenue</Text>
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="settings-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Content Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Ionicons name="grid-outline" size={20} color={colors.primary} />
            <Text style={[styles.tabText, styles.activeTabText]}>Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="bag-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.tabText}>Products</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="bookmark-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.tabText}>Saved</Text>
          </TouchableOpacity>
        </View>

        {/* Posts Grid */}
        <View style={styles.postsGrid}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <TouchableOpacity key={item} style={styles.postItem}>
              <Image 
                source={{ uri: `https://images.unsplash.com/photo-${1500000000000 + item}?auto=format&fit=crop&w=300&q=80` }} 
                style={styles.postImage} 
              />
              <View style={styles.postOverlay}>
                <View style={styles.postStats}>
                  <Ionicons name="heart" size={12} color={colors.white} />
                  <Text style={styles.postStatText}>{Math.floor(Math.random() * 500) + 100}</Text>
                  <Ionicons name="chatbubble" size={12} color={colors.white} />
                  <Text style={styles.postStatText}>{Math.floor(Math.random() * 50) + 5}</Text>
                </View>
                {Math.random() > 0.5 && (
                  <Ionicons name="bag" size={12} color={colors.primary} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {renderEditModal()}
    </SafeAreaView>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  editButton: {
    padding: spacing.s,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    padding: spacing.l,
    backgroundColor: colors.card,
    margin: spacing.m,
    borderRadius: radii.medium,
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
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: spacing.xs,
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  bio: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  website: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginHorizontal: spacing.m,
    marginBottom: spacing.m,
    ...shadows.card,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  revenueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginHorizontal: spacing.m,
    marginBottom: spacing.m,
    ...shadows.card,
  },
  revenueItem: {
    alignItems: 'center',
  },
  revenueNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  revenueLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  editProfileButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.medium,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    marginHorizontal: spacing.m,
    marginBottom: spacing.m,
  },
  editProfileText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.m,
  },
  actionButton: {
    padding: spacing.m,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.s,
    marginHorizontal: spacing.m,
    marginBottom: spacing.l,
    ...shadows.card,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
  },
  activeTab: {
    backgroundColor: colors.primaryLight,
    borderRadius: radii.medium,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.m,
  },
  postItem: {
    width: '48%',
    aspectRatio: 1,
    marginVertical: spacing.s,
    borderRadius: radii.small,
    overflow: 'hidden',
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
    borderRadius: radii.small,
  },
  postOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: spacing.s,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postStatText: {
    color: colors.white,
    fontSize: 12,
    marginLeft: spacing.xs,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.white,
    borderRadius: radii.large,
    overflow: 'hidden',
    ...shadows.card,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelButton: {
    padding: spacing.s,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  saveButton: {
    padding: spacing.s,
  },
  saveButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: spacing.m,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  editAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.s,
  },
  changeAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.medium,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.m,
  },
  changeAvatarText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
  formSection: {
    marginTop: spacing.s,
  },
  inputGroup: {
    marginBottom: spacing.m,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  textInput: {
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radii.small,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 80,
    paddingTop: spacing.s,
    textAlignVertical: 'top',
  },
}); 