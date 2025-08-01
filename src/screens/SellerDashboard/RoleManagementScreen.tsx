import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  icon: string;
  isActive: boolean;
}

const availableRoles: Role[] = [
  {
    id: 'seller',
    name: 'Seller',
    description: 'Manage products, orders, and store operations',
    permissions: [
      'Manage products',
      'View orders',
      'Process payments',
      'Manage store settings',
      'View analytics',
      'Create posts',
    ],
    icon: 'storefront-outline',
    isActive: true,
  },
  {
    id: 'creator',
    name: 'Creator',
    description: 'Create and manage social content and posts',
    permissions: [
      'Create posts',
      'Manage content',
      'View engagement',
      'Schedule posts',
      'Boost content',
    ],
    icon: 'camera-outline',
    isActive: true,
  },
  {
    id: 'user',
    name: 'User',
    description: 'Browse and purchase products',
    permissions: [
      'Browse products',
      'Place orders',
      'View orders',
      'Save favorites',
      'Follow stores',
    ],
    icon: 'person-outline',
    isActive: true,
  },
];

export default function RoleManagementScreen() {
  const navigation = useNavigation();
  const { state, updateUserRole } = useApp();
  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState(state.user?.role || 'seller');
  const [originalRole, setOriginalRole] = useState(selectedRole);

  useEffect(() => {
    if (state.user?.role) {
      setSelectedRole(state.user.role);
      setOriginalRole(state.user.role);
    }
  }, [state.user]);

  const hasChanges = () => {
    return selectedRole !== originalRole;
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      navigation.goBack();
      return;
    }

    setSaving(true);
    try {
      // Update user role in database
      await updateUserRole(selectedRole as any);

      setOriginalRole(selectedRole);
      Alert.alert('Success', 'Role updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update role. Please try again.');
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

  const handleRoleChange = (roleId: string) => {
    if (roleId === selectedRole) return;

    Alert.alert(
      'Change Role',
      `Are you sure you want to change your role to ${availableRoles.find(r => r.id === roleId)?.name}? This will affect your access to certain features.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Change', onPress: () => setSelectedRole(roleId) }
      ]
    );
  };

  const renderRoleCard = (role: Role) => (
    <TouchableOpacity
      key={role.id}
      style={[
        styles.roleCard,
        selectedRole === role.id && styles.roleCardActive
      ]}
      onPress={() => handleRoleChange(role.id)}
    >
      <View style={styles.roleHeader}>
        <View style={[
          styles.roleIcon,
          selectedRole === role.id && styles.roleIconActive
        ]}>
          <Ionicons 
            name={role.icon as any} 
            size={24} 
            color={selectedRole === role.id ? '#fff' : colors.primary} 
          />
        </View>
        <View style={styles.roleInfo}>
          <Text style={[
            styles.roleName,
            selectedRole === role.id && styles.roleNameActive
          ]}>
            {role.name}
          </Text>
          <Text style={styles.roleDescription}>
            {role.description}
          </Text>
        </View>
        {selectedRole === role.id && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          </View>
        )}
      </View>

      <View style={styles.permissionsContainer}>
        <Text style={styles.permissionsTitle}>Permissions:</Text>
        {role.permissions.map((permission, index) => (
          <View key={index} style={styles.permissionItem}>
            <Ionicons name="checkmark" size={16} color={colors.success} />
            <Text style={styles.permissionText}>{permission}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Role Management</Text>
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
          <Text style={styles.sectionTitle}>Select Your Role</Text>
          <Text style={styles.sectionDescription}>
            Choose the role that best describes your primary activity on the platform.
            You can change this at any time.
          </Text>

          {availableRoles.map(renderRoleCard)}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About Roles</Text>
          <Text style={styles.infoText}>
            Your role determines which features and permissions you have access to.
            Changing your role may affect your current access to certain features.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Current Role</Text>
          <Text style={styles.infoText}>
            You are currently set as a {availableRoles.find(r => r.id === selectedRole)?.name}.
            This role gives you access to all the permissions listed above.
          </Text>
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
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
    marginBottom: spacing.m,
  },
  roleCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.card,
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  roleIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  roleIconActive: {
    backgroundColor: colors.primary,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  roleNameActive: {
    color: colors.primary,
  },
  roleDescription: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  selectedIndicator: {
    marginLeft: spacing.s,
  },
  permissionsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.m,
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.s,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  permissionText: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  infoSection: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.m,
    ...shadows.card,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.s,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
    lineHeight: 20,
  },
}); 