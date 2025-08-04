import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import BackButton from '../../components/BackButton';
import { supabase } from '../../config/supabase';
import userProfileService from '../../services/userProfileService';

interface UserProfile {
  id: string;
  username: string;
  name: string;
  bio: string;
  website: string;
  location: string;
  avatar: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  interests: string[];
}

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>({
    id: 'user-1',
    username: '@janedoe',
    name: 'Jane Doe',
    bio: 'Fashion enthusiast and lifestyle creator. Sharing my passion for style and beauty! ✨',
    website: 'www.janedoe.com',
    location: 'New York, NY',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=400&q=80',
    email: 'jane.doe@email.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-05-15',
    gender: 'Female',
    interests: ['Fashion', 'Beauty', 'Lifestyle', 'Travel'],
  });

  const [formData, setFormData] = useState({
    username: profile.username,
    name: profile.name,
    bio: profile.bio,
    website: profile.website,
    location: profile.location,
    email: profile.email,
    phone: profile.phone,
    dateOfBirth: profile.dateOfBirth,
    gender: profile.gender,
    interests: profile.interests,
  });

  const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
  const interestOptions = [
    'Fashion', 'Beauty', 'Lifestyle', 'Travel', 'Food', 'Technology', 
    'Fitness', 'Art', 'Music', 'Books', 'Gaming', 'Sports', 'Photography'
  ];

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userProfile = await userProfileService.getCurrentUserProfile();
      if (userProfile) {
        setProfile({
          id: userProfile.id,
          username: userProfile.username || '@janedoe',
          name: userProfile.full_name || 'Jane Doe',
          bio: userProfile.bio || '',
          website: userProfile.website || '',
          location: userProfile.location || '',
          avatar: userProfile.avatar_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=400&q=80',
          email: userProfile.email || 'jane.doe@email.com',
          phone: userProfile.phone || '+1 (555) 123-4567',
          dateOfBirth: userProfile.date_of_birth || '1990-05-15',
          gender: userProfile.gender || 'Female',
          interests: userProfile.interests || ['Fashion', 'Beauty', 'Lifestyle', 'Travel'],
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  useEffect(() => {
    setFormData({
      username: profile.username,
      name: profile.name,
      bio: profile.bio,
      website: profile.website,
      location: profile.location,
      email: profile.email,
      phone: profile.phone,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender,
      interests: profile.interests,
    });
  }, [profile]);

  const handleSave = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.name.trim() || !formData.username.trim()) {
        Alert.alert('Error', 'Name and username are required');
        return;
      }

      if (!formData.email.trim()) {
        Alert.alert('Error', 'Email is required');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }

      // Check username availability
      const isUsernameAvailable = await userProfileService.isUsernameAvailable(formData.username, profile.id);
      if (!isUsernameAvailable) {
        Alert.alert('Error', 'Username is already taken');
        return;
      }

      // Update profile using Supabase service
      const updateData = {
        full_name: formData.name,
        username: formData.username,
        bio: formData.bio,
        website: formData.website,
        location: formData.location,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender.toLowerCase() as any,
        interests: formData.interests,
      };

      const success = await userProfileService.updateProfile(updateData);

      if (success) {
        // Update local state
        setProfile(prev => ({
          ...prev,
          ...formData,
        }));

        Alert.alert('Success', 'Profile updated successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }

    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeAvatar = async () => {
    try {
      setLoading(true);
      
      // TODO: Implement image picker and upload
      // For now, we'll simulate the process
      const newAvatarUrl = await userProfileService.uploadProfileImage(profile.avatar);
      
      if (newAvatarUrl) {
        const success = await userProfileService.updateProfile({
          avatar_url: newAvatarUrl
        });
        
        if (success) {
          setProfile(prev => ({ ...prev, avatar: newAvatarUrl }));
          Alert.alert('Success', 'Profile picture updated successfully!');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile picture');
    } finally {
      setLoading(false);
      setShowAvatarModal(false);
    }
  };

  const handleSelectGender = (gender: string) => {
    setFormData(prev => ({ ...prev, gender }));
    setShowGenderModal(false);
  };

  const handleToggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const renderAvatarModal = () => (
    <Modal
      visible={showAvatarModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAvatarModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAvatarModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Change Profile Picture</Text>
            <TouchableOpacity onPress={handleChangeAvatar}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.avatarOptions}>
            <TouchableOpacity style={styles.avatarOption}>
              <Ionicons name="camera" size={24} color={colors.primary} />
              <Text style={styles.avatarOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarOption}>
              <Ionicons name="images" size={24} color={colors.primary} />
              <Text style={styles.avatarOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarOption}>
              <Ionicons name="person" size={24} color={colors.primary} />
              <Text style={styles.avatarOptionText}>Use Default Avatar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderGenderModal = () => (
    <Modal
      visible={showGenderModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowGenderModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowGenderModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Gender</Text>
            <TouchableOpacity onPress={() => setShowGenderModal(false)}>
              <Text style={styles.saveButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            {genderOptions.map((gender) => (
              <TouchableOpacity
                key={gender}
                style={styles.optionItem}
                onPress={() => handleSelectGender(gender)}
              >
                <Text style={styles.optionText}>{gender}</Text>
                {formData.gender === gender && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderInterestsModal = () => (
    <Modal
      visible={showInterestsModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowInterestsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowInterestsModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Interests</Text>
            <TouchableOpacity onPress={() => setShowInterestsModal(false)}>
              <Text style={styles.saveButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            {interestOptions.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={styles.optionItem}
                onPress={() => handleToggleInterest(interest)}
              >
                <Text style={styles.optionText}>{interest}</Text>
                {formData.interests.includes(interest) && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Edit Profile</Text>
          <Text style={styles.subtitle}>Update your personal information</Text>
        </View>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={[styles.saveButtonText, loading && styles.saveButtonTextDisabled]}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Picture</Text>
          <TouchableOpacity style={styles.avatarSection} onPress={() => setShowAvatarModal(true)}>
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            <View style={styles.avatarOverlay}>
              <Ionicons name="camera" size={20} color={colors.white} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
              placeholder="Enter your full name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.username}
              onChangeText={(text) => setFormData({...formData, username: text})}
              placeholder="@username"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.bio}
              onChangeText={(text) => setFormData({...formData, bio: text})}
              placeholder="Tell us about yourself..."
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.textInput}
              value={formData.phone}
              onChangeText={(text) => setFormData({...formData, phone: text})}
              placeholder="+1 (555) 123-4567"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Website</Text>
            <TextInput
              style={styles.textInput}
              value={formData.website}
              onChangeText={(text) => setFormData({...formData, website: text})}
              placeholder="https://yourwebsite.com"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.textInput}
              value={formData.location}
              onChangeText={(text) => setFormData({...formData, location: text})}
              placeholder="City, State"
            />
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date of Birth</Text>
            <TextInput
              style={styles.textInput}
              value={formData.dateOfBirth}
              onChangeText={(text) => setFormData({...formData, dateOfBirth: text})}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <TouchableOpacity 
            style={styles.selectorItem}
            onPress={() => setShowGenderModal(true)}
          >
            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.selectorContent}>
              <Text style={styles.selectorValue}>{formData.gender}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.selectorItem}
            onPress={() => setShowInterestsModal(true)}
          >
            <Text style={styles.inputLabel}>Interests</Text>
            <View style={styles.selectorContent}>
              <Text style={styles.selectorValue}>
                {formData.interests.length > 0 
                  ? `${formData.interests.length} selected` 
                  : 'Select interests'
                }
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderAvatarModal()}
      {renderGenderModal()}
      {renderInterestsModal()}
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
    fontSize: scale(20),
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: scale(14),
    color: colors.textSecondary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.medium,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.l,
  },
  saveButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonTextDisabled: {
    color: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.m,
  },
  section: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.m,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: spacing.m,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  selectorItem: {
    marginBottom: spacing.m,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    backgroundColor: colors.surface,
  },
  selectorValue: {
    fontSize: 16,
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.large,
    borderTopRightRadius: radii.large,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalBody: {
    paddingHorizontal: spacing.m,
  },
  avatarOptions: {
    padding: spacing.m,
  },
  avatarOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarOptionText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.m,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
}); 