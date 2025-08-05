import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, radii } from '../../constants/theme';
import BackButton from '../../components/BackButton';

export default function SecurityScreen() {
  const navigation = useNavigation();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [suspiciousActivity, setSuspiciousActivity] = useState(true);

  const securityEvents = [
    {
      id: '1',
      type: 'login',
      description: 'New login from New York, NY',
      time: '2 minutes ago',
      device: 'iPhone 13',
      location: 'New York, NY',
      isSuspicious: false
    },
    {
      id: '2',
      type: 'password_change',
      description: 'Password changed successfully',
      time: '1 day ago',
      device: 'MacBook Pro',
      location: 'San Francisco, CA',
      isSuspicious: false
    },
    {
      id: '3',
      type: 'login',
      description: 'Login attempt from unknown device',
      time: '3 days ago',
      device: 'Unknown Device',
      location: 'Moscow, Russia',
      isSuspicious: true
    }
  ];

  const handleEnableTwoFactor = () => {
    Alert.alert(
      'Two-Factor Authentication',
      'This will add an extra layer of security to your account. You\'ll need to enter a code from your authenticator app when signing in.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Enable', 
          onPress: () => {
            setTwoFactorEnabled(true);
            Alert.alert('Success', 'Two-factor authentication has been enabled.');
          }
        },
      ]
    );
  };

  const handleDisableTwoFactor = () => {
    Alert.alert(
      'Disable Two-Factor Authentication',
      'This will remove the extra security layer from your account. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disable', 
          style: 'destructive',
          onPress: () => {
            setTwoFactorEnabled(false);
            Alert.alert('Success', 'Two-factor authentication has been disabled.');
          }
        },
      ]
    );
  };

  const handleChangePassword = () => {
    navigation.navigate('EmailPassword' as any);
  };

  const handleManageDevices = () => {
    Alert.alert('Manage Devices', 'Device management feature is coming soon!');
  };

  const handleSecurityReport = () => {
    Alert.alert('Security Report', 'Generating security report...');
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login':
        return 'log-in-outline';
      case 'password_change':
        return 'key-outline';
      case 'logout':
        return 'log-out-outline';
      default:
        return 'alert-circle-outline';
    }
  };

  const getEventColor = (type: string, isSuspicious: boolean) => {
    if (isSuspicious) return colors.error;
    switch (type) {
      case 'login':
        return colors.success;
      case 'password_change':
        return colors.primary;
      case 'logout':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <BackButton />
      
      <View style={{ padding: spacing.l }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: spacing.s }}>
          Security
        </Text>
        <Text style={{ fontSize: 16, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.l }}>
          Manage your account security settings and monitor activity.
        </Text>

        {/* Security Status */}
        <View style={{ marginBottom: spacing.l }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: spacing.m }}>
            Security Status
          </Text>
          <View style={{
            backgroundColor: colors.white,
            borderRadius: radii.m,
            padding: spacing.m,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.m }}>
              <Ionicons name="shield-checkmark" size={24} color={colors.success} />
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginLeft: spacing.s }}>
                Account Secure
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
              Your account is protected with strong security measures. Keep your password secure and enable two-factor authentication for extra protection.
            </Text>
          </View>
        </View>

        {/* Security Settings */}
        <View style={{ marginBottom: spacing.l }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: spacing.m }}>
            Security Settings
          </Text>
          <View style={{
            backgroundColor: colors.white,
            borderRadius: radii.m,
            padding: spacing.m,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingVertical: spacing.s,
              borderBottomWidth: 1,
              borderBottomColor: colors.border
            }}>
              <View>
                <Text style={{ fontSize: 16, color: colors.text }}>
                  Two-Factor Authentication
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  Add an extra layer of security
                </Text>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={twoFactorEnabled ? handleDisableTwoFactor : handleEnableTwoFactor}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingVertical: spacing.s,
              borderBottomWidth: 1,
              borderBottomColor: colors.border
            }}>
              <View>
                <Text style={{ fontSize: 16, color: colors.text }}>
                  Biometric Login
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  Use fingerprint or face ID
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingVertical: spacing.s,
              borderBottomWidth: 1,
              borderBottomColor: colors.border
            }}>
              <View>
                <Text style={{ fontSize: 16, color: colors.text }}>
                  Login Notifications
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  Get notified of new logins
                </Text>
              </View>
              <Switch
                value={loginNotifications}
                onValueChange={setLoginNotifications}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingVertical: spacing.s
            }}>
              <View>
                <Text style={{ fontSize: 16, color: colors.text }}>
                  Suspicious Activity Alerts
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  Alert for unusual activity
                </Text>
              </View>
              <Switch
                value={suspiciousActivity}
                onValueChange={setSuspiciousActivity}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          </View>
        </View>

        {/* Security Actions */}
        <View style={{ marginBottom: spacing.l }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: spacing.m }}>
            Security Actions
          </Text>
          <View style={{
            backgroundColor: colors.white,
            borderRadius: radii.m,
            padding: spacing.m,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <TouchableOpacity 
              style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingVertical: spacing.s,
                borderBottomWidth: 1,
                borderBottomColor: colors.border
              }}
              onPress={handleChangePassword}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="key-outline" size={20} color={colors.primary} />
                <Text style={{ fontSize: 16, color: colors.text, marginLeft: spacing.s }}>
                  Change Password
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingVertical: spacing.s,
                borderBottomWidth: 1,
                borderBottomColor: colors.border
              }}
              onPress={handleManageDevices}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="phone-portrait-outline" size={20} color={colors.primary} />
                <Text style={{ fontSize: 16, color: colors.text, marginLeft: spacing.s }}>
                  Manage Devices
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingVertical: spacing.s
              }}
              onPress={handleSecurityReport}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                <Text style={{ fontSize: 16, color: colors.text, marginLeft: spacing.s }}>
                  Security Report
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={{ marginBottom: spacing.l }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: spacing.m }}>
            Recent Activity
          </Text>
          {securityEvents.map((event) => (
            <View
              key={event.id}
              style={{
                backgroundColor: colors.white,
                borderRadius: radii.s,
                padding: spacing.m,
                marginBottom: spacing.s,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.s }}>
                <Ionicons 
                  name={getEventIcon(event.type) as any} 
                  size={20} 
                  color={getEventColor(event.type, event.isSuspicious)} 
                />
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '500', 
                  color: colors.text, 
                  marginLeft: spacing.s,
                  flex: 1
                }}>
                  {event.description}
                </Text>
                {event.isSuspicious && (
                  <Ionicons name="warning" size={16} color={colors.error} />
                )}
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  {event.device} • {event.location}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  {event.time}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Security Tips */}
        <View style={{ marginBottom: spacing.l }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: spacing.m }}>
            Security Tips
          </Text>
          <View style={{
            backgroundColor: colors.white,
            borderRadius: radii.m,
            padding: spacing.m,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <View style={{ marginBottom: spacing.s }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
                • Use a strong, unique password for your account
              </Text>
            </View>
            <View style={{ marginBottom: spacing.s }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
                • Enable two-factor authentication for extra security
              </Text>
            </View>
            <View style={{ marginBottom: spacing.s }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
                • Never share your login credentials with anyone
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
                • Regularly review your account activity
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
} 