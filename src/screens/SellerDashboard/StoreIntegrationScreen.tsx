import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, Alert, TextInput, Switch, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from './components/HeaderWithMenu';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import { StoreIntegrationAPI } from '../../services/storeIntegrationAPI';

const supportedPlatforms = [
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Connect your Shopify store to sync products, orders, and customers',
    icon: 'https://cdn.shopify.com/shopifycloud/brochure/assets/brand-assets/shopify-logo-primary-logo-456baa801ee66a0a435671082365958316831c9960c480451dd0330bcdae304f.svg',
    color: '#95BF47',
    status: 'connected',
    lastSync: '2 hours ago',
    productsCount: 156,
    ordersCount: 23,
    apiFields: ['API Key', 'API Secret', 'Store URL', 'Webhook URL'],
    syncOptions: ['Products', 'Orders', 'Customers', 'Inventory', 'Pricing'],
    storeDetails: {
      name: 'My Shopify Store',
      domain: 'myshop.myshopify.com',
      currency: 'USD',
      timezone: 'America/New_York',
      plan: 'Basic Shopify',
      products: 156,
      orders: 23,
      customers: 89,
    },
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    description: 'Sync your WooCommerce store data seamlessly',
    icon: 'https://woocommerce.com/wp-content/themes/woo/images/logo-woocommerce.svg',
    color: '#7F54B3',
    status: 'available',
    lastSync: null,
    productsCount: 0,
    ordersCount: 0,
    apiFields: ['Consumer Key', 'Consumer Secret', 'Store URL', 'Webhook URL'],
    syncOptions: ['Products', 'Orders', 'Customers', 'Categories', 'Coupons'],
    storeDetails: null,
  },
  {
    id: 'magento',
    name: 'Magento',
    description: 'Connect your Magento store for comprehensive integration',
    icon: 'https://magento.com/sites/default/files/magento-logo.svg',
    color: '#F46F25',
    status: 'available',
    lastSync: null,
    productsCount: 0,
    ordersCount: 0,
    apiFields: ['API Key', 'API Secret', 'Store URL', 'Access Token'],
    syncOptions: ['Products', 'Orders', 'Customers', 'Categories', 'Inventory'],
    storeDetails: null,
  },
  {
    id: 'bigcommerce',
    name: 'BigCommerce',
    description: 'Integrate your BigCommerce store with our platform',
    icon: 'https://www.bigcommerce.com/assets/images/bc-logo.svg',
    color: '#34313F',
    status: 'available',
    lastSync: null,
    productsCount: 0,
    ordersCount: 0,
    apiFields: ['Client ID', 'Client Secret', 'Store Hash', 'Access Token'],
    syncOptions: ['Products', 'Orders', 'Customers', 'Categories', 'Brands'],
    storeDetails: null,
  },
  {
    id: 'prestashop',
    name: 'PrestaShop',
    description: 'Connect your PrestaShop store for unified management',
    icon: 'https://www.prestashop.com/sites/default/files/prestashop-logo.svg',
    color: '#E8A33B',
    status: 'available',
    lastSync: null,
    productsCount: 0,
    ordersCount: 0,
    apiFields: ['API Key', 'Store URL', 'Webhook URL'],
    syncOptions: ['Products', 'Orders', 'Customers', 'Categories'],
    storeDetails: null,
  },
  {
    id: 'opencart',
    name: 'OpenCart',
    description: 'Sync your OpenCart store data with our platform',
    icon: 'https://www.opencart.com/image/catalog/opencart-logo.png',
    color: '#2C3E50',
    status: 'available',
    lastSync: null,
    productsCount: 0,
    ordersCount: 0,
    apiFields: ['API Key', 'Store URL', 'Username', 'Password'],
    syncOptions: ['Products', 'Orders', 'Customers', 'Categories'],
    storeDetails: null,
  },
  {
    id: 'custom',
    name: 'Custom Platform',
    description: 'Connect any e-commerce platform with custom API endpoints',
    icon: 'https://via.placeholder.com/48/6366f1/ffffff?text=C',
    color: '#6366F1',
    status: 'available',
    lastSync: null,
    productsCount: 0,
    ordersCount: 0,
    apiFields: ['API Base URL', 'API Key', 'API Secret', 'Custom Headers'],
    syncOptions: ['Products', 'Orders', 'Customers', 'Custom Fields'],
    storeDetails: null,
  },
];

