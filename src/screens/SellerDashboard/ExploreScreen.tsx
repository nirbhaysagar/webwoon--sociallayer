import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, Dimensions, Platform } from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-deck-swiper';
import { scale, verticalScale, moderateScale } from '../../lib/scale';

const mockCards = [
  {
    id: '1',
    title: 'Summer Collection',
    desc: 'Discover the hottest products for summer 2024.',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
    price: '$89.99',
    category: 'Fashion',
    seller: 'TrendyStore',
    engagement: '2.4K saves',
    rating: 4.8,
    reviews: 156,
  },
  {
    id: '2',
    title: 'Smart Home Bundle',
    desc: 'Meet the most successful sellers this month.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    price: '$299.99',
    category: 'Electronics',
    seller: 'TechHub',
    engagement: '1.8K saves',
    rating: 4.6,
    reviews: 89,
  },
  {
    id: '3',
    title: 'Organic Skincare Set',
    desc: 'Products recommended by our AI for your store.',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    price: '$149.99',
    category: 'Beauty',
    seller: 'NaturalGlow',
    engagement: '3.2K saves',
    rating: 4.9,
    reviews: 234,
  },
];

const CARD_WIDTH = Dimensions.get('window').width * 0.85;
const CARD_HEIGHT = 480;

export default function ExploreScreen() {
  const [search, setSearch] = useState('');
  const [cardIndex, setCardIndex] = useState(0);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search trends, products, sellers..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {/* Tinder-style Swipeable Cards */}
      <View style={styles.swiperWrap}>
        <Swiper
          cards={mockCards}
          cardIndex={cardIndex}
          renderCard={card =>
            card ? (
              <View style={styles.card}>
                <Image source={{ uri: card.image }} style={styles.cardImage} />
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    <Text style={styles.cardPrice}>{card.price}</Text>
                  </View>
                  <Text style={styles.cardDesc}>{card.desc}</Text>
                  <View style={styles.cardMeta}>
                    <View style={styles.metaRow}>
                      <Text style={styles.category}>{card.category}</Text>
                      <View style={styles.ratingWrap}>
                        <Ionicons name="star" size={16} color={colors.rating} />
                        <Text style={styles.rating}>{card.rating}</Text>
                        <Text style={styles.reviews}>({card.reviews})</Text>
                      </View>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.seller}>by {card.seller}</Text>
                      <Text style={styles.engagement}>{card.engagement}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <View style={[styles.card, { justifyContent: 'center', alignItems: 'center' }]}> 
                <Text style={styles.cardTitle}>No more cards</Text>
              </View>
            )
          }
          onSwiped={i => setCardIndex(i + 1)}
          onSwipedAll={() => setCardIndex(0)}
          backgroundColor={colors.background}
          stackSize={2}
          stackSeparation={18}
          disableTopSwipe
          disableBottomSwipe
          animateCardOpacity
          containerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.l,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 24,
    marginHorizontal: spacing.l,
    marginBottom: spacing.l,
    paddingHorizontal: spacing.m,
    height: 48,
    ...Platform.select({
      ios: { shadowColor: colors.shadow, shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6 },
      android: { elevation: 2 },
      default: {},
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
  },
  swiperWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.s,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: colors.card,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: colors.shadow, shadowOpacity: 0.12, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12 },
      android: { elevation: 4 },
      default: {},
    }),
  },
  cardImage: {
    width: '100%',
    height: CARD_HEIGHT * 0.7, // 70% of card height
    resizeMode: 'cover',
  },
  cardContent: {
    flex: 1,
    padding: spacing.m,
    justifyContent: 'space-between',
    height: CARD_HEIGHT * 0.3, // 30% of card height
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: typography.subtitle,
    fontWeight: 'bold',
    color: colors.primary,
    flex: 1,
  },
  cardPrice: {
    fontSize: typography.subtitle,
    fontWeight: 'bold',
    color: colors.discount,
  },
  cardDesc: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.m,
  },
  cardMeta: {
    gap: spacing.s,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: scale(13),
    fontWeight: '500',
    fontFamily: 'monospace',
    color: colors.textSecondary,
    backgroundColor: colors.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: scale(13),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.rating,
  },
  reviews: {
    fontSize: scale(13),
    color: colors.textSecondary,
  },
  seller: {
    fontSize: scale(13),
    fontWeight: '500',
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  engagement: {
    fontSize: scale(13),
    fontWeight: '500',
    fontFamily: 'monospace',
    color: colors.primary,
  },
}); 