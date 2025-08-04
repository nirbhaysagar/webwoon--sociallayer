import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from './components/HeaderWithMenu';
import { useNavigation, useRoute } from '@react-navigation/native';

const fieldMappingOptions = {
  products: [
    { source: 'title', target: 'name', required: true },
    { source: 'description', target: 'description', required: false },
    { source: 'price', target: 'price', required: true },
    { source: 'sku', target: 'sku', required: false },
    { source: 'inventory_quantity', target: 'stock', required: false },
    { source: 'vendor', target: 'brand', required: false },
    { source: 'product_type', target: 'category', required: false },
  ],
  orders: [
    { source: 'order_number', target: 'order_id', required: true },
    { source: 'total_price', target: 'total', required: true },
    { source: 'currency', target: 'currency', required: true },
    { source: 'customer_email', target: 'customer_email', required: true },
    { source: 'shipping_address', target: 'shipping_address', required: false },
    { source: 'billing_address', target: 'billing_address', required: false },
    { source: 'line_items', target: 'items', required: true },
  ],
  customers: [
    { source: 'email', target: 'email', required: true },
    { source: 'first_name', target: 'first_name', required: false },
    { source: 'last_name', target: 'last_name', required: false },
    { source: 'phone', target: 'phone', required: false },
    { source: 'addresses', target: 'addresses', required: false },
    { source: 'total_spent', target: 'total_spent', required: false },
  ],
};

const webhookEvents = [
  { event: 'orders/create', enabled: true, description: 'New order created' },
  { event: 'orders/updated', enabled: true, description: 'Order updated' },
  { event: 'orders/cancelled', enabled: false, description: 'Order cancelled' },
  { event: 'products/create', enabled: true, description: 'New product created' },
  { event: 'products/updated', enabled: true, description: 'Product updated' },
  { event: 'products/deleted', enabled: false, description: 'Product deleted' },
  { event: 'customers/create', enabled: true, description: 'New customer created' },
  { event: 'customers/updated', enabled: false, description: 'Customer updated' },
  { event: 'inventory/updated', enabled: true, description: 'Inventory updated' },
];