const integrationFeatures = [
  {
    icon: 'cube-outline',
    title: 'Universal Product Sync',
    description: 'Automatically fetch and populate all your products from any platform',
  },
  {
    icon: 'storefront-outline',
    title: 'Universal Store Details',
    description: 'Import store information and settings from any e-commerce platform',
  },
  {
    icon: 'code-outline',
    title: 'Custom API Support',
    description: 'Connect any platform with custom API endpoints and data mapping',
  },
  {
    icon: 'receipt-outline',
    title: 'Universal Order Management',
    description: 'View and manage orders from any connected store',
  },
  {
    icon: 'people-outline',
    title: 'Universal Customer Data',
    description: 'Access customer information from any platform',
  },
  {
    icon: 'analytics-outline',
    title: 'Unified Analytics',
    description: 'Get insights across all your connected stores',
  },
  {
    icon: 'notifications-outline',
    title: 'Real-time Updates',
    description: 'Receive instant notifications for new orders and events',
  },
  {
    icon: 'settings-outline',
    title: 'Flexible Data Mapping',
    description: 'Customize how data maps between any platform and our system',
  },
];

export default function StoreIntegrationScreen() {
  const navigation = useNavigation();
  const [connectedStores, setConnectedStores] = useState([]);
  const [storeConnections, setStoreConnections] = useState([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [apiCredentials, setApiCredentials] = useState({});
  const [customApiConfig, setCustomApiConfig] = useState({
    baseUrl: '',
    apiKey: '',
    apiSecret: '',
    customHeaders: '',
    productEndpoint: '/products',
    orderEndpoint: '/orders',
    customerEndpoint: '/customers',
  });
  const [syncSettings, setSyncSettings] = useState({
    products: true,
    orders: true,
    customers: true,
    inventory: true,
    pricing: true,
    categories: false,
    coupons: false,
    brands: false,
  });
  const [syncInterval, setSyncInterval] = useState('15min');
  const [webhookEnabled, setWebhookEnabled] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [fieldMapping, setFieldMapping] = useState({});
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storeDetails, setStoreDetails] = useState({
    name: 'My Shopify Store',
    domain: 'myshop.myshopify.com',
    currency: 'USD',
    timezone: 'America/New_York',
    plan: 'Basic Shopify',
    products: 156,
    orders: 23,
    customers: 89,
  });

  // Initialize the API and load user stores
  useEffect(() => {
    initializeStoreIntegration();
  }, []);

  const initializeStoreIntegration = async () => {
    try {
      setIsLoading(true);
      await StoreIntegrationAPI.initialize();
      await loadUserStores();
    } catch (error) {
      console.error('Failed to initialize store integration:', error);
      Alert.alert('Error', 'Failed to initialize store integration');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserStores = async () => {
    try {
      // For now, using a mock user ID - in real app, get from auth context
      const userId = 'temp-user-id';
      const result = await StoreIntegrationAPI.getUserStores(userId);
      
      if (result.success) {
        setStoreConnections(result.data);
        setConnectedStores(result.data.map(store => store.platform_type));
        
        // Update store details if there are connected stores
        if (result.data.length > 0) {
          const firstStore = result.data[0];
          setStoreDetails({
            name: firstStore.store_name,
            domain: firstStore.store_domain,
            currency: 'USD',
            timezone: 'UTC',
            plan: firstStore.platform_type,
            products: 0, // Will be updated from synced products
            orders: 0,   // Will be updated from synced orders
            customers: 0,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load user stores:', error);
    }
  };

  const handleConnectStore = (platformId: string) => {
    if (platformId === 'custom') {
      setShowCustomModal(true);
    } else {
      const platform = supportedPlatforms.find(p => p.id === platformId);
      setSelectedPlatform(platform);
      setShowConnectModal(true);
    }
  };

  const handleDisconnectStore = async (platformId: string) => {
    Alert.alert(
      'Disconnect Store',
      'Are you sure you want to disconnect this store? This will stop syncing data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disconnect', 
          style: 'destructive',
          onPress: async () => {
            try {
              const connection = storeConnections.find(conn => conn.platform_type === platformId);
              if (connection) {
                const userId = 'temp-user-id';
                const result = await StoreIntegrationAPI.disconnectStore(userId, connection.id);
                
                if (result.success) {
                  setConnectedStores(connectedStores.filter(id => id !== platformId));
                  setStoreConnections(storeConnections.filter(conn => conn.platform_type !== platformId));
                  Alert.alert('Disconnected', 'Store has been disconnected successfully.');
                } else {
                  Alert.alert('Error', result.message || 'Failed to disconnect store');
                }
              }
            } catch (error) {
              console.error('Failed to disconnect store:', error);
              Alert.alert('Error', 'Failed to disconnect store');
            }
          }
        },
      ]
    );
  };

  const handleSyncNow = async (platformId: string) => {
    try {
      setIsSyncing(true);
      setSyncProgress(0);
      
      const connection = storeConnections.find(conn => conn.platform_type === platformId);
      if (!connection) {
        Alert.alert('Error', 'Store connection not found');
        return;
      }

      const result = await StoreIntegrationAPI.manualSync(connection.id, ['products', 'orders']);
      
      if (result.success) {
        Alert.alert('Sync Complete', result.message);
        // Reload store data
        await loadUserStores();
      } else {
        Alert.alert('Sync Failed', result.message || 'Failed to sync store data');
      }
    } catch (error) {
      console.error('Failed to sync store:', error);
      Alert.alert('Error', 'Failed to sync store data');
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  const handleTestConnection = async () => {
    try {
      if (!selectedPlatform) return;
      
      const result = await StoreIntegrationAPI.validateCredentials(selectedPlatform.id, apiCredentials);
      
      if (result.success) {
        Alert.alert('Connection Test', 'Credentials are valid!');
      } else {
        Alert.alert('Connection Test Failed', result.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Failed to test connection:', error);
      Alert.alert('Error', 'Failed to test connection');
    }
  };

  const handleSaveIntegration = async () => {
    if (!selectedPlatform) return;
    
    // Validate required fields
    const requiredFields = selectedPlatform.apiFields;
    const missingFields = requiredFields.filter(field => !apiCredentials[field]);
    
    if (missingFields.length > 0) {
      Alert.alert('Missing Fields', `Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    try {
      setIsSyncing(true);
      setSyncProgress(0);
      
      const userId = 'temp-user-id';
      const result = await StoreIntegrationAPI.connectStore(userId, {
        platformType: selectedPlatform.id,
        credentials: apiCredentials,
        settings: syncSettings
      });

      if (result.success) {
        Alert.alert(
          'Store Connected Successfully!',
          `Your ${selectedPlatform.name} store has been connected and all products have been imported. You can now manage your products, create posts, and boost sales through our platform.`,
          [{ text: 'Great!' }]
        );
        
        // Reload stores and close modal
        await loadUserStores();
        setShowConnectModal(false);
        setSelectedPlatform(null);
        setApiCredentials({});
      } else {
        Alert.alert('Connection Failed', result.message || 'Failed to connect store');
      }
    } catch (error) {
      console.error('Failed to connect store:', error);
      Alert.alert('Error', 'Failed to connect store');
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  const handleSaveCustomIntegration = async () => {
    if (!customApiConfig.baseUrl || !customApiConfig.apiKey) {
      Alert.alert('Missing Fields', 'Please fill in the API Base URL and API Key.');
      return;
    }

    try {
      setIsSyncing(true);
      setSyncProgress(0);
      
      const userId = 'temp-user-id';
      const result = await StoreIntegrationAPI.connectStore(userId, {
        platformType: 'custom',
        credentials: {
          base_url: customApiConfig.baseUrl,
          api_key: customApiConfig.apiKey,
          api_secret: customApiConfig.apiSecret,
          custom_headers: customApiConfig.customHeaders,
          product_endpoint: customApiConfig.productEndpoint,
          order_endpoint: customApiConfig.orderEndpoint,
          customer_endpoint: customApiConfig.customerEndpoint,
        },
        settings: syncSettings
      });

      if (result.success) {
        Alert.alert(
          'Custom Store Connected Successfully!',
          'Your custom e-commerce platform has been connected and all products have been imported. You can now manage your products, create posts, and boost sales through our platform.',
          [{ text: 'Great!' }]
        );
        
        // Reload stores and close modal
        await loadUserStores();
        setShowCustomModal(false);
        setCustomApiConfig({
          baseUrl: '',
          apiKey: '',
          apiSecret: '',
          customHeaders: '',
          productEndpoint: '/products',
          orderEndpoint: '/orders',
          customerEndpoint: '/customers',
        });
      } else {
        Alert.alert('Connection Failed', result.message || 'Failed to connect custom store');
      }
    } catch (error) {
      console.error('Failed to connect custom store:', error);
      Alert.alert('Error', 'Failed to connect custom store');
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  const handleFieldMapping = (sourceField: string, targetField: string) => {
    setFieldMapping({
      ...fieldMapping,
      [sourceField]: targetField,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return colors.rating;
      case 'syncing': return colors.primary;
      case 'error': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'syncing': return 'Syncing...';
      case 'error': return 'Error';
      default: return 'Available';
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="storefront-outline" size={80} color={colors.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>No Stores Connected</Text>
      <Text style={styles.emptySubtitle}>
        Connect your first store to start managing products, orders, and customers from one place.
      </Text>
      <TouchableOpacity 
        style={styles.emptyActionButton}
        onPress={() => handleConnectStore('shopify')}
      >
        <Ionicons name="add-outline" size={20} color={colors.white} />
        <Text style={styles.emptyActionButtonText}>Connect Your First Store</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <HeaderWithMenu />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading store integration...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.screenTitle}>Store Integration</Text>
        <Text style={styles.screenSubtitle}>Connect any e-commerce platform and manage everything from one place</Text>
        
        {/* Universal Features Banner */}
        <View style={styles.universalBanner}>
          <Ionicons name="globe-outline" size={24} color={colors.white} />
          <Text style={styles.universalText}>
            Connect ANY e-commerce platform and run seamlessly
          </Text>
        </View>

        {/* Connected Store Details */}
        {connectedStores.length > 0 && (
          <View style={styles.storeDetailsSection}>
            <Text style={styles.sectionTitle}>Connected Store</Text>
            <View style={styles.storeDetailsCard}>
              <View style={styles.storeHeader}>
                <View style={[styles.storeIcon, { backgroundColor: colors.primary }]}>
                  <Ionicons name="storefront" size={24} color={colors.white} />
                </View>
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>{storeDetails.name}</Text>
                  <Text style={styles.storeDomain}>{storeDetails.domain}</Text>
                  <Text style={styles.storePlan}>{storeDetails.plan}</Text>
                </View>
                <View style={styles.storeStats}>
                  <Text style={styles.statNumber}>{storeDetails.products}</Text>
                  <Text style={styles.statLabel}>Products</Text>
                </View>
              </View>
              
              <View style={styles.storeMetrics}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{storeDetails.orders}</Text>
                  <Text style={styles.metricLabel}>Orders</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{storeDetails.customers}</Text>
                  <Text style={styles.metricLabel}>Customers</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{storeDetails.currency}</Text>
                  <Text style={styles.metricLabel}>Currency</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Sync Progress */}
        {isSyncing && (
          <View style={styles.syncProgressSection}>
            <Text style={styles.sectionTitle}>Syncing Store Data</Text>
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.progressText}>Importing products and store details...</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${syncProgress}%` }]} />
              </View>
              <Text style={styles.progressPercent}>{syncProgress}%</Text>
            </View>
          </View>
        )}

        {/* Overview Section */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>Integration Overview</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{connectedStores.length}</Text>
              <Text style={styles.statLabel}>Connected</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{storeDetails.products}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{storeDetails.orders}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{storeDetails.customers}</Text>
              <Text style={styles.statLabel}>Customers</Text>
            </View>
          </View>
        </View>

        {/* Universal Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Universal Integration Features</Text>
          <View style={styles.featuresGrid}>
            {integrationFeatures.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name={feature.icon} size={24} color={colors.primary} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Platforms Section */}
        <View style={styles.platformsSection}>
          <Text style={styles.sectionTitle}>Supported Platforms</Text>
          {connectedStores.length === 0 ? (
            renderEmptyState()
          ) : (
            supportedPlatforms.map((platform) => (
              <View key={platform.id} style={styles.platformCard}>
                <View style={styles.platformHeader}>
                  <View style={styles.platformInfo}>
                    <View style={[styles.platformIcon, { backgroundColor: platform.color }]}>
                      <Text style={styles.platformIconText}>
                        {platform.name.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.platformDetails}>
                      <Text style={styles.platformName}>{platform.name}</Text>
                      <Text style={styles.platformDescription}>{platform.description}</Text>
                      <View style={styles.platformStats}>
                        <Text style={styles.platformStat}>
                          {platform.productsCount} products
                        </Text>
                        <Text style={styles.platformStat}>
                          {platform.ordersCount} orders
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.platformStatus}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(platform.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(platform.status) }]}>
                        {getStatusText(platform.status)}
                      </Text>
                    </View>
                    {platform.lastSync && (
                      <Text style={styles.lastSyncText}>Last sync: {platform.lastSync}</Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.platformActions}>
                  {connectedStores.includes(platform.id) ? (
                    <>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleSyncNow(platform.id)}
                      >
                        <Ionicons name="refresh-outline" size={16} color={colors.primary} />
                        <Text style={styles.actionButtonText}>Sync Now</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('IntegrationSettings', { platform })}
                      >
                        <Ionicons name="settings-outline" size={16} color={colors.primary} />
                        <Text style={styles.actionButtonText}>Settings</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.disconnectButton]}
                        onPress={() => handleDisconnectStore(platform.id)}
                      >
                        <Ionicons name="link-outline" size={16} color={colors.error} />
                        <Text style={[styles.actionButtonText, { color: colors.error }]}>Disconnect</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.connectButton]}
                      onPress={() => handleConnectStore(platform.id)}
                    >
                      <Ionicons name="add-outline" size={16} color={colors.white} />
                      <Text style={[styles.actionButtonText, { color: colors.white }]}>Connect Store</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          <TouchableOpacity style={styles.helpCard}>
            <Ionicons name="document-text-outline" size={24} color={colors.primary} />
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>Universal Integration Guide</Text>
              <Text style={styles.helpDescription}>Learn how to connect any e-commerce platform</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.helpCard}>
            <Ionicons name="chatbubble-outline" size={24} color={colors.primary} />
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>Contact Support</Text>
              <Text style={styles.helpDescription}>Get help with integration issues</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Connect Store Modal */}
      <Modal
        visible={showConnectModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowConnectModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Connect {selectedPlatform?.name} Store
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Enter your {selectedPlatform?.name} API credentials to connect your store. We'll automatically fetch all your products and store details.
            </Text>

            {selectedPlatform?.apiFields.map((field) => (
              <View key={field} style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{field}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={`Enter your ${field}`}
                  value={apiCredentials[field] || ''}
                  onChangeText={(text) => setApiCredentials({
                    ...apiCredentials,
                    [field]: text
                  })}
                  secureTextEntry={field.toLowerCase().includes('secret') || field.toLowerCase().includes('password')}
                />
              </View>
            ))}

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.testButton}
                onPress={handleTestConnection}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
                <Text style={styles.testButtonText}>Test Connection</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveIntegration}
              >
                <Ionicons name="save-outline" size={20} color={colors.white} />
                <Text style={styles.saveButtonText}>Connect & Import</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Custom Platform Modal */}
      <Modal
        visible={showCustomModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCustomModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Connect Custom Platform
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Connect any e-commerce platform with custom API endpoints. We'll automatically map your data and import all products.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>API Base URL</Text>
              <TextInput
                style={styles.textInput}
                placeholder="https://your-store.com/api"
                value={customApiConfig.baseUrl}
                onChangeText={(text) => setCustomApiConfig({
                  ...customApiConfig,
                  baseUrl: text
                })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>API Key</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your API key"
                value={customApiConfig.apiKey}
                onChangeText={(text) => setCustomApiConfig({
                  ...customApiConfig,
                  apiKey: text
                })}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>API Secret (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your API secret"
                value={customApiConfig.apiSecret}
                onChangeText={(text) => setCustomApiConfig({
                  ...customApiConfig,
                  apiSecret: text
                })}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Custom Headers (JSON)</Text>
              <TextInput
                style={styles.textInput}
                placeholder='{"Authorization": "Bearer token"}'
                value={customApiConfig.customHeaders}
                onChangeText={(text) => setCustomApiConfig({
                  ...customApiConfig,
                  customHeaders: text
                })}
                multiline
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.testButton}
                onPress={handleTestConnection}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
                <Text style={styles.testButtonText}>Test Connection</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveCustomIntegration}
              >
                <Ionicons name="save-outline" size={20} color={colors.white} />
                <Text style={styles.saveButtonText}>Connect & Import</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.s,
    marginTop: spacing.s,
  },
  screenSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.l,
  },
  universalBanner: {
    backgroundColor: colors.primary,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.l,
    flexDirection: 'row',
    alignItems: 'center',
  },
  universalText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.white,
    marginLeft: spacing.s,
    flex: 1,
  },
  storeDetailsSection: {
    marginBottom: spacing.l,
  },
  storeDetailsCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    ...shadows.card,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  storeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  storeDomain: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  storePlan: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  storeStats: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  storeMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.text,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  syncProgressSection: {
    marginBottom: spacing.l,
  },
  progressCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    ...shadows.card,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'monospace',
    color: colors.text,
    marginLeft: spacing.s,
  },
  progressBar: {
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
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.primary,
    textAlign: 'center',
  },
  overviewSection: {
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  featuresSection: {
    marginBottom: spacing.l,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.s,
    alignItems: 'center',
    ...shadows.card,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.text,
    marginTop: spacing.s,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  platformsSection: {
    marginBottom: spacing.l,
  },
  platformCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  platformHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.m,
  },
  platformInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  platformIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  platformIconText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  platformDetails: {
    flex: 1,
  },
  platformName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  platformDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.s,
  },
  platformStats: {
    flexDirection: 'row',
  },
  platformStat: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: spacing.m,
  },
  platformStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: radii.small,
    marginBottom: spacing.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  lastSyncText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  platformActions: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radii.small,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'monospace',
    marginLeft: spacing.xs,
  },
  connectButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  disconnectButton: {
    borderColor: colors.error,
  },
  helpSection: {
    marginBottom: spacing.l,
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  helpContent: {
    flex: 1,
    marginLeft: spacing.m,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  helpDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: spacing.m,
  },
  modalDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.l,
    lineHeight: 22,
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
  modalActions: {
    flexDirection: 'row',
    gap: spacing.m,
    marginTop: spacing.l,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.primary,
    flex: 1,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: radii.medium,
    backgroundColor: colors.primary,
    flex: 1,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.white,
    marginLeft: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    marginBottom: spacing.l,
    ...shadows.card,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.l,
    paddingHorizontal: spacing.m,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.medium,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  emptyActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: colors.white,
    marginLeft: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.m,
    textAlign: 'center',
  },
}); 