import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../../constants/theme';

// For simplicity, use a basic date/time picker (mock UI, not native picker)
const mockTimes = ['09:00 AM', '12:00 PM', '03:00 PM', '06:00 PM', '09:00 PM'];
const mockDates = ['2024-06-10', '2024-06-11', '2024-06-12', '2024-06-13', '2024-06-14'];

export default function SchedulePostModal({ visible, onClose, onSchedule, initialDate, initialTime }) {
  const [date, setDate] = useState(initialDate || mockDates[0]);
  const [time, setTime] = useState(initialTime || mockTimes[0]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Schedule Post</Text>
          <Text style={styles.label}>Select Date</Text>
          <View style={styles.row}>
            {mockDates.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.chip, date === d && styles.chipActive]}
                onPress={() => setDate(d)}
              >
                <Text style={[styles.chipText, date === d && styles.chipTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Select Time</Text>
          <View style={styles.row}>
            {mockTimes.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, time === t && styles.chipActive]}
                onPress={() => setTime(t)}
              >
                <Text style={[styles.chipText, time === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.scheduleBtn} onPress={() => onSchedule({ date, time })}>
              <Ionicons name="calendar-outline" size={20} color={colors.background} />
              <Text style={styles.scheduleText}>Schedule</Text>
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
  scheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  scheduleText: {
    color: colors.background,
    fontWeight: 'bold',
    marginLeft: 6,
  },
}); 