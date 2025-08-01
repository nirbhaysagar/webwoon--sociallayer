import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../../constants/theme';

const mockHistory = [
  { id: '1', editor: 'Alex', time: '2024-06-10 10:00', summary: 'Initial post', changes: 'Created post with caption and 1 image.' },
  { id: '2', editor: 'Sophie', time: '2024-06-10 12:30', summary: 'Added product tag', changes: 'Tagged Sneakers product.' },
  { id: '3', editor: 'Alex', time: '2024-06-11 09:15', summary: 'Updated caption', changes: 'Changed caption to include #summer.' },
];

export default function EditHistoryModal({ visible, onClose }) {
  const [selected, setSelected] = useState(null);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Edit History</Text>
          <FlatList
            data={mockHistory}
            keyExtractor={item => item.id}
            style={styles.historyList}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.historyRow} onPress={() => setSelected(item)}>
                <Ionicons name="time-outline" size={20} color={colors.secondary} style={styles.historyIcon} />
                <View style={styles.historyInfo}>
                  <Text style={styles.historySummary}>{item.summary}</Text>
                  <Text style={styles.historyMeta}>{item.editor} • {item.time}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          />
          {selected && (
            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>Version Details</Text>
              <Text style={styles.detailMeta}>{selected.editor} • {selected.time}</Text>
              <Text style={styles.detailChanges}>{selected.changes}</Text>
              <View style={styles.detailBtns}>
                <TouchableOpacity style={styles.restoreBtn} onPress={() => alert('Restored version ' + selected.id)}>
                  <Ionicons name="refresh-outline" size={18} color={colors.background} />
                  <Text style={styles.restoreText}>Restore</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.compareBtn} onPress={() => alert('Compare not implemented')}>
                  <Ionicons name="git-compare-outline" size={18} color={colors.primary} />
                  <Text style={styles.compareText}>Compare</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeDetailBtn} onPress={() => setSelected(null)}>
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          )}
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.m,
  },
  historyList: {
    marginBottom: spacing.s,
    maxHeight: 180,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.card,
  },
  historyIcon: {
    marginRight: 8,
  },
  historyInfo: {
    flex: 1,
  },
  historySummary: {
    fontWeight: 'bold',
    color: colors.text,
    fontSize: 14,
  },
  historyMeta: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  detailCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginTop: spacing.s,
    ...shadows.card,
  },
  detailTitle: {
    fontWeight: 'bold',
    color: colors.text,
    fontSize: 15,
    marginBottom: 2,
  },
  detailMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  detailChanges: {
    color: colors.text,
    fontSize: 13,
    marginBottom: 8,
  },
  detailBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
  },
  restoreText: {
    color: colors.background,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
  },
  compareText: {
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  closeDetailBtn: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 6,
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