import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';

interface BusinessInfo {
  name: string;
  description: string;
  category: string;
  website_url: string;
  contact_info: {
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    phone: string;
  };
  social_media: {
    instagram: string;
    facebook: string;
    twitter: string;
  };
}

const businessCategories = [
  'Fashion & Apparel',
  'Electronics',
  'Home & Garden',
  'Beauty & Personal Care',
  'Sports & Outdoor',
  'Books & Media',
  'Food & Beverage',
  'Health & Wellness',
  'Automotive',
  'Toys & Games',
  'Art & Collectibles',
  'Other',
];

export default function BusinessInfoScreen() {
  const navigation = useNavigation();
  const { state, updateStoreInfo } = useApp();
  const [saving, setSaving] = useState(false);
  
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: state.store?.name || '',
    description: state.store?.description || '',
    category: '',
    website_url: state.store?.website_url || '',
    contact_info: {
      address: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
      phone: '',
    },
    social_media: {
      instagram: '',
      facebook: '',
      twitter: '',
    },
  });

  const [originalInfo, setOriginalInfo] = useState<BusinessInfo>(businessInfo);

  useEffect(() => {
    if (state.store) {
      const info = {
        name: state.store.name || '',
        description: state.store.description || '',
        category: '',
        website_url: state.store.website_url || '',
        contact_info: {
          address: '',
          city: '',
          state: '',
          zip_code: '',
          country: '',
          phone: '',
        },
        social_media: {
          instagram: '',
          facebook: '',
          twitter: '',
        },
      };
      setBusinessInfo(info);
      setOriginalInfo(info);
    }
  }, [state.store]);

  const hasChanges = () => {
    return JSON.stringify(businessInfo) !== JSON.stringify(originalInfo);
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      navigation.goBack();
      return;
    }

    setSaving(true);
    try {
      // Validate required fields
      if (!businessInfo.name.trim()) {
        Alert.alert('Error', 'Store name is required');
        return;
      }

      if (!businessInfo.category) {
        Alert.alert('Error', 'Please select a business category');
        return;
      }

      // Update store information in database
      await updateStoreInfo({
        name: businessInfo.name.trim(),
        description: businessInfo.description.trim(),
        category: businessInfo.category,
        website_url: businessInfo.website_url.trim(),
        contact_info: businessInfo.contact_info,
        social_media: businessInfo.social_media,
      });

      setOriginalInfo(businessInfo);
      Alert.alert('Success', 'Business information updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update business information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Business Information</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveButton, !hasChanges() && styles.saveButtonDisabled]}
          disabled={!hasChanges() || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.saveButtonText, !hasChanges() && styles.saveButtonTextDisabled]}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Store Name *</Text>
            <TextInput
              style={styles.input}
              value={businessInfo.name}
              onChangeText={(text) => setBusinessInfo(prev => ({ ...prev, name: text }))}
              placeholder="Enter your store name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={businessInfo.description}
              onChangeText={(text) => setBusinessInfo(prev => ({ ...prev, description: text }))}
              placeholder="Describe your business"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Category *</Text>
            <View style={styles.categoryContainer}>
              {businessCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    businessInfo.category === category && styles.categoryChipActive
                  ]}
                  onPress={() => setBusinessInfo(prev => ({ ...prev, category }))}
                >
                  <Text style={[
                    styles.categoryChipText,
                    businessInfo.category === category && styles.categoryChipTextActive
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website URL</Text>
            <TextInput
              style={styles.input}
              value={businessInfo.website_url}
              onChangeText={(text) => setBusinessInfo(prev => ({ ...prev, website_url: text }))}
              placeholder="https://yourwebsite.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              value={businessInfo.contact_info.address}
              onChangeText={(text) => setBusinessInfo(prev => ({
                ...prev,
                contact_info: { ...prev.contact_info, address: text }
              }))}
              placeholder="Enter your business address"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.s }]}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={businessInfo.contact_info.city}
                onChangeText={(text) => setBusinessInfo(prev => ({
                  ...prev,
                  contact_info: { ...prev.contact_info, city: text }
                }))}
                placeholder="City"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                value={businessInfo.contact_info.state}
                onChangeText={(text) => setBusinessInfo(prev => ({
                  ...prev,
                  contact_info: { ...prev.contact_info, state: text }
                }))}
                placeholder="State"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.s }]}>
              <Text style={styles.label}>ZIP Code</Text>
              <TextInput
                style={styles.input}
                value={businessInfo.contact_info.zip_code}
                onChangeText={(text) => setBusinessInfo(prev => ({
                  ...prev,
                  contact_info: { ...prev.contact_info, zip_code: text }
                }))}
                placeholder="ZIP Code"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Country</Text>
              <TextInput
                style={styles.input}
                value={businessInfo.contact_info.country}
                onChangeText={(text) => setBusinessInfo(prev => ({
                  ...prev,
                  contact_info: { ...prev.contact_info, country: text }
                }))}
                placeholder="Country"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={businessInfo.contact_info.phone}
              onChangeText={(text) => setBusinessInfo(prev => ({
                ...prev,
                contact_info: { ...prev.contact_info, phone: text }
              }))}
              placeholder="Business phone number"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Media</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Instagram</Text>
            <TextInput
              style={styles.input}
              value={businessInfo.social_media.instagram}
              onChangeText={(text) => setBusinessInfo(prev => ({
                ...prev,
                social_media: { ...prev.social_media, instagram: text }
              }))}
              placeholder="@yourhandle"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Facebook</Text>
            <TextInput
              style={styles.input}
              value={businessInfo.social_media.facebook}
              onChangeText={(text) => setBusinessInfo(prev => ({
                ...prev,
                social_media: { ...prev.social_media, facebook: text }
              }))}
              placeholder="Facebook page URL"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Twitter</Text>
            <TextInput
              style={styles.input}
              value={businessInfo.social_media.twitter}
              onChangeText={(text) => setBusinessInfo(prev => ({
                ...prev,
                social_media: { ...prev.social_media, twitter: text }
              }))}
              placeholder="@yourhandle"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
            />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
  },
  saveButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: radii.small,
    backgroundColor: colors.primary,
  },
  saveButtonDisabled: {
    backgroundColor: colors.border,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: '#fff',
  },
  saveButtonTextDisabled: {
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.m,
  },
  inputGroup: {
    marginBottom: spacing.m,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  categoryChip: {
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginRight: spacing.s,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
}); 