export default function IntegrationSettingsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { platform } = route.params || {};
  
  const [activeTab, setActiveTab] = useState('general');
  const [fieldMappings, setFieldMappings] = useState({});
  const [webhookSettings, setWebhookSettings] = useState(webhookEvents);
  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncInterval: '15min',
    retryFailed: true,
    maxRetries: 3,
    batchSize: 50,
  });
  const [apiSettings, setApiSettings] = useState({
    timeout: 30,
    rateLimit: 100,
    enableLogging: true,
    enableNotifications: true,
  });

  const handleFieldMapping = (category: string, sourceField: string, targetField: string) => {
    setFieldMappings({
      ...fieldMappings,
      [`${category}_${sourceField}`]: targetField,
    });
  };

  const handleWebhookToggle = (event: string, enabled: boolean) => {
    setWebhookSettings(webhookSettings.map(w => 
      w.event === event ? { ...w, enabled } : w
    ));
  };

  const handleSaveSettings = () => {
    Alert.alert('Settings Saved', 'Your integration settings have been updated successfully.');
    navigation.goBack();
  };

  const handleTestWebhook = () => {
    Alert.alert('Testing Webhook', 'Sending test webhook...');
  };

  const handleRegenerateApiKey = () => {
    Alert.alert(
      'Regenerate API Key',
      'This will invalidate your current API key. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Regenerate', style: 'destructive' },
      ]
    );
  };

  const renderGeneralSettings = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync Configuration</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="refresh-outline" size={24} color={colors.textSecondary} />
            <Text style={styles.settingLabel}>Auto Sync</Text>
          </View>
          <Switch
            value={syncSettings.autoSync}
            onValueChange={(value) => setSyncSettings({ ...syncSettings, autoSync: value })}
            trackColor={{ true: colors.primary, false: colors.disabled }}
            thumbColor={syncSettings.autoSync ? colors.primary : colors.disabled}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="time-outline" size={24} color={colors.textSecondary} />
            <Text style={styles.settingLabel}>Sync Interval</Text>
          </View>
          <TouchableOpacity style={styles.intervalSelector}>
            <Text style={styles.intervalText}>{syncSettings.syncInterval}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="repeat-outline" size={24} color={colors.textSecondary} />
            <Text style={styles.settingLabel}>Retry Failed Syncs</Text>
          </View>
          <Switch
            value={syncSettings.retryFailed}
            onValueChange={(value) => setSyncSettings({ ...syncSettings, retryFailed: value })}
            trackColor={{ true: colors.primary, false: colors.disabled }}
            thumbColor={syncSettings.retryFailed ? colors.primary : colors.disabled}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Configuration</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Request Timeout (seconds)</Text>
          <TextInput
            style={styles.textInput}
            value={apiSettings.timeout.toString()}
            onChangeText={(text) => setApiSettings({ ...apiSettings, timeout: parseInt(text) || 30 })}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Rate Limit (requests/min)</Text>
          <TextInput
            style={styles.textInput}
            value={apiSettings.rateLimit.toString()}
            onChangeText={(text) => setApiSettings({ ...apiSettings, rateLimit: parseInt(text) || 100 })}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="document-text-outline" size={24} color={colors.textSecondary} />
            <Text style={styles.settingLabel}>Enable API Logging</Text>
          </View>
          <Switch
            value={apiSettings.enableLogging}
            onValueChange={(value) => setApiSettings({ ...apiSettings, enableLogging: value })}
            trackColor={{ true: colors.primary, false: colors.disabled }}
            thumbColor={apiSettings.enableLogging ? colors.primary : colors.disabled}
          />
        </View>
      </View>
    </View>
  );

  const renderFieldMapping = () => (
    <View style={styles.tabContent}>
      {Object.entries(fieldMappingOptions).map(([category, fields]) => (
        <View key={category} style={styles.section}>
          <Text style={styles.sectionTitle}>{category.charAt(0).toUpperCase() + category.slice(1)} Fields</Text>
          
          {fields.map((field) => (
            <View key={field.source} style={styles.mappingItem}>
              <View style={styles.mappingLeft}>
                <Text style={styles.mappingSource}>{field.source}</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
                <TextInput
                  style={styles.mappingInput}
                  placeholder={field.target}
                  value={fieldMappings[`${category}_${field.source}`] || field.target}
                  onChangeText={(text) => handleFieldMapping(category, field.source, text)}
                />
              </View>
              {field.required && (
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredText}>Required</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );

  const renderWebhooks = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Webhook Configuration</Text>
        
        <View style={styles.webhookUrlContainer}>
          <Text style={styles.inputLabel}>Webhook URL</Text>
          <TextInput
            style={styles.textInput}
            placeholder="https://your-domain.com/webhook"
            value="https://api.socialspark.com/webhook/shopify"
          />
          <TouchableOpacity style={styles.testWebhookButton} onPress={handleTestWebhook}>
            <Ionicons name="play-outline" size={16} color={colors.primary} />
            <Text style={styles.testWebhookText}>Test</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Webhook Events</Text>
        
        {webhookSettings.map((webhook) => (
          <View key={webhook.event} style={styles.webhookItem}>
            <View style={styles.webhookLeft}>
              <Text style={styles.webhookEvent}>{webhook.event}</Text>
              <Text style={styles.webhookDescription}>{webhook.description}</Text>
            </View>
            <Switch
              value={webhook.enabled}
              onValueChange={(enabled) => handleWebhookToggle(webhook.event, enabled)}
              trackColor={{ true: colors.primary, false: colors.disabled }}
              thumbColor={webhook.enabled ? colors.primary : colors.disabled}
            />
          </View>
        ))}
      </View>
    </View>
  );

  const renderSecurity = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Security</Text>
        
        <View style={styles.securityItem}>
          <View style={styles.securityLeft}>
            <Ionicons name="key-outline" size={24} color={colors.textSecondary} />
            <View style={styles.securityInfo}>
              <Text style={styles.securityTitle}>API Key</Text>
              <Text style={styles.securityValue}>sk_live_...abc123</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.regenerateButton} onPress={handleRegenerateApiKey}>
            <Ionicons name="refresh-outline" size={16} color={colors.error} />
            <Text style={styles.regenerateText}>Regenerate</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.securityItem}>
          <View style={styles.securityLeft}>
            <Ionicons name="shield-outline" size={24} color={colors.textSecondary} />
            <View style={styles.securityInfo}>
              <Text style={styles.securityTitle}>Access Token</Text>
              <Text style={styles.securityValue}>expires in 30 days</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.refreshButton}>
            <Ionicons name="refresh-outline" size={16} color={colors.primary} />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permissions</Text>
        
        <View style={styles.permissionItem}>
          <View style={styles.permissionLeft}>
            <Ionicons name="cube-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.permissionText}>Read Products</Text>
          </View>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
        </View>

        <View style={styles.permissionItem}>
          <View style={styles.permissionLeft}>
            <Ionicons name="receipt-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.permissionText}>Read Orders</Text>
          </View>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
        </View>

        <View style={styles.permissionItem}>
          <View style={styles.permissionLeft}>
            <Ionicons name="people-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.permissionText}>Read Customers</Text>
          </View>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithMenu />
      
      <View style={styles.header}>
        <Text style={styles.screenTitle}>
          {platform?.name} Integration Settings
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'general' && styles.activeTab]}
            onPress={() => setActiveTab('general')}
          >
            <Text style={[styles.tabText, activeTab === 'general' && styles.activeTabText]}>
              General
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'mapping' && styles.activeTab]}
            onPress={() => setActiveTab('mapping')}
          >
            <Text style={[styles.tabText, activeTab === 'mapping' && styles.activeTabText]}>
              Field Mapping
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'webhooks' && styles.activeTab]}
            onPress={() => setActiveTab('webhooks')}
          >
            <Text style={[styles.tabText, activeTab === 'webhooks' && styles.activeTabText]}>
              Webhooks
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'security' && styles.activeTab]}
            onPress={() => setActiveTab('security')}
          >
            <Text style={[styles.tabText, activeTab === 'security' && styles.activeTabText]}>
              Security
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'general' && renderGeneralSettings()}
        {activeTab === 'mapping' && renderFieldMapping()}
        {activeTab === 'webhooks' && renderWebhooks()}
        {activeTab === 'security' && renderSecurity()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
          <Ionicons name="save-outline" size={20} color={colors.white} />
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.m,
    paddingTop: spacing.s,
    paddingBottom: spacing.m,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginHorizontal: spacing.xs,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: spacing.m,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.l,
    ...shadows.card,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.m,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'monospace',
    color: colors.text,
    marginLeft: spacing.s,
  },
  intervalSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: radii.small,
  },
  intervalText: {
    fontSize: 14,
    color: colors.text,
    marginRight: spacing.xs,
  },
  inputContainer: {
    marginBottom: spacing.m,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.small,
    padding: spacing.m,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
  },
  mappingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mappingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mappingSource: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'monospace',
    color: colors.text,
    width: 80,
  },
  mappingInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.small,
    padding: spacing.s,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
    flex: 1,
    marginLeft: spacing.s,
  },
  requiredBadge: {
    backgroundColor: colors.error + '20',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radii.small,
  },
  requiredText: {
    fontSize: 10,
    color: colors.error,
    fontWeight: '600',
  },
  webhookUrlContainer: {
    marginBottom: spacing.m,
  },
  testWebhookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary + '20',
    borderRadius: radii.small,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  testWebhookText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  webhookItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  webhookLeft: {
    flex: 1,
  },
  webhookEvent: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'monospace',
    color: colors.text,
  },
  webhookDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  securityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  securityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityInfo: {
    marginLeft: spacing.s,
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'monospace',
    color: colors.text,
  },
  securityValue: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
  },
  regenerateText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
  },
  refreshText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  permissionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'monospace',
    color: colors.text,
    marginLeft: spacing.s,
  },
  footer: {
    padding: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.medium,
    paddingVertical: spacing.m,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.white,
    marginLeft: spacing.xs,
  },
}); 