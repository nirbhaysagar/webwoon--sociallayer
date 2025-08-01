import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import PostCommentsModal from './components/PostCommentsModal';
import SharePostModal from './components/SharePostModal';
import EditHistoryModal from './components/EditHistoryModal';

const mockPost = {
  id: '1',
  media: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80',
  caption: 'Check out our new summer collection! #trendy #summer',
  time: '2h ago',
  likes: 120,
  comments: 18,
  saves: 34,
  views: 1500,
  ctr: '8.2%',
  shoppableProducts: [
    {
      id: 'p1',
      img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
      title: 'Sneakers',
      price: '$120',
    },
    {
      id: 'p2',
      img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      title: 'Handbag',
      price: '$90',
    },
  ],
};

const analytics = [
  { icon: 'eye-outline', label: 'Views', value: mockPost.views },
  { icon: 'heart-outline', label: 'Likes', value: mockPost.likes },
  { icon: 'chatbubble-outline', label: 'Comments', value: mockPost.comments },
  { icon: 'bookmark-outline', label: 'Saves', value: mockPost.saves },
  { icon: 'trending-up-outline', label: 'CTR', value: mockPost.ctr },
];

export default function PostDetailScreen({ navigation }) {
  const [showCommentsModal, setShowCommentsModal] = React.useState(false);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [showHistoryModal, setShowHistoryModal] = React.useState(false);
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: mockPost.media }} style={styles.media} />
        <View style={styles.captionRow}>
          <Text style={styles.caption}>{mockPost.caption}</Text>
          <Text style={styles.time}>{mockPost.time}</Text>
        </View>
        <View style={styles.analyticsRow}>
          {analytics.map(a => (
            <View key={a.label} style={styles.analyticsCard}>
              <Ionicons name={a.icon} size={22} color={colors.secondary} style={styles.analyticsIcon} />
              <Text style={styles.analyticsValue}>{a.value}</Text>
              <Text style={styles.analyticsLabel}>{a.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.rowBtns}>
          <TouchableOpacity style={styles.rowBtn} onPress={() => setShowCommentsModal(true)}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.secondary} />
            <Text style={styles.rowBtnText}>Comments</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rowBtn} onPress={() => setShowShareModal(true)}>
            <Ionicons name="share-social-outline" size={20} color={colors.primary} />
            <Text style={styles.rowBtnText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rowBtn} onPress={() => setShowHistoryModal(true)}>
            <Ionicons name="time-outline" size={20} color={colors.secondary} />
            <Text style={styles.rowBtnText}>History</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle}>Shoppable Products</Text>
        <FlatList
          data={mockPost.shoppableProducts}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsRow}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <Image source={{ uri: item.img }} style={styles.productImg} />
              <Text style={styles.productTitle}>{item.title}</Text>
              <Text style={styles.productPrice}>{item.price}</Text>
            </View>
          )}
        />
      </ScrollView>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <PostCommentsModal visible={showCommentsModal} onClose={() => setShowCommentsModal(false)} />
      <SharePostModal visible={showShareModal} onClose={() => setShowShareModal(false)} />
      <EditHistoryModal visible={showHistoryModal} onClose={() => setShowHistoryModal(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.m,
    paddingBottom: 80,
  },
  media: {
    width: '100%',
    height: 220,
    borderRadius: radii.large,
    marginBottom: spacing.m,
  },
  captionRow: {
    marginBottom: spacing.s,
  },
  caption: {
    fontSize: 16,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  time: {
    fontSize: 13,
    color: colors.disabled,
  },
  analyticsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.l,
  },
  analyticsCard: {
    width: 90,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.s,
    marginRight: 8,
    marginBottom: 8,
    alignItems: 'center',
    ...shadows.card,
  },
  analyticsIcon: {
    marginBottom: 2,
  },
  analyticsValue: {
    fontSize: 15,
    color: colors.secondary,
    fontWeight: 'bold',
  },
  analyticsLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: typography.subtitle,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  productsRow: {
    marginBottom: spacing.m,
  },
  productCard: {
    width: 120,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    marginRight: spacing.m,
    padding: spacing.s,
    alignItems: 'center',
    ...shadows.card,
  },
  productImg: {
    width: 80,
    height: 80,
    borderRadius: radii.medium,
    marginBottom: 6,
  },
  productTitle: {
    fontSize: 15,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: 'bold',
  },
  backBtn: {
    position: 'absolute',
    top: 36,
    left: 16,
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 8,
    ...shadows.card,
    zIndex: 10,
  },
  rowBtns: {
    flexDirection: 'row',
    marginBottom: spacing.s,
  },
  rowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    ...shadows.card,
  },
  rowBtnText: {
    color: colors.textSecondary,
    fontWeight: 'bold',
    marginLeft: 6,
  },
}); 