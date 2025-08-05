import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, radii } from '../../constants/theme';
import BackButton from '../../components/BackButton';

export default function DataStorageScreen() {
  const navigation = useNavigation();
  const [autoBackup, setAutoBackup] = useState(true);
  const [dataAnalytics, setDataAnalytics] = useState(true);
  const [personalizedAds, setPersonalizedAds] = useState(false);
  const [locationData, setLocationData] = useState(true);

  const storageData = {
    total: 2.5, // GB
    used: 1.2,
    available: 1.3,
    breakdown: [
      { name: 'Photos & Videos', size: 0.8, color: colors.primary },
      { name: 'App Data', size: 0.3, color: colors.success },
      { name: 'Cache', size: 0.1, color: colors.warning },
    ]
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will free up storage space by removing temporary files. Your data will remain safe.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Cache', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully!');
          }
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your data will be exported and sent to your email address.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Export', 
          onPress: () => {
            Alert.alert('Export Started', 'Your data export has been initiated. You will receive an email when it\'s ready.');
          }
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Account', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'Please contact support to complete account deletion.');
          }
        },
      ]
    );
  };

  const getStoragePercentage = () => {
    return Math.round((storageData.used / storageData.total) * 100);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <BackButton />
      
      <View style={{ padding: spacing.l }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: spacing.s }}>
          Data & Storage
        </Text>
        <Text style={{ fontSize: 16, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.l }}>
          Manage your data, storage usage, and privacy settings.
        </Text>

        {/* Storage Overview */}
        <View style={{ marginBottom: spacing.l }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: spacing.m }}>
            Storage Usage
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.m }}>
              <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>
                Total Storage
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                {storageData.total} GB
              </Text>
            </View>
            
            <View style={{ marginBottom: spacing.m }}>
              <View style={{ 
                height: 8, 
                backgroundColor: colors.border, 
                borderRadius: 4,
                overflow: 'hidden'
              }}>
                <View style={{ 
                  width: `${getStoragePercentage()}%`, 
                  height: '100%', 
                  backgroundColor: colors.primary,
                  borderRadius: 4
                }} />
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.s }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                Used: {storageData.used} GB
              </Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                Available: {storageData.available} GB
              </Text>
            </View>

            {/* Storage Breakdown */}
            <View style={{ marginTop: spacing.m }}>
              {storageData.breakdown.map((item, index) => (
                <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ 
                      width: 12, 
                      height: 12, 
                      backgroundColor: item.color, 
                      borderRadius: 6,
                      marginRight: spacing.s
                    }} />
                    <Text style={{ fontSize: 14, color: colors.text }}>
                      {item.name}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                    {item.size} GB
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Data Management */}
        <View style={{ marginBottom: spacing.l }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: spacing.m }}>
            Data Management
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
              onPress={handleClearCache}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="trash-outline" size={20} color={colors.warning} />
                <Text style={{ fontSize: 16, color: colors.text, marginLeft: spacing.s }}>
                  Clear Cache
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
              onPress={handleExportData}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="download-outline" size={20} color={colors.primary} />
                <Text style={{ fontSize: 16, color: colors.text, marginLeft: spacing.s }}>
                  Export Data
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
              onPress={handleDeleteAccount}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="warning-outline" size={20} color={colors.error} />
                <Text style={{ fontSize: 16, color: colors.error, marginLeft: spacing.s }}>
                  Delete Account
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={{ marginBottom: spacing.l }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: spacing.m }}>
            Privacy Settings
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
                  Auto Backup
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  Automatically backup your data
                </Text>
              </View>
              <Switch
                value={autoBackup}
                onValueChange={setAutoBackup}
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
                  Data Analytics
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  Help improve our service
                </Text>
              </View>
              <Switch
                value={dataAnalytics}
                onValueChange={setDataAnalytics}
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
                  Personalized Ads
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  Show relevant advertisements
                </Text>
              </View>
              <Switch
                value={personalizedAds}
                onValueChange={setPersonalizedAds}
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
                  Location Data
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  Allow location-based features
                </Text>
              </View>
              <Switch
                value={locationData}
                onValueChange={setLocationData}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          </View>
        </View>

        {/* Data Usage Info */}
        <View style={{ marginBottom: spacing.l }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: spacing.m }}>
            Data Usage Information
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
                • Your data is encrypted and stored securely
              </Text>
            </View>
            <View style={{ marginBottom: spacing.s }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
                • You can export your data at any time
              </Text>
            </View>
            <View style={{ marginBottom: spacing.s }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
                • Cache files are automatically cleaned periodically
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
                • Account deletion is permanent and irreversible
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
} 