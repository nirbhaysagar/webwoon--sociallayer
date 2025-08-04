import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Linking,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import { supabase } from '../../config/supabase';

interface TrackingEvent {
  id: string;
  status: string;
  title: string;
  description: string;
  timestamp: string;
  location?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface OrderTracking {
  order_number: string;
  tracking_number: string;
  status: string;
  estimated_delivery: string;
  events: TrackingEvent[];
  carrier: string;
  carrier_url: string;
}

export default function OrderTrackingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderNumber, trackingNumber } = route.params as { orderNumber: string; trackingNumber: string };

  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTracking();
  }, []);

  const loadTracking = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .eq('user_id', user.id)
        .single();

      if (orderError || !order) {
        throw new Error('Order not found');
      }

      // Fetch tracking events
      const { data: events, error: eventsError } = await supabase
        .from('order_tracking_events')
        .select('*')
        .eq('order_id', order.id)
        .order('event_timestamp', { ascending: true });

      if (eventsError) {
        console.error('Error loading tracking events:', eventsError);
      }

      // Transform events to match our interface
      const transformedEvents: TrackingEvent[] = (events || []).map((event: any, index: number) => ({
        id: event.id,
        status: event.status,
        title: event.title,
        description: event.description || '',
        timestamp: event.event_timestamp,
        location: event.location,
        isCompleted: event.status === 'completed',
        isCurrent: event.status === 'current'
      }));

      // Create tracking object
      const trackingData: OrderTracking = {
        order_number: order.order_number,
        tracking_number: order.tracking_number || trackingNumber,
        status: order.status,
        estimated_delivery: order.estimated_delivery,
        events: transformedEvents,
        carrier: order.carrier || 'UPS',
        carrier_url: 'https://www.ups.com/track'
      };

      setTracking(trackingData);
    } catch (error) {
      console.error('Error loading tracking:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load tracking',
        text2: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOnCarrier = () => {
    if (tracking?.carrier_url) {
      const url = `${tracking.carrier_url}?tracknum=${tracking.tracking_number}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Could not open tracking page');
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Pending';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'order_placed':
        return 'cart-outline';
      case 'order_confirmed':
        return 'checkmark-circle-outline';
      case 'processing':
        return 'construct-outline';
      case 'shipped':
        return 'car-outline';
      case 'in_transit':
        return 'airplane-outline';
      case 'out_for_delivery':
        return 'bicycle-outline';
      case 'delivered':
        return 'checkmark-done-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading tracking information...</Text>
      </View>
    );
  }

  if (!tracking) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={styles.errorTitle}>Tracking Not Available</Text>
        <Text style={styles.errorMessage}>
          Tracking information is not available for this order yet.
        </Text>
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
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Track Package</Text>
          <Text style={styles.headerSubtitle}>{tracking.order_number}</Text>
        </View>
      </View>

      {/* Tracking Info */}
      <View style={styles.trackingInfo}>
        <View style={styles.trackingHeader}>
          <Text style={styles.trackingLabel}>Tracking Number</Text>
          <Text style={styles.trackingNumber}>{tracking.tracking_number}</Text>
        </View>

        <View style={styles.carrierInfo}>
          <Text style={styles.carrierLabel}>Carrier</Text>
          <Text style={styles.carrierName}>{tracking.carrier}</Text>
        </View>

        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryLabel}>Estimated Delivery</Text>
          <Text style={styles.deliveryDate}>{formatDate(tracking.estimated_delivery)}</Text>
        </View>
      </View>

      {/* Timeline */}
      <ScrollView style={styles.timelineContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.timelineTitle}>Order Timeline</Text>
        
        {tracking.events.map((event, index) => (
          <View key={event.id} style={styles.timelineItem}>
            <View style={styles.timelineIconContainer}>
              <View style={[
                styles.timelineIcon,
                event.isCompleted && { backgroundColor: colors.success },
                event.isCurrent && { backgroundColor: colors.primary }
              ]}>
                <Ionicons 
                  name={getStatusIcon(event.status) as any} 
                  size={20} 
                  color={event.isCompleted || event.isCurrent ? colors.white : colors.textSecondary} 
                />
              </View>
              {index < tracking.events.length - 1 && (
                <View style={[
                  styles.timelineLine,
                  event.isCompleted && { backgroundColor: colors.success }
                ]} />
              )}
            </View>

            <View style={styles.timelineContent}>
              <View style={styles.timelineHeader}>
                <Text style={[
                  styles.timelineEventTitle,
                  event.isCompleted && styles.timelineTitleCompleted,
                  event.isCurrent && styles.timelineTitleCurrent
                ]}>
                  {event.title}
                </Text>
                <Text style={styles.timelineTime}>
                  {formatDate(event.timestamp)}
                </Text>
              </View>
              
              <Text style={styles.timelineDescription}>
                {event.description}
              </Text>
              
              {event.location && (
                <Text style={styles.timelineLocation}>
                  📍 {event.location}
                </Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleTrackOnCarrier}>
          <Ionicons name="location-outline" size={20} color={colors.white} />
          <Text style={styles.primaryButtonText}>Track on {tracking.carrier}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: scale(16),
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  errorMessage: {
    fontSize: scale(14),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.s,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: scale(12),
    color: colors.textSecondary,
  },
  trackingInfo: {
    padding: spacing.l,
    backgroundColor: colors.card,
    margin: spacing.m,
    borderRadius: radii.medium,
    ...shadows.card,
  },
  trackingHeader: {
    marginBottom: spacing.m,
  },
  trackingLabel: {
    fontSize: scale(12),
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  trackingNumber: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
  },
  carrierInfo: {
    marginBottom: spacing.m,
  },
  carrierLabel: {
    fontSize: scale(12),
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  carrierName: {
    fontSize: scale(14),
    color: colors.text,
    fontWeight: '500',
  },
  deliveryInfo: {
    marginBottom: spacing.s,
  },
  deliveryLabel: {
    fontSize: scale(12),
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  deliveryDate: {
    fontSize: scale(14),
    color: colors.text,
    fontWeight: '500',
  },
  timelineContainer: {
    flex: 1,
    paddingHorizontal: spacing.l,
  },
  timelineTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.m,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing.l,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: spacing.m,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.circle,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  timelineLine: {
    width: 2,
    height: 40,
    backgroundColor: colors.border,
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  timelineEventTitle: {
    fontSize: scale(14),
    fontWeight: '500',
    color: colors.textSecondary,
  },
  timelineTitleCompleted: {
    color: colors.text,
  },
  timelineTitleCurrent: {
    color: colors.primary,
    fontWeight: '600',
  },
  timelineTime: {
    fontSize: scale(12),
    color: colors.textSecondary,
  },
  timelineDescription: {
    fontSize: scale(14),
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  timelineLocation: {
    fontSize: scale(12),
    color: colors.textSecondary,
  },
  actionContainer: {
    padding: spacing.l,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.medium,
    paddingVertical: spacing.m,
  },
  primaryButtonText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.white,
    marginLeft: spacing.xs,
  },
}); 