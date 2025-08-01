import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../../constants/theme';

const sampleImages = [
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80',
];

export default function ImagePickerModal({ visible, onClose, onDone, images = [] }) {
  const [selected, setSelected] = useState(images);

  const handleAdd = (img) => {
    if (!selected.includes(img)) setSelected([...selected, img]);
  };
  const handleRemove = (img) => {
    setSelected(selected.filter(i => i !== img));
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Pick Images</Text>
          <FlatList
            data={sampleImages}
            horizontal
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleAdd(item)}>
                <Image source={{ uri: item }} style={styles.imageThumb} />
                {!selected.includes(item) && (
                  <View style={styles.addIcon}><Ionicons name="add-circle" size={24} color={colors.primary} /></View>
                )}
                {selected.includes(item) && (
                  <TouchableOpacity style={styles.removeIcon} onPress={() => handleRemove(item)}>
                    <Ionicons name="close-circle" size={24} color={colors.discount} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            )}
            style={styles.imagesRow}
          />
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneBtn} onPress={() => onDone(selected)}>
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
    width: '90%',
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
  imagesRow: {
    marginBottom: spacing.m,
  },
  imageThumb: {
    width: 64,
    height: 64,
    borderRadius: radii.medium,
    marginRight: 8,
    marginBottom: 8,
  },
  addIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  removeIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.background,
    borderRadius: 12,
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