import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../../constants/theme';

const mockProducts = [
  {
    id: '1',
    img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
    title: 'Sneakers',
  },
  {
    id: '2',
    img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    title: 'Handbag',
  },
  {
    id: '3',
    img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80',
    title: 'Dress',
  },
];

export default function TagProductsModal({ visible, onClose, onDone, selected = [] }) {
  const [selectedProducts, setSelectedProducts] = useState(selected);

  const toggleProduct = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(pid => pid !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Tag Products</Text>
          <FlatList
            data={mockProducts}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.productRow} onPress={() => toggleProduct(item.id)}>
                <Image source={{ uri: item.img }} style={styles.productImg} />
                <Text style={styles.productTitle}>{item.title}</Text>
                <Ionicons
                  name={selectedProducts.includes(item.id) ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={colors.primary}
                  style={{ marginLeft: 'auto' }}
                />
              </TouchableOpacity>
            )}
            style={styles.productList}
          />
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneBtn} onPress={() => onDone(selectedProducts)}>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.background} />
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
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
    width: '85%',
    backgroundColor: colors.background,
    borderRadius: radii.large,
    padding: spacing.l,
    ...shadows.card,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.m,
  },
  productList: {
    marginBottom: spacing.m,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.card,
  },
  productImg: {
    width: 40,
    height: 40,
    borderRadius: radii.medium,
    marginRight: 12,
  },
  productTitle: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.l,
  },
  cancelBtn: {
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 8,
    ...shadows.card,
  },
  cancelText: {
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  doneText: {
    color: colors.background,
    fontWeight: 'bold',
    marginLeft: 6,
  },
}); 