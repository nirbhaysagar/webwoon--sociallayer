import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Image, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { colors, spacing, typography, radii, shadows } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';

export default function HeaderWithMenu() {
  const navigation = useNavigation();
  const { authState, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const user = authState.user || {
    full_name: 'Guest User',
    avatar_url: 'https://randomuser.me/api/portraits/men/32.jpg',
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        },
      ]
    );
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        style={styles.menuButton}
        accessibilityLabel="Open sidebar menu"
      >
        <Ionicons name="menu" size={28} color={colors.text} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.greetingWrap}
        onPress={() => setShowMenu(true)}
      >
        <Text style={styles.greetingText}>
          Welcome back, <Text style={styles.greetingName}>{user.full_name || 'Guest'}</Text>!
        </Text>
        <Image source={{ uri: user.avatar_url || user.avatar }} style={styles.avatar} />
      </TouchableOpacity>

      {/* User Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Image source={{ uri: user.avatar_url || user.avatar }} style={styles.menuAvatar} />
              <View style={styles.menuUserInfo}>
                <Text style={styles.menuUserName}>{user.full_name || 'Guest User'}</Text>
                <Text style={styles.menuUserEmail}>{user.email || 'guest@example.com'}</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => {
              setShowMenu(false);
              navigation.navigate('UserProfileScreen');
            }}>
              <Ionicons name="person-outline" size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => {
              setShowMenu(false);
              navigation.navigate('SettingsScreen');
            }}>
              <Ionicons name="settings-outline" size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => {
              setShowMenu(false);
              navigation.navigate('SignOutScreen');
            }}>
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={[styles.menuItemText, { color: colors.error }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: 'space-between',
  },
  menuButton: {
    padding: spacing.s,
  },
  greetingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingText: {
    ...typography.subheadline,
    color: colors.text,
    marginRight: spacing.s,
  },
  greetingName: {
    color: colors.primary,
    fontWeight: '700',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    marginTop: 80,
    marginRight: spacing.m,
    minWidth: 200,
    ...shadows.card,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.s,
  },
  menuUserInfo: {
    flex: 1,
  },
  menuUserName: {
    ...typography.headline,
    color: colors.text,
  },
  menuUserEmail: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemText: {
    ...typography.subheadline,
    color: colors.text,
    marginLeft: spacing.s,
  },
}); 