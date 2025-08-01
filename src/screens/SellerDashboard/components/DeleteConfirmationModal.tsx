import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../../constants/theme';

export default function DeleteConfirmationModal({ visible, onClose, onDelete, itemName = 'this item' }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Ionicons name="trash-outline" size={36} color={colors.discount} style={styles.icon} />
          <Text style={styles.title}>Delete {itemName}?</Text>
          <Text style={styles.desc}>Are you sure you want to delete {itemName}? This action cannot be undone.</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
              <Ionicons name="trash" size={20} color={colors.background} />
              <Text style={styles.deleteText}>Delete</Text>
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
    width: '80%',
    backgroundColor: colors.background,
    borderRadius: radii.large,
    padding: spacing.l,
    ...shadows.card,
    alignItems: 'center',
  },
  icon: {
    marginBottom: spacing.s,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.discount,
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  desc: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.m,
    textAlign: 'center',
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
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.discount,
    borderRadius: radii.pill,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  deleteText: {
    color: colors.background,
    fontWeight: 'bold',
    marginLeft: 6,
  },
}); 