import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import inventoryManagementService from '../../services/inventoryManagementService';
import BackButton from '../../components/BackButton';

const InventoryManagementScreen = ({ navigation }) => {
  const { user } = useApp();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadInventoryData();
    }
  }, [user?.id]);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const [items, summaryData, alertsData] = await Promise.all([
        inventoryManagementService.getInventoryItems(user!.id),
        inventoryManagementService.getInventorySummary(user!.id),
        inventoryManagementService.getInventoryAlerts(user!.id),
      ]);

      setInventoryItems(items);
      setSummary(summaryData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading inventory data:', error);
      Alert.alert('Error', 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInventoryData();
    setRefreshing(false);
  };

  const getStockStatusColor = (item) => {
    if (item.quantity_available <= 0) return colors.error;
    if (item.quantity_available <= item.reorder_point) return colors.warning;
    return colors.success;
  };

  const getStockStatusText = (item) => {
    if (item.quantity_available <= 0) return 'Out of Stock';
    if (item.quantity_available <= item.reorder_point) return 'Low Stock';
    return 'Normal';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading inventory data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Inventory Management</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Inventory Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summary?.total_products || 0}</Text>
              <Text style={styles.summaryLabel}>Products</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summary?.total_quantity || 0}</Text>
              <Text style={styles.summaryLabel}>Total Qty</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>${summary?.total_value?.toFixed(2) || '0.00'}</Text>
              <Text style={styles.summaryLabel}>Total Value</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summary?.low_stock_count || 0}</Text>
              <Text style={styles.summaryLabel}>Low Stock</Text>
            </View>
          </View>
        </View>

        {/* Alerts Card */}
        <View style={styles.alertsCard}>
          <View style={styles.alertsHeader}>
            <Text style={styles.alertsTitle}>Active Alerts</Text>
            <Text style={styles.alertsCount}>{alerts.length}</Text>
          </View>
          {alerts.slice(0, 3).map((alert, index) => (
            <View key={alert.id} style={styles.alertItem}>
              <View style={[styles.alertDot, { backgroundColor: alert.alert_level === 'critical' ? colors.error : colors.warning }]} />
              <Text style={styles.alertMessage} numberOfLines={2}>{alert.message}</Text>
            </View>
          ))}
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by SKU or supplier..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* Inventory List */}
        <View style={styles.inventoryList}>
          <Text style={styles.listTitle}>
            Inventory Items ({inventoryItems.length})
          </Text>
          
          {inventoryItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.inventoryItem}
              onPress={() => Alert.alert('Item Details', `SKU: ${item.sku}\nQuantity: ${item.quantity_available}`)}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.itemSku}>{item.sku}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStockStatusColor(item) }]}>
                  <Text style={styles.statusText}>{getStockStatusText(item)}</Text>
                </View>
              </View>
              
              <View style={styles.itemDetails}>
                <View style={styles.quantityRow}>
                  <Text style={styles.quantityLabel}>Available:</Text>
                  <Text style={styles.quantityValue}>{item.quantity_available}</Text>
                </View>
                
                <View style={styles.quantityRow}>
                  <Text style={styles.quantityLabel}>Reserved:</Text>
                  <Text style={styles.quantityValue}>{item.quantity_reserved}</Text>
                </View>
                
                <View style={styles.quantityRow}>
                  <Text style={styles.quantityLabel}>On Order:</Text>
                  <Text style={styles.quantityValue}>{item.quantity_on_order}</Text>
                </View>
              </View>
              
              <View style={styles.itemFooter}>
                <Text style={styles.supplierText}>{item.supplier_name || 'No Supplier'}</Text>
                <Text style={styles.locationText}>{item.location_name || 'No Location'}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.medium,
    padding: spacing.s,
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: colors.white,
    margin: spacing.l,
    padding: spacing.l,
    borderRadius: radii.large,
    ...shadows.card,
  },
  summaryTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text,
    marginBottom: spacing.m,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.primary,
  },
  summaryLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  alertsCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.l,
    marginBottom: spacing.l,
    padding: spacing.l,
    borderRadius: radii.large,
    ...shadows.card,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  alertsTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text,
  },
  alertsCount: {
    fontSize: typography.body.fontSize,
    color: colors.error,
    fontWeight: typography.weights.bold,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.s,
  },
  alertMessage: {
    fontSize: typography.body.fontSize,
    color: colors.text,
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: spacing.l,
    marginBottom: spacing.l,
  },
  searchInput: {
    backgroundColor: colors.white,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    fontSize: typography.body.fontSize,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inventoryList: {
    paddingHorizontal: spacing.l,
  },
  listTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text,
    marginBottom: spacing.m,
  },
  inventoryItem: {
    backgroundColor: colors.white,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.s,
    ...shadows.small,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  itemSku: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: radii.small,
  },
  statusText: {
    fontSize: typography.caption.fontSize,
    color: colors.white,
    fontWeight: typography.weights.medium,
  },
  itemDetails: {
    marginBottom: spacing.s,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  quantityLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  quantityValue: {
    fontSize: typography.caption.fontSize,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  supplierText: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  locationText: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
});

export default InventoryManagementScreen; 