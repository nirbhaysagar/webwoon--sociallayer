import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from '../SellerDashboard/components/HeaderWithMenu';

const mockSavedItems = [
  {
    id: '1',
    title: 'Summer Collection Sneakers',
    price: '$89.99',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
    store: 'TrendyStore',
    type: 'product',
  },
  {
    id: '2',
    title: 'Smart Home Bundle',
    price: '$299.99',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    store: 'TechHub',
    type: 'product',
  },
  {
    id: '3',
    title: 'Behind the scenes collection',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    store: 'LuxuryBrand',
    type: 'post',
  },
];

export default function UserSavedScreen() {
  const renderSavedItem = ({ item }) => (
    <TouchableOpacity style={styles.savedCard}>
      <Image source={{ uri: item.image }} style={styles.savedImage} />
      <View style={styles.savedContent}>
        <Text style={styles.savedTitle}>{item.title}</Text>
        <Text style={styles.savedStore}>{item.store}</Text>
        {item.type === 'product' && (
          <Text style={styles.savedPrice}>{item.price}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <HeaderWithMenu />
      
      <Text style={styles.title}>Saved Items</Text>
      
      <FlatList
        data={mockSavedItems}
        keyExtractor={item => item.id}
        renderItem={renderSavedItem}
        numColumns={2}
        contentContainerStyle={styles.savedGrid}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginHorizontal: spacing.m,
    marginTop: spacing.m,
    marginBottom: spacing.m,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  savedGrid: {
    paddingHorizontal: spacing.m,
    paddingBottom: 120,
  },
  savedCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    marginHorizontal: 4,
    marginBottom: spacing.m,
    overflow: 'hidden',
    ...shadows.card,
  },
  savedImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  savedContent: {
    padding: spacing.m,
  },
  savedTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: 4,
  },
  savedStore: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
  },
  savedPrice: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.primary,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.primary,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
  },
}); 