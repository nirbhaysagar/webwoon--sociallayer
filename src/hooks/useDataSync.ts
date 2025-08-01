import { useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';

export interface DataSyncOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  onDataChange?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useDataSync = (
  dataType: 'products' | 'orders' | 'posts',
  options: DataSyncOptions = {}
) => {
  const { state, loadProducts, loadOrders, loadPosts } = useApp();
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSyncRef = useRef<number>(0);

  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    onDataChange,
    onError
  } = options;

  // Get current data based on type
  const getCurrentData = useCallback(() => {
    switch (dataType) {
      case 'products':
        return state.products;
      case 'orders':
        return state.orders;
      case 'posts':
        return state.posts;
      default:
        return [];
    }
  }, [dataType, state.products, state.orders, state.posts]);

  // Load data function
  const loadData = useCallback(async () => {
    try {
      switch (dataType) {
        case 'products':
          await loadProducts();
          break;
        case 'orders':
          await loadOrders();
          break;
        case 'posts':
          await loadPosts();
          break;
      }
      lastSyncRef.current = Date.now();
      
      if (onDataChange) {
        onDataChange(getCurrentData());
      }
    } catch (error) {
      console.error(`Error loading ${dataType}:`, error);
      if (onError) {
        onError(error as Error);
      }
    }
  }, [dataType, loadProducts, loadOrders, loadPosts, onDataChange, onError, getCurrentData]);

  // Manual refresh function
  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  // Check if data is stale
  const isDataStale = useCallback(() => {
    const lastSync = state.lastSync[dataType];
    const now = Date.now();
    return !lastSync || (now - lastSync) > refreshInterval;
  }, [dataType, state.lastSync, refreshInterval]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const setupAutoRefresh = () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      refreshTimeoutRef.current = setTimeout(() => {
        if (isDataStale()) {
          loadData();
        }
        setupAutoRefresh(); // Schedule next refresh
      }, refreshInterval);
    };

    setupAutoRefresh();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, isDataStale, loadData]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time sync status
  const isRealtimeConnected = state.realtimeConnected;
  const lastSyncTime = state.lastSync[dataType];

  return {
    data: getCurrentData(),
    isLoading: state.loadingStates[dataType],
    isRealtimeConnected,
    lastSyncTime,
    isDataStale: isDataStale(),
    refresh,
    loadData
  };
};

// Specialized hooks for each data type
export const useProductsSync = (options?: DataSyncOptions) => 
  useDataSync('products', options);

export const useOrdersSync = (options?: DataSyncOptions) => 
  useDataSync('orders', options);

export const usePostsSync = (options?: DataSyncOptions) => 
  useDataSync('posts', options); 