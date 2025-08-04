import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, FlatList, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';

export default function PostPreviewModal({ visible, onClose, media = [], caption = '', taggedProducts = [], schedule }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Preview Post</Text>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <FlatList
              data={media}
              horizontal
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => <Image source={{ uri: item }} style={styles.mediaImg} />}
              style={styles.mediaRow}
            />
            <Text style={styles.caption}>{caption}</Text>
            {schedule && <Text style={styles.schedule}>Scheduled: {schedule.date} {schedule.time}</Text>}
            <Text style={styles.sectionTitle}>Tagged Products</Text>
            <FlatList
              data={taggedProducts}
              horizontal
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <View style={styles.productCard}>
                  <Image source={{ uri: item.img }} style={styles.productImg} />
                  <Text style={styles.productTitle}>{item.title}</Text>
                </View>
              )}
              style={styles.productsRow}
            />
          </ScrollView>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    backgroundColor: colors.background,
    borderRadius: radii.large,
    padding: spacing.l,
    ...shadows.card,
  },
  scrollContent: {
    paddingBottom: spacing.l,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.m,
  },
  mediaRow: {
    marginBottom: spacing.s,
  },
  mediaImg: {
    width: 80,
    height: 80,
    borderRadius: radii.medium,
    marginRight: 8,
  },
  caption: {
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.s,
  },
  schedule: {
    fontSize: 13,
    color: colors.secondary,
    marginBottom: spacing.s,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  productsRow: {
    marginBottom: spacing.s,
  },
  productCard: {
    width: 80,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    marginRight: spacing.s,
    padding: spacing.s,
    alignItems: 'center',
    ...shadows.card,
  },
  productImg: {
    width: 48,
    height: 48,
    borderRadius: radii.medium,
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 13,
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeBtn: {
    alignSelf: 'center',
    marginTop: spacing.m,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 8,
    ...shadows.card,
  },
}); 