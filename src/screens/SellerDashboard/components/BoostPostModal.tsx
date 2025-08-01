import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../../constants/theme';

const mockAudiences = ['All', 'Women 18-34', 'Men 18-34', 'USA', 'UK', 'India'];

export default function BoostPostModal({ visible, onClose, onBoost, initial }) {
  const [budget, setBudget] = useState(initial?.budget || '50');
  const [duration, setDuration] = useState(initial?.duration || '7');
  const [audience, setAudience] = useState(initial?.audience || mockAudiences[0]);

  const handleBoost = () => {
    onBoost?.({ budget, duration, audience });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Boost Post</Text>
          <Text style={styles.label}>Budget ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter budget"
            placeholderTextColor={colors.textSecondary}
            value={budget}
            onChangeText={setBudget}
            keyboardType="decimal-pad"
          />
          <Text style={styles.label}>Duration (days)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter duration"
            placeholderTextColor={colors.textSecondary}
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
          />
          <Text style={styles.label}>Audience</Text>
          <View style={styles.row}>
            {mockAudiences.map(a => (
              <TouchableOpacity
                key={a}
                style={[styles.chip, audience === a && styles.chipActive]}
                onPress={() => setAudience(a)}
              >
                <Text style={[styles.chipText, audience === a && styles.chipTextActive]}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.previewCard}>
            <Ionicons name="eye-outline" size={22} color={colors.secondary} />
            <Text style={styles.previewText}>Estimated reach: {parseInt(budget) * 100 * parseInt(duration)} people</Text>
          </View>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.boostBtn} onPress={handleBoost}>
              <Ionicons name="rocket-outline" size={20} color={colors.background} />
              <Text style={styles.boostText}>Boost</Text>
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
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.s,
    marginBottom: 2,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.s,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.s,
  },
  chip: {
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: colors.primary + '33',
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  previewCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.s,
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.m,
    ...shadows.card,
  },
  previewText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 8,
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
  boostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  boostText: {
    color: colors.background,
    fontWeight: 'bold',
    marginLeft: 6,
  },
}); 