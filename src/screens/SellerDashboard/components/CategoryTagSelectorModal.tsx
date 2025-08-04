import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../../constants/theme';

const mockCategories = ['Sneakers', 'Handbags', 'Dresses', 'Accessories', 'Jackets', 'Tops', 'Bottoms'];

export default function CategoryTagSelectorModal({ visible, onClose, onDone, selected = [] }) {
  const [selectedCats, setSelectedCats] = useState(selected);

  const toggleCat = (cat) => {
    if (selectedCats.includes(cat)) {
      setSelectedCats(selectedCats.filter(c => c !== cat));
    } else {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Select Categories/Tags</Text>
          <FlatList
            data={mockCategories}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.catRow} onPress={() => toggleCat(item)}>
                <Ionicons name={selectedCats.includes(item) ? 'checkbox' : 'square-outline'} size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.catText}>{item}</Text>
              </TouchableOpacity>
            )}
            style={styles.catList}
          />
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneBtn} onPress={() => onDone(selectedCats)}>
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
  catList: {
    marginBottom: spacing.m,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  catText: {
    fontSize: 15,
    color: colors.text,
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