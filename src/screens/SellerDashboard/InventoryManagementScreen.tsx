import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import inventoryService, { InventorySummary, InventoryItem, StockAlert } from '../../services/inventoryService';
import { useApp } from '../../context/AppContext';

interface InventoryManagementScreenProps {
  navigation: any;
}

export default function InventoryManagementScreen({ navigation }: InventoryManagementScreenProps) {
  const { state } = useApp();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'inventory' | 'alerts'>('overview');

  const sellerId = state.user?.id || 'seller-1'; // Fallback for development

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const [summaryData, itemsData, alertsData] = await Promise.all([
        inventoryService.getInventorySummary(sellerId),
        inventoryService.getInventoryItems(sellerId),
        inventoryService.getStockAlerts(sellerId, true) // Only unread alerts
      ]);

      setSummary(summaryData);
      setInventoryItems(itemsData);
      setStockAlerts(alertsData);
    } catch (error) {
      console.error('Error loading inventory data:', error);
      Alert.alert('Error', 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInventoryData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const getStockStatusColor = (item: InventoryItem) => {
    if (item.quantity_available === 0) return colors.error;
    if (item.quantity_available <= item.low_stock_threshold) return colors.warning;
    return colors.success;
  };

  const getStockStatusText = (item: InventoryItem) => {
    if (item.quantity_available === 0) return 'Out of Stock';
    if (item.quantity_available <= item.low_stock_threshold) return 'Low Stock';
    return 'In Stock';
  };

  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return colors.error;
      case 'warning': return colors.warning;
      case 'info': return colors.info;
      default: return colors.textSecondary;
    }
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Ionicons name="cube-outline" size={24} color={colors.primary} />
          <Text style={styles.summaryValue}>{summary?.total_products || 0}</Text>
          <Text style={styles.summaryLabel}>Total Products</Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Ionicons name="warning-outline" size={24} color={colors.warning} />
          <Text style={styles.summaryValue}>{summary?.low_stock_count || 0}</Text>
          <Text style={styles.summaryLabel}>Low Stock</Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Ionicons name="close-circle-outline" size={24} color={colors.error} />
          <Text style={styles.summaryValue}>{summary?.out_of_stock_count || 0}</Text>
          <Text style={styles.summaryLabel}>Out of Stock</Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Ionicons name="cash-outline" size={24} color={colors.success} />
          <Text style={styles.summaryValue}>{formatCurrency(summary?.total_value || 0)}</Text>
          <Text style={styles.summaryLabel}>Total Value</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('AddInventoryItem')}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Add Item</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('BulkUpdate')}
          >
            <Ionicons name="list-outline" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Bulk Update</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('PurchaseOrders')}
          >
            <Ionicons name="document-text-outline" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Purchase Orders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Suppliers')}
          >
            <Ionicons name="people-outline" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Suppliers</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Alerts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          <TouchableOpacity onPress={() => setSelectedTab('alerts')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {stockAlerts.slice(0, 3).map((alert) => (
          <View key={alert.id} style={styles.alertItem}>
            <View style={[styles.alertIndicator, { backgroundColor: getAlertLevelColor(alert.alert_level) }]} />
            <View style={styles.alertContent}>
              <Text style={styles.alertMessage} numberOfLines={2}>
                {alert.message}
              </Text>
              <Text style={styles.alertTime}>
                {new Date(alert.created_at).toLocaleDateString()}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.alertAction}
              onPress={() => inventoryService.markAlertAsRead(alert.id)}
            >
              <Ionicons name="checkmark" size={16} color={colors.success} />
            </TouchableOpacity>
          </View>
        ))}
        
        {stockAlerts.length === 0 && (
          <Text style={styles.emptyText}>No alerts at the moment</Text>
        )}
      </View>
    </View>
  );

  const renderInventoryTab = () => (
    <View style={styles.tabContent}>
      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <Text style={styles.searchPlaceholder}>Search inventory...</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Inventory List */}
      <View style={styles.inventoryList}>
        {inventoryItems.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.inventoryItem}
            onPress={() => navigation.navigate('InventoryItemDetail', { itemId: item.id })}
          >
            <View style={styles.itemImageContainer}>
              {item.product?.image_url ? (
                <View style={styles.itemImage} />
              ) : (
                <Ionicons name="cube-outline" size={32} color={colors.textSecondary} />
              )}
            </View>
            
            <View style={styles.itemContent}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.product?.name || 'Product Name'}
              </Text>
              <Text style={styles.itemPrice}>
                {formatCurrency(item.product?.price || 0)}
              </Text>
              <View style={styles.itemStock}>
                <View style={[styles.stockIndicator, { backgroundColor: getStockStatusColor(item) }]} />
                <Text style={styles.stockText}>
                  {item.quantity_available} available
                </Text>
              </View>
            </View>
            
            <View style={styles.itemActions}>
              <Text style={[styles.stockStatus, { color: getStockStatusColor(item) }]}>
                {getStockStatusText(item)}
              </Text>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="ellipsis-vertical" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
        
        {inventoryItems.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No inventory items found</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('AddInventoryItem')}
            >
              <Text style={styles.addButtonText}>Add First Item</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderAlertsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.alertsList}>
        {stockAlerts.map((alert) => (
          <View key={alert.id} style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <View style={[styles.alertTypeIndicator, { backgroundColor: getAlertLevelColor(alert.alert_level) }]} />
              <Text style={styles.alertType}>
                {alert.alert_type.replace('_', ' ').toUpperCase()}
              </Text>
              <Text style={styles.alertTime}>
                {new Date(alert.created_at).toLocaleDateString()}
              </Text>
            </View>
            
            <Text style={styles.alertMessage}>
              {alert.message}
            </Text>
            
            {alert.product && (
              <View style={styles.alertProduct}>
                <Text style={styles.productName}>{alert.product.name}</Text>
                <Text style={styles.productPrice}>{formatCurrency(alert.product.price)}</Text>
              </View>
            )}
            
            <View style={styles.alertActions}>
              <TouchableOpacity 
                style={styles.resolveButton}
                onPress={() => inventoryService.resolveAlert(alert.id)}
              >
                <Ionicons name="checkmark" size={16} color={colors.success} />
                <Text style={styles.resolveButtonText}>Resolve</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.viewButton}
                onPress={() => navigation.navigate('InventoryItemDetail', { 
                  itemId: alert.product_id.toString() 
                })}
              >
                <Text style={styles.viewButtonText}>View Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        {stockAlerts.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={48} color={colors.success} />
            <Text style={styles.emptyText}>No alerts at the moment</Text>
            <Text style={styles.emptySubtext}>All inventory is properly managed</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="cube-outline" size={48} color={colors.primary} />
        <Text style={styles.loadingText}>Loading inventory...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventory Management</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity 
          style={[styles.tabButton, selectedTab === 'overview' && styles.tabButtonActive]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text style={[styles.tabText, selectedTab === 'overview' && styles.tabTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, selectedTab === 'inventory' && styles.tabButtonActive]}
          onPress={() => setSelectedTab('inventory')}
        >
          <Text style={[styles.tabText, selectedTab === 'inventory' && styles.tabTextActive]}>
            Inventory
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, selectedTab === 'alerts' && styles.tabButtonActive]}
          onPress={() => setSelectedTab('alerts')}
        >
          <View style={styles.alertTabContainer}>
            <Text style={[styles.tabText, selectedTab === 'alerts' && styles.tabTextActive]}>
              Alerts
            </Text>
            {stockAlerts.length > 0 && (
              <View style={styles.alertBadge}>
                <Text style={styles.alertBadgeText}>{stockAlerts.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {selectedTab === 'overview' && renderOverviewTab()}
        {selectedTab === 'inventory' && renderInventoryTab()}
        {selectedTab === 'alerts' && renderAlertsTab()}
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.sizes.lg,
    ...typography.weights.semibold,
    color: colors.text,
  },
  settingsButton: {
    padding: spacing.xs,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.xs,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },
  tabButtonActive: {
    backgroundColor: colors.primary + '20',
  },
  tabText: {
    ...typography.sizes.sm,
    ...typography.weights.medium,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
  alertTabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertBadge: {
    backgroundColor: colors.error,
    borderRadius: radii.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  alertBadgeText: {
    ...typography.sizes.xs,
    ...typography.weights.bold,
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  summaryValue: {
    ...typography.sizes.xl,
    ...typography.weights.bold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  summaryLabel: {
    ...typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.sizes.md,
    ...typography.weights.semibold,
    color: colors.text,
  },
  viewAllText: {
    ...typography.sizes.sm,
    color: colors.primary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  quickActionText: {
    ...typography.sizes.sm,
    ...typography.weights.medium,
    color: colors.text,
    marginTop: spacing.xs,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    ...shadows.xs,
  },
  alertIndicator: {
    width: 4,
    height: 40,
    borderRadius: radii.xs,
    marginRight: spacing.sm,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    ...typography.sizes.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  alertTime: {
    ...typography.sizes.xs,
    color: colors.textSecondary,
  },
  alertAction: {
    padding: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  searchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    ...shadows.xs,
  },
  searchPlaceholder: {
    ...typography.sizes.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  filterButton: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.sm,
    ...shadows.xs,
  },
  inventoryList: {
    marginBottom: spacing.lg,
  },
  inventoryItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: radii.md,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: radii.md,
    backgroundColor: colors.gray[200],
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    ...typography.sizes.sm,
    ...typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  itemPrice: {
    ...typography.sizes.sm,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  itemStock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    marginRight: spacing.xs,
  },
  stockText: {
    ...typography.sizes.xs,
    color: colors.textSecondary,
  },
  itemActions: {
    alignItems: 'flex-end',
  },
  stockStatus: {
    ...typography.sizes.xs,
    ...typography.weights.medium,
    marginBottom: spacing.xs,
  },
  actionButton: {
    padding: spacing.xs,
  },
  alertsList: {
    marginBottom: spacing.lg,
  },
  alertCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  alertTypeIndicator: {
    width: 12,
    height: 12,
    borderRadius: radii.full,
    marginRight: spacing.sm,
  },
  alertType: {
    ...typography.sizes.xs,
    ...typography.weights.medium,
    color: colors.textSecondary,
    flex: 1,
  },
  alertTime: {
    ...typography.sizes.xs,
    color: colors.textSecondary,
  },
  alertMessage: {
    ...typography.sizes.sm,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  alertProduct: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  productName: {
    ...typography.sizes.sm,
    ...typography.weights.medium,
    color: colors.text,
  },
  productPrice: {
    ...typography.sizes.sm,
    color: colors.primary,
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resolveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  resolveButtonText: {
    ...typography.sizes.sm,
    color: colors.success,
    marginLeft: spacing.xs,
  },
  viewButton: {
    backgroundColor: colors.primary + '20',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  viewButtonText: {
    ...typography.sizes.sm,
    color: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  addButtonText: {
    ...typography.sizes.sm,
    ...typography.weights.medium,
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
}); 