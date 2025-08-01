import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from './components/HeaderWithMenu';
import { useNavigation } from '@react-navigation/native';

const mockProfile = {
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  name: 'Jane Doe',
  email: 'jane@email.com',
  phone: '+1 555-1234',
  business: {
    store: 'Urban Styles',
    category: 'Fashion',
    address: '123 Main St, NY',
  },
  payout: {
    method: 'Bank Transfer',
    account: '**** 1234',
  },
  notifications: {
    orders: true,
    messages: true,
    promotions: false,
  },
  role: 'Seller',
};
const roles = ['Seller', 'Creator', 'User'];

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(mockProfile);
  const [role, setRole] = useState(profile.role);
  const [notif, setNotif] = useState(profile.notifications);

  const navigateToSection = (section: string) => {
    switch (section) {
      case 'personal':
        navigation.navigate('PersonalInfoScreen');
        break;
      case 'business':
        navigation.navigate('BusinessInfoScreen');
        break;
      case 'payout':
        navigation.navigate('PayoutSettingsScreen');
        break;
      case 'notifications':
        navigation.navigate('NotificationPreferencesScreen');
        break;
      case 'role':
        navigation.navigate('RoleManagementScreen');
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
        <TouchableOpacity 
          style={styles.avatarRow}
          onPress={() => navigateToSection('personal')}
        >
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.email}>{profile.email}</Text>
            <Text style={styles.phone}>{profile.phone}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="chevron-forward" size={20} color={colors.secondary} />
          </TouchableOpacity>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigateToSection('business')}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Business Info</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </View>
          <Text style={styles.label}>Store</Text>
          <Text style={styles.value}>{profile.business.store}</Text>
          <Text style={styles.label}>Category</Text>
          <Text style={styles.value}>{profile.business.category}</Text>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{profile.business.address}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigateToSection('payout')}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Payout Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </View>
          <Text style={styles.label}>Method</Text>
          <Text style={styles.value}>{profile.payout.method}</Text>
          <Text style={styles.label}>Account</Text>
          <Text style={styles.value}>{profile.payout.account}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigateToSection('notifications')}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Notification Preferences</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Order Updates</Text>
            <Switch
              value={notif.orders}
              onValueChange={v => setNotif(n => ({ ...n, orders: v }))}
              trackColor={{ true: colors.primary, false: colors.disabled }}
              thumbColor={notif.orders ? colors.primary : colors.disabled}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Messages</Text>
            <Switch
              value={notif.messages}
              onValueChange={v => setNotif(n => ({ ...n, messages: v }))}
              trackColor={{ true: colors.primary, false: colors.disabled }}
              thumbColor={notif.messages ? colors.primary : colors.disabled}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Promotions</Text>
            <Switch
              value={notif.promotions}
              onValueChange={v => setNotif(n => ({ ...n, promotions: v }))}
              trackColor={{ true: colors.primary, false: colors.disabled }}
              thumbColor={notif.promotions ? colors.primary : colors.disabled}
            />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigateToSection('role')}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Role</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </View>
          <View style={styles.rolesRow}>
            {roles.map(r => (
              <View
                key={r}
                style={[styles.roleChip, role === r && styles.roleChipActive]}
              >
                <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>{r}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color={colors.discount} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.large,
    padding: spacing.m,
    marginBottom: spacing.m,
    ...shadows.card,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radii.circle,
    marginRight: spacing.m,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  phone: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.disabled,
  },
  editBtn: {
    backgroundColor: colors.background,
    borderRadius: radii.circle,
    padding: 8,
    ...shadows.card,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.m,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
  },
  label: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
    marginTop: spacing.s,
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.text,
  },
  rolesRow: {
    flexDirection: 'row',
    marginTop: spacing.s,
  },
  roleChip: {
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginRight: 8,
  },
  roleChipActive: {
    backgroundColor: colors.primary + '33',
  },
  roleChipText: {
    fontSize: 15,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  roleChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingVertical: 12,
    marginTop: spacing.l,
    marginBottom: spacing.m,
    ...shadows.card,
  },
  logoutText: {
    color: colors.discount,
    fontWeight: '700',
    fontFamily: 'monospace',
    fontSize: 16,
    marginLeft: 8,
  },
}); 